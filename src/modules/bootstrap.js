function initializeSearchPage() {
    currentPageNumber = getCurrentPageNumber();

    if (window.location.pathname.includes('/search/') && isSettingEnabled('infiniteScroll')) {
        $('#footer').hide();
    }
}

function attachSearchScrollLoader() {
    window.addEventListener('scroll', function() {
        if (window.location.pathname.includes('/search/') && window.scrollY + window.innerHeight >= document.body.scrollHeight - 90) {
            loadMoreContent();
        }
    });
}

function initializeApp() {
    initializeMediaRelay();
    initializeSettings();
    initializeSearchPage();
    attachKeyboardShortcuts();
    attachSearchScrollLoader();
    addPageSpecificClass();
    attachHoverPreviewAndDownload();
    collectMediaItems();
}
