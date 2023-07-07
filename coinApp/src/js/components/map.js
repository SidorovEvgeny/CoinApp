import { autorizationError } from "./autorization";

const token = localStorage.getItem('token')

if (document.getElementById('map')) {

  let bankCoordinates = [];
  // Получаем с сервера координаты местанахождения банкоматов
  fetch('http://localhost:3000/banks', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${token}`
    }
  })
    .then(response => response.json())
    .then(dataAtm => {
      // Обработка ответа сервера после авторизации
      if (dataAtm) {
        bankCoordinates = dataAtm.payload
      }
    })
    .catch(error => {
      // Обработка ошибки
      console.error(error);
      autorizationError(document.body, 'error')
    });

  function init() {
    const map = new ymaps.Map("map", {
      center: [55.751574, 37.573856],
      zoom: 10
    });

    // Добавление меток на карту для каждого банка
    bankCoordinates.forEach(coords => {
      const placemark = new ymaps.Placemark([coords.lat, coords.lon]);
      map.geoObjects.add(placemark);
    });

    map.behaviors.disable('scrollZoom'); // отключил скрол
  }
  ymaps.ready(init);
}
