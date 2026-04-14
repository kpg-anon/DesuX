function getSourcePostLink(postContainer) {
    const highlightLink = postContainer.querySelector('a[data-function="highlight"][title="Link to this post"]');
    const quoteLink = postContainer.querySelector('a[data-function="quote"]');

    return (highlightLink && highlightLink.href) || (quoteLink && quoteLink.href) || '';
}

function getPostTimeInfo(postContainer) {
    const timeElement = postContainer.querySelector('time');
    if (!timeElement) {
        return {
            text: '',
            title: '',
            iso: ''
        };
    }

    return {
        text: (timeElement.textContent || '').trim(),
        title: (timeElement.getAttribute('title') || '').trim(),
        iso: (timeElement.getAttribute('datetime') || '').trim()
    };
}

function getMediaMetadataLabel(postFileElement) {
    if (!postFileElement) {
        return '';
    }

    return (postFileElement.textContent || '').replace(/\s+/g, ' ').trim();
}

function parseDimensionsFromMetadataLabel(metadataLabel) {
    const match = metadataLabel.match(/(\d+)\s*x\s*(\d+)/i);
    if (!match) {
        return null;
    }

    return {
        width: parseInt(match[1], 10),
        height: parseInt(match[2], 10)
    };
}

function getMediaExtension(url) {
    const filename = getFilenameFromUrl(url) || '';
    const extensionMatch = filename.match(/(\.[^.]+)$/);
    return extensionMatch ? extensionMatch[1].toLowerCase() : '';
}

function findMediaContext(element) {
    if (!element || !(element instanceof Element)) {
        return null;
    }

    const candidate = element.closest('.thread_image_link, .post_file_filename, .post_file_controls a[download], .post_image');
    if (!candidate) {
        return null;
    }

    const postContainer = candidate.closest('.post_wrapper, .thread');
    if (!postContainer) {
        return null;
    }

    const mediaLink = candidate.matches('.thread_image_link') ? candidate : postContainer.querySelector('.thread_image_link');
    if (!mediaLink || !isValidMediaUrl(mediaLink.href)) {
        return null;
    }

    const filenameElement = postContainer.querySelector('.post_file_filename');
    const postLink = postContainer.querySelector('a[data-function="quote"]');

    return {
        link: mediaLink.href,
        filename: getFilenameFromElement(filenameElement) || getFilenameFromUrl(mediaLink.href),
        postId: postLink ? postLink.getAttribute('data-post') : postContainer.id,
        isVideo: isVideoUrl(mediaLink.href)
    };
}

function isSameMediaContext(left, right) {
    return Boolean(left && right && left.link === right.link && left.postId === right.postId);
}

function collectMediaItems() {
    const mediaLinks = document.querySelectorAll('.thread .thread_image_link, .post_wrapper .thread_image_link');
    const existingMedia = new Set(images.map(media => `${media.postId}::${media.src}`));

    mediaLinks.forEach((mediaLink) => {
        const postWrapper = mediaLink.closest('.post_wrapper, .thread');
        if (!postWrapper) {
            return;
        }

        const thumbnailImage = mediaLink.querySelector('img');
        const filenameElement = postWrapper.querySelector('.post_file_filename');
        const postLink = postWrapper.querySelector('a[data-function="quote"]');
        const postFileElement = postWrapper.querySelector('.post_file');
        const postId = postLink ? postLink.getAttribute('data-post') : postWrapper.id;
        const mediaKey = `${postId}::${mediaLink.href}`;

        if (existingMedia.has(mediaKey)) {
            return;
        }

        const metadataLabel = getMediaMetadataLabel(postFileElement);
        const parsedDimensions = parseDimensionsFromMetadataLabel(metadataLabel);
        const timeInfo = getPostTimeInfo(postWrapper);

        existingMedia.add(mediaKey);

        images.push({
            src: mediaLink.href,
            isVideo: isVideoUrl(mediaLink.href),
            thumbnail: thumbnailImage ? thumbnailImage.src : mediaLink.href,
            postId,
            filename: getFilenameFromElement(filenameElement) || getFilenameFromUrl(mediaLink.href),
            sourceUrl: getSourcePostLink(postWrapper),
            metadataLabel,
            width: parsedDimensions ? parsedDimensions.width : null,
            height: parsedDimensions ? parsedDimensions.height : null,
            extension: getMediaExtension(mediaLink.href),
            timeText: timeInfo.text,
            timeTitle: timeInfo.title,
            timeIso: timeInfo.iso
        });
    });
}
