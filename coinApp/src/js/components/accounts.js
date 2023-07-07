import { mount, el, h } from "redom";
import { handleClick } from "./autorization";
import Chart from 'chart.js/auto'
import { autoComplite } from "./autocomplite";
import { autorizationError } from "./autorization";
import { hideLoader } from "./loader";

window.addEventListener('load', function () {
  hideLoader(); // Скрываем лоадер-показываем контент
});

const token = localStorage.getItem('token')
const id = localStorage.getItem('check')
const $createNewCheck = document.getElementById('createNewCheck')
const $accContainer = document.getElementById('accContainer')

let globalDataDetailsTransactions;
let cards = [];

let number;
let balance;
let $viewContainer;
let $viewBlock;

if ($createNewCheck) {
  fetch('http://localhost:3000/accounts', {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${token}`
    }
  })
    .then(response => response.json())
    .then(dataAccount => {
      // Обработка ответа сервера после авторизации
      if (dataAccount) {

        for (const account of dataAccount.payload) {
          let check = account.account;
          let sm = account.balance
          let summa = Math.trunc(sm);
          let formattedDate;

          if (account.transactions.length === 0) {
            formattedDate = 'Операций не было';
          } else {
            for (const transaction of account.transactions) {
              const dateStr = new Date(transaction.date);
              const options = { day: 'numeric', month: 'long', year: 'numeric' };
              formattedDate = dateStr.toLocaleDateString('ru-RU', options);
            }
          }
          cards.push({ check, summa, formattedDate });
        }
        // Функция для сортировки по номеру
        function sortByCheck(a, b) {
          return a.check.localeCompare(b.check);
        }

        // Функция для сортировки по балансу
        function sortBySumma(a, b) {
          return b.summa - a.summa;
        }

        // Функция для сортировки по последней транзакции
        function sortByDate(a, b) {
          return new Date(b.formattedDate) - new Date(a.formattedDate);
        }

        const accountChoice = document.querySelector('.js-choice');
        accountChoice.addEventListener('change', function (event) {
          const selectedValue = event.target.value;
          let sortedCards;

          if (selectedValue === '1') {
            sortedCards = cards.slice().sort(sortByCheck);
          } else if (selectedValue === '2') {
            sortedCards = cards.slice().sort(sortBySumma);
          } else if (selectedValue === '3') {
            sortedCards = cards.slice().sort(sortByDate);
          } else {
            // Выполнить действие по умолчанию
            sortedCards = cards;
          }
          $accContainer.innerHTML = ''
          // Добавляем отсортированные карточки в контейнер
          for (const card of sortedCards) {
            createCardCheck(card.check, card.summa, card.formattedDate);
          }
        });

        for (const card of cards) {
          createCardCheck(card.check, card.summa, card.formattedDate);
        }
      }
    })
    .catch(error => {
      // Обработка ошибки
      console.error(error);
      autorizationError(document.body, 'error')
    });
}

// Создание нового счета
if ($createNewCheck) {
  $createNewCheck.addEventListener('click', (e) => {
    e.preventDefault();

    fetch('http://localhost:3000/create-account', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${token}`
      },
      body: JSON.stringify()
    })
      .then(response => response.json())
      .then(dataNewCheck => {
        // Обработка ответа сервера после авторизации
        if (dataNewCheck) {
          let check = dataNewCheck.payload.account;
          let sm = dataNewCheck.payload.balance
          let summa = Math.trunc(sm);
          let formattedDate = 'Операций еще не было';
          cards.push({ check, summa, formattedDate });
          $accContainer.innerHTML = ''
          for (const card of cards) {
            createCardCheck(card.check, card.summa, card.formattedDate);
          }
        }
      })
      .catch(error => {
        // Обработка ошибки
        console.error(error);
        autorizationError(document.body, 'error')
      });
  })
}

// Функция создания карточки счёта
function createCardCheck(check, summa, date) {
  const $card = el('div', { class: 'card' })
  const $number = el('p', { class: 'card__number', textContent: check })
  const $summa = el('p', { class: 'card__summa', textContent: summa + ' ' + '₽' })
  const $blockBtn = el('div', { class: 'card__blockBtn' })
  const $blockDate = el('div', { class: 'card__blockDate' })
  const $title = el('h2', { class: 'card__title', textContent: 'Последняя транзакция:' })
  const $date = el('p', { class: 'card__date', textContent: date })
  const $btn = el('button', { class: 'btn btn-reset btn-blue', id: 'btnOpen', textContent: 'Открыть' })

  $btn.addEventListener('click', (e) => {
    e.preventDefault();
    handleClick('/viewAccount.html')
    localStorage.setItem('check', check)
  })

  mount($accContainer, $card)
  mount($card, $number)
  mount($card, $summa)
  mount($card, $blockBtn)
  mount($blockBtn, $blockDate)
  mount($blockBtn, $btn)
  mount($blockDate, $title)
  mount($blockDate, $date)
}

