import { el, mount } from "redom";
import { autorizationError } from "./autorization";

const token = localStorage.getItem('token')
const $currencyLeft = document.getElementById('currencyLeft')
const $currencyRight = document.getElementById('currencyRight')

if (window.location.pathname === '/currency.html') {
  function createMainCheck() {
    // Запрос валютных счетов
    fetch('http://localhost:3000/currencies', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${token}`
      }
    })
      .then(response => response.json())
      .then(dataCurrency => {
        // Обработка ответа сервера
        if (dataCurrency) {
          let currencies = dataCurrency.payload

          for (const check in currencies) {
            const code = currencies[check].code;
            const amount = currencies[check].amount;
            createMainLine(code, amount)
          }
        }
      })
      .catch(error => {
        // Обработка ошибки
        console.error(error);
        autorizationError(document.body, 'error')
      });
  }
  createMainCheck();

  //создаем две карточки этой страницы
  const $currencyMain = el('div', { class: 'currency__main' })
  const $currencyСhangeInTheCourse = el('div', { class: 'currency__changeInTheCourse' })
  mount($currencyLeft, $currencyMain)
  mount($currencyRight, $currencyСhangeInTheCourse)

  // Создаем карточку с моими валютными счетами
  const $mainTitle = el('h2', { class: 'currency__subtitle', textContent: 'Ваши валюты' })
  const $mainBlockLine = el('div', { class: 'currency__mainBlockLine' })
  mount($currencyMain, $mainTitle)
  mount($currencyMain, $mainBlockLine)
  // Функция добавления строки в карточку счетов
  function createMainLine(nameCurrency, summaCurrency) {
    const $newLine = el('div', { class: 'currency__line' })
    const $nameCurrency = el('p', { class: 'currency__name', textContent: nameCurrency })
    const $summaCurrency = el('p', { class: 'currency__summa', textContent: summaCurrency })

    mount($mainBlockLine, $newLine)
    mount($newLine, $nameCurrency)
    mount($newLine, $summaCurrency)
  }

  // Создаем карточку с изменением курсов
  const $courseTitle = el('h2', { class: 'currency__subtitle', textContent: 'Изменение курсов в реальном времени' })
  const $courseBlockLine = el('div', { class: 'currency__courseBlockLine' })
  mount($currencyСhangeInTheCourse, $courseTitle)
  mount($currencyСhangeInTheCourse, $courseBlockLine)

  // Получаем актуальные курсы валют в реальном времени
  function getChangeCouse() {
    const socket = new WebSocket('ws://localhost:3000/currency-feed');

    // Событие при успешном установлении соединения
    socket.addEventListener('open', () => {
      // console.log('WebSocket соединение установлено');
    });

    // Событие при получении сообщения от сервера
    socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);

      // Проверяем тип сообщения
      if (message.type === 'EXCHANGE_RATE_CHANGE') {
        const fromCurrency = message.from;
        const toCurrency = message.to;
        const exchangeRate = message.rate;
        const rateChange = message.change;

        createExchengeLine(`${fromCurrency}/${toCurrency}`, exchangeRate, rateChange)
      }
    });

    // Событие при закрытии соединения
    socket.addEventListener('close', () => {
      // console.log('WebSocket соединение закрыто');
    });

    // Событие при ошибке соединения
    socket.addEventListener('error', (error) => {
      console.error('Ошибка WebSocket соединения:', error);
      autorizationError(document.body, 'error')
    });


  }
  getChangeCouse()
  // Создаем строку для таблицы с курсами
  function createExchengeLine(currenciesDouble, currencyTotal, rateChange) {
    const $courseLine = el('div', { class: 'currency__courseLine' })
    const $courseСurrency = el('p', { textContent: currenciesDouble })
    const $courseDiv = el('div', { class: 'currency__rightBlock d-flex' })
    const $courseTotal = el('p', { class: 'currency__courseTotal', textContent: currencyTotal })
    const $courseArrowRed = el('span', { class: 'currency__arrowRed currency__arrow' })
    const $courseArrowGreen = el('span', { class: 'currency__arrowGreen currency__arrow' })

    mount($courseBlockLine, $courseLine)
    mount($courseLine, $courseСurrency)
    mount($courseLine, $courseDiv)
    mount($courseDiv, $courseTotal)
    if (rateChange === -1) {
      mount($courseDiv, $courseArrowRed)
      $courseСurrency.classList.add('currency__courseCurrencyRed')
    } else if (rateChange === 1) {
      mount($courseDiv, $courseArrowGreen)
      $courseСurrency.classList.add('currency__courseCurrencyGreen')
    }
  }

  // Создаем событие обмена валют
  const $changeBtn = document.getElementById('changeBtn')
  const $changeFrom = document.getElementById('currencyFrom')
  const $changeTo = document.getElementById('currencyTo')
  const $changeSumma = document.getElementById('changeSumma')

  let FROM = $changeFrom.value
  let TO = $changeTo.value
  let AMOUNT;

  $changeFrom.addEventListener('change', () => {
    FROM = $changeFrom.value
  })
  $changeTo.addEventListener('change', () => {
    TO = $changeTo.value
  })
  $changeSumma.addEventListener('input', () => {
    const value = $changeSumma.value;
    if (!/^\d*$/.test(value)) {
      $changeSumma.value = value.replace(/\D/g, '');
    }
  })
  $changeSumma.addEventListener('blur', () => {
    AMOUNT = $changeSumma.value
  })

  $changeBtn.addEventListener('click', (e) => {
    e.preventDefault()

    if ($changeSumma.value === '') {
      sendError('Не указана сумма перевода')
    } else if (FROM === TO) {
      sendError('Одинаковая валюта конвертации')
    } else {
      const dataChange = {
        from: FROM,
        to: TO,
        amount: AMOUNT
      }

      // Запрос на обмен валюты
      fetch('http://localhost:3000/currency-buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${token}`
        },
        body: JSON.stringify(dataChange)
      })
        .then(response => response.json())
        .then(data => {
          // Обработка ответа сервера
          if (data.payload !== null) {
            $mainBlockLine.innerHTML = ''
            createMainCheck()
            $changeSumma.value = ''
            sendSuccess()
            return
          }
          if (data.error === 'Not enough currency') {
            sendError('На счете нет средств')
            $changeSumma.value = ''
            return
          }
          if (data.error === 'Invalid amount') {
            sendError('Не указана сумма')
            $changeSumma.value = ''
            return
          }
          if (data.error === 'Overdraft prevented') {
            sendError('Не достаточно средств')
            $changeSumma.value = ''
            return
          }

        })
        .catch(error => {
          // Обработка ошибки
          console.error(error);
          autorizationError(document.body, 'error')
        });
    }
  })

  function sendError(textError) {
    const error = document.querySelector('.currency__formError')
    error.style.display = 'block'
    error.textContent = textError
    setTimeout(() => {
      error.style.display = 'none'
    }, 2000);
  }
  function sendSuccess() {
    const success = document.querySelector('.currency__formSucces')
    success.style.display = 'block'
    setTimeout(() => {
      success.style.display = 'none'
    }, 2000);
  }

  const selectFrom = document.getElementById('currencyFrom');
  const selectTo = document.getElementById('currencyTo');
  const selectArrowFrom = document.querySelector('.select-arrowFrom');
  const selectArrowTo = document.querySelector('.select-arrowTo');

  selectFrom.addEventListener('click', function () {
    // Добавляем/удаляем класс 'select-open' при каждом клике
    selectArrowFrom.classList.toggle('select-open');
  });
  selectTo.addEventListener('click', function () {
    // Добавляем/удаляем класс 'select-open' при каждом клике
    selectArrowTo.classList.toggle('select-open');
  });
}
