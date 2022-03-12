// Shared javascript code over the site //

// Global variables //
let cropper
let timer
const selectedUsers = []

// Enables button when textarea fills //
$("#postTextarea, #commentTextarea").keyup(event => {
    const textbox = $(event.target)
    const value = textbox.val().trim()

    const isPopup = textbox.parents(".modal").length == 1

    const submitButton = isPopup ? $("#submitCommentButton") : $("#submitPostButton")

    if(submitButton.length == 0) return alert("No submit button found")

    if(value == "") {
        submitButton.prop("disabled", true)
        return
    } else {
        submitButton.prop("disabled", false)
    }
})

// Event handler for submitting posts //
$("#submitPostButton, #submitCommentButton").click(event => {
    const button = $(event.target)
    const isPopup = button.parents(".modal").length == 1
    const textbox = isPopup ? $("#commentTextarea") : $("#postTextarea")
    const data = { content: textbox.val() }

    if(isPopup) {
        const id = button.data().id
        if(id == null) return alert("Id is null")
        data.replyTo = id
    }

    $.post("/api/posts", data, postData => {
        if(postData.replyTo) {
            location.reload()
        } else {
            const html = createPostHtml(postData)
            $(".postsContainer").prepend(html)
            textbox.val("")
            button.prop("disabled", true)
        }
    })
})

// Show specific bootstrap modal for commenting on post //
$("#commentModal").on("show.bs.modal", (event) => {
    const button = $(event.relatedTarget)
    const postId = getIdFromElement(button)
    $("#submitCommentButton").data("id", postId)

    $.get(`/api/posts/${postId}`, results => {
        renderPosts(results.postData, $("#originalPostContainer"))
    })
})

$("#deletePostModal").on("show.bs.modal", (event) => {
    const button = $(event.relatedTarget)
    const postId = getIdFromElement(button)
    $("#deletePostButton").data("id", postId)
})

// Deletes post //
$("#deletePostButton").click((event) => {
    const postId = $(event.target).data("id")

    $.ajax({
        url: `/api/posts/${postId}`,
        type: "DELETE",
        success: (data, status, check) => {

            if(check.status != 202) {
                alert("Could not delete post")
                return
            }

            location.reload()
        }
    })

})

// Triggers modal for pinning post //
$("#confirmPinModal").on("show.bs.modal", (event) => {
    const button = $(event.relatedTarget)
    const postId = getIdFromElement(button)
    $("#pinPostButton").data("id", postId)
})

// Triggers modal for unpinning post //
$("#unpinModal").on("show.bs.modal", (event) => {
    const button = $(event.relatedTarget)
    const postId = getIdFromElement(button)
    $("#unpinPostButton").data("id", postId)
})

// Unpinning post by updating boolean //
$("#unpinPostButton").click((event) => {
    const postId = $(event.target).data("id")

    $.ajax({
        url: `/api/posts/${postId}`,
        type: "PUT",
        data: { pinned: false },
        success: (data, status, check) => {

            if(check.status != 204) {
                alert("Could not unpin post")
                return
            }
            location.reload()
        }
    })
})

// Pin post by updating boolean //
$("#pinPostButton").click((event) => {
    const postId = $(event.target).data("id")

    $.ajax({
        url: `/api/posts/${postId}`,
        type: "PUT",
        data: { pinned: true },
        success: (data, status, check) => {

            if(check.status != 204) {
                alert("Could not pin post")
                return
            }
            location.reload()
        }
    })
})

// Cropper profile piture //
$("#filePhoto").change(function() {
    if(this.files && this.files[0]) {
        const reader = new FileReader()
        reader.onload = (event) => {
            let image = document.getElementById("imagePreview")
            image.src = event.target.result
            if(cropper !== undefined) {
                cropper.destroy()
            }

            cropper = new Cropper(image, {
                aspectRatio: 1/1,
                background: false
            })
        }
        reader.readAsDataURL(this.files[0])
    }
})

// Cropper cover photo //
$("#coverPhoto").change(function() {
    if(this.files && this.files[0]) {
        const reader = new FileReader()
        reader.onload = (event) => {
            let image = document.getElementById("coverPreview")
            image.src = event.target.result
            if(cropper !== undefined) {
                cropper.destroy()
            }

            cropper = new Cropper(image, {
                aspectRatio: 16 / 9,
                background: false
            })
        }
        reader.readAsDataURL(this.files[0])
    }
})

