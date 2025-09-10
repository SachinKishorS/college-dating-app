import { createClient } from '@supabase/supabase-js'

// Use environment variables for production, fallback to hardcoded values for development
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://csfdyvzhtnddjwwwuzej.supabase.co'
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzZmR5dnpodG5kZGp3d3d1emVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MTY2NzUsImV4cCI6MjA3MzA5MjY3NX0.tmU8tU85sExCFTg1ddZ6Zw3eXpZUOv0dPoFx7MiEjwI'


export const supabase = createClient(supabaseUrl, supabaseKey)
