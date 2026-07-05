import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || '';
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';

// If credentials exist, use real Supabase
export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Helper to check if we are using the mock fallback
export const isMockingDb = () => !supabase;

// Mock memory store for local development without DB
const mockStore = {
  sessions: new Map(),
  interactions: [] as any[],
  cards: [] as any[]
};

export const db = {
  async createSession(countryCode: string) {
    if (supabase) {
      const { data, error } = await supabase
        .from('sessions')
        .insert([{ country_code: countryCode }])
        .select()
        .single();
      if (error) {
        console.error('Error creating session:', error);
        return null;
      }
      return data.id;
    }
    
    // Mock
    const id = 'mock-session-' + Date.now();
    mockStore.sessions.set(id, { id, created_at: new Date().toISOString(), country_code: countryCode, last_active_at: new Date().toISOString() });
    return id;
  },

  async updateSessionActivity(sessionId: string) {
    if (supabase) {
      await supabase
        .from('sessions')
        .update({ last_active_at: new Date().toISOString() })
        .eq('id', sessionId);
      return;
    }
    
    // Mock
    const session = mockStore.sessions.get(sessionId);
    if (session) {
      session.last_active_at = new Date().toISOString();
    }
  },

  async recordInteraction(sessionId: string, stepName: string, value: string) {
    if (supabase) {
      await supabase
        .from('interactions')
        .insert([{ session_id: sessionId, step_name: stepName, value }]);
      return;
    }
    
    // Mock
    mockStore.interactions.push({ session_id: sessionId, step_name: stepName, value, created_at: new Date().toISOString() });
  },

  async recordCardPick(sessionId: string, cardName: string) {
    if (supabase) {
      await supabase
        .from('card_selections')
        .insert([{ session_id: sessionId, card_name: cardName }]);
      return;
    }
    
    // Mock
    mockStore.cards.push({ session_id: sessionId, card_name: cardName, created_at: new Date().toISOString() });
  },

  async getStats() {
    if (supabase) {
      // Very basic aggregate query for "Are you bored?"
      const { count: boredCount } = await supabase
        .from('interactions')
        .select('*', { count: 'exact', head: true })
        .eq('step_name', 'are_you_bored')
        .eq('value', 'Yes')
        .gte('created_at', new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString());

      const { count: totalCount } = await supabase
        .from('interactions')
        .select('*', { count: 'exact', head: true })
        .eq('step_name', 'are_you_bored')
        .gte('created_at', new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString());

      const boredPercent = totalCount && boredCount ? Math.round((boredCount / totalCount) * 100) : 83;

      // Active users (active in last 5 mins)
      const { count: activeCount } = await supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .gte('last_active_at', new Date(Date.now() - 5 * 60 * 1000).toISOString());

      return {
        boredPercentage: boredPercent,
        activeVisitors: activeCount || 1,
      };
    }
    
    // Mock stats
    return {
      boredPercentage: 83,
      activeVisitors: 4
    };
  },

  async getTraces() {
    if (supabase) {
      const { data } = await supabase
        .from('interactions')
        .select('value, created_at, sessions(country_code)')
        .order('created_at', { ascending: false })
        .limit(10);
      return data || [];
    }
    return [];
  },
  
  async getCardStats(cardName: string) {
    if (supabase) {
      const { count } = await supabase
        .from('card_selections')
        .select('*', { count: 'exact', head: true })
        .eq('card_name', cardName)
        .gte('created_at', new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString());
      return count || 0;
    }
    return Math.floor(Math.random() * 20); // Mock
  }
};
