import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
    X, ExternalLink, Download, Play, Pause,
    FlipHorizontal, RotateCw, Maximize2, ChevronDown, ChevronUp,
    Volume2, VolumeX
} from 'lucide-react';

const VIDEO_EXTS = ['.webm', '.mp4'];
const SOURCE_FAVICONS = {
    desuarchive: 'https://desuarchive.org/favicon.ico'
};

function LazyThumb({ src, alt, className, style }) {
    const imgRef = useRef(null);
    const retriesRef = useRef(0);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const img = imgRef.current;
        if (!img) {
            return undefined;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    img.src = src;
                    observer.unobserve(img);
                }
            },
            { rootMargin: '200px' }
        );

        observer.observe(img);
        return () => observer.disconnect();
    }, [src]);

    const handleError = useCallback(() => {
        if (retriesRef.current >= 3) {
            return;
        }

        retriesRef.current += 1;
        const img = imgRef.current;
        if (!img) {
            return;
        }

        window.setTimeout(() => {
            img.src = '';
            img.src = src;
        }, 2000 * retriesRef.current);
    }, [src]);

    return (
        <img
            ref={imgRef}
            alt={alt}
            className={className}
            style={{ ...style, opacity: loaded ? 1 : 0, transition: 'opacity 0.2s ease, scale 0.3s ease, filter 0.3s ease' }}
            onLoad={() => setLoaded(true)}
            onError={handleError}
        />
    );
}

function formatSize(bytes) {
    if (!bytes) {
        return '';
    }
    if (bytes < 1024) {
        return `${bytes}B`;
    }
    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)}KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function formatRelativeTime(tim) {
    if (!tim) {
        return '';
    }
    const diff = Date.now() - tim;
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
    const years = Math.floor(months / 12);
    return `${years} year${years !== 1 ? 's' : ''} ago`;
}

function formatExactTime(tim) {
    if (!tim) {
        return '';
    }
    const d = new Date(tim);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(-2);
    let h = d.getHours();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    const min = String(d.getMinutes()).padStart(2, '0');
    const tz = d.toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ').pop() || '';
    return `${mm}${dd}${yy} ${h}:${min}${ampm} ${tz}`;
}

// The chevron in the 94 x 108 box of the arrow, measured from the arrow images of 4chmg2.
const CHEVRON_PREV = '53.7,39.2 33.5,54 53.7,68.8';
const CHEVRON_NEXT = '40.8,39.2 61.1,54 40.8,68.8';

// Drawn with CSS and an inline SVG (classes nav-arrow, nav-arrow-prev, nav-arrow-next in the build script),
// so the colours can be restyled through --nav-arrow-bg and --nav-arrow-fg.
function NavArrow({ direction, onClick, visible = true, thumbDocked = false }) {
    const isPrev = direction === 'prev';
    return (
        <button
            className={`absolute ${isPrev ? 'left-0' : 'right-0'} z-50 p-0 cursor-pointer outline-none bg-transparent border-none transition-all duration-300 -translate-y-1/2 ${visible ? 'opacity-70 hover:opacity-100 hover:scale-105 active:scale-95' : 'opacity-0 pointer-events-none'}`}
            style={{ transformOrigin: isPrev ? 'left center' : 'right center', top: thumbDocked ? 'calc(50% - 2.5rem)' : '50%' }}
            aria-label={isPrev ? 'Previous' : 'Next'}
            onClick={onClick}
        >
            <span className={`nav-arrow ${isPrev ? 'nav-arrow-prev' : 'nav-arrow-next'} drop-shadow-lg`}>
                <svg viewBox="0 0 94 108" aria-hidden="true">
                    <polyline points={isPrev ? CHEVRON_PREV : CHEVRON_NEXT} fill="none" stroke="currentColor" strokeWidth={8.3} strokeLinecap="round" strokeLinejoin="miter" />
                </svg>
            </span>
        </button>
    );
}

function TbBtn({ onClick, children, title, isExit = false }) {
    return (
        <button
            onClick={onClick}
            className={`p-2 outline-none cursor-pointer bg-transparent border-none transition-all duration-100 hover:scale-110 active:scale-90 ${isExit ? 'text-white/70 hover:text-red-400' : 'text-white/70 hover:text-[#E445FF]'}`}
            title={title}
        >
            {children}
        </button>
    );
}

