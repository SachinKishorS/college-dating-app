import { useEffect, useRef, useState } from 'react'
import { supabase, db } from '../supabaseClient'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [profileComplete, setProfileComplete] = useState(false)
  const initializedRef = useRef(false)

  useEffect(() => {
    let isMounted = true

    const evaluateProfile = async (theUser) => {
      if (!theUser) {
        if (isMounted) setProfileComplete(false)
        return
      }
      const { data: profile } = await db.getProfile(theUser.id)
      if (isMounted) {
        const isComplete = Boolean(
          profile && profile.name && profile.age && profile.photo_url_1 && profile.photo_url_2
        )
        setProfileComplete(isComplete)
      }
    }

    const init = async () => {
      if (initializedRef.current) return
      initializedRef.current = true
      const { data: { session } } = await supabase.auth.getSession()
      const currentUser = session?.user ?? null
      if (isMounted) setUser(currentUser)
      await evaluateProfile(currentUser)
      if (isMounted) setIsLoading(false)
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const nextUser = session?.user ?? null
        if (isMounted) setUser(nextUser)
        await evaluateProfile(nextUser)
        if (isMounted) setIsLoading(false)
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  return { user, isLoading, profileComplete }
}


