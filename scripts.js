// Detect standalone/display-mode (iOS uses window.navigator.standalone, others use display-mode)
function isStandalone() {
  return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches)
         || window.navigator.standalone === true;
}

window.addEventListener('DOMContentLoaded', () => {
  if (isStandalone()) document.body.classList.add('standalone');

  const back = document.querySelector('.nav-btn[aria-label="Back"]');
  const menu = document.querySelector('.nav-btn[aria-label="Menu"]');

  // create a simple menu sheet (keeps previous structure)
  const overlay = document.createElement('div');
  overlay.className = 'menu-overlay';
  overlay.innerHTML = `
    <div class="menu-sheet" role="dialog" aria-modal="true" aria-label="Menu">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <strong style="font-size:16px">Menu</strong>
        <button aria-label="Close" style="background:none;border:none;color:var(--muted);font-size:24px">×</button>
      </div>
      <div class="card">
        <button class="btn-primary" style="width:100%">New chat</button>
        <div style="height:10px"></div>
        <button style="width:100%;border-radius:10px;padding:10px;background:transparent;border:1px solid rgba(255,255,255,0.04);color:var(--muted)">Settings</button>
      </div>
      <div style="height:20px"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('open');
      if (menu) { menu.classList.remove('active'); menu.setAttribute('aria-expanded', 'false'); }
    }
  });

  const closeBtn = overlay.querySelector('button[aria-label="Close"]');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      overlay.classList.remove('open');
      if (menu) { menu.classList.remove('active'); menu.setAttribute('aria-expanded', 'false'); }
    });
  }

  if (menu) {
    // make menu button accessible and reflect state
    menu.setAttribute('aria-expanded', 'false');
    menu.addEventListener('click', () => {
      const isOpen = overlay.classList.toggle('open');
      menu.classList.toggle('active', isOpen);
      menu.setAttribute('aria-expanded', String(isOpen));
      document.body.classList.toggle('menu-open', isOpen);
      // subtle bounce using Web Animations API for tactile feel
      try {
        menu.animate([
          { transform: 'scale(1)' },
          { transform: 'scale(0.96)' },
          { transform: 'scale(1)' }
        ], { duration: 200, easing: 'cubic-bezier(.2,.9,.2,1)' });
      } catch (err) { /* ignore if WAAPI not supported */ }
    });
  }

  if (back) {
    back.addEventListener('click', () => {
      if (window.history.length > 1) window.history.back();
      else {
        try {
          back.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(2px)' }, { transform: 'translateY(0)' }], { duration: 150 });
        } catch (err) { /* noop */ }
      }
    });
  }

  // composer send / fab interactions (small demo)
  const send = document.querySelector('.icon-btn.send');
  const input = document.querySelector('.pill-input');
  const fab = document.querySelector('.fab');
  if (send && input) {
    send.addEventListener('click', () => {
      // small pulse feedback
      try { send.animate([{ transform: 'scale(1)' }, { transform: 'scale(0.96)' }, { transform: 'scale(1)' }], { duration: 160 }); } catch (e) {}
      // simple behavior: clear input
      input.value = '';
    });
  }
  if (fab) {
    fab.addEventListener('click', () => {
      try { fab.animate([{ transform: 'scale(1)' }, { transform: 'scale(0.94)' }, { transform: 'scale(1)' }], { duration: 180 }); } catch (e) {}
      // open menu as quick new chat action
      overlay.classList.toggle('open');
      const isOpen = overlay.classList.contains('open');
      if (menu) { menu.classList.toggle('active', isOpen); menu.setAttribute('aria-expanded', String(isOpen)); }
    });
  }

  // optional: react to display-mode change during dev
  if (window.matchMedia) {
    const m = window.matchMedia('(display-mode: standalone)');
    try { m.addEventListener('change', e => document.body.classList.toggle('standalone', e.matches)); }
    catch (err) { /* older browsers */ }
  }
});