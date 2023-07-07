import { mount, el } from "redom";
import Chart from 'chart.js/auto'
import { autorizationError } from "./autorization";

const token = localStorage.getItem('token')
const id = localStorage.getItem('check')
const $historyContainer = document.querySelector('.history__container')
const $historyHeaderBlock = document.querySelector('.view__hederBlock')
const $historyDynamic = document.querySelector('.history__dynamic')
const $historyTransactions = document.querySelector('.history__transaction')
const $historyHistoryTransactions = document.querySelector('.history__historyTransactions')
let globalDetailsTransactions;

if (window.location.pathname === '/history.html') {

  fetch(`http://localhost:3000/account/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${token}`
    }
  })
    .then(response => response.json())
    .then(data => {
      // Обработка ответа сервера после авторизации
      globalDetailsTransactions = data
      const number = data.payload.account
      const bl = data.payload.balance
      const balance = Math.trunc(bl)
      createHeaderHistory(number, balance)
      chartJs()
      createHistoryTransactions()
    })
    .catch(error => {
      // Обработка ошибки
      console.error(error);
      autorizationError(document.body, 'error')
    });

}

function createHeaderHistory(hNumber, hBalance) {
  //создаем шапку страницы c номером и балансом
  const $hederNumber = el('p', { class: 'view__headerNumber', textContent: hNumber })
  const $hederBalance = el('p', { class: 'view__headerBalance', textContent: hBalance + ' ₽' })
  mount($historyHeaderBlock, $hederNumber)
  mount($historyHeaderBlock, $hederBalance)
}

// Создаем карточку динамики баланса
// Карточку соотношения расх и дох
function chartJs() {
  const $viewdynamicH3 = el('h3', { class: 'view__subtitle', textContent: 'Динамика баланса' })
  const $canvas = el('canvas', { class: 'history__myChart', id: 'myChart' })
  mount($historyDynamic, $viewdynamicH3)
  mount($historyDynamic, $canvas)
  // Создали объек с транзакциями
  const transactions = globalDetailsTransactions.payload.transactions;
  // Получение текущей даты и времени
  const currentDate = new Date();
  // Проверяем является ли операция в нужном диапозоне
  function isInLastTwelveMonths(date) {
    const transactionDate = new Date(date);
    const twelveMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 11, 1);
    return transactionDate >= twelveMonthsAgo && transactionDate <= currentDate;
  }
  // Фильтрация транзакций по последним 12 месяцам
  const filteredTransactions = transactions.filter(transaction => isInLastTwelveMonths(transaction.date));

  // Объект для хранения сумм транзакций по месяцам
  const transactionTotalsByMonth = {};
  const consumptionOperations = {};
  const parishOperations = {};

  // Массив с названиями месяцев
  const monthNames = [
    'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
    'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'
  ];
  // Итерация по отфильтрованным транзакциям и суммирование по месяцам
  // Разделяем входящие и исходящие
  filteredTransactions.forEach(transaction => {
    const transactionDate = new Date(transaction.date);
    const month = transactionDate.getMonth(); // Получение номера месяца (0-11)
    const amount = transaction.amount;
    if (transaction.from !== id) {
      if (parishOperations[month]) {
        parishOperations[month] += amount;
      } else {
        parishOperations[month] = amount;
      }
    } else {
      if (consumptionOperations[month]) {
        consumptionOperations[month] += amount;
      } else {
        consumptionOperations[month] = amount;
      }
    }
  });
  // Считаем сумму всех оппераций
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
  const chartData = [];
  for (let i = 11; i >= 0; i--) {
    const monthIndex = (currentDate.getMonth() - i + 12) % 12;
    const monthName = monthNames[monthIndex];
    const monthTotal = transactionTotalsByMonth[monthIndex] || 0;
    const monthTotalMinus = consumptionOperations[monthIndex] || 0;
    const monthTotalPlus = parishOperations[monthIndex] || 0;
    chartData.push({ month: monthName, total: monthTotal, totalMinus: monthTotalMinus, totalPlus: monthTotalPlus });
  }
  // Массив меток и данных для графика
  let labels = [];
  let data = [];
  let dataMinus = [];
  let dataPlus = [];

  for (const lb of chartData) {
    labels.push(lb.month)
    data.push(lb.total)
    dataMinus.push(lb.totalMinus)
    dataPlus.push(lb.totalPlus)
  }
  // Создаем класс графика
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
      layout: {
        padding: {
          left: 10,
          right: 10,
          top: 10,
          bottom: 10
        }
      },
      elements: {
        line: {
          borderWidth: 1
        }
      },
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

  const $historyH3 = el('h3', { class: 'view__subtitle', textContent: 'Соотношение входящих исходящих транзакций' })
  const $canvas1 = el('canvas', { class: 'history__myChart', id: 'myChart' })
  mount($historyTransactions, $historyH3)
  mount($historyTransactions, $canvas1)

  const data1 = {
    labels: labels,
    datasets: [
      {
        label: 'Приходные операции',
        data: dataPlus,
        backgroundColor: '#27AE60'
      },
      {
        label: 'Расходные операции',
        data: dataMinus,
        backgroundColor: '#FD4E5D',
      },
    ],
  };

  new Chart($canvas1, {
    type: 'bar',
    data: data1,
    options: {
      scales: {
        y: {
          stacked: true, // Добавляем свойство stacked для объединения столбцов
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
              if (value < 0) {
                return Math.abs(value).toFixed(0) + ' ₽';
              } else if (index === 0 || index === values.length - 1) {
                return value.toFixed(0) + ' ₽';
              } else {
                return '';
              }
            }
          }
        },
        x: {
          stacked: true, // Добавляем свойство stacked для объединения столбцов
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
  })
}

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

