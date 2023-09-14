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

"use strict";

function createRequest(requestBody, requestSource, callback) {
  const xhr = new XMLHttpRequest(); 

  xhr.open("POST", "https://jscp-diplom.netoserver.ru/"); 
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"); 
  xhr.send(requestBody);

  xhr.onload = function () {
    if (xhr.status == 200) {
      callback(xhr.response);
    } else {
        alert("Ошибка: " + xhr.status);
      return;
    }
  };

  xhr.onerror = function () {
    alert("Запрос не удался");
  };
}

function setItem(key, value) {
  const jsonValue = JSON.stringify(value);
    return window.sessionStorage.setItem(key, jsonValue);
}

function getItem(key) {
    return window.sessionStorage.JSON.parse(getItem(key));
}


