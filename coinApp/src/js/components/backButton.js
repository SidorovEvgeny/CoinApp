const $backButton = document.getElementById('btnBack');

if ($backButton) {
  $backButton.addEventListener('click', () => {
    window.history.back();
  });
}
