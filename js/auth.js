// ============================================================
// AUTH MODULE — carrega após CDN Supabase
// ============================================================

const Auth = {
  currentUser: null,
  currentProfile: null,
  _sb: null,

  // Obter cliente Supabase (criado pelo config.js ou pelo index.html)
  sb() {
    if (!this._sb) {
      if (typeof window.supabase === 'undefined') throw new Error('Supabase CDN não carregou');
      this._sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return this._sb;
  },

  async init() {
    try {
      const { data: { session } } = await this.sb().auth.getSession();
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
    const { data, error } = await this.sb().auth.signInWithPassword({ email, password });
    if (error) throw error;
    await this.loadProfile(data.user);
    return data;
  },

  async logout() {
    try { await this.sb().auth.signOut(); } catch(e) {}
    this.currentUser = null;
    this.currentProfile = null;
    const depth = window.location.pathname.includes('/pages/') ? '../' : '';
    window.location.href = depth + 'index.html';
  },

  async loadProfile(user) {
    this.currentUser = user;
    try {
      const { data, error } = await this.sb()
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (!error) this.currentProfile = data;
    } catch(e) {
      console.error('loadProfile error:', e);
    }
  },

  isAdmin() { return this.currentProfile?.role === 'admin'; },
  isSupervisor() { return this.currentProfile?.role === 'supervisor'; },

  requireAuth() {
    if (!this.currentUser) {
      window.location.href = '../index.html';
      return false;
    }
    return true;
  }
};

// Referência global ao cliente para uso directo nas páginas
function getSupabase() { return Auth.sb(); }
