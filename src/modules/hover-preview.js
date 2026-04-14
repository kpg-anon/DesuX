function showHoverPreview(mediaContext) {
    preview.innerHTML = '';
    const media = mediaContext.isVideo ? document.createElement('video') : document.createElement('img');
    media.src = mediaContext.link;

    if (mediaContext.isVideo) {
        media.autoplay = true;
        media.loop = true;
        media.muted = true;
    }

    preview.appendChild(media);
    preview.style.display = 'block';
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
    }, true);

    document.addEventListener('mouseover', function(event) {
        const mediaContext = findMediaContext(event.target);
        if (!mediaContext || isSameMediaContext(mediaContext, hoveredMedia)) {
            return;
        }

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
