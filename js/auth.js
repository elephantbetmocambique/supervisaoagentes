// ============================================================
// AUTH MODULE
// ============================================================

const Auth = {
  currentUser: null,
  currentProfile: null,

  async init() {
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
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await this.loadProfile(data.user);
    return data;
  },

  async logout() {
    await supabase.auth.signOut();
    this.currentUser = null;
    this.currentProfile = null;
    // Funciona tanto de / como de /pages/
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

// Listen for auth changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    const depth = window.location.pathname.includes('/pages/') ? '../' : '';
    window.location.href = depth + 'index.html';
  }
});
