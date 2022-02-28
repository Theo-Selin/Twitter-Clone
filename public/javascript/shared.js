// Shared javascript code over the site //

$("#postTextarea").keyup(event => {
    const textbox = $(event.target)
    const value = textbox.val().trim()

    const submitButton = $("#submitPostButton")

    if(submitButton.length == 0) return alert("No submit button found")

    if(value == "") {
        submitButton.prop("disabled", true)
        return
    } else {
        submitButton.prop("disabled", false)
    }
})

$("#submitPostButton").click(event => {
    const button = $(event.target)
    const textbox = $("#postTextarea")

    const data = {
        content: textbox.val()
    }

    $.post("/api/posts", data, postData => {
        const html = createPostHtml(postData)
        $(".postsContainer").prepend(html)
        textbox.val("")
        button.prop("disabled", true)
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

function getIdFromElement(element) {
    const isRoot = element.hasClass("post")
    const rootElement = isRoot == true ? element : element.closest(".post")
    const postId = rootElement.data().id

    if(postId == undefined) return alert("Id undefined")

    return postId
}

function createPostHtml(postData) {

    if(postData == null) return alert("post object is null")

    const postedBy = postData.postedBy
    const isShared = postData.shareData !== undefined
    const sharedBy = isShared ? postData.postedBy.username : null
    postData = isShared ? postData.shareData : postData

    console.log(isShared)

    if(postedBy._id === undefined) {
        return console.log("User object not populated")
    }

    const sender = `${postedBy.firstName} ${postedBy.lastName}`
    const time = timeDifference(new Date(), new Date(postData.createdAt))
    const likeButtonActiveClass = postData.likes.includes(userLoggedIn._id) ? "active" : ""
    const shareButtonActiveClass = postData.shareUsers.includes(userLoggedIn._id) ? "active" : ""

    let sharedText = ""
    if(isShared) {
        sharedText = `<span>
            <i class="fa-solid fa-retweet"></i>
            Shared by <a href="/profile/${sharedBy}">♪${sharedBy}</a>
        </span>`
    }

    return `<div class="post" data-id='${postData._id}'>
                <div class="postActionContainer">
                    ${sharedText}
                </div>
                <div class="mainContentContainer">

                    <div class="userImageContainer">
                        <img src="${postedBy.profilePicture}">
                    </div>

                    <div class="postContentContainer">

                        <div class="postHeader">
                            <span class="sender">${sender}</span>
                            <a class="username" href="/profile/${postedBy.username}">♪${postedBy.username}</a>
                            <span class="date">${time}</span>
                        </div>

                        <div class="postBody">
                            <span>${postData.content}</span>
                        </div>

                        <div class="postFooter">
                            <div class="postButtonContainer comment">
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