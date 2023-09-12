const API_BASE_URL = "https://jscp-diplom.netoserver.ru/"



  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "event=update",
  })
  const responseJson = await response.json()
  console.log(responseJson)

















/*const API_BASE_URL = "https://jscp-diplom.netoserver.ru/"

async function getRequest(endpoint, params = {}) {
  const url = new URL(endpoint, API_BASE_URL) // Example => https://example.com/movies
  url.searchParams = new URLSearchParams(params) // Example => https://example.com/movies?sessionId=1

  const response = await fetch(url, {
    method: "GET",
    // headers: {}
  })
  const responseJson = await response.json()
  return responseJson
}

async function postRequest(endpoint, payload, params = {}) {
  const url = new URL(endpoint, API_BASE_URL)
  url.searchParams = new URLSearchParams(params)

  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify(payload)
  })
  const responseJson = await response.json()
  return responseJson
}

getRequest("/movies", {
  place: 43,
})

postRequest("/book", {
  sessionId: 1,
  places: [45, 46]
})