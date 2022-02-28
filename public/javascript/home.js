$(document).ready(() => {
    $.get("/api/posts", results => {
        renderPosts(results, $(".postsContainer"))
    })
})