// Функция для обновления значений number и balance и lobalDataDetailsTransactions
function updateNumberAndBalance(newNumber, newBalance, newGlobalDataDetailsTransactions, newTransactions) {
  number = newNumber;
  balance = newBalance;
  transactions = newTransactions
  globalDataDetailsTransactions = newGlobalDataDetailsTransactions
}
// Функция получения полной истории транзакций по счёту
async function getDataTransactions() {
  try {
    const response = await fetch(`http://localhost:3000/account/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${token}`
      }
    });
    const data = await response.json();

    // Обработка ответа сервера после авторизации
    const newGlobalDataDetailsTransactions = data
    const newTransactions = data.payload.transactions
    const newNumber = data.payload.account;
    const newBalance = Math.trunc(data.payload.balance);

    // Вызов функции для обновления значений number и balance
    updateNumberAndBalance(newNumber, newBalance, newGlobalDataDetailsTransactions, newTransactions);
  } catch (error) {
    // Обработка ошибки
    console.error(error);
    autorizationError(document.body, 'error')
  }
}

//создаем шапку страницы c номером и балансом
function createViewAccounts(hNumber, hBalance) {
  $viewContainer = document.querySelector('.view__container')
  const $hederBlock = el('div', { class: 'view__hederBlock' })
  const $hederNumber = el('p', { class: 'view__headerNumber', textContent: hNumber })
  const $hederBalance = el('p', { class: 'view__headerBalance', textContent: hBalance + ' ₽' })
  mount($viewContainer, $hederBlock)
  mount($hederBlock, $hederNumber)
  mount($hederBlock, $hederBalance)
}

