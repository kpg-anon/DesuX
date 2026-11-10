let reactGalleryApp = null;

function isGalleryOpen() {
    return Boolean(galleryContainer && document.body.contains(galleryContainer));
}

function getGalleryStartIndex() {
    const activeMedia = hoveredMedia || getMediaContextUnderPointer();
    if (!activeMedia) {
        return clamp(currentIndex, 0, Math.max(images.length - 1, 0));
    }

    const activeIndex = images.findIndex(media => media.src === activeMedia.link && String(media.postId) === String(activeMedia.postId));
    return activeIndex >= 0 ? activeIndex : clamp(currentIndex, 0, Math.max(images.length - 1, 0));
}

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function parseGallerySize(metadataLabel) {
    if (!metadataLabel) {
        return 0;
    }

    const match = metadataLabel.match(/([\d.]+)\s*(B|Ki?B|Mi?B|Gi?B)/i);
    if (!match) {
        return 0;
    }

    const value = parseFloat(match[1]);
    if (!Number.isFinite(value)) {
        return 0;
    }

    const unit = match[2].toUpperCase().replace('I', '');
    const multipliers = {
        B: 1,
        KB: 1024,
        MB: 1024 * 1024,
        GB: 1024 * 1024 * 1024
    };

    return Math.round(value * (multipliers[unit] || 1));
}

function splitGalleryFilename(filename, extension) {
    const safeFilename = filename || '';
    if (!extension) {
        return {
            baseName: safeFilename,
            extension: ''
        };
    }

    const lowerFilename = safeFilename.toLowerCase();
    if (lowerFilename.endsWith(extension.toLowerCase())) {
        return {
            baseName: safeFilename.slice(0, -extension.length),
            extension
        };
    }

    return {
        baseName: safeFilename,
        extension
    };
}

function getCurrentBoardKey() {
    const match = window.location.pathname.match(/^\/([^/]+)\//);
    return match ? match[1] : '';
}

function getCurrentThreadId() {
    const match = window.location.pathname.match(/\/thread\/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
}

function createReactGalleryMediaItems() {
    const boardKey = getCurrentBoardKey();
    const threadId = getCurrentThreadId();

    return images.map((item, index) => {
        const extension = item.extension || getMediaExtension(item.src) || '';
        const splitName = splitGalleryFilename(item.filename || getFilenameFromUrl(item.src), extension);
        const timestamp = item.timeIso ? Date.parse(item.timeIso) : 0;
        const numericPostId = parseInt(String(item.postId || index + 1), 10) || index + 1;

        return {
            id: numericPostId,
            index,
            source: 'desuarchive',
            boardKey,
            boardId: boardKey,
            threadId,
            url: item.src,
            thumbnail: item.thumbnail || item.src,
            filename: splitName.baseName || `media-${index + 1}`,
            ext: splitName.extension || extension,
            tim: Number.isFinite(timestamp) ? timestamp : 0,
            size: parseGallerySize(item.metadataLabel),
            width: item.width || null,
            height: item.height || null,
            sourceUrl: item.sourceUrl || '',
            postId: item.postId || ''
        };
    });
}

function closeGallery() {
    if (reactGalleryApp) {
        reactGalleryApp.unmount();
        reactGalleryApp = null;
    }

    if (galleryContainer) {
        galleryContainer.remove();
        galleryContainer = null;
    }
}

function scrollToPost(postId) {
    if (!postId) {
        return;
    }
    const highlightLink = document.querySelector('a[data-function="highlight"][data-post="' + postId + '"]');
    if (highlightLink) {
        highlightLink.click();
    }
}

function isThreadPage() {
    return document.body.classList.contains('desux-thread-page');
}

function createGallery() {
    collectMediaItems();

    if (!images.length) {
        return;
    }

    if (isGalleryOpen()) {
        closeGallery();
        return;
    }

    const runtime = globalThis.desuXReactGalleryRuntime;
    if (!runtime || typeof runtime.mountGallery !== 'function') {
        console.error('desuX React gallery runtime is unavailable.');
        return;
    }

    currentIndex = getGalleryStartIndex();

    galleryContainer = document.createElement('div');
    galleryContainer.id = prefix + 'reactGalleryHost';
    galleryContainer.style.position = 'fixed';
    galleryContainer.style.inset = '0';
    galleryContainer.style.zIndex = '9999';
    galleryContainer.style.pointerEvents = 'none';

    const shadowRoot = galleryContainer.attachShadow({ mode: 'open' });
    const styleElement = document.createElement('style');
    styleElement.textContent = desuXReactGalleryStyles;

    const mountNode = document.createElement('div');
    mountNode.style.pointerEvents = 'auto';

    shadowRoot.append(styleElement, mountNode);
    document.body.appendChild(galleryContainer);

    const mediaItems = createReactGalleryMediaItems();
    const threadPage = isThreadPage();

    reactGalleryApp = runtime.mountGallery(mountNode, {
        media: mediaItems,
        initialSelectedIndex: currentIndex,
        onIndexChange(index) {
            currentIndex = index;
            if (threadPage) {
                scrollToPost(mediaItems[index] && mediaItems[index].postId);
            }
        },
        onClose(index) {
            if (typeof index === 'number') {
                currentIndex = index;
            }
            window.setTimeout(closeGallery, 0);
            if (threadPage) {
                window.setTimeout(() => {
                    scrollToPost(mediaItems[currentIndex] && mediaItems[currentIndex].postId);
                }, 0);
            }
        },
        onSave(item) {
            if (item && item.url) {
                const filename = (item.filename || '') + (item.ext || '');
                downloadMedia(item.url, filename || getFilenameFromUrl(item.url));
            }
        },
        onFetchBlob(url) {
            return fetchMediaBlob(url);
        }
    });
}

function handleGalleryKeydown() {
    return false;
}
