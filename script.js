document.addEventListener('DOMContentLoaded', () => {
  const menu = document.querySelector('.mobile-nav');
  if (!menu) return;
  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => menu.removeAttribute('open'));
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.open) {
      menu.removeAttribute('open');
      menu.querySelector('summary').focus();
    }
  });
});
