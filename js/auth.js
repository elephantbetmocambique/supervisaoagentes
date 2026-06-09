// ============================================================
// AUTH MODULE
// ============================================================

// Criar cliente Supabase aqui, depois do CDN ter carregado
let supabase;

function initSupabaseClient() {
  if (supabase) return true;
  if (typeof window.supabase === 'undefined') {
    console.error('ERRO: window.supabase não está disponível. O CDN não carregou.');
    return false;
  }
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return true;
}

const Auth = {
  currentUser: null,
  currentProfile: null,

  async init() {
    if (!initSupabaseClient()) return false;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await this.loadProfile(session.user);
        return true;
      }
    } catch(e) {
      console.error('Auth.init error:', e);
    }
    return false;
  },

  async login(email, password) {
    if (!initSupabaseClient()) throw new Error('Supabase não carregou. Refresque a página.');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await this.loadProfile(data.user);
    return data;
  },

  async logout() {
    if (supabase) await supabase.auth.signOut();
    this.currentUser = null;
    this.currentProfile = null;
    const depth = window.location.pathname.includes('/pages/') ? '../' : '';
    window.location.href = depth + 'index.html';
  },

  async loadProfile(user) {
    this.currentUser = user;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) {
        console.error('loadProfile error:', error);
      } else {
        this.currentProfile = data;
      }
    } catch(e) {
      console.error('loadProfile exception:', e);
    }
  },

  isAdmin() {
    return this.currentProfile?.role === 'admin';
  },

  isSupervisor() {
    return this.currentProfile?.role === 'supervisor';
  },

  requireAuth() {
    if (!this.currentUser) {
      window.location.href = '../index.html';
      return false;
    }
    return true;
  },

  requireAdmin() {
    if (!this.isAdmin()) {
      window.location.href = 'dashboard.html';
      return false;
    }
    return true;
  }
};

// Listener de sessão — só registar após cliente criado
document.addEventListener('DOMContentLoaded', () => {
  if (initSupabaseClient()) {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        const depth = window.location.pathname.includes('/pages/') ? '../' : '';
        window.location.href = depth + 'index.html';
      }
    });
  }
});
