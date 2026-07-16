document.addEventListener('DOMContentLoaded', () => {
  const mobileMenu = document.querySelector('.mobile-nav');

  if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.removeAttribute('open');
      });
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        mobileMenu.removeAttribute('open');
      }
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start'
      });
    });
  });
});
