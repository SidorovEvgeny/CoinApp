const menuLinks = document.querySelectorAll('.nav__link');
const currentPath = window.location.pathname;
const nav = document.querySelector('.nav');

menuLinks.forEach(link => {
  const linkPath = '/' + link.getAttribute('href');
  // Добавляем класс "active" к ссылке, если текущий путь страницы соответствует href
  if (currentPath == '/index.html') {
  } else if (linkPath === currentPath) {
    nav.style.display = 'block';
    link.classList.add('active');
  } else {
    nav.style.display = 'block';
  }
});

