// Only render posts from followings //
$(document).ready(() => {
    $.get("/api/posts", {followingOnly: true }, results => {
        renderPosts(results, $(".postsContainer"))
    })
})