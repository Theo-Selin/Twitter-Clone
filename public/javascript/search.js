let timer

$("#searchInput").keydown((event) => {
    clearTimeout(timer)
    const textbox = $(event.target)
    let value = textbox.val()
    let searchType = textbox.data().search

    timer = setTimeout(() => {
        value = textbox.val().trim()

        if(value == "") {
            $(".resultsContainer").html("")
        } else {
            search(value, searchType)
        }
    }, 200)
})

function search(searchTerm, searchType) {
    const url = searchType == "users" ? "/api/users" : "/api/posts"

    $.get(url, { search: searchTerm }, (results) => {
        

        if(searchType == "users") {
            renderUsers(results, $(".resultsContainer"))
        } else {
            renderPosts(results, $(".resultsContainer"))
        }
    })
}