// Upload cropped profile picture //
$("#imageUploadButton").click(() => {
    const canvas = cropper.getCroppedCanvas()

    if(canvas == null) {
        alert("Could not upload")
        return
    }

    canvas.toBlob((blob) => {
        const formData = new FormData()
        formData.append("croppedImage", blob)

        $.ajax({
            url: "/api/users/profilePicture",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: () => location.reload()
        })
    })
})

// Upload cropped cover photo //
$("#coverPhotoButton").click(() => {
    const canvas = cropper.getCroppedCanvas()

    if(canvas == null) {
        alert("Could not upload")
        return
    }

    canvas.toBlob((blob) => {
        const formData = new FormData()
        formData.append("croppedImage", blob)

        $.ajax({
            url: "/api/users/coverPhoto",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: () => location.reload()
        })
    })
})

// Update profile information //
$("#editProfileButton").click(() => {
    const firstName = $("#firstName").val().trim()
    const lastName = $("#lastName").val().trim()
    const username = $("#username").val().trim()
    const email = $("#email").val().trim()
    const aboutMe = $("#aboutMe").val()
    
    $.ajax({
        url: `/api/users/${profileUserId}`,
        type: "PUT",
        data: {
            firstName: firstName,
            lastName: lastName,
            username: username,
            email: email,
            aboutMe: aboutMe
        },
        success: (data, status, check) => {
            if(check.status != 204) {
                alert("Could not update")
            } else {
                window.location.href = `/profile/${profileUserId}`
            }
        }
    })
})

$("#userSearchTextbox").keydown((event) => {
    clearTimeout(timer)
    const textbox = $(event.target)
    let value = textbox.val()

    if(value == "" && (event.which == 8 || event.keyCode == 8)) {
        
        // remove selected user from selection
        selectedUsers.pop()
        updateSelectedUsersHtml()
        $(".resultsContainer").html("")

        if(selectedUsers.length == 0) {
            $("#createChatButton").prop("disabled", true)
        }
        return
    }

    timer = setTimeout(() => {
        value = textbox.val().trim()

        if(value == "") {
            $(".resultsContainer").html("")
        } else {
            searchUsers(value)
        }
    }, 200)
})

$("#createChatButton").click(() => {
    const data = JSON.stringify(selectedUsers)

    $.post("/api/chats", { users: data }, chat => {

        if(!chat || !chat._id) return alert("Can't find chat")

        window.location.href = `/messages/${chat._id}`
    })
})

$(document).on("click", ".likeButton", (event) => {
    const button = $(event.target)
    const postId = getIdFromElement(button)
    
    if(postId === undefined) return

    $.ajax({
        url: `/api/posts/${postId}/like`,
        type: "PUT",
        success: (postData) => {
            button.find("span").text(postData.likes.length || "")

            if(postData.likes.includes(userLoggedIn._id)) {
                button.addClass("active")
            } else {
                button.removeClass("active")
            }
        }
    })
})

$(document).on("click", ".shareButton", (event) => {
    const button = $(event.target)
    const postId = getIdFromElement(button)
    
    if(postId === undefined) return

    $.ajax({
        url: `/api/posts/${postId}/share`,
        type: "POST",
        success: (postData) => {
            button.find("span").text(postData.shareUsers.length || "")

            if(postData.shareUsers.includes(userLoggedIn._id)) {
                button.addClass("active")
            } else {
                button.removeClass("active")
            }
        }
    })
})

$(document).on("click", ".post", (event) => {
    const postCard = $(event.target)
    const postId = getIdFromElement(postCard)

    if(postId !== undefined && !postCard.is("button")) {
        window.location.href = `/posts/${postId}`
    }
})

$(document).on("click", ".followButton", (event) => {
    const button = $(event.target)
    const userId = button.data().user

    $.ajax({
        url: `/api/users/${userId}/follow`,
        type: "PUT",
        success: (data, status, check) => {

            if(check.status == 404) {
                alert("We can't seem to find this user anymore")
                return
            }

            let adjustment = 1

            if(data.following && data.following.includes(userId)) {
                button.addClass("following")
                button.text("Forget")
            } else {
                button.removeClass("following")
                button.text("Remember")
                adjustment = -1
            }

            const followersLabel = $("#followersValue")
            if(followersLabel.lenght != 0) {
                let followersText = followersLabel.text()
                followersText = parseInt(followersText)
                followersLabel.text(followersText + adjustment)
            }
        }
    })

})

