
 /* # API сервиса

### Базовый URL АПИ:
[https://jscp-diplom.netoserver.ru/](https://jscp-diplom.netoserver.ru/)

### Ответы API
Ответы API  приходят в формате JSON
Чтобы распарсить ответ используйте функцию [JSON.parse()](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse)

### Запросы к API

При отправке запросов используйте следующие параметры:

* ***Адрес (URL)*** - `https://jscp-diplom.netoserver.ru/`
* ***Метод (Method)*** - `POST`
*  ***HTTP заголовок (HttpRequest)***

|Название заголовка | Значение заголовка |
|--|--|
| `Content-Type` | `application/x-www-form-urlencoded`  |

### Основные функции API

1.  [Получение списков всех Залов Кинофильмов и Сеансов](api/getlist.md)
2.  [Получение актуальной схемы посадочных мест на выбранный сеанс](api/getconfig.md)
3.  [Заказ билета](api/reserv.md)

*/
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  updateCalendar();
  updateData();
});

const pageNavDay = document.querySelectorAll(".page-nav__day");
function updateCalendar() {
  const thisDay = new Date(Date.now());
  let selectedDay = thisDay;

  pageNavDay.forEach((elememt) => {
    elememt.dataset.dayTimeStamp = selectedDay.setHours(0, 0, 0, 0);
    const pageNavDayWeek = elememt.querySelector(".page-nav__day-week");
    const pageNavDayNumber = elememt.querySelector(".page-nav__day-number");
      pageNavDayWeek.textContent = selectedDay.toLocaleDateString("ru-RU", {weekday: "short"});
      pageNavDayNumber.textContent = selectedDay.getDate();
  
    if (selectedDay.getDay() === 0 || selectedDay.getDay() === 6) {
      elememt.classList.add("page-nav__day_weekend");
    } 
    selectedDay.setDate(selectedDay.getDate() + 1);
  });
}

function updateData() {
  createRequest("event=update", "MAIN", contentUpdate);
};

function dateSeanceClick() {
  pageNavDay.forEach(element => {
    element.addEventListener("click", (event) => {
      event.preventDefault();
      pageNavDay.forEach((element) => {
        element.classList.remove("page-nav__day_chosen");
      });
      event.currentTarget.classList.add("page-nav__day_chosen");
      updateData();
    });
  });

  const movieSeancesTime = document.querySelectorAll(".movie-seances__time");
  movieSeancesTime.forEach(element => {
    element.addEventListener("click", () => {
      const seanceData = this.dataset;
      setItem("data-of-the-selected-seance", seanceData);
    });
  });
}
function contentUpdate(serverResponse) {
  const response = JSON.parse(serverResponse);
  const films = response.films.result;
  const halls = response.halls.result.filter((item) => item.hall_open !== "0");
  const seances = response.seances.result;
  const selectedDayTimeStamp = (document.querySelector("nav .page-nav__day_chosen")).dataset.dayTimeStamp;
  const dateNow = Date.now();
  const hallLayout = {};
  const main = document.querySelector("main");
  main.innerHTML = "";
  films.forEach((element) => {
    const html = `
        <section class="movie">
          <div class="movie__info">
            <div class="movie__poster">
              <img class="movie__poster-image" alt="${element.film_name} постер" src="${element.film_poster}">
            </div>
            <div class="movie__description">
              <h2 class="movie__title">${element.film_name}</h2>
              <p class="movie__synopsis">${element.film_description}</p>
              <p class="movie__data">
                <span class="movie__data-duration">${element.film_duration} минут</span>
                <span class="movie__data-origin">${element.film_origin}</span>
              </p>
            </div>
          </div>
        </section>`;
    main.insertAdjacentHTML("beforeend", html);
    halls.forEach(elementHall => {
      hallLayout[elementHall.hall_id] = elementHall.hall_config;
      const currentFilmsSeancesHalls = seances.filter((seance) => {
        return seance.seance_filmid === element.film_id && seance.seance_hallid === elementHall.hall_id;
      });
      const hallNameText = `${elementHall.hall_name.slice(0, 3)} ${elementHall.hall_name.slice(3)}`;

      if (currentFilmsSeancesHalls.length) {
        const html = `
            <div class="movie-seances__hall">
              <h3 class="movie-seances__hall-title">${hallNameText}</h3>
              <ul class="movie-seances__list">
              </ul>
            </div> `;
        const movie = main.querySelector(".movie:last-child");
        movie.insertAdjacentHTML("beforeend", html);
        const movieSeances = movie.querySelector(".movie-seances__hall:last-child > .movie-seances__list");
        currentFilmsSeancesHalls.forEach(elementSeance => {
          const seanceTimeStamp = +selectedDayTimeStamp + (+elementSeance.seance_start * 60 * 1000);

          const htmlMovie = `<li class="movie-seances__time-block">
          <a class="movie-seances__time" href="hall.html" data-film-id=${element.film_id} data-film-name="${element.film_name}" data-hall-id=${elementHall.hall_id} data-hall-name="${hallNameText}" data-price-vip=${elementHall.hall_price_vip} data-price-standart=${elementHall.hall_price_standart} data-seance-id=${elementSeance.seance_id} data-seance-time=${elementSeance.seance_time} data-seance-start=${elementSeance.seance_start} data-seance-time-stamp=${seanceTimeStamp}>${elementSeance.seance_time}</a></li>`;
          if (dateNow < seanceTimeStamp) {
          
            movieSeances.insertAdjacentHTML("beforeend", htmlMovie);
          } else {
            const html = `<li class="movie-seances__time-block">
            <a class="movie-seances__time acceptin-button-disabled" href="#" data-film-id=${element.film_id} data-film-name="${element.film_name}" data-hall-id=${elementHall.hall_id} data-hall-name="${hallNameText}" data-price-vip=${elementHall.hall_price_vip} data-price-standart=${elementHall.hall_price_standart} data-seance-id=${elementSeance.seance_id} data-seance-time=${elementSeance.seance_time} data-seance-start=${elementSeance.seance_start} data-seance-time-stamp=${seanceTimeStamp}>${elementSeance.seance_time}</a></li>`;
           movieSeances.insertAdjacentHTML("beforeend", html);
          }
        });
      };
    });
  });

  setItem("config-halls", hallLayout);
  dateSeanceClick();
}

