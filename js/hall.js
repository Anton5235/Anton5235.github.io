"use strict"

document.addEventListener('DOMContentLoaded', () => {
    const dataSelectedSeance = getItem("data-of-the-selected-seance");
    console.log(dataSelectedSeance)
    const timestamp = dataSelectedSeance && +dataSelectedSeance.seanceTimeStamp / 1000 || 0;
    const hallId = dataSelectedSeance.hallId;
    const seanceId = dataSelectedSeance.seanceId;
    const requestBody = `event=get_hallConfig&timestamp=${timestamp}&hallId=${hallId}&seanceId=${seanceId}`;
    createRequest(requestBody, "HALL", hallUpdate);
});

function hallUpdate(response) {
    const parseResponse = JSON.parse(response);
    const dataSelectedSeance = getItem("data-of-the-selected-seance");
    let configHalls = getItem("config-halls")
    let selectedHall;

    if(parseResponse) {
        selectedHall = configHalls[dataSelectedSeance.hallId]; 
    } else {
        selectedHall = response;
    }

    const buyingInfo = document.querySelector(".buying__info");
    buyingInfo.innerHTML = "";
    const html = `
        <div class = "buying__info-description">
            <h2 class="buying__info-title">"${dataSelectedSeance.filmName}"</h2>
            <p class="buying__info-start">Начало сеанса: ${dataSelectedSeance.seanceTime}</br>
            ${new Date(+dataSelectedSeance.seanceTimeStamp).toLocaleDateString(
                "ru-RU", 
                { day: "2-digit", month: "long", year: "numeric"})}</p>
            <p class="buying__info-hall">${dataSelectedSeance.hallName}</p>
            </div>
            <div class="buying__info-hint>
            <p>Тапните дважды,<br>чтобы увеличить</p>
        </div>`;
    buyingInfo.insertAdjacentHTML("beforeend", html);

    const confStep = document.querySelector(".conf-step");
    const textHtmlConf = `
    <div class="conf-step__wrapper">
    ${selectedHall}
    </div>
  `;
  
    confStep.innerHTML = "";
    confStep.insertAdjacentHTML("beforeend", textHtmlConf);
  // Генерируем HTML-разметку для легенды и добавляем ее в .conf-step
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
    </div>
  `;
    confStep.insertAdjacentHTML("beforeend", textHtmlLegend);


    const selectedChair = [];
    const confStepChair = document.querySelectorAll(".conf-step__chair_selected");
    confStepChair.forEach((element) => {
        element.addEventListener("click", (event) => {
          const currentTarget = event.currentTarget.classList;
          if (currentTarget.contains("conf-step__chair_disabled" || "conf-step__chair_taken")) {
            return
          };
          element.classList.toggle("conf-step__chair_selected");
        });
      });
  // Обработчик клика по кнопке "Забронировать"
  const acceptinButton = document.querySelector(".acceptin-button");

  acceptinButton?.addEventListener("click", (event) => {
    event.preventDefault();
    // 1. Формируем список выбранных мест selectedChairs
    // 2. Меняем статус выбранных мест с "выбранные" на "занятые"
    // 3. Сохраняем новую кофигурацию зала ("pre-config-halls") в новом объекте Хранилища
    // 4. На следующей стринице "после оплаты" - отправляем на сервер измененную схему зала
    const arrayOfRows = Array.from(
      document.querySelectorAll(".conf-step__row")
    );

    for (let indexRow = 0; indexRow < arrayOfRows.length; indexRow++) {
      const elementRow = arrayOfRows[indexRow];
      const arrayOfChairs = Array.from(
        elementRow.querySelectorAll(".conf-step__chair")
      );

      for (
        let indexChair = 0;
        indexChair < arrayOfChairs.length;
        indexChair++
      ) {
        const elementChair = arrayOfChairs[indexChair];
        if (elementChair.classList.contains("conf-step__chair_selected")) {
          const typeChair = elementChair.classList.contains(
            "conf-step__chair_vip"
          )
            ? "vip"
            : "standart";

            selectedChair.push({
            row: indexRow + 1,
            place: indexChair + 1,
            typeChair: typeChair,
          });
        }
      }
    }

    // Если есть выбранные места в зале
    if (selectedChairs.length) {
      // Запишем в хранилище выбранные места в зале
      setItem("data-of-the-selected-chairs", selectedChairs);

      // Конфигурация (разметка) выбранного зала
      const configSelectedHallHtml = document
        .querySelector(".conf-step__wrapper")
        ?.innerHTML.trim();

      // Запишем выбранные места в конфиг залов в Хранилище
      configHalls[dataSelectedSeance.hallId] = configSelectedHallHtml;
      setItem("config-halls", configHalls);

      // Подготовим пре-конфигурацию залов с "занятыми" (оплаченными) местами
      confStepChair.forEach((element) => {
        element.classList.replace("conf-step__chair_selected", "conf-step__chair_taken");
      });

      const configSelectedHallTaken = document.querySelector(".conf-step__wrapper")?.innerHTML.trim();
      const configHallsTaken = getItem("config-halls");

      // Запишем занятые места в отдельный пре-конфиг залов в Хранилище, после оплаты он отправится на сервер (отдельный, чтобы при нажатии кнопки "Назад" не показываались места "taken", т.к. они еще не оплачены)
      configHallsTaken[dataSelectedSeance.hallId] = configSelectedHallTaken;
      setItem("pre-config-halls-paid-seats", configHallsTaken);

      // формируем набор итоговых данных для заполнения билета на следующих страницах
      const dataOfTheSelectedChairs = getItem("data-of-the-selected-chairs");

      // Считаем общую стоимость билетов и формируем строку выбранных мест
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



