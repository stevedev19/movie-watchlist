'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { User } from '../types/auth'
import Header from '../components/Header'

interface ActivityLog {
  _id: string
  userId: string
  userName: string
  action: 'add' | 'update' | 'delete' | 'watch' | 'unwatch' | 'rate' | 'login' | 'signup' | 'admin_action'
  movieId?: string
  movieTitle?: string
  details?: string
  timestamp: string
  createdAt: string
}

export default function AdminPage() {
  const router = useRouter()
  const { isAuthenticated, isAdmin } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingLogs, setIsLoadingLogs] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'users' | 'activity'>('users')
  
  // Users tab filters
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all')

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
    fetchActivityLogs()
  }, [isAuthenticated, isAdmin, router])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/users', { credentials: 'include', cache: 'no-store' })
      const data = await response.json().catch(() => ({}))
      if (response.ok) {
        setUsers(data.users || [])
      } else {
        setError(data.error || 'Failed to fetch users')
      }
    } catch (err) {
      console.error('Error fetching users:', err)
      setError('Failed to fetch users')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchActivityLogs = async () => {
    try {
      setIsLoadingLogs(true)
      const response = await fetch('/api/activity?limit=100', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setActivityLogs(data.logs || [])
      } else {
        console.error('Failed to fetch activity logs')
      }
    } catch (err) {
      console.error('Error fetching activity logs:', err)
    } finally {
      setIsLoadingLogs(false)
    }
  }

  // Filtered users
  const filteredUsers = useMemo(() => {
    let filtered = users

    // Filter by search query
    if (userSearchQuery) {
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(userSearchQuery.toLowerCase())
      )
    }

    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter(u => u.role === roleFilter)
    }

    return filtered
  }, [users, userSearchQuery, roleFilter])

  // Stats
  const adminUsers = users.filter(u => u.role === 'admin')
  const regularUsers = users.filter(u => u.role !== 'admin' || !u.role)

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'add': return '➕'
      case 'update': return '✏️'
      case 'delete': return '🗑️'
      case 'watch': return '✅'
      case 'unwatch': return '👁️'
      case 'rate': return '⭐'
      case 'login': return '🔐'
      case 'signup': return '👤'
      case 'admin_action': return '👑'
      default: return '📝'
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'add': return 'text-green-400'
      case 'update': return 'text-blue-400'
      case 'delete': return 'text-red-400'
      case 'watch': return 'text-green-400'
      case 'unwatch': return 'text-yellow-400'
      case 'rate': return 'text-yellow-400'
      case 'login': return 'text-cyan-400'
      case 'signup': return 'text-purple-400'
      case 'admin_action': return 'text-yellow-400'
      default: return 'text-[#A3A3A3]'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatActivityDescription = (log: ActivityLog) => {
    const userName = log.userName
    const action = log.action
    const movieTitle = log.movieTitle

    switch (action) {
      case 'add':
        return `${userName} added "${movieTitle || 'a movie'}" to watchlist`
      case 'update':
        return `${userName} updated "${movieTitle || 'a movie'}"`
      case 'delete':
        return `${userName} deleted "${movieTitle || 'a movie'}"`
      case 'watch':
        return `${userName} marked "${movieTitle || 'a movie'}" as watched`
      case 'unwatch':
        return `${userName} marked "${movieTitle || 'a movie'}" as unwatched`
      case 'rate':
        return `${userName} rated "${movieTitle || 'a movie'}"`
      case 'login':
        return `${userName} logged in`
      case 'signup':
        return `${userName} signed up`
      case 'admin_action':
        return `${userName} performed an admin action`
      default:
        return log.details || `${userName} performed ${action}`
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

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      <Header
        searchQuery=""
        onSearchChange={() => {}}
        filterType="all"
        onFilterChange={() => {}}
        selectedGenre=""
        onGenreChange={() => {}}
        selectedYear=""
        onYearChange={() => {}}
        genres={[]}
        years={[]}
        hideAuth={true}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-2">
              <span>👑</span>
              <span>Admin Panel</span>
            </h1>
            <p className="text-[#A3A3A3] text-sm sm:text-base">
              Manage users, roles, and monitor activity across your watchlist app.
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 bg-transparent border border-[#262626] rounded-lg text-white text-sm font-medium hover:border-white/50 hover:bg-white/5 transition-all self-start sm:self-auto"
          >
            <span>←</span>
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#181818] border border-white/5 rounded-lg p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">👥</span>
              <div>
                <div className="text-2xl font-bold text-white">{users.length}</div>
                <div className="text-xs text-[#A3A3A3]">Total Users</div>
              </div>
            </div>
            <div className="text-xs text-[#A3A3A3] mt-2">+0 in last 24h</div>
          </div>
          
          <div className="bg-[#181818] border border-white/5 rounded-lg p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🛡️</span>
              <div>
                <div className="text-2xl font-bold text-yellow-400">{adminUsers.length}</div>
                <div className="text-xs text-[#A3A3A3]">Admin Users</div>
              </div>
            </div>
            <div className="text-xs text-[#A3A3A3] mt-2">+0 in last 24h</div>
          </div>
          
          <div className="bg-[#181818] border border-white/5 rounded-lg p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🎟️</span>
              <div>
                <div className="text-2xl font-bold text-white">{regularUsers.length}</div>
                <div className="text-xs text-[#A3A3A3]">Regular Users</div>
              </div>
            </div>
            <div className="text-xs text-[#A3A3A3] mt-2">+0 in last 24h</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-[#262626] overflow-x-auto">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-3 font-semibold text-sm sm:text-base transition-colors whitespace-nowrap ${
              activeTab === 'users'
                ? 'text-white border-b-2 border-[#E50914]'
                : 'text-[#A3A3A3] hover:text-white'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-4 py-3 font-semibold text-sm sm:text-base transition-colors whitespace-nowrap ${
              activeTab === 'activity'
                ? 'text-white border-b-2 border-[#E50914]'
                : 'text-[#A3A3A3] hover:text-white'
            }`}
          >
            Activity Logs
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-[#181818] border border-[#262626] rounded-lg overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 sm:p-6 border-b border-[#262626]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-xl font-bold text-white">All Users</h2>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="px-3 py-2 bg-[#0F0F0F] border border-[#262626] rounded-lg text-white text-sm placeholder-[#A3A3A3] focus:outline-none focus:border-[#E50914] transition-colors"
                  />
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value as 'all' | 'admin' | 'user')}
                    className="px-3 py-2 bg-[#0F0F0F] border border-[#262626] rounded-lg text-white text-sm focus:outline-none focus:border-[#E50914] transition-colors"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4 animate-pulse">👑</div>
                <h3 className="text-xl font-bold text-white mb-2">Loading users...</h3>
              </div>
            ) : error ? (
              <div className="p-6">
                <div className="text-red-400">{error}</div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-lg font-semibold text-white mb-2">No users found</h3>
                <p className="text-[#A3A3A3] text-sm">
                  {userSearchQuery || roleFilter !== 'all'
                    ? 'Try adjusting your search or filter'
                    : 'No users yet — users will appear here once they sign up.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#262626] bg-[#0F0F0F]/50">
                      <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-white">Name</th>
                      <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-white">Role</th>
                      <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-white">User ID</th>
                      <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-white">Last Login</th>
                      <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u, index) => (
                      <tr 
                        key={u.id} 
                        className={`border-b border-[#262626] transition-colors ${
                          index % 2 === 0 ? 'bg-[#181818]' : 'bg-[#1a1a1a]'
                        } hover:bg-[#222222]`}
                      >
                        <td className="py-3 px-4 text-sm text-white font-medium">
                          {u.name}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
                            u.role === 'admin' 
                              ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30' 
                              : 'bg-[#262626] text-[#A3A3A3] border border-[#262626]'
                          }`}>
                            {u.role === 'admin' && <span>👑</span>}
                            <span className="capitalize">{u.role || 'user'}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-[#A3A3A3] font-mono text-xs">
                          {u.id.substring(0, 8)}...
                        </td>
                        <td className="py-3 px-4 text-sm text-[#A3A3A3]">
                          <span className="text-xs">—</span>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <div className="flex gap-2">
                            <button
                              className="px-2 py-1 text-xs bg-[#0F0F0F] border border-[#262626] rounded text-[#A3A3A3] hover:text-white hover:border-[#E50914] transition-colors"
                              onClick={() => {
                                // Placeholder for promote/demote logic
                                alert('Promote/Demote functionality coming soon')
                              }}
                            >
                              {u.role === 'admin' ? 'Demote' : 'Promote'}
                            </button>
                            <button
                              className="px-2 py-1 text-xs bg-[#0F0F0F] border border-[#262626] rounded text-red-400 hover:border-red-400 transition-colors"
                              onClick={() => {
                                // Placeholder for disable logic
                                alert('Disable functionality coming soon')
                              }}
                            >
                              Disable
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Activity Logs Tab */}
        {activeTab === 'activity' && (
          <div className="bg-[#181818] border border-[#262626] rounded-lg overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-[#262626] flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Activity Logs</h2>
              <button
                onClick={fetchActivityLogs}
                className="px-3 py-1.5 bg-[#0F0F0F] border border-[#262626] rounded-lg text-white text-sm font-medium hover:border-[#E50914] transition-colors"
              >
                🔄 Refresh
              </button>
            </div>

            {isLoadingLogs ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4 animate-pulse">📊</div>
                <h3 className="text-xl font-bold text-white mb-2">Loading activity logs...</h3>
              </div>
            ) : activityLogs.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-lg font-semibold text-white mb-2">No activity yet</h3>
                <p className="text-[#A3A3A3] text-sm">
                  User actions will appear here.
                </p>
              </div>
            ) : (
              <div className="p-4 sm:p-6">
                <div className="space-y-4">
                  {activityLogs.map((log, index) => (
                    <div
                      key={log._id}
                      className="flex gap-4 pb-4 border-b border-[#262626] last:border-0 last:pb-0"
                    >
                      {/* Timeline indicator */}
                      <div className="flex flex-col items-center">
                        <div className={`w-2 h-2 rounded-full ${getActionColor(log.action).replace('text-', 'bg-')} opacity-60`}></div>
                        {index < activityLogs.length - 1 && (
                          <div className="w-px h-full bg-[#262626] mt-2"></div>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-semibold ${getActionColor(log.action)}`}>
                              {getActionIcon(log.action)}
                            </span>
                            <span className="text-sm text-white font-medium">{log.userName}</span>
                          </div>
                          <span className="text-xs text-[#A3A3A3] font-mono">
                            {formatDate(log.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-[#A3A3A3]">
                          {formatActivityDescription(log)}
                        </p>
                        {log.details && (
                          <p className="text-xs text-[#666] mt-1 italic">
                            {log.details}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
