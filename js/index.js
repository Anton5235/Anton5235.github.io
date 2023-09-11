const api = fetch('https://jscp-diplom.netoserver.ru/',{
method: 'POST',
headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
  body: requestData,
})

console.log(api)