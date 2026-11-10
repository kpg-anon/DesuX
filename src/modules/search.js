function getCurrentPageNumber() {
    const matches = window.location.pathname.match(/page\/(\d+)/);
    const pageNumber = matches ? parseInt(matches[1], 10) : 1;
    return pageNumber;
}

function loadMoreContent() {
    if (loading || !isSettingEnabled('infiniteScroll') || !window.location.pathname.includes('/search/')) return;

    const now = Date.now();
    if (now < nextSearchLoadAllowedAt) {
        return;
    }

    loading = true;
    nextSearchLoadAllowedAt = now + SEARCH_LOAD_COOLDOWN_MS;

    const nextPageUrl = constructNextPageUrl(currentPageNumber);

    $.ajax({
        url: nextPageUrl,
        type: 'GET',
        success: function(response) {
            const $response = $(response);
            $response.find('article.backlink_container, section.section_title, h3.section_title, div.paginate').remove();
            const newContent = $response.find('.thread').parent();

            if (newContent.length === 0) {
                $('#footer').show();
                nextSearchLoadAllowedAt = Number.POSITIVE_INFINITY;
                loading = false;
                return;
            }

            $('.thread').last().parent().append(newContent.html());

            attachHoverPreviewAndDownload();
            collectMediaItems();

            currentPageNumber++;
            searchRetryDelay = SEARCH_LOAD_RETRY_BASE_MS;
            nextSearchLoadAllowedAt = Date.now() + SEARCH_LOAD_COOLDOWN_MS;
            loading = false;
        },
        error: function(xhr) {
            const wasRateLimited = xhr && xhr.status === 429;
            const retryDelay = wasRateLimited ? searchRetryDelay : SEARCH_LOAD_COOLDOWN_MS;

            if (wasRateLimited) {
                searchRetryDelay = Math.min(searchRetryDelay * 2, SEARCH_LOAD_RETRY_MAX_MS);
            } else {
                searchRetryDelay = SEARCH_LOAD_RETRY_BASE_MS;
            }

            nextSearchLoadAllowedAt = Date.now() + retryDelay;
            loading = false;
        }
    });
}

function constructNextPageUrl(pageNumber) {
    let basePath = window.location.href;
    const nextPageNumber = pageNumber + 1;

    if (basePath.includes('/page/')) {
        basePath = basePath.replace(/\/page\/\d+/, `/page/${nextPageNumber}`);
    } else {
        if (!basePath.endsWith('/')) {
            basePath += '/';
        }
        basePath += `page/${nextPageNumber}/`;
    }

    return basePath;
}
