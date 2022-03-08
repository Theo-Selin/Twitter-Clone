$(document).ready(() => {
    $.get("/api/chats", (data, status, check) => {
        if(check.status == 400) {
            alert("Could not get chat list")
        } else {
            renderChatList(data, $(".resultsContainer"))
        }
    })
})

function renderChatList(chatList, container) {
    chatList.forEach(chat => {
        const html = createChatHtml(chat)
        container.append(html)
    })

    if(chatList.length == 0) {
        container.append("<span class='noResults'>Nothing to show</span>")
    }
}

function createChatHtml(chatData) {
    let chatName = getChatName(chatData)
    let image = getChatImageElements(chatData)
    const latestMessage ="This is the latest message"

    return `
        <a href="/messages/${chatData._id}" class="resultListItem">
            ${image}
            <div class="resultsDetailsContainer ellipsis">
                <span class="heading ellipsis">${chatName}</span>
                <span class="subText ellipsis">${latestMessage}</span>
            </div>
        </a>
    `
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

function getChatImageElements(chatData) {
    const otherChatUsers = getOtherChatUsers(chatData.users)
    let groupChatClass = ""
    let chatImage = getUserChatImageElement(otherChatUsers[0])

    if(otherChatUsers.length > 1) {
        groupChatClass = "groupChatImage"
        chatImage += getUserChatImageElement(otherChatUsers[1])
    }

    return `<div class="resultsImageContainer ${groupChatClass}">${chatImage}</div>`
}

function getUserChatImageElement(user) {
    if(!user || !user.profilePicture) {
        return alert("User passed is not valid")
    }

    return `<img src="${user.profilePicture}" alt="User's profile picture">`
}