// Get postID from root element by looking for closest element with "post" as class //
function getIdFromElement(element) {
    const isRoot = element.hasClass("post")
    const rootElement = isRoot == true ? element : element.closest(".post")
    const postId = rootElement.data().id

    if(postId == undefined) return alert("Id undefined")

    return postId
}

// Creates the HTML for posts //
function createPostHtml(postData, postFocus = false) {

    if(postData == null) return alert("Post object is null")

    const postedBy = postData.postedBy
    const isShared = postData.shareData !== undefined
    const sharedBy = isShared ? postData.postedBy.username : null
    postData = isShared ? postData.shareData : postData

    if(postedBy._id === undefined) {
        return console.log("User object not populated")
    }

    const sender = `${postData.postedBy.firstName} ${postData.postedBy.lastName}`
    const time = timeDifference(new Date(), new Date(postData.createdAt))

    // Class changes for styling //
    const likeButtonActiveClass = postData.likes.includes(userLoggedIn._id) ? "active" : ""
    const shareButtonActiveClass = postData.shareUsers.includes(userLoggedIn._id) ? "active" : ""
    const postFocusClass = postFocus ? "postFocus" : ""

    let sharedText = ""
    if(isShared) {
        sharedText = `<span>
            <i class="fa-solid fa-retweet"></i>
            Shared by <a href="/profile/${sharedBy}">♪${sharedBy}</a>
        </span>`
    }

    // Text indicating reply //
    let replyIndicator = ""
    if(postData.replyTo && postData.replyTo._id) {

        if(!postData.replyTo._id) {
            return alert("Reply to is not populated")
        } else if(!postData.replyTo.postedBy._id){
            return alert("PostedBy is not populated")
        }

        const replyToUsername = postData.replyTo.postedBy.username
        replyIndicator = `
            <div class="replyIndicator">
                Replying to <a href="/profile/${replyToUsername}">♪${replyToUsername}<a>
            </div>`
    }

    // Buttons for deleting or pinning posts //
    let buttons = ""
    let pinnedPostLabel = ""
    if(postData.postedBy._id == userLoggedIn._id) {

        let pinnedClass = ""
        let dataTarget = "#confirmPinModal"
        if(postData.pinned === true) {
            pinnedClass = "active"
            dataTarget = "#unpinModal"
            pinnedPostLabel = "<i class='fa-solid fa-thumbtack'></i> <span>Pinned post</span>"
        }

        buttons = `
            <button class="pinPostButton ${pinnedClass}" data-id="${postData._id}" data-bs-toggle="modal" data-bs-target="${dataTarget}">
            <i class="fa-solid fa-thumbtack"></i>
            </button>

            <button class="deletePostMark" data-id="${postData._id}" data-bs-toggle="modal" data-bs-target="#deletePostModal">
                <i class="fa-solid fa-xmark"></i>
            </button>`
    }

    // Post html //
    return `<div class="post ${postFocusClass}" data-id='${postData._id}'>
                <div class="postActionContainer">
                    ${sharedText}
                </div>
                <div class="mainContentContainer">

                    <div class="userImageContainer">
                        <img src="${postData.postedBy.profilePicture}">
                    </div>

                    <div class="postContentContainer">
                        <div class="pinnedPostLabel">${pinnedPostLabel}</div>
                        <div class="postHeader">
                            <span class="sender">${sender}</span>
                            <a class="username" href="/profile/${postData.postedBy.username}">♪${postData.postedBy.username}</a>
                            <span class="date">${time}</span>
                            ${buttons}
                        </div>

                        ${replyIndicator}

                        <div class="postBody">
                            <span>${postData.content}</span>
                        </div>

                        <div class="postFooter">
                            <div class="postButtonContainer" comment>
                                <button data-bs-toggle="modal" data-bs-target="#commentModal">
                                    <i class="fa-regular fa-comment"></i>
                                </button>
                            </div>

                            <div class="postButtonContainer like">
                                <button class="likeButton ${likeButtonActiveClass}">
                                    <i class="fa-regular fa-heart"></i>
                                    <span>${postData.likes.length || ""}</span>
                                </button>
                            </div>

                            <div class="postButtonContainer share">
                                <button class="shareButton ${shareButtonActiveClass}">
                                    <i class="fa-solid fa-retweet"></i>
                                    <span>${postData.shareUsers.length || ""}</span>
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>`
}

