// ==============================================================================
// KrishiSetu AI - Supabase Configuration & Client Manager
// ==============================================================================

const SupabaseConfig = {
  // Config keys stored in localStorage for easy user setup
  STORAGE_URL_KEY: 'krishi_supabase_url',
  STORAGE_ANON_KEY: 'krishi_supabase_anon_key',

  // Get current config
  getUrl() {
    return localStorage.getItem(this.STORAGE_URL_KEY) || window.KRISHI_SUPABASE_URL || '';
  },

  getAnonKey() {
    return localStorage.getItem(this.STORAGE_ANON_KEY) || window.KRISHI_SUPABASE_ANON_KEY || '';
  },

  isConfigured() {
    const url = this.getUrl();
    const key = this.getAnonKey();
    return Boolean(url && key && url.startsWith('https://') && key.length > 20);
  },

  saveConfig(url, anonKey) {
    if (!url || !url.startsWith('https://')) {
      throw new Error('Supabase URL must start with https://');
    }
    if (!anonKey || anonKey.length < 20) {
      throw new Error('Please enter a valid Supabase Anon Public Key.');
    }
    localStorage.setItem(this.STORAGE_URL_KEY, url.trim());
    localStorage.setItem(this.STORAGE_ANON_KEY, anonKey.trim());
    this.initClient();
  },

  clearConfig() {
    localStorage.removeItem(this.STORAGE_URL_KEY);
    localStorage.removeItem(this.STORAGE_ANON_KEY);
    window.krishiSupabase = null;
  },

  // Initialize official Supabase client if configured & SDK is loaded
  initClient() {
    if (this.isConfigured() && window.supabase) {
      try {
        window.krishiSupabase = window.supabase.createClient(this.getUrl(), this.getAnonKey(), {
          auth: {
            persistSession: true,
            storage: window.localStorage,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        });
        console.log('[KrishiSetu AI] Supabase Cloud Client Initialized successfully.');
        return window.krishiSupabase;
      } catch (e) {
        console.warn('[KrishiSetu AI] Failed to initialize Supabase client:', e);
        window.krishiSupabase = null;
      }
    } else {
      window.krishiSupabase = null;
    }
    return null;
  }
};

// Auto-initialize on script load
if (typeof window !== 'undefined') {
  window.SupabaseConfig = SupabaseConfig;
  SupabaseConfig.initClient();
}
