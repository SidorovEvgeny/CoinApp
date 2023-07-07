import { hideLoader } from "./loader";

window.addEventListener('load', function() {
  hideLoader(); // Скрываем лоадер-показываем контент
});

const $inpLogin = document.getElementById('login');
const $inpPassword = document.getElementById('password')
const $btnEntry = document.getElementById('btnEntry');
const $inpLogAft = document.getElementById('inpLog')
const $inpPassAft = document.getElementById('inpPass')

let login;
let password;

export function handleClick(url) {
  window.location.href = url;
}

if ($inpLogin) {

  $inpLogin.addEventListener('input', () => {
    const inputValue = $inpLogin.value;
    const regex = /^[a-z0-9]+$/;

    if (!regex.test(inputValue)) {
      $inpLogin.value = inputValue.replace(/[^a-z0-9]/g, '');
    }
  });

  $inpLogin.addEventListener('blur', () => {
    login = $inpLogin.value;
  })
}

if ($inpPassword) {

  $inpPassword.addEventListener('input', () => {
    const inputValue = $inpPassword.value;
    const regex = /^[a-z0-9]+$/;

    if (!regex.test(inputValue)) {
      $inpPassword.value = inputValue.replace(/[^a-z0-9]/g, '');
    }
  });

  $inpPassword.addEventListener('blur', () => {
    password = $inpPassword.value;
  })
}

if ($btnEntry) {
  $btnEntry.addEventListener('click', (e) => {
    e.preventDefault();
    const userData = {
      login: login,       //'developer'
      password: password  //'skillbox'
    };

    fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    })
      .then(response => response.json())
      .then(dataToken => {
        // Обработка ответа сервера после авторизации
        if (dataToken.payload !== null) {
          const token = dataToken.payload.token
          localStorage.setItem('token', token);
          handleClick('/accounts.html')
          return
        }
        if (dataToken.error === 'No such user') {
          autorizationError($inpLogAft, 'hero__input-login')
          return
        }
        if (dataToken.error === 'Invalid password') {
          autorizationError($inpPassAft, 'hero__input-password')
          return
        }
      })
      .catch(error => {
        // Обработка ошибки
        console.error(error);
        autorizationError(document.body, 'error')
      });
  })
}

export function autorizationError(input, clas) {
  input.classList.add(clas)
  setTimeout(() => {
    input.classList.remove(clas)
  }, 2000);
}
