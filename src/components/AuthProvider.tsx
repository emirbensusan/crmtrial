import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { Logger } from '../utils/logging'
import { FormRateLimiter } from '../utils/inputSecurity'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any }>
  updatePassword: (password: string) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Rate limiting for auth attempts
  const loginRateLimiter = new FormRateLimiter(5, 15 * 60 * 1000) // 5 attempts per 15 minutes
  const signupRateLimiter = new FormRateLimiter(3, 60 * 60 * 1000) // 3 attempts per hour
  const logger = Logger.getInstance()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      
      // Log auth events
      if (_event === 'SIGNED_IN') {
        logger.logUserAction('sign_in', 'auth', { userId: session?.user?.id })
      } else if (_event === 'SIGNED_OUT') {
        logger.logUserAction('sign_out', 'auth')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    // Rate limiting check
    const rateLimitCheck = loginRateLimiter.canSubmit(email)
    if (!rateLimitCheck.allowed) {
      const remainingMinutes = Math.ceil((rateLimitCheck.remainingTime || 0) / 60000)
      return { 
        error: { 
          message: `Too many login attempts. Please try again in ${remainingMinutes} minutes.` 
        } 
      }
    }

    logger.info('Login attempt', { email: email.replace(/(.{2}).*(@.*)/, '$1***$2') })
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      logger.warn('Login failed', { 
        email: email.replace(/(.{2}).*(@.*)/, '$1***$2'),
        error: error.message 
      })
    } else {
      logger.info('Login successful', { 
        email: email.replace(/(.{2}).*(@.*)/, '$1***$2') 
      })
    }
    
    return { error }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    // Rate limiting check
    const rateLimitCheck = signupRateLimiter.canSubmit(email)
    if (!rateLimitCheck.allowed) {
      const remainingMinutes = Math.ceil((rateLimitCheck.remainingTime || 0) / 60000)
      return { 
        error: { 
          message: `Too many signup attempts. Please try again in ${remainingMinutes} minutes.` 
        } 
      }
    }

    logger.info('Signup attempt', { email: email.replace(/(.{2}).*(@.*)/, '$1***$2') })
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: undefined, // Disable email confirmation
      },
    })
    
    if (error) {
      logger.warn('Signup failed', { 
        email: email.replace(/(.{2}).*(@.*)/, '$1***$2'),
        error: error.message 
      })
    } else {
      logger.info('Signup successful', { 
        email: email.replace(/(.{2}).*(@.*)/, '$1***$2'),
        userId: data.user?.id 
      })
    }
    
    return { error }
  }

  const signOut = async () => {
    logger.info('Signout initiated', { userId: user?.id })
    await supabase.auth.signOut()
  }

  const resetPassword = async (email: string) => {
    logger.info('Password reset requested', { email: email.replace(/(.{2}).*(@.*)/, '$1***$2') })
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    
    if (error) {
      logger.warn('Password reset failed', { 
        email: email.replace(/(.{2}).*(@.*)/, '$1***$2'),
        error: error.message 
      })
    }
    
    return { error }
  }

  const updatePassword = async (password: string) => {
    logger.info('Password update initiated', { userId: user?.id })
    
    const { error } = await supabase.auth.updateUser({
      password: password
    })
    
    if (error) {
      logger.warn('Password update failed', { 
        userId: user?.id,
        error: error.message 
      })
    } else {
      logger.info('Password updated successfully', { userId: user?.id })
    }
    
    return { error }
  }
  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}