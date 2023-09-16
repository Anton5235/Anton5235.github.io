
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
function updateCalendar() {
  const thisDay = new Date(Date.now());
  let selectedDay = thisDay;

  const pageNavDay = document.querySelectorAll(".page-nav__day");
  pageNavDay.forEach((elementFilm) => {
    elementFilm.dataset.dayTimeStamp = selectedDay.setHours(0, 0, 0, 0);
    const pageNavDayWeek = elementFilm.querySelector(".page-nav__day-week");
    const pageNavDayNumber = elementFilm.querySelector(".page-nav__day-number");
      pageNavDayWeek.textContent = selectedDay.toLocaleDateString("ru-RU", {weekday: "short"});
      pageNavDayNumber.textContent = selectedDay.getDate();
  
    if (selectedDay.getDay() === 0 || selectedDay.getDay() === 6) {
      elementFilm.classList.add("page-nav__day_weekend");
    } else {
      elementFilm.classList.remove("page-nav__day_weekend");
    };
selectedDay.setDate(selectedDay.getDate() + 1);
  });
}

function updateData() {
  createRequest("event=update", "MAIN", contentUpdate);
};

function contentUpdate(serverResponse) {
  const response = JSON.parse(serverResponse);
  const films = response.films.result;
  const halls = response.halls.result.filter((item) => item.hall_open !== "0");
  const seances = response.seances.result;

  // Сохраним конфигурацию залов в объект для sessionStorage
  const hallConfig = {};

  // Наполнение страницы

  // timestamp выбранного дня
  // @ts-ignore
  const selectedDayTimeStamp = (document.querySelector("nav .page-nav__day_chosen")).dataset.dayTimeStamp;
  const dateNow = Date.now();

  films.forEach((elementFilm) => {
    const textHtml = `
        <section class="movie">
          <div class="movie__info">
            <div class="movie__poster">
              <img class="movie__poster-image" alt="${elementFilm.film_name} постер" src="${elementFilm.film_poster}">
            </div>
            <div class="movie__description">
              <h2 class="movie__title">${elementFilm.film_name}</h2>
              <p class="movie__synopsis">${elementFilm.film_description}</p>
              <p class="movie__data">
                <span class="movie__data-duration">${elementFilm.film_duration} минут</span>
                <span class="movie__data-origin">${elementFilm.film_origin}</span>
              </p>
            </div>
          </div>
        </section>
      `;
    const main = document.querySelector("main");
    main.insertAdjacentHTML("beforeend", textHtml);

    // Секция hall
    const movieSection = main.querySelector(".movie:last-child");

    halls.forEach(elementHall => {

      hallConfig[elementHall.hall_id] = elementHall.hall_config;

      const arrSeancesCurrentFilmAndHall = seances.filter((seance, index, array) => {
        return seance.seance_filmid === elementFilm.film_id && seance.seance_hallid === elementHall.hall_id;
      });
      // Добавляем пробел между словом зал и номером зала  
      const hallNameText = `${elementHall.hall_name.slice(0, 3)} ${elementHall.hall_name.slice(3).trim()}`;

      if (arrSeancesCurrentFilmAndHall.length) {
        const textHtml = `
            <div class="movie-seances__hall">
              <h3 class="movie-seances__hall-title">${hallNameText}</h3>
              <ul class="movie-seances__list">
              </ul>
            </div>
          `;
        // @ts-ignore
        movieSection.insertAdjacentHTML("beforeend", textHtml);

        // Секция seances
        const mooviSeancesList = movieSection?.querySelector(".movie-seances__hall:last-child > .movie-seances__list");

        arrSeancesCurrentFilmAndHall.forEach(elementSeance => {
          const seanceTimeStamp = +selectedDayTimeStamp + (+elementSeance.seance_start * 60 * 1000);

          // Если сеанс еще не начался:
          if (dateNow < seanceTimeStamp) {
            const textHtml = `
                <li class="movie-seances__time-block"><a class="movie-seances__time" href="hall.html" data-film-id=${elementFilm.film_id} data-film-name="${elementFilm.film_name}" data-hall-id=${elementHall.hall_id} data-hall-name="${hallNameText}" data-price-vip=${elementHall.hall_price_vip} data-price-standart=${elementHall.hall_price_standart} data-seance-id=${elementSeance.seance_id} data-seance-time=${elementSeance.seance_time} data-seance-start=${elementSeance.seance_start} data-seance-time-stamp=${seanceTimeStamp}>${elementSeance.seance_time}</a></li>
              `;
            // @ts-ignore
            mooviSeancesList.insertAdjacentHTML("beforeend", textHtml);
          } else {
            const textHtml = `
            <li class="movie-seances__time-block"><a class="movie-seances__time acceptin-button-disabled" href="#" data-film-id=${elementFilm.film_id} data-film-name="${elementFilm.film_name}" data-hall-id=${elementHall.hall_id} data-hall-name="${hallNameText}" data-price-vip=${elementHall.hall_price_vip} data-price-standart=${elementHall.hall_price_standart} data-seance-id=${elementSeance.seance_id} data-seance-time=${elementSeance.seance_time} data-seance-start=${elementSeance.seance_start} data-seance-time-stamp=${seanceTimeStamp}>${elementSeance.seance_time}</a></li>
          `;
      // @ts-ignore
      mooviSeancesList.insertAdjacentHTML("beforeend", textHtml);
          }
        });
      };
    });
  });

  // Запишем данные залов в SessionStorage через JSON
  // @ts-ignore
  setItem("config-halls", hallConfig);
// Добавление слушателей событий
  addListeners();
}

// Обработчик клика в шапке на выбранной дате
function onDayClick(event) {
  event.preventDefault();
  const pageNavDay = document.querySelectorAll(".page-nav__day");
  pageNavDay.forEach((elementFilm) => {
    elementFilm.classList.remove("page-nav__day_chosen");
  });

  event.currentTarget.classList.add("page-nav__day_chosen");
// Вызываем функцию обновления данных
  updateData();
}

// Обработчик Клика по сеансу
function onSeanceClick(event) {
  const seanceData = this.dataset;

// Записываем данные о выбранном сеансе в SessionStorage
  // @ts-ignore
  setItem("data-of-the-selected-seance", seanceData);
}
// Добавление слушалку событий
function addListeners() {
  // Добавляем слушалку на клик по дате
  const pageNavDay = document.querySelectorAll(".page-nav__day");
  pageNavDay.forEach(elementFilm => {
    elementFilm.addEventListener("click", onDayClick);
  });

  // Добавляем слушалку на клик по сеансу
  const movieSeancesTime = document.querySelectorAll(".movie-seances__time");
  movieSeancesTime.forEach(elementFilm => {
    elementFilm.addEventListener("click", onSeanceClick);
  });
}