//создаем форму для совершения переводов
async function createFormTransfer() {
  $viewBlock = el('div', { class: 'view__heroBlock' })
  const $viewError = el('span', { class: 'error-send' })
  const $viewSuccess = el('span', { class: 'success-send', textContent: 'Операция выполнена' })
  const $viewCard = el('div', { class: 'view__card' })
  const $viewH3 = el('h3', { class: 'view__subtitle', textContent: 'Новый перевод' })
  const $divInp1 = el('div', { class: 'view__inputDiv' })
  const $label1 = el('label', { for: 'number', class: 'view__label', textContent: 'Номер счета получателя' })
  const $input1 = el('input', {
    class: 'view__input',
    type: 'text', id: 'number',
    placeholder: 'Введите номер счёта', name: 'number', maxlength: '27', minlenght: '27'
  })
  const $inpBtnDelete = el('button', { class: 'view__inpBtnDelete btn-reset' })
  const $inpBtnSuccess = el('button', { class: 'view__inpBtnSuccess btn-reset' })
  const $inpBtnDelete1 = el('button', { class: 'view__inpBtnDelete btn-reset' })
  const $inpBtnSuccess1 = el('button', { class: 'view__inpBtnSuccess btn-reset' })
  const $divInp2 = el('div', { class: 'view__inputDiv' })
  const $label2 = el('label', { for: 'summa', class: 'view__label', textContent: 'Сумма перевода' })
  const $input2 = el('input', {
    class: 'view__input',
    type: 'text', id: 'summa', autocomplite: 'off',
    placeholder: 'Введите сумму перевода', name: 'summa', maxlength: '11', minlenght: '1'
  })
  const $btnContainer = el('div', { class: 'view__btnContainer' })
  const $btnSend = el('button', { class: 'view__btnSend btn btn-blue btn-reset', id: 'btnSend', textContent: 'Отправить' })

  mount($viewContainer, $viewBlock)
  mount($viewBlock, $viewCard)
  mount($viewCard, $viewSuccess)
  mount($viewCard, $viewError)
  mount($viewCard, $viewH3)
  mount($divInp1, $label1)
  mount($divInp1, $input1)
  mount($divInp1, $inpBtnDelete)
  mount($divInp1, $inpBtnSuccess)
  mount($viewCard, $divInp1)
  mount($divInp2, $label2)
  mount($divInp2, $input2)
  mount($divInp2, $inpBtnDelete1)
  mount($divInp2, $inpBtnSuccess1)
  mount($viewCard, $divInp2)
  mount($btnContainer, $btnSend)
  mount($viewCard, $btnContainer)

  //обработчики на инпуты
  let statusSuccessCheck = false
  let statusSuccessSumma = false

  // инпут ввода номера событие input
  $input1.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(.{4})/g, '$1 ').trim();
    e.target.value = value;
    $inpBtnDelete.style.display = 'block'
    $inpBtnSuccess.style.display = 'none'
    $input1.style.borderColor = '#116ACC' //blue
    statusSuccessCheck = false
  })

  // инпут ввода номера событие blur
  $input1.addEventListener('blur', () => {
    if ((isDeleteButtonClicked) || ($input1.value.length < 27)) {
      $input1.style.borderColor = '#BA0000' //red
      isDeleteButtonClicked = false;
      $inpBtnDelete.style.display = 'none'
      statusSuccessCheck = false
    } else {
      $inpBtnDelete.style.display = 'none'
      $inpBtnSuccess.style.display = 'block'
      $input1.style.borderColor = '#76CA66' //green
      statusSuccessCheck = true
    }
  })

  let isDeleteButtonClicked = false;
  //обработчик на кнопку очистки инпута счёта
  $inpBtnDelete.addEventListener('mousedown', (e) => {
    e.preventDefault()
    isDeleteButtonClicked = true;
    $input1.value = ''
    $inpBtnDelete.style.display = 'none'
  })

  // инпут ввода суммы, событие input
  $input2.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(.{3})/g, '$1 ').trim();
    e.target.value = value;
    $inpBtnDelete1.style.display = 'block'
    $inpBtnSuccess1.style.display = 'none'
    $input2.style.borderColor = '#116ACC' //blue
    statusSuccessSumma = false
  })

  let isDeleteButtonClicked1 = false;
  //обработчик на кнопку очистки инпута суммы
  $inpBtnDelete1.addEventListener('mousedown', (e) => {
    e.preventDefault()
    isDeleteButtonClicked1 = true;
    $input2.value = ''
    $inpBtnDelete1.style.display = 'none'
  })

  // инпут ввода суммы, событие blur
  $input2.addEventListener('blur', () => {
    if ((isDeleteButtonClicked1) || ($input2.value.length === 0)) {
      $input2.value = ''
      $input2.style.borderColor = '#BA0000' //red
      $inpBtnSuccess1.style.display = 'none'
      isDeleteButtonClicked1 = false
      statusSuccessSumma = false
    } else {
      $inpBtnDelete1.style.display = 'none'
      $inpBtnSuccess1.style.display = 'block'
      $input2.style.borderColor = '#76CA66' //green
      statusSuccessSumma = true
    }
  })

  //событие на перевод денег
  $btnSend.addEventListener('click', async (e) => {
    e.preventDefault();

    if ((statusSuccessCheck === true) && (statusSuccessSumma === true) && (number !== $input1.value.replace(/\s/g, ''))) {
      const dataTransfer = {
        from: number,
        to: $input1.value.replace(/\s/g, ''),
        amount: $input2.value.replace(/\s/g, ''),
      };

      try {
        // Выполняем POST запрос и дожидаемся его выполнения
        const response = await fetch(`http://localhost:3000/transfer-funds/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${token}`
          },
          body: JSON.stringify(dataTransfer)
        });

        const result = await response.json();
        // Обработка ответа сервера
        if (result.error === 'Invalid account from') {
          sendError('Неверный счет отправителя')
          return
        }
        if (result.error === 'Invalid account to') {
          sendError('Неверный счет получателя')
          return
        }
        if (result.error === 'Invalid amount') {
          sendError('Не указана сумма перевода')
          return
        }
        if (result.error === 'Overdraft prevented') {
          sendError('Недостаточно средств для перевода')
          return
        } else {
          await getDataTransactions()
          const history = document.querySelector('.view__history-line').innerHTML = ''
          createNewHistoryLine()
          sendSuccess()

          const savedAccounts = localStorage.getItem('checkTo'); // получаем ранее сохр номера из LS
          let accounts = []; // Массив для хранения использованных счетов
          if (savedAccounts !== null) {
            accounts = JSON.parse(savedAccounts); // Разбор ранее сохраненных номеров счетов из JSON в массив
          }
          accounts.push($input1.value)
          if (accounts.length > 0) {
            const uniqAccounts = accounts.filter((value, index) => {
              return accounts.indexOf(value) === index;
            });
            localStorage.setItem('checkTo', JSON.stringify(uniqAccounts));
          } else {
            localStorage.setItem('checkTo', JSON.stringify(accounts));
          }
        }
        $input1.value = ''
        $input2.value = ''
        $inpBtnSuccess.style.display = 'none'
        $inpBtnSuccess1.style.display = 'none'
        $input1.style.borderColor = '#116ACC' //blue
        $input2.style.borderColor = '#116ACC' //blue
        statusSuccessCheck = false
        statusSuccessSumma = false

      } catch (error) {
        // Обработка ошибки
        console.error(error);
        sendError('Произошла ошибка, попробуйте позже');
        $input1.value = '';
        $input2.value = '';
      }

    } else {
      sendError('Введите корректные данные')
    }
  })

  // вызов функции автодополнения
  autoComplite($input1)

  function sendError(textError) {
    $viewError.style.display = 'flex'
    $viewError.textContent = textError
    setTimeout(() => {
      $viewError.style.display = 'none'
    }, 2000);
  }
  function sendSuccess() {
    $viewSuccess.style.display = 'flex'
    setTimeout(() => {
      $viewSuccess.style.display = 'none'
    }, 2000);
  }
}

