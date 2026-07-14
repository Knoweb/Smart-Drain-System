/**
 * AuthContext — src/contexts/AuthContext.tsx
 * ---------------------------------------------------------------------------
 * Provides Firebase Authentication state to the entire React tree.
 * Replaces the previous Supabase auth context.
 */

import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  User,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth } from '../lib/firebase'
import { ADMIN_EMAILS } from '../config/constants'

interface AuthContextType {
  user: User | null
  isAdmin: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  isLoading: true,
})

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser]         = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Firebase listener fires immediately with the current auth state,
    // then again on every login / logout / token-refresh event.
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const isAdmin = user?.email ? ADMIN_EMAILS.includes(user.email.toLowerCase()) : false

  return (
    <AuthContext.Provider value={{ user, isAdmin, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
