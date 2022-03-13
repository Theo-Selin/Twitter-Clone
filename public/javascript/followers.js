$(document).ready(() => {

    if(selectedTab === "followers") {
        loadFollowers()
    } else {
        loadFollowing()
    }
})

// Renders list of followers //
function loadFollowers() {
    $.get(`/api/users/${profileUserId}/followers`, results => {
        renderUsers(results.followers, $(".resultsContainer"))
    })
}

// Renders list of followings //
function loadFollowing() {
    $.get(`/api/users/${profileUserId}/following`, results => {
        renderUsers(results.following, $(".resultsContainer"))
    })
}