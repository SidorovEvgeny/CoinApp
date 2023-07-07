export function hideLoader() {
  const siteContainer = document.querySelector('.site-container')
  siteContainer.style.display = 'block'
  const loader = document.getElementById('BlockLoader');
  loader.style.display = 'none';
}