let transactions;
//создаем карточку динамики баланса
function createDynamicBalance() {
  const $viewdynamic = el('div', { class: 'view__dynamic' })
  const $viewdynamicH3 = el('h3', { class: 'view__subtitle', textContent: 'Динамика баланса' })
  // const $viewdynamicContainer = el('div', { class: 'view__dynamicContainer', id: 'dynamicContainer' })
  const $canvas = el('canvas', { class: 'view__myChart', id: 'myChart' })

  mount($viewBlock, $viewdynamic)
  mount($viewdynamic, $viewdynamicH3)
  mount($viewdynamic, $canvas)

  // создаем массив с транзакциями
  transactions = globalDataDetailsTransactions.payload.transactions;

  // Получение текущей даты и времени
  const currentDate = new Date();

  // Функция, которая определяет, находится ли дата в последних 6 месяцах
  function isInLastSixMonths(date) {
    const transactionDate = new Date(date);
    const sixMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 6, 1);
    return transactionDate >= sixMonthsAgo && transactionDate <= currentDate;
  }

  // Фильтрация транзакций по последним 6 месяцам
  const filteredTransactions = transactions.filter(transaction => isInLastSixMonths(transaction.date));
  // Объект для хранения сумм транзакций по месяцам
  const transactionTotalsByMonth = {};
  // Массив с названиями месяцев
  const monthNames = [
    'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
    'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'
  ];
  // Итерация по отфильтрованным транзакциям и суммирование по месяцам
  filteredTransactions.forEach(transaction => {
    const transactionDate = new Date(transaction.date);
    const month = transactionDate.getMonth(); // Получение номера месяца (0-11)
    const amount = transaction.amount;
    if (transactionTotalsByMonth[month]) {
      transactionTotalsByMonth[month] += amount;
    } else {
      transactionTotalsByMonth[month] = amount;
    }
  });
  // Формирование массива с суммами транзакций по месяцам для графика
  const chartData = monthNames.map((monthName, index) => {
    const monthTotal = transactionTotalsByMonth[index] || 0;
    return { month: monthName, total: monthTotal };
  });
  // Получение последних шести месяцев от текущей даты
  const lastSixMonths = monthNames.slice(currentDate.getMonth() - 5, currentDate.getMonth() + 1);
  const lastSixMonthsChartData = chartData.filter(data => lastSixMonths.includes(data.month));
  // Массив меток и данных для графика
  const labels = lastSixMonthsChartData.map(data => data.month);
  const data = lastSixMonthsChartData.map(data => data.total);

  const chartAreaBorder = {
    id: 'chartAreaBorder',
    beforeDraw(chart, args, options) {
      const { ctx, chartArea: { left, top, width, height } } = chart;
      ctx.save();
      ctx.strokeStyle = options.borderColor;
      ctx.lineWidth = options.borderWidth;
      ctx.setLineDash(options.borderDash || []);
      ctx.lineDashOffset = options.borderDashOffset;
      ctx.strokeRect(left, top, width, height);
      ctx.restore();
    }
  };

  new Chart($canvas, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Всего операций',
        data: data,
        backgroundColor: '#116ACC',
        borderColor: '#116ACC',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          position: 'right',
          grid: {
            display: false
          },
          ticks: {
            font: {
              size: 20,
              weight: '500',
            },
            color: '#000000',
            callback: function (value, index, values) {
              if (index === 0 || index === values.length - 1) {
                return value.toFixed(0) + ' ₽';
              } else {
                return '';
              }
            }
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              size: 20,
              weight: '700'
            },
            color: '#000000'
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        chartAreaBorder: {
          borderColor: '#000000',
          borderWidth: 1,
        }
      }
    },
    plugins: [chartAreaBorder],
    responsive: true,
    maintainAspectRatio: false,

  });

  // клик по карточке динамика баланса
  $viewdynamic.addEventListener('click', () => {
    handleClick('/history.html')
    localStorage.setItem('check', number)
  })
}

