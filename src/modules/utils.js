function isVideoUrl(url) {
    return /\.(webm|mp4)(?:$|[?#])/i.test(url);
}

function isValidMediaUrl(url) {
    return /\.(?:jpe?g|png|gif|webm|mp4|webp)(?:$|[?#])/i.test(url);
}

function getFilenameFromElement(filenameElement) {
    if (!filenameElement) {
        return null;
    }

    return (filenameElement.getAttribute('title') || filenameElement.textContent || '').trim() || null;
}

function getFilenameFromUrl(url) {
    const cleanUrl = url.split('#')[0].split('?')[0];
    return cleanUrl.split('/').pop();
}

function isEditableElement(element) {
    if (!element || !(element instanceof Element)) {
        return false;
    }

    return /input|textarea/i.test(element.tagName) || element.isContentEditable;
}
