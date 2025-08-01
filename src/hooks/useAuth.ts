'use client'

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types'
// Modo demo removido - usando apenas dados reais

interface AuthState {
  user: User | null
  profile: Profile | null
  loading: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
  })

  useEffect(() => {
    // Obter usuário inicial
    const getInitialUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          setAuthState({
            user,
            profile: profile || null,
            loading: false,
          })
        } else {
          setAuthState({
            user: null,
            profile: null,
            loading: false,
          })
        }
      } catch (error) {
        console.error('Erro ao obter usuário:', error)
        setAuthState({
          user: null,
          profile: null,
          loading: false,
        })
      }
    }

    getInitialUser()

    // Escutar mudanças de autenticação
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()

            setAuthState({
              user: session.user,
              profile: profile || null,
              loading: false,
            })
          } else {
            setAuthState({
              user: null,
              profile: null,
              loading: false,
            })
          }
        }
      )

      return () => subscription.unsubscribe()
    } catch (error) {
      console.error('Erro ao configurar listener de auth:', error)
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!authState.user) return { error: new Error('Usuário não autenticado') }

    // Atualizar perfil no banco de dados

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', authState.user.id)
      .select()
      .single()

    if (!error && data) {
      setAuthState(prev => ({
        ...prev,
        profile: data,
      }))
    }

    return { data, error }
  }

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    updateProfile,
  }
}
