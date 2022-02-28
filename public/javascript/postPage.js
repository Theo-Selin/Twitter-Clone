$(document).ready(() => {
    $.get(`/api/posts/${postId}`, results => {
        renderPostsWithReplies(results, $(".postsContainer"))
    })
})