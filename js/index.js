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

sdnojckgkhb*/

async function fetchData(url, requestData, callback) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: requestData,
    });

    if (response.status === 404) {
      throw new Error("Resource not found");
    } else if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    let data;
    try {
      data = await response.json();
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return; // Останавливаем выполнение функции
    }

    if (typeof callback === 'function') {
      callback(data);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

export default fetchData;