//создаем карточку истории переводов
function createCardHistoryTransaction() {
  const $history = el('div', { class: 'view__history' })
  const $historyTitle = el('h3', { class: 'view__subtitle', textContent: 'История переводов' })
  const $historyHeader = el('div', { class: 'view__history-header' })
  const $historyСheckSender = el('p', { class: 'view__history-parag', textContent: 'Счёт отправителя' })
  const $historyСheckRecipient = el('p', { class: 'view__history-parag', textContent: 'Счёт получателя' })
  const $historySumma = el('p', { class: 'view__history-parag', textContent: 'Сумма' })
  const $historyDate = el('p', { class: 'view__history-parag view__history-date', textContent: 'Дата' })
  const $historyBlock = el('div', { class: 'view__history-block' })
  const $historyBtnBlock = el('div', { class: 'd-flex al-i-center jf-center', style: 'padding-top: 25px' })
  const $historyBtnAdd = el('button', { class: 'view__history-btn btn btn-reset btn-blue', textContent: 'Показать еще' })
  const $historyLineBlock = el('div', { class: 'view__history-line' })

  mount($viewContainer, $history)
  mount($history, $historyTitle)
  mount($history, $historyHeader)
  mount($historyHeader, $historyСheckSender)
  mount($historyHeader, $historyСheckRecipient)
  mount($historyHeader, $historySumma)
  mount($historyHeader, $historyDate)
  mount($history, $historyBlock)
  mount($historyBlock, $historyLineBlock)
  createNewHistoryLine();
  mount($historyBlock, $historyBtnBlock)
  mount($historyBtnBlock, $historyBtnAdd)

  let visibleLinesCount = 5;
  $historyBtnAdd.addEventListener('click', (e) => {
    e.stopPropagation()
    let $newLine = document.querySelectorAll('.view__block-line')
    visibleLinesCount += 5;
    $newLine.forEach((line, index) => {
      if (index < visibleLinesCount) {
        line.style.display = 'flex';
      } else {
        line.style.display = 'none';
      }
    });
  })

  $history.addEventListener('click', () => {
    handleClick('/history.html')
    localStorage.setItem('check', number)
  })
}

function createNewHistoryLine() {
  // Сортировка транзакций по дате (от новых к старым)
  transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  for (const tr of transactions) {
    const newLine = el('div', { class: 'view__block-line' })
    const checkSender = el('p', { class: 'view__block-text', textContent: tr.from })
    const checkRecipient = el('p', { class: 'view__block-text', textContent: tr.to })
    let checkSumma = el('p', { class: 'view__block-text view__block-amount' })
    if (number === tr.from) {
      checkSumma.textContent = '- ' + tr.amount
      checkSumma.style.color = '#FD4E5D' //red
    } else if (number !== tr.from) {
      checkSumma.textContent = '+ ' + tr.amount
      checkSumma.style.color = '#76CA66' //green
    }
    let formattedDate
    const dateStr = new Date(tr.date);
    const options = { day: 'numeric', month: 'numeric', year: 'numeric' };
    formattedDate = dateStr.toLocaleDateString('ru-RU', options);
    const checkDate = el('p', { class: 'view__block-text', textContent: formattedDate })
    const $historyLineBloc = document.querySelector('.view__history-line')
    mount($historyLineBloc, newLine)
    mount(newLine, checkSender)
    mount(newLine, checkRecipient)
    mount(newLine, checkSumma)
    mount(newLine, checkDate)
  }
}

if (window.location.pathname === '/viewAccount.html') {
  await getDataTransactions()
  createViewAccounts(number, balance)
  createFormTransfer()
  createDynamicBalance()
  createCardHistoryTransaction()
}