function DesuXReactGallery({ media, initialSelectedIndex, onClose, onIndexChange, onSave, onFetchBlob }) {
    const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex ?? 0);
    const lastViewedIndexRef = useRef(initialSelectedIndex ?? 0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [slideshowInterval, setSlideshowInterval] = useState(() => {
        const stored = window.localStorage.getItem('desux-gallery-slideshow-interval');
        return stored ? parseInt(stored, 10) : 10;
    });
    const [dimensions, setDimensions] = useState(null);
    const [mediaLoaded, setMediaLoaded] = useState(false);
    const [overlayVisible, setOverlayVisible] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const overlayTimeoutRef = useRef(null);
    const [intervalEditValue, setIntervalEditValue] = useState('');
    const [isEditingInterval, setIsEditingInterval] = useState(false);
    const [thumbDocked, setThumbDocked] = useState(() => window.localStorage.getItem('desux-gallery-thumbnails-docked') !== 'false');

    const transformRef = useRef(null);
    const zoomRef = useRef(1);
    const panRef = useRef({ x: 0, y: 0 });
    const isFlippedRef = useRef(false);
    const rotationRef = useRef(0);
    const mediaRotateRef = useRef(null);
    const didDragRef = useRef(false);
    const pointersRef = useRef(new Map());
    const isDraggingRef = useRef(false);
    const initialPinchRef = useRef(null);

    const imgRef = useRef(null);
    const videoRef = useRef(null);
    const thumbnailStripRef = useRef(null);
    const slideshowTimerRef = useRef(null);
    const precacheRef = useRef(new Set());
    const blobCacheRef = useRef(new Map());

    const [isVideoPaused, setIsVideoPaused] = useState(false);
    const [isVideoMuted, setIsVideoMuted] = useState(() => window.localStorage.getItem('desux-gallery-video-muted') === 'true');
    const [seekbarValue, setSeekbarValue] = useState(0);
    const seekbarRafRef = useRef(null);
    const frameDurationRef = useRef(1 / 30);
    const lastFrameTimeRef = useRef(-1);
    const contentAreaRef = useRef(null);
    const videoWrapperRef = useRef(null);
    const [speedOverlay, setSpeedOverlay] = useState(null);
    const speedTimeoutRef = useRef(null);
    const [selectedVideoSrc, setSelectedVideoSrc] = useState('');
    const [blobVersion, setBlobVersion] = useState(0);
    const blobFallbackRef = useRef(new Set());
    const fallbackSizesRef = useRef(new Map());

    // A file that does not load from its own URL (the Cloudflare check on some boards) is fetched by the host script.
    // It is shown from a data: URL, because the Content-Security-Policy of the page refuses blob: URLs.
    // Keep quote characters out of comments in this file: the build finds Tailwind classes by scanning string literals.
    const loadViaBlob = useCallback(url => {
        if (!onFetchBlob || blobFallbackRef.current.has(url) || blobCacheRef.current.has(url)) {
            return;
        }
        blobFallbackRef.current.add(url);
        onFetchBlob(url)
            .then(async blob => {
                const dataUrl = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = () => reject(reader.error);
                    reader.readAsDataURL(blob);
                });
                if (blob.type.startsWith('image/')) {
                    try {
                        const bitmap = await createImageBitmap(blob);
                        fallbackSizesRef.current.set(url, { width: bitmap.width, height: bitmap.height });
                        bitmap.close();
                    } catch (error) {
                        // The size is only shown in the info bar.
                    }
                }
                blobCacheRef.current.set(url, dataUrl);
                setBlobVersion(version => version + 1);
            })
            .catch(() => {
                // Fetched again the next time the file fails to load, for example when it is selected again.
                blobFallbackRef.current.delete(url);
            });
    }, [onFetchBlob]);

    useEffect(() => {
        if (selectedIndex !== null) {
            lastViewedIndexRef.current = selectedIndex;
            onIndexChange && onIndexChange(selectedIndex);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [selectedIndex, onIndexChange]);

    useEffect(() => {
        if (selectedIndex !== null && thumbnailStripRef.current) {
            const activeThumb = thumbnailStripRef.current.children[selectedIndex];
            if (activeThumb) {
                activeThumb.scrollIntoView({ behavior: 'smooth', inline: 'center' });
            }
        }
    }, [selectedIndex]);

    // A mouse wheel only reports vertical movement, which a horizontal strip ignores: turn it into horizontal scrolling.
    // A native listener, because the wheel listeners React attaches are passive and cannot cancel the event.
    useEffect(() => {
        const strip = thumbnailStripRef.current;
        if (!strip) {
            return undefined;
        }
        const handleStripWheel = event => {
            if (event.ctrlKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) {
                return;
            }
            // deltaMode 1 counts lines (Firefox with a mouse wheel), 2 counts pages.
            const unit = event.deltaMode === 1 ? 40 : event.deltaMode === 2 ? strip.clientWidth : 1;
            strip.scrollLeft += event.deltaY * unit * 3;
            event.preventDefault();
            event.stopPropagation();
        };
        strip.addEventListener('wheel', handleStripWheel, { passive: false });
        return () => strip.removeEventListener('wheel', handleStripWheel);
    }, [selectedIndex === null]);

    useEffect(() => {
        const handler = () => setIsFullscreen(Boolean(document.fullscreenElement));
        document.addEventListener('fullscreenchange', handler);
        return () => document.removeEventListener('fullscreenchange', handler);
    }, []);

    useEffect(() => {
        if (overlayTimeoutRef.current) {
            clearTimeout(overlayTimeoutRef.current);
            overlayTimeoutRef.current = null;
        }
        if ((isFullscreen || isPlaying) && !isEditingInterval) {
            const delay = isPlaying ? 300 : 1500;
            overlayTimeoutRef.current = window.setTimeout(() => setOverlayVisible(false), delay);
        } else if (!isFullscreen && !isPlaying) {
            setOverlayVisible(true);
        }
        return () => {
            if (overlayTimeoutRef.current) {
                clearTimeout(overlayTimeoutRef.current);
            }
        };
    }, [isFullscreen, isPlaying, isEditingInterval]);

    const applyTransform = useCallback(() => {
        if (transformRef.current) {
            transformRef.current.style.transform = `scale(${zoomRef.current}) translate(${panRef.current.x}px, ${panRef.current.y}px)`;
        }
        if (mediaRotateRef.current) {
            const flip = isFlippedRef.current ? -1 : 1;
            mediaRotateRef.current.style.transform = `scaleX(${flip}) rotate(${rotationRef.current}deg)`;
        }
        const wrapper = videoWrapperRef.current;
        const video = videoRef.current;
        if (wrapper && video && video.clientWidth > 0) {
            const rot = ((rotationRef.current % 360) + 360) % 360;
            const swapped = rot === 90 || rot === 270;
            if (swapped) {
                wrapper.style.width = `${video.clientHeight}px`;
                wrapper.style.height = `${video.clientWidth}px`;
            } else {
                wrapper.style.width = '';
                wrapper.style.height = '';
            }
        }
    }, []);

    const resetTransform = useCallback(() => {
        zoomRef.current = 1;
        panRef.current = { x: 0, y: 0 };
        isFlippedRef.current = false;
        rotationRef.current = 0;
        if (mediaRotateRef.current) {
            mediaRotateRef.current.style.transition = 'none';
        }
        if (videoWrapperRef.current) {
            videoWrapperRef.current.style.width = '';
            videoWrapperRef.current.style.height = '';
        }
        setDimensions(null);
        setMediaLoaded(false);
        setIsVideoPaused(false);
        setSeekbarValue(0);
        applyTransform();
        requestAnimationFrame(() => {
            if (mediaRotateRef.current) {
                mediaRotateRef.current.style.transition = 'transform 0.15s ease-out';
            }
        });
    }, [applyTransform]);

    useEffect(() => {
        if (seekbarRafRef.current) {
            cancelAnimationFrame(seekbarRafRef.current);
            seekbarRafRef.current = null;
        }
        if (selectedIndex === null || isVideoPaused) {
            return undefined;
        }
        const tick = () => {
            if (videoRef.current) {
                const { currentTime, duration } = videoRef.current;
                if (duration > 0) {
                    setSeekbarValue(currentTime / duration);
                }
            }
            seekbarRafRef.current = requestAnimationFrame(tick);
        };
        seekbarRafRef.current = requestAnimationFrame(tick);
        return () => {
            if (seekbarRafRef.current) {
                cancelAnimationFrame(seekbarRafRef.current);
            }
        };
    }, [selectedIndex, isVideoPaused]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || selectedIndex === null || isVideoPaused || !('requestVideoFrameCallback' in video)) {
            lastFrameTimeRef.current = -1;
            return undefined;
        }
        lastFrameTimeRef.current = -1;
        let id;
        const onFrame = (_now, meta) => {
            if (lastFrameTimeRef.current >= 0) {
                const delta = meta.mediaTime - lastFrameTimeRef.current;
                if (delta > 0 && delta < 0.2) {
                    frameDurationRef.current = delta;
                }
            }
            lastFrameTimeRef.current = meta.mediaTime;
            id = video.requestVideoFrameCallback(onFrame);
        };
        id = video.requestVideoFrameCallback(onFrame);
        return () => video.cancelVideoFrameCallback(id);
    }, [selectedIndex, isVideoPaused]);

    useEffect(() => {
        if (slideshowTimerRef.current) {
            clearTimeout(slideshowTimerRef.current);
            slideshowTimerRef.current = null;
        }
        if (isPlaying && selectedIndex !== null && mediaLoaded) {
            const currentItem = media[selectedIndex];
            const isVideo = currentItem && VIDEO_EXTS.includes(currentItem.ext);
            if (!isVideo) {
                slideshowTimerRef.current = window.setTimeout(() => {
                    setSelectedIndex(prev => (prev + 1) % media.length);
                    resetTransform();
                }, slideshowInterval * 1000);
            }
        }
        return () => {
            if (slideshowTimerRef.current) {
                clearTimeout(slideshowTimerRef.current);
            }
        };
    }, [isPlaying, selectedIndex, media, slideshowInterval, mediaLoaded, resetTransform]);

    useEffect(() => {
        if (selectedIndex === null || media.length === 0) {
            return;
        }
        const lookahead = 3;
        for (let i = 1; i <= lookahead; i += 1) {
            const idx = (selectedIndex + i) % media.length;
            if (idx === selectedIndex) {
                continue;
            }
            const item = media[idx];
            if (precacheRef.current.has(item.url)) {
                continue;
            }
            precacheRef.current.add(item.url);
            if (VIDEO_EXTS.includes(item.ext)) {
                if (item.size > 0 && item.size < 4 * 1024 * 1024) {
                    fetch(item.url, { priority: 'low' })
                        .then(response => response.blob())
                        .then(blob => {
                            blobCacheRef.current.set(item.url, URL.createObjectURL(blob));
                        })
                        .catch(() => {});
                }
            } else {
                const img = new Image();
                img.onerror = () => loadViaBlob(item.url);
                img.src = item.url;
            }
        }
    }, [selectedIndex, media, loadViaBlob]);

    useEffect(() => {
        const blobCache = blobCacheRef.current;
        return () => {
            blobCache.forEach(url => URL.revokeObjectURL(url));
            blobCache.clear();
        };
    }, []);

    useEffect(() => {
        if (selectedIndex !== null) {
            requestAnimationFrame(applyTransform);
        }
    }, [selectedIndex, applyTransform]);

    useLayoutEffect(() => {
        if (selectedIndex === null) {
            return;
        }
        const item = media[selectedIndex];
        if (!item) {
            return;
        }
        if (VIDEO_EXTS.includes(item.ext)) {
            if (blobCacheRef.current.has(item.url)) {
                setMediaLoaded(true);
            }
            return;
        }
        const img = imgRef.current;
        if (img && img.complete && img.naturalWidth > 0) {
            setMediaLoaded(true);
        }
    }, [selectedIndex, media]);

    useEffect(() => {
        if (mediaLoaded) {
            requestAnimationFrame(applyTransform);
        }
    }, [mediaLoaded, applyTransform]);

    useEffect(() => {
        const onResize = () => applyTransform();
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [applyTransform]);

    const handleNext = useCallback(() => {
        setSelectedIndex(prev => (prev + 1) % media.length);
        resetTransform();
    }, [media.length, resetTransform]);

    const handlePrev = useCallback(() => {
        setSelectedIndex(prev => (prev - 1 + media.length) % media.length);
        resetTransform();
    }, [media.length, resetTransform]);

    const toggleSlideshow = useCallback(() => setIsPlaying(playing => !playing), []);

    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen().catch(() => {});
        }
    }, []);

    const closeLightbox = useCallback(() => {
        const closingIndex = lastViewedIndexRef.current;
        onClose && onClose(closingIndex);
        setSelectedIndex(null);
        setIsPlaying(false);
        setOverlayVisible(true);
    }, [onClose]);

    const toggleThumbDocked = useCallback(() => {
        setThumbDocked(docked => {
            const nextDocked = !docked;
            window.localStorage.setItem('desux-gallery-thumbnails-docked', String(nextDocked));
            return nextDocked;
        });
    }, []);

    const handleSave = useCallback(async () => {
        const item = selectedIndex !== null ? media[selectedIndex] : null;
        if (!item) {
            return;
        }

        const filename = `${item.filename}${item.ext}`;
        const isVideo = VIDEO_EXTS.includes(item.ext);
        const hasTransform = isFlippedRef.current || rotationRef.current !== 0;

        if (isVideo || !hasTransform) {
            if (onSave) {
                onSave(item);
            }
            return;
        }

        try {
            let bitmap;
            if (onFetchBlob) {
                const blob = await onFetchBlob(item.url);
                bitmap = await createImageBitmap(blob);
            } else {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.src = item.url;
                await new Promise((resolve, reject) => {
                    img.onload = () => resolve();
                    img.onerror = reject;
                });
                bitmap = await createImageBitmap(img);
            }

            const rot = ((rotationRef.current % 360) + 360) % 360;
            const swapDims = rot === 90 || rot === 270;
            const canvas = document.createElement('canvas');
            canvas.width = swapDims ? bitmap.height : bitmap.width;
            canvas.height = swapDims ? bitmap.width : bitmap.height;
            const ctx = canvas.getContext('2d');
            ctx.translate(canvas.width / 2, canvas.height / 2);
            if (isFlippedRef.current) {
                ctx.scale(-1, 1);
            }
            ctx.rotate(rot * Math.PI / 180);
            ctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);
            bitmap.close();

            const ext = item.ext.toLowerCase();
            const mimeType = ext === '.jpg' || ext === '.jpeg'
                ? 'image/jpeg'
                : ext === '.webp'
                    ? 'image/webp'
                    : 'image/png';
            const quality = mimeType === 'image/jpeg'
                ? 0.92
                : mimeType === 'image/webp'
                    ? 0.90
                    : undefined;

            canvas.toBlob(blob => {
                if (!blob) {
                    return;
                }
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, mimeType, quality);
        } catch {
            if (onSave) {
                onSave(item);
            }
        }
    }, [media, selectedIndex, onSave, onFetchBlob]);

    useEffect(() => {
        const item = selectedIndex !== null ? media[selectedIndex] : null;
        if (!item || !VIDEO_EXTS.includes(item.ext)) {
            setSelectedVideoSrc('');
            return;
        }

        setSelectedVideoSrc(blobCacheRef.current.get(item.url) || item.url);
    }, [selectedIndex, media, blobVersion]);

    useEffect(() => {
        if (selectedIndex === null) {
            return undefined;
        }

        const handler = event => {
            switch (event.key) {
                case 'ArrowLeft':
                    event.preventDefault();
                    handlePrev();
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    handleNext();
                    break;
                case ' ':
                    event.preventDefault();
                    toggleSlideshow();
                    break;
                case 'Escape':
                    event.preventDefault();
                    closeLightbox();
                    break;
                case 'f':
                case 'F':
                    event.preventDefault();
                    toggleFullscreen();
                    break;
                case 'h':
                case 'H':
                    event.preventDefault();
                    isFlippedRef.current = !isFlippedRef.current;
                    applyTransform();
                    break;
                case 's':
                case 'S':
                    event.preventDefault();
                    handleSave();
                    break;
                case 't':
                case 'T':
                    event.preventDefault();
                    toggleThumbDocked();
                    break;
                case 'm':
                case 'M':
                    event.preventDefault();
                    if (videoRef.current) {
                        videoRef.current.muted = !videoRef.current.muted;
                    }
                    break;
                case ',':
                case '<':
                    if (videoRef.current && videoRef.current.paused) {
                        event.preventDefault();
                        videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - frameDurationRef.current);
                    }
                    break;
                case '.':
                case '>':
                    if (videoRef.current && videoRef.current.paused) {
                        event.preventDefault();
                        videoRef.current.currentTime = Math.min(videoRef.current.duration, videoRef.current.currentTime + frameDurationRef.current);
                    }
                    break;
                case '[':
                    if (videoRef.current) {
                        event.preventDefault();
                        videoRef.current.playbackRate = Math.max(0.25, videoRef.current.playbackRate - 0.25);
                        setSpeedOverlay({ text: `${videoRef.current.playbackRate}x`, key: Date.now() });
                        if (speedTimeoutRef.current) clearTimeout(speedTimeoutRef.current);
                        speedTimeoutRef.current = setTimeout(() => setSpeedOverlay(null), 3000);
                    }
                    break;
                case ']':
                    if (videoRef.current) {
                        event.preventDefault();
                        videoRef.current.playbackRate = Math.min(2, videoRef.current.playbackRate + 0.25);
                        setSpeedOverlay({ text: `${videoRef.current.playbackRate}x`, key: Date.now() });
                        if (speedTimeoutRef.current) clearTimeout(speedTimeoutRef.current);
                        speedTimeoutRef.current = setTimeout(() => setSpeedOverlay(null), 3000);
                    }
                    break;
                case '\\':
                    if (videoRef.current) {
                        event.preventDefault();
                        videoRef.current.playbackRate = 1;
                        setSpeedOverlay({ text: '1x', key: Date.now() });
                        if (speedTimeoutRef.current) clearTimeout(speedTimeoutRef.current);
                        speedTimeoutRef.current = setTimeout(() => setSpeedOverlay(null), 3000);
                    }
                    break;
                case 'r':
                case 'R':
                    event.preventDefault();
                    rotationRef.current += 90;
                    applyTransform();
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [selectedIndex, handleNext, handlePrev, toggleSlideshow, toggleFullscreen, closeLightbox, applyTransform, handleSave, toggleThumbDocked]);

    const handleWheel = useCallback(event => {
        event.preventDefault();
        event.stopPropagation();
        const oldZoom = zoomRef.current;
        const newZoom = Math.max(0.1, Math.min(10, event.deltaY > 0 ? oldZoom * 0.9 : oldZoom * 1.1));
        const bounds = contentAreaRef.current?.getBoundingClientRect();
        if (bounds) {
            const cx = event.clientX - (bounds.left + bounds.width / 2);
            const cy = event.clientY - (bounds.top + bounds.height / 2);
            panRef.current = {
                x: panRef.current.x + cx * (1 / newZoom - 1 / oldZoom),
                y: panRef.current.y + cy * (1 / newZoom - 1 / oldZoom)
            };
        }
        zoomRef.current = newZoom;
        applyTransform();
    }, [applyTransform]);

    const getPointerDistance = (p1, p2) => Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);

    const handlePointerDown = useCallback(event => {
        event.preventDefault();
        didDragRef.current = false;
        transformRef.current?.setPointerCapture(event.pointerId);
        pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
        if (pointersRef.current.size === 1) {
            isDraggingRef.current = true;
            if (transformRef.current) {
                transformRef.current.style.cursor = 'grabbing';
                transformRef.current.style.transition = 'none';
            }
        }
        if (pointersRef.current.size === 2) {
            isDraggingRef.current = false;
            const pts = Array.from(pointersRef.current.values());
            const distance = getPointerDistance(pts[0], pts[1]);
            initialPinchRef.current = {
                distance,
                scale: zoomRef.current,
                midX: (pts[0].x + pts[1].x) / 2,
                midY: (pts[0].y + pts[1].y) / 2,
                panX: panRef.current.x,
                panY: panRef.current.y
            };
        }
    }, []);

    const handlePointerMove = useCallback(event => {
        if (!pointersRef.current.has(event.pointerId)) {
            return;
        }
        const last = pointersRef.current.get(event.pointerId);
        pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

        if (pointersRef.current.size === 1 && isDraggingRef.current) {
            const dx = event.clientX - last.x;
            const dy = event.clientY - last.y;
            if (Math.abs(dx) + Math.abs(dy) > 3) {
                didDragRef.current = true;
            }
            const z = zoomRef.current;
            panRef.current = { x: panRef.current.x + dx / z, y: panRef.current.y + dy / z };
        } else if (pointersRef.current.size === 2 && initialPinchRef.current) {
            const pts = Array.from(pointersRef.current.values());
            const newDistance = getPointerDistance(pts[0], pts[1]);
            const newMidX = (pts[0].x + pts[1].x) / 2;
            const newMidY = (pts[0].y + pts[1].y) / 2;

            zoomRef.current = Math.max(0.1, Math.min(10, initialPinchRef.current.scale * (newDistance / initialPinchRef.current.distance)));
            const z = zoomRef.current;
            panRef.current = {
                x: initialPinchRef.current.panX + (newMidX - initialPinchRef.current.midX) / z,
                y: initialPinchRef.current.panY + (newMidY - initialPinchRef.current.midY) / z
            };
        }
        applyTransform();
    }, [applyTransform]);

    const handlePointerUp = useCallback(event => {
        pointersRef.current.delete(event.pointerId);
        if (pointersRef.current.size === 0) {
            isDraggingRef.current = false;
            if (transformRef.current) {
                transformRef.current.style.cursor = 'grab';
                transformRef.current.style.transition = 'transform 0.1s ease-out';
            }
            if (!didDragRef.current && videoRef.current) {
                if (videoRef.current.paused) {
                    void videoRef.current.play().catch(() => {});
                } else {
                    videoRef.current.pause();
                }
            }
        } else if (pointersRef.current.size === 1) {
            isDraggingRef.current = true;
        }
        if (pointersRef.current.size < 2) {
            initialPinchRef.current = null;
        }
    }, []);

    const handleDoubleClick = useCallback(event => {
        event.stopPropagation();
        zoomRef.current = 1;
        panRef.current = { x: 0, y: 0 };
        applyTransform();
    }, [applyTransform]);

    const handleMouseMove = useCallback(() => {
        if (!(isFullscreen || isPlaying) || isEditingInterval) {
            return;
        }
        setOverlayVisible(true);
        if (overlayTimeoutRef.current) {
            clearTimeout(overlayTimeoutRef.current);
        }
        overlayTimeoutRef.current = setTimeout(() => setOverlayVisible(false), 2000);
    }, [isFullscreen, isPlaying, isEditingInterval]);

    const selectedItem = selectedIndex !== null ? media[selectedIndex] : null;
    const overlayFadeStyle = {
        opacity: overlayVisible ? 1 : 0,
        transition: 'opacity 0.3s ease',
        pointerEvents: overlayVisible ? 'auto' : 'none'
    };

    if (!selectedItem) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col bg-black/95" onClick={closeLightbox} onMouseMove={handleMouseMove} style={{ animation: 'fadeIn 0.15s ease-out', cursor: !overlayVisible ? 'none' : undefined }}>
            <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-center z-50 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-300" onClick={event => event.stopPropagation()} style={overlayFadeStyle}>
                <div className="flex gap-2 items-center">
                    <div className="text-white/70 bg-black/40 px-3 py-1 rounded-full text-sm font-mono">{selectedIndex + 1} / {media.length}</div>
                    <div className="text-white/50 bg-black/40 px-3 py-1 rounded-full text-sm font-mono max-w-xs truncate" title={`${selectedItem.filename}${selectedItem.ext}`}>{selectedItem.filename}{selectedItem.ext}</div>
                </div>
                <div className="flex gap-1 items-center">
                    <TbBtn onClick={() => { isFlippedRef.current = !isFlippedRef.current; applyTransform(); }} title="Flip (H)"><FlipHorizontal size={18} /></TbBtn>
                    <TbBtn onClick={() => { rotationRef.current += 90; applyTransform(); }} title="Rotate (R)"><RotateCw size={18} /></TbBtn>
                    <div className="flex items-center bg-white/10 rounded-lg overflow-hidden border border-white/10">
                        <TbBtn onClick={toggleSlideshow} title="Slideshow">{isPlaying ? <Pause size={18} /> : <Play size={18} />}</TbBtn>
                        {isPlaying && (
                            <input
                                type="number"
                                className="w-10 bg-transparent text-white text-center text-sm p-1 border-l border-white/20 outline-none caret-transparent selection:bg-[var(--accent)]"
                                value={isEditingInterval ? intervalEditValue : slideshowInterval}
                                onFocus={event => {
                                    setIntervalEditValue(String(slideshowInterval));
                                    setIsEditingInterval(true);
                                    requestAnimationFrame(() => event.target.select());
                                }}
                                onChange={event => setIntervalEditValue(event.target.value)}
                                onKeyDown={event => {
                                    if (event.key === 'Enter') {
                                        event.preventDefault();
                                        const value = parseInt(intervalEditValue, 10) || 10;
                                        setSlideshowInterval(value);
                                        window.localStorage.setItem('desux-gallery-slideshow-interval', String(value));
                                        setIsEditingInterval(false);
                                        event.target.blur();
                                    }
                                }}
                                onBlur={() => {
                                    const value = parseInt(intervalEditValue, 10) || 10;
                                    setSlideshowInterval(value);
                                    window.localStorage.setItem('desux-gallery-slideshow-interval', String(value));
                                    setIsEditingInterval(false);
                                }}
                                onClick={event => event.stopPropagation()}
                            />
                        )}
                    </div>
                    <TbBtn onClick={toggleFullscreen} title="Fullscreen (F)"><Maximize2 size={18} /></TbBtn>
                    {selectedItem.sourceUrl ? (
                        <a href={selectedItem.sourceUrl} target="_blank" rel="noopener noreferrer" onClick={event => event.stopPropagation()}>
                            <TbBtn onClick={() => {}} title="View Source"><ExternalLink size={18} /></TbBtn>
                        </a>
                    ) : null}
                    <TbBtn onClick={handleSave} title="Download (S)"><Download size={18} /></TbBtn>
                    <TbBtn onClick={closeLightbox} title="Close (Esc)" isExit><X size={18} /></TbBtn>
                </div>
            </div>

            {selectedItem.tim > 0 ? (
                <div className="absolute top-12 left-3 z-50 transition-opacity duration-300" style={overlayFadeStyle} onClick={event => event.stopPropagation()}>
                    <div className="flex items-center gap-1.5 text-white/40 text-xs" title={formatExactTime(selectedItem.tim)}>
                        {SOURCE_FAVICONS[selectedItem.source] ? <img src={SOURCE_FAVICONS[selectedItem.source]} alt="" className="w-3.5 h-3.5" style={{ imageRendering: 'auto' }} /> : null}
                        <span>{formatRelativeTime(selectedItem.tim)}</span>
                    </div>
                </div>
            ) : null}

            <div ref={contentAreaRef} className="flex-1 flex items-center justify-center overflow-hidden relative">
                {!mediaLoaded ? (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                        <div className="w-48 h-0.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full w-2/5 bg-[var(--accent)] rounded-full animate-[shimmer_1s_ease-in-out_infinite]" />
                        </div>
                    </div>
                ) : null}

                <NavArrow direction="prev" onClick={event => { event.stopPropagation(); setIsPlaying(false); handlePrev(); }} visible={overlayVisible} thumbDocked={thumbDocked} />

                <div
                    ref={transformRef}
                    className="relative flex items-center justify-center"
                    style={{ cursor: 'grab', touchAction: 'none', transition: 'transform 0.1s ease-out' }}
                    onWheel={handleWheel}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    onDoubleClick={handleDoubleClick}
                    onClick={event => event.stopPropagation()}
                >
                    {VIDEO_EXTS.includes(selectedItem.ext) ? (
                        <div ref={videoWrapperRef} className="relative flex items-center justify-center">
                            <div ref={mediaRotateRef} style={{ transition: 'transform 0.15s ease-out' }}>
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    loop={!isPlaying}
                                    className={`max-w-[90vw] max-h-[95vh] rounded shadow-2xl pointer-events-none transition-opacity duration-200 block ${mediaLoaded ? 'opacity-100' : 'opacity-0'}`}
                                    src={selectedVideoSrc}
                                    onError={() => {
                                        if (selectedVideoSrc === selectedItem.url) {
                                            loadViaBlob(selectedItem.url);
                                        }
                                    }}
                                    onLoadedData={() => setMediaLoaded(true)}
                                    onEnded={() => {
                                        if (isPlaying) {
                                            setSelectedIndex(prev => (prev + 1) % media.length);
                                            resetTransform();
                                        }
                                    }}
                                    onLoadedMetadata={event => {
                                        const video = event.target;
                                        setDimensions({ width: video.videoWidth, height: video.videoHeight });
                                        const storedVolume = window.localStorage.getItem('desux-gallery-video-volume');
                                        const storedMuted = window.localStorage.getItem('desux-gallery-video-muted');
                                        if (storedVolume) {
                                            video.volume = parseFloat(storedVolume);
                                        }
                                        if (storedMuted) {
                                            video.muted = storedMuted === 'true';
                                        }
                                    }}
                                    onVolumeChange={event => {
                                        const video = event.target;
                                        window.localStorage.setItem('desux-gallery-video-volume', String(video.volume));
                                        window.localStorage.setItem('desux-gallery-video-muted', String(video.muted));
                                        setIsVideoMuted(video.muted);
                                    }}
                                    onPlay={() => setIsVideoPaused(false)}
                                    onPause={() => setIsVideoPaused(true)}
                                />
                            </div>
                            {mediaLoaded ? (
                                <div
                                    className="absolute bottom-0 left-0 right-0 flex items-center gap-1.5 px-2 h-5 bg-black/60 backdrop-blur-sm rounded-b z-10"
                                    style={{ ...overlayFadeStyle, pointerEvents: overlayVisible ? 'auto' : 'none' }}
                                    onClick={event => event.stopPropagation()}
                                    onPointerDown={event => event.stopPropagation()}
                                    onPointerMove={event => event.stopPropagation()}
                                    onPointerUp={event => event.stopPropagation()}
                                    onWheel={event => event.stopPropagation()}
                                >
                                    <button
                                        className="text-white/70 hover:text-white transition-colors duration-100 bg-transparent border-none cursor-pointer p-0.5"
                                        onClick={() => {
                                            if (!videoRef.current) {
                                                return;
                                            }
                                            if (isVideoPaused) {
                                                void videoRef.current.play().catch(() => {});
                                            } else {
                                                videoRef.current.pause();
                                            }
                                        }}
                                    >
                                        {isVideoPaused ? <Play size={12} /> : <Pause size={12} />}
                                    </button>
                                    <input
                                        type="range"
                                        className="video-seekbar flex-1"
                                        min={0}
                                        max={1}
                                        step={0.001}
                                        value={seekbarValue}
                                        onChange={event => {
                                            const value = parseFloat(event.target.value);
                                            setSeekbarValue(value);
                                            if (videoRef.current && videoRef.current.duration) {
                                                videoRef.current.currentTime = value * videoRef.current.duration;
                                            }
                                        }}
                                        style={{ background: `linear-gradient(to right, var(--accent) ${seekbarValue * 100}%, rgba(255,255,255,0.12) ${seekbarValue * 100}%)` }}
                                    />
                                    <button
                                        className="text-white/70 hover:text-white transition-colors duration-100 bg-transparent border-none cursor-pointer p-0.5"
                                        onClick={() => {
                                            if (videoRef.current) {
                                                videoRef.current.muted = !videoRef.current.muted;
                                            }
                                        }}
                                    >
                                        {isVideoMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    ) : (
                        <div ref={mediaRotateRef} style={{ transition: 'transform 0.15s ease-out' }}>
                            {(blobCacheRef.current.get(selectedItem.url) || '').startsWith('data:') ? (
                                // The Content-Security-Policy of the page refuses a data: URL in an img element but
                                // allows it in an embed element, which Firefox draws like an image.
                                <embed
                                    ref={imgRef}
                                    key={selectedItem.url}
                                    src={blobCacheRef.current.get(selectedItem.url)}
                                    type={blobCacheRef.current.get(selectedItem.url).slice(5, blobCacheRef.current.get(selectedItem.url).indexOf(';'))}
                                    className={`max-w-[90vw] max-h-[95vh] rounded shadow-2xl object-contain transition-opacity duration-200 pointer-events-none ${mediaLoaded ? 'opacity-100' : 'opacity-0'}`}
                                    onLoad={() => {
                                        const size = fallbackSizesRef.current.get(selectedItem.url);
                                        if (size) {
                                            setDimensions(size);
                                        }
                                        setMediaLoaded(true);
                                    }}
                                />
                            ) : (
                            <img
                                ref={imgRef}
                                src={blobCacheRef.current.get(selectedItem.url) || selectedItem.url}
                                onError={event => {
                                    if (event.target.getAttribute('src') === selectedItem.url) {
                                        loadViaBlob(selectedItem.url);
                                    }
                                }}
                                alt={selectedItem.filename}
                                fetchPriority="high"
                                className={`max-w-[90vw] max-h-[95vh] rounded shadow-2xl object-contain transition-opacity duration-200 ${mediaLoaded ? 'opacity-100' : 'opacity-0'}`}
                                draggable={false}
                                onLoad={event => {
                                    const image = event.target;
                                    setDimensions({ width: image.naturalWidth, height: image.naturalHeight });
                                    setMediaLoaded(true);
                                }}
                            />
                            )}
                        </div>
                    )}
                </div>

                <NavArrow direction="next" onClick={event => { event.stopPropagation(); setIsPlaying(false); handleNext(); }} visible={overlayVisible} thumbDocked={thumbDocked} />

                {speedOverlay ? (
                    <div key={speedOverlay.key} className="absolute top-16 right-6 z-20 pointer-events-none" style={{ animation: 'speedOverlay 3s ease forwards' }}>
                        <div className="bg-black/70 text-white/90 px-3 py-1 rounded-lg text-sm font-mono backdrop-blur-sm">{speedOverlay.text}</div>
                    </div>
                ) : null}

                <div className="absolute bottom-2 right-3 bg-black/70 px-2 py-0.5 rounded text-xs text-white/60 font-mono pointer-events-none z-10 transition-all duration-300" style={{ opacity: overlayVisible ? 1 : 0, transform: overlayVisible && thumbDocked ? 'translateY(-5.5rem)' : 'translateY(0)' }}>
                    {selectedItem.size ? `${formatSize(selectedItem.size)} | ` : ''}{dimensions ? `${dimensions.width}x${dimensions.height}` : '...'}
                </div>
            </div>

            <button
                className="group/dock absolute bottom-0 left-0 right-0 z-50 h-1.5 flex items-center justify-center bg-[#141418] hover:bg-[#1e1e1e] cursor-pointer transition-all duration-300 ease-in-out"
                style={{ transform: thumbDocked ? 'translateY(-5rem)' : 'translateY(0)', opacity: overlayVisible ? 1 : 0, pointerEvents: overlayVisible ? 'auto' : 'none' }}
                onClick={event => {
                    event.stopPropagation();
                    toggleThumbDocked();
                }}
                title={thumbDocked ? 'Hide thumbnails (T)' : 'Show thumbnails (T)'}
            >
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#141418] group-hover/dock:bg-[#1e1e1e] px-2.5 py-0.5 rounded-t text-white/50 group-hover/dock:text-white/80 transition-colors duration-150">
                    {thumbDocked ? <ChevronDown size={16} strokeWidth={3.5} /> : <ChevronUp size={16} strokeWidth={3.5} />}
                </span>
            </button>

            <div
                className="group/kb absolute bottom-2 left-3 z-50"
                style={{ transform: thumbDocked ? 'translateY(-5.5rem)' : 'translateY(0)', transition: 'transform 0.3s ease-in-out, opacity 0.3s ease', opacity: overlayVisible ? 1 : 0, pointerEvents: overlayVisible ? 'auto' : 'none' }}
                onClick={event => event.stopPropagation()}
            >
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white/40 text-xs font-bold cursor-default select-none group-hover/kb:bg-white/15 group-hover/kb:text-white/60 transition-all duration-150">K</div>
                <div className="absolute bottom-full left-0 mb-2 hidden group-hover/kb:block">
                    <div className="bg-black/85 backdrop-blur-md rounded-xl border border-white/10 px-4 py-3 text-xs text-white/70 whitespace-nowrap shadow-2xl animate-[fadeIn_0.15s_ease-out]">
                        <div className="text-white/40 font-semibold uppercase tracking-wider text-[10px] mb-2">Shortcuts</div>
                        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
                            <kbd className="text-white/50 font-mono">← →</kbd><span>Previous / Next</span>
                            <kbd className="text-white/50 font-mono">Space</kbd><span>Slideshow</span>
                            <kbd className="text-white/50 font-mono">F</kbd><span>Fullscreen</span>
                            <kbd className="text-white/50 font-mono">H</kbd><span>Flip</span>
                            <kbd className="text-white/50 font-mono">R</kbd><span>Rotate</span>
                            <kbd className="text-white/50 font-mono">S</kbd><span>Download</span>
                            <kbd className="text-white/50 font-mono">T</kbd><span>Thumbnails</span>
                            <kbd className="text-white/50 font-mono">M</kbd><span>Mute</span>
                            <kbd className="text-white/50 font-mono">&lt; &gt;</kbd><span>Frame step</span>
                            <kbd className="text-white/50 font-mono">[ ]</kbd><span>Playback speed</span>
                            <kbd className="text-white/50 font-mono">\</kbd><span>Reset speed</span>
                            <kbd className="text-white/50 font-mono">Scroll</kbd><span>Zoom</span>
                            <kbd className="text-white/50 font-mono">Esc</kbd><span>Close</span>
                        </div>
                    </div>
                </div>
            </div>

            <div
                className="absolute bottom-0 left-0 right-0 z-40 transition-transform duration-300 ease-in-out"
                style={{ transform: thumbDocked ? 'translateY(0)' : 'translateY(100%)' }}
                onClick={event => event.stopPropagation()}
            >
                <div ref={thumbnailStripRef} className="h-20 bg-black flex items-center gap-1.5 px-3 overflow-x-auto" style={overlayFadeStyle}>
                    {media.map((item, index) => (
                        <button
                            key={`thumb-${index}`}
                            onClick={() => {
                                setSelectedIndex(index);
                                setIsPlaying(false);
                                resetTransform();
                            }}
                            className={`relative h-16 w-16 shrink-0 rounded overflow-hidden border-solid border-2 transition-all duration-100 cursor-pointer ${index === selectedIndex ? 'border-[var(--accent)] opacity-100' : 'border-transparent opacity-40 hover:opacity-80'}`}
                        >
                            <LazyThumb src={item.thumbnail} alt="" className="object-cover w-full h-full" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

function mountGallery(mountNode, props) {
    const root = createRoot(mountNode);
    let currentProps = props;

    function render(nextProps) {
        currentProps = nextProps;
        root.render(<DesuXReactGallery {...currentProps} />);
    }

    render(currentProps);

    return {
        update(nextProps) {
            render({ ...currentProps, ...nextProps });
        },
        unmount() {
            root.unmount();
        }
    };
}

globalThis.desuXReactGalleryRuntime = {
    mountGallery
};
