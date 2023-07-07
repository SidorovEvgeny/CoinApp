import 'jquery-ui/ui/widgets/autocomplete';
import $ from 'jquery';

export function autoComplite(input) {
  // Получение сохраненных номеров счетов из localStorage (если есть)
  const savedAccounts = localStorage.getItem('checkTo');
  let accounts = [];
  if (savedAccounts) {
    // Разбор сохраненных номеров счетов из JSON в массив
    accounts = JSON.parse(savedAccounts);
    // Настройка автодополнения
    $(function () {
      // Инициализация автодополнения для инпута с номером счета
      $(input).autocomplete({
        source: accounts, // Передача массива сохраненных номеров счетов в качестве источника данных
        minLength: 1 // Минимальное количество символов для начала автодополнения
      });
    });
  }
}
