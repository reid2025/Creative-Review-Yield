'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { doc, setDoc, getDoc } from 'firebase/firestore'

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, username: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      await updateProfile(user, {
        displayName: username
      })

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        username: username,
        createdAt: new Date().toISOString()
      })
    } catch (error: any) {
      console.error('Error signing up:', error)
      
      // Provide more helpful error messages
      if (error.code === 'auth/configuration-not-found') {
        throw new Error('Authentication is not enabled in Firebase. Please enable Email/Password authentication in your Firebase Console.')
      }
      
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 AuthContext: Attempting sign in for email:', email)
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      console.log('✅ AuthContext: Sign in successful, user:', userCredential.user.email)
      return userCredential
    } catch (error: any) {
      console.error('❌ AuthContext: Error signing in:', error.code, error.message)
      
      // Provide more helpful error messages
      if (error.code === 'auth/configuration-not-found') {
        throw new Error('Authentication is not enabled in Firebase. Please enable Email/Password authentication in your Firebase Console.')
      }
      
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Error logging out:', error)
      throw error
    }
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}