// TIMESTAMP CODE //
function timeDifference(current, previous) {

    var msPerMinute = 60 * 1000
    var msPerHour = msPerMinute * 60
    var msPerDay = msPerHour * 24
    var msPerMonth = msPerDay * 30
    var msPerYear = msPerDay * 365

    var elapsed = current - previous;

    if (elapsed < msPerMinute) {
        if(elapsed/1000 < 30) return "Just now"

        return Math.round(elapsed/1000) + ' seconds ago' 
    }

    else if (elapsed < msPerHour) {
         return Math.round(elapsed/msPerMinute) + ' minutes ago'  
    }

    else if (elapsed < msPerDay ) {
         return Math.round(elapsed/msPerHour ) + ' hours ago'  
    }

    else if (elapsed < msPerMonth) {
        return Math.round(elapsed/msPerDay) + ' days ago'
    }

    else if (elapsed < msPerYear) {
        return Math.round(elapsed/msPerMonth) + ' months ago' 
    }

    else {
        return Math.round(elapsed/msPerYear ) + ' years ago' 
    }
}

// Makes sure post data is in array and fills container with post //
function renderPosts(results, container) {
    container.html("")

    if(!Array.isArray(results)) {
        results = [results]
    }

    results.forEach(result => {
        const html = createPostHtml(result)
        container.append(html)
    })

    if(results.length == 0) {
        container.append("<span class='noResults'>Nothing to show.</span>")
    }
}

function renderPostsWithReplies(results, container) {
    container.html("")

    if(results.replyTo !== undefined && results.replyTo._id !== undefined) {
        const html = createPostHtml(results.replyTo)
        container.append(html)
    }

    const mainPostHtml = createPostHtml(results.postData, true)
    container.append(mainPostHtml)

    results.replies.forEach(result => {
        const html = createPostHtml(result)
        container.append(html)
    })
}

function renderUsers(results, container) {
    container.html("")

    results.forEach(result => {
        const html = createUserHtml(result, true)
        container.append(html)
    })

    if(results.length == 0) {
        container.append("<span class='noResults'>No results found</span")
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

function searchUsers(searchTerm) {
    $.get("/api/users", { search: searchTerm }, results => {
        renderSelectableUsers(results, $(".resultsContainer"))
    })
}

function renderSelectableUsers(results, container) {
    container.html("")

    results.forEach(result => {

        // removes users from the list if they're previously selected //
        if(result._id == userLoggedIn._id || selectedUsers.some(user => user._id == result._id)) {
            return
        }

        const html = createUserHtml(result, false)
        const element = $(html)
        element.click(() => userSelected(result))
        container.append(element)
    })

    if(results.length == 0) {
        container.append("<span class='noResults'>No results found</span")
    }
}

function userSelected(user) {
    selectedUsers.push(user)
    updateSelectedUsersHtml()
    $("#userSearchTextbox").val("").focus()
    $(".resultsContainer").html("")
    $("#createChatButton").prop("disabled", false)
}

function updateSelectedUsersHtml() {
    const elements = []

    selectedUsers.forEach(user => {
        const name = `${user.firstName} ${user.lastName}`
        const userElement = $(`<span class="selectedUser">${name}</span>`)
        elements.push(userElement)
    })

    $(".selectedUser").remove()
    $("#selectedUsers").prepend(elements)
}

function getChatName(chatData) {
    let chatName = chatData.chatName

    if(!chatName) {
        const otherChatUsers = getOtherChatUsers(chatData.users)
        const namesArray = otherChatUsers.map(user => `${user.firstName} ${user.lastName}`)
        chatName = namesArray.join(", ")
    }

    return chatName
}

function getOtherChatUsers(users) {
    if(users.length == 1) return users

    return users.filter(user => user._id != userLoggedIn._id)
}