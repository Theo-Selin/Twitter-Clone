$(document).ready(() => {

    if(selectedTab === "followers") {
        loadFollowers()
    } else {
        loadFollowing()
    }
})

function loadFollowers() {
    $.get(`/api/users/${profileUserId}/followers`, results => {
        renderUsers(results.followers, $(".resultsContainer"))
    })
}

function loadFollowing() {
    $.get(`/api/users/${profileUserId}/following`, results => {
        renderUsers(results.following, $(".resultsContainer"))
    })
}

function renderUsers(results, container) {
    container.html("")

    results.forEach(result => {
        const html = createUserHtml(result, true)
        container.append(html)
    })

    if(results.length == 0) {
        container.append("<span class='noResults'>You need to start filling this page with people</span")
    }
}

function createUserHtml(userData, showFollowButton) {
    const name = `${userData.firstName} ${userData.lastName}`
    const isFollowing = userLoggedIn.following && userLoggedIn.following.includes(userData._id)
    const text = isFollowing ? "Forget" : "Remember"
    const buttonClass = isFollowing ? "followButton following" : "followButton"

    let followButton = ""

    if(showFollowButton && userLoggedIn._id !== userData._id) {
        followButton = `
            <div class="followButtonContainer">
                <button class="${buttonClass}" data-user="${userData._id}">${text}</button>
            </div>`
    }

    return `
        <div class="user">
            <div class="userImageContainer">
                <img src="${userData.profilePicture}">
            </div>
            <div class="userDetailsContainer">
                <div class="header">
                    <span class="sender">${name}</span>
                    <a class="username" href="/profile/${userData.username}">♪${userData.username}</a>
                </div>
            </div>
            ${followButton}
        </div>    
    `
}