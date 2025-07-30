// context/AuthModalContext.tsx
"use client"

import { createContext, useContext, useState, ReactNode } from "react"

type AuthModalContextType = {
  isOpen: boolean
  openModal: () => void
  closeModal: () => void
}

export const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined)

export const AuthModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false)

  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)

  return (
    <AuthModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
    </AuthModalContext.Provider>
  )
}

export const useAuthModal = () => {
  const context = useContext(AuthModalContext)
  if (!context) {
    throw new Error("useAuthModal must be used within an AuthModalProvider")
  }
  return context
}
