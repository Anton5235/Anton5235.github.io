"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const ticketDetails = getJson("ticket-details");
  const ticketInfoWrapper = document.querySelector(".ticket__info-wrapper");
  ticketInfoWrapper.innerHTML = "";
  const ticketInfoBlock = `
    <p class="ticket__info">На фильм: <span class="ticket__details ticket__title">${ticketDetails.filmName}</span></p>
    <p class="ticket__info">Ряд/Место: <span class="ticket__details ticket__chairs">${ticketDetails.strRowPlace}</span></p>
    <p class="ticket__info">В зале: <span class="ticket__details ticket__hall">${ticketDetails.hallNameNumber}</span></p>
    <p class="ticket__info">Начало сеанса: <span class="ticket__details ticket__start">${ticketDetails.seanceTime} - ${ticketDetails.seanceDay}</span></p>

    <div id="qrcode" class="ticket__info-qr"></div>

    <p class="ticket__hint">Покажите QR-код нашему контроллеру для подтверждения бронирования.</p>
    <p class="ticket__hint">Приятного просмотра!</p> `;

  ticketInfoWrapper.insertAdjacentHTML("beforeend", ticketInfoBlock);
  const qrContent = `
    Фильм: ${ticketDetails.filmName}
    Зал: ${ticketDetails.hallNameNumber}
    Ряд/место: ${ticketDetails.strRowPlace}
    Дата: ${ticketDetails.seanceDay}
    Начало сеанса: ${ticketDetails.seanceTime}

    Билет действителен строго на свой сеанс
    `;
    let qr = document.getElementById('qrcode'); 	// выбираем элемент
    qr.append(QRCreator(qrContent).result);				// добавляем в контейнер
    qr.querySelector('canvas').style.display = 'block';	// показываем картинку
    qr.querySelector('canvas').style.margin = '0 auto';
})