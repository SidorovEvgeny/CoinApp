import Choices from 'choices.js';

const accountChoice = document.querySelector('.js-choice');

if (accountChoice) {
  const choices = new Choices(accountChoice, {
    searchEnabled: false, //убрал строку поиска
    itemSelectText: "",    //убрал подсказку
  });
}

