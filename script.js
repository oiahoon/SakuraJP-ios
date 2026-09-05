document.addEventListener('DOMContentLoaded', () => {
  const menu = document.querySelector('.mobile-nav');
  if (menu) {
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => menu.removeAttribute('open')));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.open) {
        menu.removeAttribute('open');
        menu.querySelector('summary').focus();
      }
    });
  }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (!('IntersectionObserver' in window) || !Element.prototype.animate) return;
  const running = new Set();
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    observer.unobserve(entry.target);
    if (reduced.matches || document.hidden) return;
    const animation = entry.target.animate([
      {opacity: 0, transform: 'translateY(14px)'},
      {opacity: 1, transform: 'translateY(0)'}
    ], {duration: 620, easing: 'cubic-bezier(.22,1,.36,1)'});
    running.add(animation);
    animation.finished.catch(() => {}).finally(() => running.delete(animation));
  }), {threshold: .08});
  document.querySelectorAll('.hero-copy, .hero-experience, .section-heading, .workspace-card, .screen-gallery figure, .local-card, .final-cta-card').forEach(el => observer.observe(el));
  const stop = () => { running.forEach(a => a.cancel()); running.clear(); };
  reduced.addEventListener('change', () => { if (reduced.matches) stop(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
});
