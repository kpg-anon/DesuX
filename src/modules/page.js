let postsWithoutFileHidden = false;
// Set when F hides the post at the top of the window, so that pressing F again without scrolling goes back to it.
let postVisibilityReturnPoint = null;

function getThreadPostWrappers() {
    return Array.from(document.querySelectorAll('article.post > .post_wrapper'))
        .filter(post => !post.closest('#backlink, .backlink_container'));
}

function postHasFile(post) {
    return post.querySelector('.post_file') !== null;
}

// Picks a post that is still shown after the toggle and the viewport offset it should end up at, so the window stays
// on the same part of the thread. Without this the scroll offset stays the same while the page gets shorter or
// longer, which usually lands at the bottom of the thread.
function getPostVisibilityAnchor(posts, hide) {
    const returnPoint = postVisibilityReturnPoint;
    if (!hide && returnPoint && returnPoint.post.isConnected && Math.abs(window.scrollY - returnPoint.scrollY) < 1) {
        return { post: returnPoint.post, top: returnPoint.top, returnPoint: null };
    }

    // The window starts above every reply (in the opening post), so nothing above it moves. The article stays in the
    // layout when its .post_wrapper is hidden.
    if (!posts.length || posts[0].parentElement.getBoundingClientRect().top >= 0) {
        return null;
    }

    // The first shown post that reaches below the top of the window.
    const topIndex = posts.findIndex(post => !post.classList.contains('desux-post-hidden') && post.getBoundingClientRect().bottom > 0);
    if (topIndex === -1) {
        return null;
    }

    const topPost = posts[topIndex];
    const topPostTop = topPost.getBoundingClientRect().top;
    if (!hide || postHasFile(topPost)) {
        return { post: topPost, top: topPostTop, returnPoint: null };
    }

    // The post at the top is about to be hidden. Put the next post with a file where it was, or at the top of the
    // window if it was partly scrolled past. With no later post with a file the page ends up scrolled to the bottom.
    return {
        post: posts.slice(topIndex + 1).find(postHasFile) || null,
        top: Math.max(topPostTop, 0),
        returnPoint: { post: topPost, top: topPostTop }
    };
}

function togglePostVisibility() {
    const hide = !postsWithoutFileHidden;
    const posts = getThreadPostWrappers();
    const anchor = getPostVisibilityAnchor(posts, hide);

    postsWithoutFileHidden = hide;
    postVisibilityReturnPoint = null;
    posts.forEach(post => {
        if (!postHasFile(post)) {
            post.classList.toggle('desux-post-hidden', hide);
        }
    });

    if (!anchor) {
        return;
    }

    if (anchor.post) {
        // getBoundingClientRect() lays the page out again, including the browser's clamp of the scroll offset to the
        // new page height, so the difference is measured from wherever the window is now.
        const offset = anchor.post.getBoundingClientRect().top - anchor.top;
        if (Math.abs(offset) >= 1) {
            window.scrollBy({ top: offset, behavior: 'instant' });
        }
    }

    if (anchor.returnPoint) {
        postVisibilityReturnPoint = { ...anchor.returnPoint, scrollY: window.scrollY };
    }
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
