"use strict"

document.addEventListener("DOMContentLoaded", () => {
  const dataOfTheSelectedSeance = getJson("data-of-the-selected-seance");
  const timestamp = dataOfTheSelectedSeance && +dataOfTheSelectedSeance.seanceTimeStamp / 1000 || 0;
  const hallId = dataOfTheSelectedSeance.hallId;
  const seanceId = dataOfTheSelectedSeance.seanceId;
  const requestBody = `event=get_hallConfig&timestamp=${timestamp}&hallId=${hallId}&seanceId=${seanceId}`;
  createRequest(requestBody, "HALL", updateHtmlHall);
});
// Функция для обновления разметки зала
function updateHtmlHall(response) {
  const dataOfTheSelectedSeance = getJson("data-of-the-selected-seance");
  const configSelectedHall = JSON.parse(response);
  let configHalls = getJson("config-halls");
  const buyingInfoSection = document.querySelector(".buying__info")
  buyingInfoSection.innerHTML = "";
  const buyingInfoHtml = 
  `<div class="buying__info-description">
    <h2 class="buying__info-title">"${dataOfTheSelectedSeance.filmName}"</h2>
    <p class="buying__info-start">Начало сеанса: ${dataOfTheSelectedSeance.seanceTime
    } </br>
    ${new Date(+dataOfTheSelectedSeance.seanceTimeStamp).toLocaleDateString(
      "ru-RU",
      { day: "2-digit", month: "long", year: "numeric" }
    )}</p>
    <p class="buying__info-hall">${dataOfTheSelectedSeance.hallName}</p>          
  </div>
  <div class="buying__info-hint">
    <p>Тапните дважды,<br>чтобы увеличить</p>
  </div>`;
  buyingInfoSection.insertAdjacentHTML("beforeend", buyingInfoHtml);

  const confStep = document.querySelector(".conf-step");
  confStep.innerHTML = "";
  let confStepHtml = 
  `<div class="conf-step__wrapper">
    ${configSelectedHall}
  </div>
  <div class="conf-step__legend">
    <div class="col">
      <p class="conf-step__legend-price"><span class="conf-step__chair conf-step__chair_standart"></span> Свободно (<span
          class="conf-step__legend-value price-standart">${dataOfTheSelectedSeance.priceStandart}</span>руб)</p>
      <p class="conf-step__legend-price"><span class="conf-step__chair conf-step__chair_vip"></span> Свободно VIP (<span
          class="conf-step__legend-value price-vip">${dataOfTheSelectedSeance.priceVip}</span>руб)</p>
    </div>
    <div class="col">
      <p class="conf-step__legend-price"><span class="conf-step__chair conf-step__chair_taken"></span> Занято</p>
      <p class="conf-step__legend-price"><span class="conf-step__chair conf-step__chair_selected"></span> Выбрано</p>
    </div>
  </div>`;
  confStep.insertAdjacentHTML("beforeend", confStepHtml);


  const confStepChair = document.querySelectorAll(".conf-step__wrapper .conf-step__chair");
  confStepChair.forEach((element) => {
    element.addEventListener("click", (event) => {
      const elementClickClassList = event.currentTarget.classList;
      if (elementClickClassList.contains("conf-step__chair_disabled" || "conf-step__chair_taken")) {
        return
      }
      element.classList.toggle("conf-step__chair_selected");
    });
  });
  const selectedChairs = [];
  const acceptinButton = document.querySelector(".acceptin-button");
  acceptinButton.addEventListener('click', () => { 	// при нажатии на кнопку
		let selectedPlaces = Array.from(document.querySelectorAll('.conf-step__row .conf-step__chair_selected'));

		selectedPlaces.forEach((chair) => { 	
			let row = chair.closest('.conf-step__row'); 	
			let rowIndex = Array.from(row.parentNode.children).indexOf(row) + 1; 	
			let chairIndex = Array.from(row.children).indexOf(chair) + 1; 	
			let chairOption = (chair.classList.contains('conf-step__chair_standart')) ? 'standart' : 'vip'; 	
			selectedChairs.push({ 	
				row: rowIndex, 		
				place: chairIndex, 
				type: chairOption		
			});
		});

    if (selectedChairs.length) {
      setJson("data-selected-chairs", selectedChairs);
      const confStepWrapper = document.querySelector(".conf-step__wrapper")?.innerHTML.trim();
      configHalls[dataOfTheSelectedSeance.hallId] = confStepWrapper;
      setJson("config-halls", configHalls);
      confStepChair.forEach((element) => {
        element.classList.replace("conf-step__chair_selected", "conf-step__chair_taken");
      });

      const dataSelectedChairs = getJson("data-selected-chairs");

      // Считаем общую стоимость билетов и формируем строку выбранных мест
      const arrRowPlace = [];
      let counter = 0;

      dataSelectedChairs.forEach(element => {
        arrRowPlace.push(`${element.row}/${element.place}`);
        counter += element.typeChair === "vip" ? +dataOfTheSelectedSeance.priceVip : +dataOfTheSelectedSeance.priceStandart;
      });

      const ticketDetails = {
        ...dataOfTheSelectedSeance,
        strRowPlace: arrRowPlace,
        hallNameNumber: dataOfTheSelectedSeance.hallName.slice(3).trim(),
        seanceTimeStampInSec: +dataOfTheSelectedSeance.seanceTimeStamp / 1000,
        seanceDay: new Date(+dataOfTheSelectedSeance.seanceTimeStamp).toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric" }),
        totalCost: counter,
      };
   

      setJson("ticket-details", ticketDetails);
     

      window.location.href = "payment.html";
    }
  });
};
