function handleDownloadShortcut(event) {
    if (event.key.toLowerCase() !== 's' || event.repeat || !isSettingEnabled('downloadKey') || isEditableElement(document.activeElement)) {
        return;
    }

    if (isGalleryOpen()) {
        return;
    }

    event.preventDefault();
    const activeMedia = hoveredMedia || getMediaContextUnderPointer();
    if (activeMedia) {
        downloadMedia(activeMedia.link, activeMedia.filename);
    }
}

function handleGalleryShortcut(event) {
    if (event.altKey && event.key.toLowerCase() === 'g' && (isSettingEnabled('gallery') || isGalleryOpen())) {
        if (!images.length) {
            collectMediaItems();
        }
        event.preventDefault();
        createGallery();
        return true;
    }

    if (isGalleryOpen()) {
        return false;
    }

    if (handleGalleryKeydown(event)) {
        event.preventDefault();
        return true;
    }

    return false;
}

function handleImageOnlyShortcut(event) {
    if ((event.key !== 'F' && event.key !== 'f') || !isSettingEnabled('imageOnlyKey') || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) {
        return;
    }

    if (isGalleryOpen()) {
        return;
    }

    if (isEditableElement(event.target) || !/https:\/\/desuarchive\.org\/.*\/thread\/.*/.test(window.location.href)) {
        return;
    }

    togglePostVisibility();
    event.preventDefault();
}

function attachKeyboardShortcuts() {
    document.addEventListener('keydown', function(event) {
        handleDownloadShortcut(event);
        if (handleGalleryShortcut(event)) {
            return;
        }
        handleImageOnlyShortcut(event);
    });
}
