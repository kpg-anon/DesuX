function getOriginalFilename(postId) {
    let postElement = document.querySelector(`.thread[id="${postId}"]`);
    let filenameLink;

    if (postElement) {
        filenameLink = postElement.querySelector('.post_file_filename');
    } else {
        postElement = document.querySelector(`.post_wrapper a[data-function="quote"][data-post="${postId}"]`);
        const postWrapperParent = postElement ? postElement.closest('.post_wrapper') : null;
        filenameLink = postWrapperParent ? postWrapperParent.querySelector('.post_file_filename') : null;
    }

    if (filenameLink) {
        if (filenameLink.getAttribute('title')) {
            return filenameLink.getAttribute('title').trim();
        } else if (filenameLink.textContent) {
            return filenameLink.textContent.trim();
        }
    }

    const currentMedia = images.find(img => img.postId === postId);
    if (currentMedia && currentMedia.src) {
        const urlParts = currentMedia.src.split('.');
        const ext = urlParts[urlParts.length - 1];
        return `default-filename.${ext}`;
    }

    return 'default-filename';
}

function downloadMedia(url, filename) {
    if (!url) {
        return;
    }

    GM_xmlhttpRequest({
        method: 'GET',
        url,
        responseType: 'blob',
        onload: function(response) {
            saveBlob(response.response, filename || getFilenameFromUrl(url));
        },
        onerror: function(error) {
            console.error('Error downloading file:', error);
            alert('Download failed.');
        }
    });
}

function downloadCurrentMedia() {
    const currentMedia = images[currentIndex];
    if (!currentMedia) {
        return;
    }

    const preferredFilename = currentMedia.filename || getFilenameFromUrl(currentMedia.src);
    if (preferredFilename) {
        downloadMedia(currentMedia.src, preferredFilename);
        return;
    }

    const threadElement = document.querySelector('.thread');
    let postId = currentMedia.postId;
    if (!postId && threadElement) {
        postId = threadElement.id;
    }

    downloadMedia(currentMedia.src, getOriginalFilename(postId));
}

function saveBlob(blob, filename) {
    const blobUrl = window.URL.createObjectURL(blob);
    const anchor = GM_addElement(document.body, 'a', { href: blobUrl, download: filename });
    anchor.click();
    document.body.removeChild(anchor);
    window.setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
}
