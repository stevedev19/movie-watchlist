'use client'

import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import SignupForm from './auth/SignupForm'

interface SignupModalProps {
  onClose: () => void
  onSwitchToLogin: () => void
}

export default function SignupModal({ onClose, onSwitchToLogin }: SignupModalProps) {
  const [successMessage, setSuccessMessage] = useState('')
  const { user } = useAuth()

  const handleSuccess = (userData: { id: string; name: string }) => {
    setSuccessMessage(`Welcome, ${userData.name}! Account created successfully.`)
    setTimeout(() => {
      onClose()
    }, 1500)
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="netflix-card rounded-lg p-8 max-w-md w-full netflix-glow"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Sign Up</h2>
          <button
            onClick={onClose}
            className="text-[#A3A3A3] hover:text-white transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        {successMessage && (
          <div className="mb-4 text-green-500 text-sm bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2">
            {successMessage}
          </div>
        )}

        <SignupForm onSuccess={handleSuccess} />

        <div className="mt-6 text-center">
          <p className="text-[#A3A3A3] text-sm">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-[#E50914] hover:underline font-semibold"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