// Создаем карточку истории транзакций
function createHistoryTransactions() {
  //создаем карточку истории переводов
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

  // mount($viewContainer, $history)
  mount($historyHistoryTransactions, $historyTitle)
  mount($historyHistoryTransactions, $historyHeader)
  mount($historyHistoryTransactions, $historyBlock)
  mount($historyHeader, $historyСheckSender)
  mount($historyHeader, $historyСheckRecipient)
  mount($historyHeader, $historySumma)
  mount($historyHeader, $historyDate)
  mount($historyBlock, $historyLineBlock)
  mount($historyBlock, $historyBtnBlock)
  mount($historyBtnBlock, $historyBtnAdd)

  const transactions = globalDetailsTransactions.payload.transactions
  function createNewHistoryLine() {
    // Сортировка транзакций по дате (от новых к старым)
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    for (const tr of transactions) {
      const newLine = el('div', { class: 'history__blockHistory-line' })
      const checkSender = el('p', { class: 'view__block-text', textContent: tr.from })
      const checkRecipient = el('p', { class: 'view__block-text', textContent: tr.to })
      let checkSumma = el('p', { class: 'view__block-text view__block-amount' })
      if (id === tr.from) {
        checkSumma.textContent = '- ' + tr.amount
        checkSumma.style.color = '#FD4E5D' //red
      } else if (id !== tr.from) {
        checkSumma.textContent = '+ ' + tr.amount
        checkSumma.style.color = '#76CA66' //green
      }
      let formattedDate
      const dateStr = new Date(tr.date);
      const options = { day: 'numeric', month: 'numeric', year: 'numeric' };
      formattedDate = dateStr.toLocaleDateString('ru-RU', options);
      const checkDate = el('p', { class: 'view__block-text', textContent: formattedDate })
      mount($historyLineBlock, newLine)
      mount(newLine, checkSender)
      mount(newLine, checkRecipient)
      mount(newLine, checkSumma)
      mount(newLine, checkDate)
    }
  }
  createNewHistoryLine();

  let $newLine = document.querySelectorAll('.history__blockHistory-line')
  let visibleLinesCount = 5;
  $historyBtnAdd.addEventListener('click', () => {
    visibleLinesCount += 5;
    $newLine.forEach((line, index) => {
      if (index < visibleLinesCount) {
        line.style.display = 'flex';
      } else {
        line.style.display = 'none';
      }
    });
  })
}

