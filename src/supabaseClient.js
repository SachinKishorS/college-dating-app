import { createClient } from '@supabase/supabase-js'

// Use environment variables for production, fallback to hardcoded values for development
const supabaseUrl =
  process.env.REACT_APP_SUPABASE_URL ||
  'https://csfdyvzhtnddjwwwuzej.supabase.co'

const supabaseKey =
  process.env.REACT_APP_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzZmR5dnpodG5kZGp3d3d1emVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MTY2NzUsImV4cCI6MjA3MzA5MjY3NX0.tmU8tU85sExCFTg1ddZ6Zw3eXpZUOv0dPoFx7MiEjwI'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    flowType: 'pkce',
    redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
  },
})

// Database helper functions
export const db = {
  // Profile functions
  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  async updateProfile(userId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    return { data, error }
  },

  // Get profiles to swipe (excluding already swiped and self)
  async getProfilesToSwipe(userId) {
    const { data: swiped } = await supabase
      .from('swipes')
      .select('swiped_id')
      .eq('swiper_id', userId)

    const swipedIdsList = (swiped?.map(s => s.swiped_id) || []).concat(userId)
    const ids = swipedIdsList.map(id => `"${id}"`).join(',')

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .not('id', 'in', `(${ids})`)
      .limit(10)

    return { data, error }
  },

  // Swipe functions
  async createSwipe(swiperId, swipedId, direction) {
    const { data, error } = await supabase
      .from('swipes')
      .insert({
        swiper_id: swiperId,
        swiped_id: swipedId,
        direction,
      })
      .select()
      .single()
    return { data, error }
  },

  // Match functions
  async getMatches(userId) {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        user1:profiles!matches_user1_id_fkey(*),
        user2:profiles!matches_user2_id_fkey(*)
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order('created_at', { ascending: false })

    return { data, error }
  },

  // Message functions
  async getMessages(matchId) {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(*)
      `)
      .eq('match_id', matchId)
      .order('created_at', { ascending: true })

    return { data, error }
  },

  async sendMessage(matchId, senderId, messageText) {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        match_id: matchId,
        sender_id: senderId,
        message_text: messageText,
      })
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(*)
      `)
      .single()

    return { data, error }
  },

  // Subscribe to new messages
  subscribeToMessages(matchId, callback) {
    return supabase
      .channel(`messages:${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`,
        },
        callback
      )
      .subscribe()
  },
}
