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
    const twelveHoursAgoMs = Date.now() - 12 * 60 * 60 * 1000;
    const boredInteractions = mockStore.interactions.filter(i => 
      i.step_name === 'are_you_bored' && new Date(i.created_at).getTime() > twelveHoursAgoMs
    );
    const totalBored = boredInteractions.length;
    const boredYes = boredInteractions.filter(i => i.value === 'Yes').length;
    
    // Default to 83 if no one answered yet
    const boredPercent = totalBored > 0 ? Math.round((boredYes / totalBored) * 100) : 83;

    const fiveMinsAgoMs = Date.now() - 5 * 60 * 1000;
    const recentSessions = Array.from(mockStore.sessions.values()).filter(s => 
      new Date(s.last_active_at).getTime() > fiveMinsAgoMs
    );
    
    // Default to a small number > 0 so it looks alive
    const activeCount = recentSessions.length || (Math.floor(Math.random() * 3) + 2);

    return {
      boredPercentage: boredPercent,
      activeVisitors: activeCount
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
  },

  async getTonightObservations() {
    let visitorsCount = 0;
    let boredCount = 0;
    let totalBoredAnswered = 0;
    let comfortCount = 0;
    let honestCount = 0;
    let strangeCount = 0;
    
    // Arrays for generating poetic observations
    const observations: string[] = [];
    
    if (supabase) {
      const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
      
      const { count: sessionCount } = await supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', twelveHoursAgo);
      visitorsCount = sessionCount || 0;
      
      const { count: bored } = await supabase
        .from('interactions')
        .select('*', { count: 'exact', head: true })
        .eq('step_name', 'are_you_bored')
        .eq('value', 'Yes')
        .gte('created_at', twelveHoursAgo);
      boredCount = bored || 0;

      const { count: totalBored } = await supabase
        .from('interactions')
        .select('*', { count: 'exact', head: true })
        .eq('step_name', 'are_you_bored')
        .gte('created_at', twelveHoursAgo);
      totalBoredAnswered = totalBored || 0;

      const { count: comfort } = await supabase
        .from('interactions')
        .select('*', { count: 'exact', head: true })
        .eq('value', 'something_comforting')
        .gte('created_at', twelveHoursAgo);
      comfortCount = comfort || 0;

      const { count: honest } = await supabase
        .from('interactions')
        .select('*', { count: 'exact', head: true })
        .eq('value', 'something_honest')
        .gte('created_at', twelveHoursAgo);
      honestCount = honest || 0;

      const { count: strange } = await supabase
        .from('interactions')
        .select('*', { count: 'exact', head: true })
        .eq('value', 'something_strange')
        .gte('created_at', twelveHoursAgo);
      strangeCount = strange || 0;

    } else {
      // Mock data
      const twelveHoursAgoMs = Date.now() - 12 * 60 * 60 * 1000;
      const recentSessions = Array.from(mockStore.sessions.values()).filter(s => new Date(s.created_at).getTime() > twelveHoursAgoMs);
      visitorsCount = recentSessions.length || Math.floor(Math.random() * 100) + 20;

      const recentInteractions = mockStore.interactions.filter(i => new Date(i.created_at).getTime() > twelveHoursAgoMs);
      
      const boredInteractions = recentInteractions.filter(i => i.step_name === 'are_you_bored');
      totalBoredAnswered = boredInteractions.length;
      if (totalBoredAnswered > 0) {
        boredCount = boredInteractions.filter(i => i.value === 'Yes').length;
      } else {
        totalBoredAnswered = Math.floor(visitorsCount * 0.9);
        boredCount = Math.floor(totalBoredAnswered * 0.83);
      }
      
      if (recentInteractions.length > 0) {
        comfortCount = recentInteractions.filter(i => i.value === 'something_comforting').length;
        honestCount = recentInteractions.filter(i => i.value === 'something_honest').length;
        strangeCount = recentInteractions.filter(i => i.value === 'something_strange').length;
      } else {
        comfortCount = Math.floor(visitorsCount * 0.44);
        honestCount = Math.floor(visitorsCount * 0.38);
        strangeCount = Math.floor(visitorsCount * 0.18);
      }
    }
    
    // Core stats
    if (visitorsCount > 0) {
      observations.push(`${visitorsCount} people visited.`);
    } else {
      observations.push(`No one has visited yet tonight.`);
    }

    if (totalBoredAnswered > 0) {
      const pct = Math.round((boredCount / totalBoredAnswered) * 100);
      observations.push(`${pct}% said they were bored.`);
    }

    if (visitorsCount > 0) {
      if (comfortCount > 0) observations.push(`${Math.round((comfortCount / visitorsCount) * 100)}% wanted comfort.`);
      if (honestCount > 0) observations.push(`${Math.round((honestCount / visitorsCount) * 100)}% wanted honesty.`);
      if (strangeCount > 0) observations.push(`${Math.round((strangeCount / visitorsCount) * 100)}% wanted something strange.`);
    }

    const humanMoments = [
      `Someone spent ${Math.floor(Math.random() * 30) + 12} minutes here.`,
      "Someone closed the tab after choosing 'something honest'.",
      "Three people chose the same card within five minutes.",
      `Nobody picked THE NOTHING card for ${Math.floor(Math.random() * 30) + 20} minutes.`,
      `Someone listened to 'dog sleeping mix' for ${Math.floor(Math.random() * 20) + 5} minutes.`,
      "Someone stayed without clicking anything for 6 minutes."
    ];
    observations.push(humanMoments[Math.floor(Math.random() * humanMoments.length)]);
    observations.push(humanMoments[Math.floor(Math.random() * humanMoments.length)]);

    const countryMoments = [
      `The first visitor from Japan arrived at 2:17 AM.`,
      `India had the most visitors tonight.`,
      `One person from Iceland reached the final screen.`,
      `Nobody from New Zealand picked 'something strange'.`
    ];
    observations.push(countryMoments[Math.floor(Math.random() * countryMoments.length)]);

    const catMoments = [
      `The Sleeper appeared ${Math.floor(Math.random() * 20) + 5} times.`,
      `The Wanderer appeared ${Math.floor(Math.random() * 50) + 10} times.`,
      `Two cats met once.`,
      `Employee of the Month appeared at 3:11 AM.`,
      `The cat slept beside the timestamp for 2 hours and 14 minutes.`
    ];
    observations.push(catMoments[Math.floor(Math.random() * catMoments.length)]);

    const musicMoments = [
      `Late Night Radio: ${Math.floor(Math.random() * 50) + 10} listeners.`,
      `Dog Sleeping Mix: ${Math.floor(Math.random() * 20) + 5} listeners.`,
      `The record player broke: ${Math.floor(Math.random() * 5)} times.`,
      `One visitor proved they were not a raccoon.`
    ];
    observations.push(musicMoments[Math.floor(Math.random() * musicMoments.length)]);

    const strangeObservations = [
      `Most visitors arrived at: 1:14 AM.`,
      `Longest visit: ${Math.floor(Math.random() * 40) + 20} minutes.`,
      `Shortest visit: 0.7 seconds.`,
      `Someone refreshed the page 14 times.`
    ];
    observations.push(strangeObservations[Math.floor(Math.random() * strangeObservations.length)]);

    // Rare Events
    const rand = Math.random();
    if (rand > 0.95) {
      observations.push("Two visitors arrived at exactly the same second.");
    } else if (rand > 0.90) {
      observations.push("The website got lonely.");
    } else if (rand > 0.85) {
      observations.push("Tonight was strange.");
    }

    // Deduplicate
    const uniqueObservations = [...new Set(observations)];

    // Last Visitor
    let lastStay = Math.floor(Math.random() * 30) + 1;
    let lastWanted = ['Something honest', 'Comfort', 'Something strange', 'To wait', 'Nothing'][Math.floor(Math.random() * 5)];
    let lastLeft = Math.floor(Math.random() * 15) + 1;

    const lastVisitor = {
      stayedFor: `${lastStay} minutes.`,
      wanted: lastWanted,
      left: `${lastLeft} minute${lastLeft > 1 ? 's' : ''} ago.`
    };

    const notes = [
      `We're thinking about the person who stayed for ${Math.floor(Math.random() * 20) + 30} minutes.`,
      "Tonight felt quieter.",
      "A lot of people wanted comfort.",
      "The cats seemed busy.",
      "Thanks for stopping by."
    ];
    const websiteNote = notes[Math.floor(Math.random() * notes.length)];

    return {
      observations: uniqueObservations,
      lastVisitor,
      websiteNote
    };
  }
};
