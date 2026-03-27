'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'
import type { Profile, Child } from './database.types'

type AuthState = {
  user: User | null
  profile: Profile | null
  children: Child[]
  loading: boolean
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: string | null }>
  refreshChildren: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthState>({
  user: null,
  profile: null,
  children: [],
  loading: true,
  signUp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  signOut: async () => {},
  resetPassword: async () => ({ error: null }),
  refreshChildren: async () => {},
  refreshProfile: async () => {},
})

export function AuthProvider({ children: childrenProp }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [kids, setKids] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchProfile(userId: string) {
    if (!supabase) return
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (data) {
      setProfile(data as Profile)
      return
    }

    // Profile missing — auto-create from auth user metadata
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (authUser) {
      const { data: newProfile } = await supabase
        .from('profiles')
        .upsert({
          id: authUser.id,
          email: authUser.email || '',
          full_name: authUser.user_metadata?.full_name || '',
          phone: authUser.user_metadata?.phone || '',
        })
        .select()
        .single()
      if (newProfile) setProfile(newProfile as Profile)
    }
  }

  async function fetchChildren(userId: string) {
    if (!supabase) return
    const { data } = await supabase
      .from('children')
      .select('*')
      .eq('parent_id', userId)
      .order('created_at', { ascending: true })
    if (data) setKids(data as Child[])
  }

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    let initialised = false

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) {
        await Promise.all([fetchProfile(u.id), fetchChildren(u.id)])
      }
      initialised = true
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!initialised) return
      const u = session?.user ?? null
      setUser(u)
      if (u) {
        await Promise.all([fetchProfile(u.id), fetchChildren(u.id)])
      } else {
        setProfile(null)
        setKids([])
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signUp(email: string, password: string, fullName: string, phone: string) {
    if (!supabase) return { error: 'Supabase not configured' }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone },
      },
    })
    if (error) return { error: error.message }

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        email,
        full_name: fullName,
        phone,
      })
      if (profileError) return { error: `Account created but profile failed: ${profileError.message}` }
      await fetchProfile(data.user.id)
    }

    return { error: null }
  }

  async function signIn(email: string, password: string) {
    if (!supabase) return { error: 'Supabase not configured' }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return { error: null }
  }

  async function signOut() {
    if (!supabase) return
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setKids([])
  }

  async function resetPassword(email: string) {
    if (!supabase) return { error: 'Supabase not configured' }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    })
    if (error) return { error: error.message }
    return { error: null }
  }

  async function refreshChildren() {
    if (user) await fetchChildren(user.id)
  }

  async function refreshProfile() {
    if (user) await fetchProfile(user.id)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        children: kids,
        loading,
        signUp,
        signIn,
        signOut,
        resetPassword,
        refreshChildren,
        refreshProfile,
      }}
    >
      {childrenProp}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
