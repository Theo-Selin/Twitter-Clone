$(document).ready(() => {
    $.get(`/api/chats/${chatId}`, (data) => {
        $("#chatName").text(getChatName(data))
    })
})

$("#chatNameButton").click(() => {
    const name = $("#chatNameTextbox").val().trim()
    
    $.ajax({
        url: `/api/chats/${chatId}`,
        type: "PUT",
        data: { chatName: name },
        success: (data, status, check) => {
            if(check.status != 204) {
                alert("Could not update")
            } else {
                location.reload()
            }
        }
    })
})

$(".sendMessageButton").click(() => {
    chatMessageButton()
})

$(".chatTextbox").keydown((event) => {

    if(event.which === 13 && !event.shiftKey) {
        chatMessageButton()
        return false
    }
})

function chatMessageButton() {
    let content = $(".chatTextbox").val().trim()

    if(content != "") {
        sendChatMessage(content)
        $(".chatTextbox").val("")
    }
}

function sendChatMessage(content) {
    $.post("/api/messages", {content: content, chatId: chatId}, (data, status, check) => {
        console.log(data)
    })
}