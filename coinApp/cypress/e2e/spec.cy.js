/// <reference types='cypress' />
describe('Тестируем банковское приложение CoinApp', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3001/index.html')
  })

  it('Проверяем форму авторизации, просмотр списка счетов, создание нового счета, перевод средств между счетами и тд', () => {

    // Проверили форму регистрации
    cy.get('input[type="text"]').type('developer')
    cy.get('input[type="password"]').type('skillbox')
    cy.get('a').contains('Войти').click()
    cy.wait(2000);


    // Создали новый счет
    cy.wait(2000);
    cy.get('.account__btn').click()

    // Зашли в просмотр счета
    cy.get('#btnOpen').click()
    cy.wait(2000);

    // Поверили возможность отправки денег на другой счет
    cy.get('input[name="number"]').type('1108 0542 3435 5738 0634 0874 34')
    cy.get('input[name="summa"]').type('123')

    cy.get('.view__btnSend').click()
    cy.wait(2000)

    // Проверяем кнопку "Показать еще" для просмотра истории операций
    cy.get('.view__history-btn').click()
    cy.wait(2000)

    // Проверяем переход к просмотру детальной информации счёта нажатием на карточку динамики баланса
    cy.get('.view__dynamic').click()
    cy.wait(3000)

    // Проверяем кнопку "Вернуться назад"
    cy.get('#btnBack').click()
    cy.wait(3000)

    // Проверяем переход к просмотру детальной информации счёта нажатием на карточку истории баланса
    cy.get('.view__history').click()
    cy.wait(3000)

    // Проверяем возможность просмотра банкоматов на карте
    cy.get('.nav__link').contains('Банкоматы').click()
    cy.wait(3000)

    // Проверяем возможность просмотра страницы "Валюта"
    cy.get('.nav__link').contains('Валюта').click()
    cy.wait(3000)


    // Проверяем кнопку "выйти" для выхода из приложения
    cy.get('.nav__link').contains('Выйти').click()
  })
})
