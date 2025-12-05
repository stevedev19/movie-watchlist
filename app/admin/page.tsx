'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { User } from '@/types/auth'

export default function AdminPage() {
  const router = useRouter()
  const { isAuthenticated, user, isAdmin } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/')
      return
    }

    if (!isAdmin) {
      router.push('/dashboard')
      return
    }

    fetchUsers()
  }, [isAuthenticated, isAdmin, router])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      } else {
        setError('Failed to fetch users')
      }
    } catch (err) {
      console.error('Error fetching users:', err)
      setError('Failed to fetch users')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-2xl font-bold text-white mb-2">Access Denied</h3>
          <p className="text-[#A3A3A3]">You need admin privileges to access this page.</p>
        </div>
      </div>
    )
  }

  const adminUsers = users.filter(u => u.role === 'admin')
  const regularUsers = users.filter(u => u.role !== 'admin')

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
              <span className="text-yellow-400">👑</span>
              Admin Panel
            </h1>
            <p className="text-[#A3A3A3]">Manage users and system settings</p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-[#181818] border border-[#262626] rounded-lg text-white text-sm font-medium hover:border-[#E50914] transition-colors"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="netflix-card rounded-lg p-6">
            <div className="text-2xl font-bold text-white mb-1">{users.length}</div>
            <div className="text-sm text-[#A3A3A3]">Total Users</div>
          </div>
          <div className="netflix-card rounded-lg p-6">
            <div className="text-2xl font-bold text-yellow-400 mb-1">{adminUsers.length}</div>
            <div className="text-sm text-[#A3A3A3]">Admin Users</div>
          </div>
          <div className="netflix-card rounded-lg p-6">
            <div className="text-2xl font-bold text-white mb-1">{regularUsers.length}</div>
            <div className="text-sm text-[#A3A3A3]">Regular Users</div>
          </div>
        </div>

        {/* Users List */}
        {isLoading ? (
          <div className="netflix-card rounded-lg p-12 text-center">
            <div className="text-6xl mb-4 animate-pulse">👑</div>
            <h3 className="text-2xl font-bold text-white mb-2">Loading users...</h3>
          </div>
        ) : error ? (
          <div className="netflix-card rounded-lg p-6">
            <div className="text-red-500">{error}</div>
          </div>
        ) : (
          <div className="netflix-card rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">All Users</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#262626]">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white">Role</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white">User ID</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-[#262626] hover:bg-[#181818] transition-colors">
                      <td className="py-3 px-4 text-sm text-white">
                        {u.role === 'admin' && <span className="text-yellow-400 mr-2">👑</span>}
                        {u.name}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          u.role === 'admin' 
                            ? 'bg-yellow-400/20 text-yellow-400' 
                            : 'bg-[#262626] text-[#A3A3A3]'
                        }`}>
                          {u.role || 'user'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-[#A3A3A3] font-mono text-xs">
                        {u.id}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

