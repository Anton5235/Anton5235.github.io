"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const dataSelectedSeance = getItem("data-of-the-selected-seance");
  const timestamp = dataSelectedSeance && +dataSelectedSeance.seanceTimeStamp / 1000 || 0;
  const hallId = dataSelectedSeance.hallId;
  const seanceId = dataSelectedSeance.seanceId;
  const requestBody = `event=get_hallConfig&timestamp=${timestamp}&hallId=${hallId}&seanceId=${seanceId}`;
  createRequest(requestBody, "HALL", hallUpdate);
});

function hallUpdate(response) {
  const parseResponse = JSON.parse(response);
  const dataSelectedSeance = getItem("data-of-the-selected-seance");

  let selectedHallConfig;
  let configHalls = getItem("config-halls");

  if (parseResponse !== null) {
    selectedHallConfig = parseResponse; 
  } else {
    selectedHallConfig = configHalls[dataSelectedSeance.hallId];
  }

  const confStep = document.querySelector(".conf-step");
  const textHtmlConf = `
  <div class="conf-step__wrapper">
  ${selectedHallConfig}
  </div>`;
  confStep.innerHTML = "";
  confStep.insertAdjacentHTML("beforeend", textHtmlConf);

  const textHtmlLegend = `
    <div class="conf-step__legend">
    <div class="col">
      <p class="conf-step__legend-price"><span class="conf-step__chair conf-step__chair_standart"></span> Свободно (<span
          class="conf-step__legend-value price-standart">${dataSelectedSeance.priceStandart}</span>руб)</p>
      <p class="conf-step__legend-price"><span class="conf-step__chair conf-step__chair_vip"></span> Свободно VIP (<span
          class="conf-step__legend-value price-vip">${dataSelectedSeance.priceVip}</span>руб)</p>
    </div>
    <div class="col">
      <p class="conf-step__legend-price"><span class="conf-step__chair conf-step__chair_taken"></span> Занято</p>
      <p class="conf-step__legend-price"><span class="conf-step__chair conf-step__chair_selected"></span> Выбрано</p>
    </div>
  </div>`;
  confStep.insertAdjacentHTML("beforeend", textHtmlLegend);

  const buyingInfoSection = document.querySelector(".buying__info");
  const buyingInfoHtml = `
  <div class="buying__info-description">
    <h2 class="buying__info-title">"${dataSelectedSeance.filmName}"</h2>
    <p class="buying__info-start">Начало сеанса: ${dataSelectedSeance.seanceTime} </br>
    ${new Date(+dataSelectedSeance.seanceTimeStamp).toLocaleDateString(
      "ru-RU",
      { day: "2-digit", month: "long", year: "numeric" }
    )}</p>
    <p class="buying__info-hall">${dataSelectedSeance.hallName}</p>          
  </div>
  <div class="buying__info-hint">
    <p>Тапните дважды,<br>чтобы увеличить</p>
  </div>`;
  buyingInfoSection.innerHTML = "";
  buyingInfoSection.insertAdjacentHTML("beforeend", buyingInfoHtml);

  const selectedChairs = [];
  const confStepChair = document.querySelectorAll( ".conf-step__wrapper .conf-step__chair");

  confStepChair.forEach((element) => {
    element.addEventListener("click", (event) => {
      const elementClickClassList = event.currentTarget.classList;
      if (elementClickClassList.contains("conf-step__chair_disabled" || "conf-step__chair_taken")) {
        return
      }
      element.classList.toggle("conf-step__chair_selected");
    });
  });

  const acceptinButton = document.querySelector(".acceptin-button");

  acceptinButton.addEventListener("click", (event) => {
    event.preventDefault();
    const arrRow = Array.from(document.querySelectorAll(".conf-step__row"));

    for (let index = 0; index < arrRow.length; index++) {
      const indexRow = arrRow[index];
      const arrChairs = Array.from(indexRow.querySelectorAll(".conf-step__chair"));

      for (let indexChair = 0; indexChair < arrChairs.length; indexChair++) {
        const elementChair = arrChairs[indexChair];
        if (elementChair.classList.contains("conf-step__chair_selected")) {
          const typeChair = elementChair.classList.contains("conf-step__chair_vip")? "vip": "standart";
          selectedChairs.push({
            row: indexRow + 1,
            place: indexChair + 1,
            typeChair: typeChair,
          });
        }
      }
    }

    if (selectedChairs.length) {
      setItem("data-of-the-selected-chairs", selectedChairs);
      const configSelectedHallHtml = document.querySelector(".conf-step__wrapper");
      configHalls[dataSelectedSeance.hallId] = configSelectedHallHtml;
      configSelectedHallHtml.innerHTML = "";
      setItem("config-halls", configHalls);

      confStepChair.forEach((element) => {
        element.classList.replace("conf-step__chair_selected", "conf-step__chair_taken");
      });

      const configSelectedHallTaken = document.querySelector(".conf-step__wrapper");
      const configHallsTaken = getItem("config-halls");
      configHallsTaken[dataSelectedSeance.hallId] = configSelectedHallTaken;
      configSelectedHallTaken.innerHTML = "";
      setItem("pre-config-halls-paid-seats", configHallsTaken);

      const dataOfTheSelectedChairs = getItem("data-of-the-selected-chairs");

      const arrRowPlace = [];
      let totalCost = 0;

      dataOfTheSelectedChairs.forEach(element => {
        arrRowPlace.push(`${element.row}/${element.place}`);
        totalCost += element.typeChair === "vip" ? +dataSelectedSeance.priceVip : +dataSelectedSeance.priceStandart;
      });

      const strRowPlace = arrRowPlace.join(", ");

      const ticketDetails = {
        ...dataSelectedSeance,
        strRowPlace: strRowPlace,
        hallNameNumber: dataSelectedSeance.hallName.slice(3).trim(),
        seanceTimeStampInSec: +dataSelectedSeance.seanceTimeStamp / 1000,
        seanceDay: new Date(+dataSelectedSeance.seanceTimeStamp).toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric" }),
        totalCost: totalCost,
      };

      setItem("ticket-details", ticketDetails);

      window.location.href = "payment.html";
    }
  });
};
