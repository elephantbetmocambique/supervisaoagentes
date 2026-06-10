// ============================================================
// SHARED LAYOUT — injected into every page
// ============================================================

const NAV_ITEMS_ADMIN = [
  { section: 'Principal' },
  { href: 'dashboard.html', icon: '◈', label: 'Dashboard', id: 'nav-dashboard' },
  { section: 'Gestão' },
  { href: 'agentes.html', icon: '👤', label: 'Agentes', id: 'nav-agentes' },
  { href: 'importar-agentes.html', icon: '⬆', label: 'Importar em Lote', id: 'nav-importar' },
  { href: 'supervisores.html', icon: '🎖', label: 'Supervisores', id: 'nav-supervisores' },
  { href: 'auditorias.html', icon: '📋', label: 'Auditorias', id: 'nav-auditorias' },
  { href: 'fotos.html', icon: '🖼', label: 'Galeria de Fotos', id: 'nav-fotos' },
  { section: 'Relatórios' },
  { href: 'relatorios.html', icon: '📊', label: 'Relatórios', id: 'nav-relatorios' },
];

const NAV_ITEMS_SUPERVISOR = [
  { section: 'Principal' },
  { href: 'auditorias.html', icon: '📋', label: 'Auditorias', id: 'nav-auditorias' },
  { href: 'agentes.html', icon: '👤', label: 'Meus Agentes', id: 'nav-agentes' },
  { href: 'fotos.html', icon: '🖼', label: 'Fotos', id: 'nav-fotos' },
];

function buildNav(items, activePage) {
  return items.map(item => {
    if (item.section) return `<div class="nav-section__label">${item.section}</div>`;
    const active = activePage === item.id ? 'active' : '';
    return `<a href="${item.href}" class="nav-item ${active}" id="${item.id}">
      <span class="nav-item__icon">${item.icon}</span>
      <span>${item.label}</span>
    </a>`;
  }).join('');
}

function renderLayout(activePage, title) {
  const isAdmin = Auth.isAdmin();
  const navItems = isAdmin ? NAV_ITEMS_ADMIN : NAV_ITEMS_SUPERVISOR;

  const layout = `
  <div class="sidebar-overlay" id="sidebar-overlay"></div>
  <aside class="sidebar" id="sidebar">
    <div class="sidebar__logo">
      <div class="sidebar__logo-icon">S</div>
      <div class="sidebar__logo-text">
        <div class="sidebar__logo-name">SupervisãoAgentes</div>
        <div class="sidebar__logo-sub">Gestão em Campo</div>
      </div>
    </div>
    <nav class="sidebar__nav">
      <div class="nav-section">${buildNav(navItems, activePage)}</div>
    </nav>
    <div class="sidebar__user">
      <div class="sidebar__user-avatar" id="nav-avatar">?</div>
      <div class="sidebar__user-info">
        <div class="sidebar__user-name" id="nav-user-name">—</div>
        <div class="sidebar__user-role" id="nav-user-role">—</div>
      </div>
      <button class="sidebar__logout" title="Sair" id="logout-btn">⏻</button>
    </div>
  </aside>
  <div class="main">
    <header class="topbar">
      <button class="topbar__hamburger" id="hamburger">☰</button>
      <span class="topbar__title" id="page-title">${title}</span>
      <div class="topbar__actions" id="topbar-actions"></div>
    </header>
    <main class="content" id="page-content"></main>
  </div>`;

  document.getElementById('app').innerHTML = layout;

  // Hamburger
  document.getElementById('hamburger').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('sidebar-overlay').classList.toggle('active');
  });
  document.getElementById('sidebar-overlay').addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').classList.remove('active');
  });

  // Logout
  document.getElementById('logout-btn').addEventListener('click', () => Auth.logout());

  UI.setNavUser();
}
