// ============================================================
// UI UTILITIES
// ============================================================

const UI = {
  // Toast notifications
  toast(message, type = 'info', duration = 3500) {
    const existing = document.querySelector('.toast-container');
    if (existing) existing.remove();
    const container = document.createElement('div');
    container.className = 'toast-container';
    const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
    container.innerHTML = `
      <div class="toast toast--${type}">
        <span class="toast__icon">${icons[type] || icons.info}</span>
        <span class="toast__msg">${message}</span>
      </div>`;
    document.body.appendChild(container);
    setTimeout(() => container.classList.add('toast--visible'), 10);
    setTimeout(() => {
      container.classList.remove('toast--visible');
      setTimeout(() => container.remove(), 400);
    }, duration);
  },

  // Loading overlay
  loading(show, text = 'A carregar...') {
    let overlay = document.getElementById('loading-overlay');
    if (show) {
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.innerHTML = `<div class="loading-box"><div class="spinner"></div><span>${text}</span></div>`;
        document.body.appendChild(overlay);
      }
      overlay.classList.add('active');
    } else {
      if (overlay) overlay.classList.remove('active');
    }
  },

  // Confirm modal
  confirm(title, message) {
    return new Promise(resolve => {
      const modal = document.createElement('div');
      modal.className = 'modal-backdrop active';
      modal.innerHTML = `
        <div class="modal modal--sm">
          <h3 class="modal__title">${title}</h3>
          <p class="modal__body">${message}</p>
          <div class="modal__actions">
            <button class="btn btn--ghost" id="modal-cancel">Cancelar</button>
            <button class="btn btn--danger" id="modal-confirm">Confirmar</button>
          </div>
        </div>`;
      document.body.appendChild(modal);
      modal.querySelector('#modal-cancel').onclick = () => { modal.remove(); resolve(false); };
      modal.querySelector('#modal-confirm').onclick = () => { modal.remove(); resolve(true); };
    });
  },

  // Format date
  formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-MZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
  },

  formatDateTime(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-MZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  },

  // Avatar initials
  initials(name) {
    if (!name) return '?';
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  },

  // Role badge
  roleBadge(role) {
    const map = { admin: ['Administrador', 'badge--admin'], supervisor: ['Supervisor', 'badge--supervisor'], agente: ['Agente', 'badge--agente'] };
    const [label, cls] = map[role] || [role, ''];
    return `<span class="badge ${cls}">${label}</span>`;
  },

  // Status badge
  statusBadge(status) {
    const map = {
      ativo: ['Ativo', 'badge--success'],
      inativo: ['Inativo', 'badge--danger'],
      pendente: ['Pendente', 'badge--warning'],
      aprovado: ['Aprovado', 'badge--success'],
      reprovado: ['Reprovado', 'badge--danger']
    };
    const [label, cls] = map[status] || [status, ''];
    return `<span class="badge ${cls}">${label}</span>`;
  },

  // Set navbar user info
  setNavUser() {
    const p = Auth.currentProfile;
    if (!p) return;
    const nameEl = document.getElementById('nav-user-name');
    const roleEl = document.getElementById('nav-user-role');
    const avatarEl = document.getElementById('nav-avatar');
    if (nameEl) nameEl.textContent = p.full_name || p.email;
    if (roleEl) roleEl.textContent = p.role === 'admin' ? 'Administrador' : 'Supervisor';
    if (avatarEl) avatarEl.textContent = UI.initials(p.full_name || p.email);
  },

  // Pagination helper
  paginate(items, page, perPage = 15) {
    const total = items.length;
    const pages = Math.ceil(total / perPage);
    const start = (page - 1) * perPage;
    return { items: items.slice(start, start + perPage), total, pages, page };
  },

  renderPagination(container, current, total, onPage) {
    if (total <= 1) { container.innerHTML = ''; return; }
    let html = '<div class="pagination">';
    html += `<button class="page-btn" ${current === 1 ? 'disabled' : ''} data-page="${current - 1}">‹</button>`;
    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - 1 && i <= current + 1)) {
        html += `<button class="page-btn ${i === current ? 'active' : ''}" data-page="${i}">${i}</button>`;
      } else if (i === current - 2 || i === current + 2) {
        html += `<span class="page-ellipsis">…</span>`;
      }
    }
    html += `<button class="page-btn" ${current === total ? 'disabled' : ''} data-page="${current + 1}">›</button>`;
    html += '</div>';
    container.innerHTML = html;
    container.querySelectorAll('.page-btn:not([disabled])').forEach(btn => {
      btn.addEventListener('click', () => onPage(parseInt(btn.dataset.page)));
    });
  }
};

// Export CSV utility
function exportToCSV(data, filename) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(row => headers.map(h => `"${(row[h] ?? '').toString().replace(/"/g, '""')}"`).join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
