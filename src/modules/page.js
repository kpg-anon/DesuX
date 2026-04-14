function togglePostVisibility() {
    const posts = document.querySelectorAll('article.post > .post_wrapper');
    posts.forEach(post => {
        const hasImage = post.querySelector('.post_file') !== null;
        if (!hasImage) {
            post.classList.toggle('desux-post-hidden');
        }
    });
}

function addPageSpecificClass() {
    const urlPath = window.location.pathname;
    const bodyClass = document.body.classList;

    if (urlPath.includes('/search/')) {
        bodyClass.add('desux-search-page');
    } else if (urlPath.match(/\/\w+\/thread\/\d+/)) {
        bodyClass.add('desux-thread-page');
    }
}
