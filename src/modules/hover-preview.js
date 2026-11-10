function showHoverPreview(mediaContext) {
    preview.innerHTML = '';
    const media = mediaContext.isVideo ? document.createElement('video') : document.createElement('img');

    if (mediaContext.isVideo) {
        media.autoplay = true;
        media.loop = true;
        media.muted = true;
    }

    let relayed = false;
    const loadThroughRelay = () => {
        if (relayed) {
            return;
        }
        relayed = true;

        // The helper tab takes a moment: show a spinner until the whole file has arrived.
        const placeholder = document.createElement('div');
        placeholder.className = 'desux-preview-spinner';
        media.style.display = 'none';
        preview.appendChild(placeholder);

        getRelayDataUrl(mediaContext.link).then((dataUrl) => {
            if (!media.isConnected) {
                return;
            }

            // The page's Content-Security-Policy refuses data: and blob: in <img>, but allows data: in <embed>,
            // which Firefox draws like an image, and in <video>.
            let shown = media;
            if (!mediaContext.isVideo) {
                shown = document.createElement('embed');
                shown.type = dataUrl.slice(5, dataUrl.indexOf(';'));
                shown.style.display = 'none';
                media.replaceWith(shown);
            }
            shown.addEventListener(mediaContext.isVideo ? 'loadeddata' : 'load', () => {
                placeholder.remove();
                shown.style.display = '';
            }, { once: true });
            shown.src = dataUrl;
        }).catch((error) => {
            console.error('desuX: could not load', mediaContext.link, error);
            if (!preview.contains(placeholder)) {
                return;
            }
            const note = document.createElement('div');
            note.className = 'desux-preview-note';
            note.textContent = 'Full file not loaded: ' + ((error && error.message) || error) + '. Open the file in a tab once, then hover again.';
            preview.appendChild(note);
        });
    };

    if (isMediaBlocked(mediaContext.link)) {
        loadThroughRelay();
    } else {
        media.addEventListener('error', () => {
            if (isRelayableUrl(mediaContext.link) && isSettingEnabled('helperTab')) {
                loadThroughRelay();
            }
        }, { once: true });
        media.src = mediaContext.link;
    }

    preview.appendChild(media);
    preview.style.display = 'block';
    positionHoverPreview();
}

// Placement follows 4chan X's image hover (UI.hover): the preview sits beside the pointer, on the side with more
// room, and slides vertically in proportion to the pointer's height so it never leaves the viewport.
const HOVER_PREVIEW_PADDING = 25;
const HOVER_PREVIEW_GAP = 45;

function positionHoverPreview() {
    if (!hoveredMedia || !lastPointerPosition) {
        return;
    }

    const clientWidth = document.documentElement.clientWidth;
    const clientHeight = document.documentElement.clientHeight;
    const width = preview.offsetWidth;
    const height = preview.offsetHeight + HOVER_PREVIEW_PADDING;
    const { x, y } = lastPointerPosition;

    const top = Math.max(0, y * (clientHeight - height) / clientHeight);
    const onLeftHalf = x <= clientWidth / 2;
    const margin = Math.max(0, Math.min((onLeftHalf ? x : clientWidth - x) + HOVER_PREVIEW_GAP, clientWidth - width));

    preview.style.top = top + 'px';
    preview.style.left = onLeftHalf ? margin + 'px' : 'auto';
    preview.style.right = onLeftHalf ? 'auto' : margin + 'px';
}

function clearHoverPreview() {
    preview.innerHTML = '';
    preview.style.display = 'none';
}

function setHoveredMedia(mediaContext) {
    hoveredMedia = mediaContext;

    if (mediaContext) {
        showHoverPreview(mediaContext);
    } else {
        clearHoverPreview();
    }
}

function getMediaContextUnderPointer() {
    if (lastPointerPosition && typeof lastPointerPosition.x === 'number' && typeof lastPointerPosition.y === 'number') {
        const pointerElement = document.elementFromPoint(lastPointerPosition.x, lastPointerPosition.y);
        const pointerContext = findMediaContext(pointerElement);
        if (pointerContext) {
            return pointerContext;
        }
    }

    if (lastPointerTarget) {
        const targetContext = findMediaContext(lastPointerTarget);
        if (targetContext) {
            return targetContext;
        }
    }

    const hoveredElements = Array.from(document.querySelectorAll(':hover')).reverse();
    for (const hoveredElement of hoveredElements) {
        const hoveredContext = findMediaContext(hoveredElement);
        if (hoveredContext) {
            return hoveredContext;
        }
    }

    return null;
}

function attachHoverPreviewAndDownload() {
    if (mediaHoverHandlersAttached) {
        return;
    }

    mediaHoverHandlersAttached = true;

    document.addEventListener('pointermove', function(event) {
        lastPointerTarget = event.target;
        lastPointerPosition = { x: event.clientX, y: event.clientY };
        positionHoverPreview();
    }, true);

    // The preview changes size when the file's dimensions become known and when the spinner gives way to the file.
    new ResizeObserver(positionHoverPreview).observe(preview);

    document.addEventListener('mouseover', function(event) {
        if (!isSettingEnabled('hoverPreview')) {
            return;
        }

        const mediaContext = findMediaContext(event.target);
        if (!mediaContext || isSameMediaContext(mediaContext, hoveredMedia)) {
            return;
        }

        lastPointerPosition = { x: event.clientX, y: event.clientY };
        setHoveredMedia(mediaContext);
    }, true);

    document.addEventListener('mouseout', function(event) {
        if (!hoveredMedia) {
            return;
        }

        const mediaContext = findMediaContext(event.target);
        if (!isSameMediaContext(mediaContext, hoveredMedia)) {
            return;
        }

        const relatedContext = findMediaContext(event.relatedTarget);
        if (isSameMediaContext(relatedContext, hoveredMedia)) {
            return;
        }

        setHoveredMedia(null);
    }, true);
}
