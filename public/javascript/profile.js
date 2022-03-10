$(document).ready(() => {

    if(selectedTab === "replies") {
        loadReplies()
    } else {
        loadPosts()
    }
})

$("#editProfileButton").click(() => {
    const firstName = $("#firstName").val().trim()
    const lastName = $("#lastName").val().trim()
    const username = $("#username").val().trim()
    const email = $("#email").val().trim()
    
    $.ajax({
        url: `/api/users/${profileUserId}`,
        type: "PUT",
        data: {
            firstName: firstName,
            lastName: lastName,
            username: username,
            email: email
        },
        success: (data, status, check) => {
            if(check.status != 204) {
                alert("Could not update")
            } else {
                window.location.href = "/logout"
            }
        }
    })
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