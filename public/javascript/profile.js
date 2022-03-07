$(document).ready(() => {

    if(selectedTab === "replies") {
        loadReplies()
    } else {
        loadPosts()
    }
})

function loadPosts() {
    $.get("/api/posts", { postedBy: profileUserId, pinned: true }, results => {
        renderPinnedPost(results, $(".pinnedPostContainer"))
    })

    $.get("/api/posts", { postedBy: profileUserId, isReply: false }, results => {
        renderPosts(results, $(".postsContainer"))
    })
}

function loadReplies() {
    $.get("/api/posts", { postedBy: profileUserId, isReply: true }, results => {
        renderPosts(results, $(".postsContainer"))
    })
}

function renderPinnedPost(results, container) {

    if(results.length == 0) {
        container.hide()
        return
    }
    container.html("")

    results.forEach(result => {
        const html = createPostHtml(result)
        container.append(html)
    })
}