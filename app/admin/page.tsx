'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Check, Clock, Crown, FileText, Lock, LogIn, LucideIcon, Pencil, Plus, RefreshCw, Search, Star, Trash2, UserPlus,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { User } from '../types/auth'
import ShelfNav from '../components/shelf/ShelfNav'
import { stubMask } from '../components/shelf/ShelfTabs'
import { fill, formatDateTime, formatNumber } from '../components/shelf/shelfUtils'
import { bodyFont, displayFont, editorialFont } from '../fonts'

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
  const { isAuthenticated, isAdmin, isLoading: isAuthLoading } = useAuth()
  const { t, language } = useLanguage()
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
    // Wait for the session check, or a reload would bounce admins to the home page
    if (isAuthLoading) return

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
  }, [isAuthLoading, isAuthenticated, isAdmin, router])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/users', { credentials: 'include', cache: 'no-store' })
      const data = await response.json().catch(() => ({}))
      if (response.ok) {
        setUsers(data.users || [])
      } else {
        setError(data.error || t.admin.fetchUsersError)
      }
    } catch (err) {
      console.error('Error fetching users:', err)
      setError(t.admin.fetchUsersError)
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

  const actionIcons: Record<ActivityLog['action'], LucideIcon> = {
    add: Plus,
    update: Pencil,
    delete: Trash2,
    watch: Check,
    unwatch: Clock,
    rate: Star,
    login: LogIn,
    signup: UserPlus,
    admin_action: Crown,
  }

  const actionTemplates: Record<ActivityLog['action'], string> = {
    add: t.admin.actAdd,
    update: t.admin.actUpdate,
    delete: t.admin.actDelete,
    watch: t.admin.actWatch,
    unwatch: t.admin.actUnwatch,
    rate: t.admin.actRate,
    login: t.admin.actLogin,
    signup: t.admin.actSignup,
    admin_action: t.admin.actAdmin,
  }

  const formatActivityDescription = (log: ActivityLog) => {
    const template = actionTemplates[log.action]
    if (!template) return log.details || fill(t.admin.actOther, { user: log.userName, action: log.action })
    return fill(template, { user: log.userName, title: log.movieTitle || t.admin.aMovie })
  }

  if (isAuthLoading) {
    return <div className="min-h-screen bg-[#0e0c0b]" />
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className={`${bodyFont.className} min-h-screen bg-[#0e0c0b] flex items-center justify-center px-4`}>
        <div className="text-center">
          <Lock size={28} className="mx-auto text-[#f2ebdd]/40" />
          <h1 className={`${displayFont.className} mt-4 text-3xl uppercase text-[#f2ebdd]`}>{t.admin.accessDenied}</h1>
          <p className={`${editorialFont.className} mt-2 text-lg text-[#f2ebdd]/70`}>{t.admin.accessDeniedMessage}</p>
        </div>
      </div>
    )
  }

  const panel = 'rounded-md border border-[#f2ebdd]/10 bg-[#151210] overflow-hidden'
  const tabs = [
    { key: 'users' as const, label: t.admin.users, count: users.length },
    { key: 'activity' as const, label: t.admin.activityLogs, count: activityLogs.length },
  ]
  const statsLine = [
    fill(t.admin.statsUsers, { n: formatNumber(users.length, language) }),
    fill(t.admin.statsAdmins, { n: formatNumber(adminUsers.length, language) }),
    fill(t.admin.statsRegular, { n: formatNumber(regularUsers.length, language) }),
  ].join(' · ')

  return (
    <div className={`${bodyFont.className} min-h-screen bg-[#0e0c0b] text-[#f2ebdd] overflow-x-clip`}>
      <ShelfNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16 sm:pt-8">
        {/* Header */}
        <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className={`${displayFont.className} text-3xl uppercase leading-tight sm:text-4xl`}>{t.admin.title}</h1>
            <p className="mt-1 text-sm text-[#f2ebdd]/55">{isLoading ? '\u00a0' : statsLine}</p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 self-start text-sm text-[#f2ebdd]/70 underline-offset-4 transition-colors hover:text-[#f2ebdd] hover:underline sm:self-auto"
          >
            <ArrowLeft size={15} />
            {t.admin.backToDashboard}
          </Link>
        </section>

        {/* Tabs */}
        <div className="mb-5 flex flex-wrap items-center gap-3">
          {tabs.map(({ key, label, count }) => {
            const active = activeTab === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                aria-pressed={active}
                style={stubMask}
                className={`flex items-center gap-3 rounded-[3px] px-5 py-2.5 transition-colors sm:px-6 sm:py-3 ${
                  active ? 'bg-[#f2ebdd] text-[#1a1714]' : 'border border-[#f2ebdd]/30 text-[#f2ebdd] hover:border-[#f2ebdd]/60'
                }`}
              >
                <span className={`${displayFont.className} text-xl uppercase leading-none sm:text-2xl`}>{label}</span>
                <span className={`border-l border-dashed pl-3 font-mono text-sm ${active ? 'border-[#1a1714]/30' : 'border-[#f2ebdd]/30 text-[#f2ebdd]/70'}`}>
                  {formatNumber(count, language)}
                </span>
              </button>
            )
          })}
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className={panel}>
            <div className="flex flex-col gap-3 border-b border-[#f2ebdd]/10 p-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#f2ebdd]/60">{t.admin.allUsers}</h2>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative">
                  <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#f2ebdd]/40" />
                  <input
                    type="search"
                    placeholder={t.admin.searchByName}
                    aria-label={t.admin.searchByName}
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="h-9 w-full rounded-md border border-[#f2ebdd]/15 bg-[#0e0c0b] pl-9 pr-3 text-sm text-[#f2ebdd] placeholder-[#f2ebdd]/40 focus:border-[#f2ebdd]/50 focus:outline-none sm:w-56"
                  />
                </div>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as 'all' | 'admin' | 'user')}
                  aria-label={t.admin.role}
                  className="h-9 rounded-md border border-[#f2ebdd]/15 bg-[#0e0c0b] px-3 text-sm text-[#f2ebdd] focus:border-[#f2ebdd]/50 focus:outline-none"
                >
                  <option value="all">{t.admin.allRoles}</option>
                  <option value="admin">{t.admin.roleAdmin}</option>
                  <option value="user">{t.admin.roleUser}</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <p className={`${editorialFont.className} p-12 text-center text-lg text-[#f2ebdd]/70`} role="status">
                {t.admin.loadingUsers}
              </p>
            ) : error ? (
              <p className="p-6 text-sm text-[#f87171]">{error}</p>
            ) : filteredUsers.length === 0 ? (
              <div className="p-12 text-center">
                <p className={`${editorialFont.className} text-xl text-[#f2ebdd]/80`}>{t.admin.noUsers}</p>
                <p className="mt-2 text-sm text-[#f2ebdd]/55">
                  {userSearchQuery || roleFilter !== 'all' ? t.admin.noUsersFiltered : t.admin.noUsersMessage}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-sm">
                  <thead>
                    <tr className="border-b border-[#f2ebdd]/10 text-left font-mono text-[10px] uppercase tracking-[0.2em] text-[#f2ebdd]/50">
                      <th className="px-4 py-3 font-normal">{t.admin.name}</th>
                      <th className="px-4 py-3 font-normal">{t.admin.role}</th>
                      <th className="px-4 py-3 font-normal">{t.admin.userId}</th>
                      <th className="px-4 py-3 font-normal">{t.admin.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="border-b border-[#f2ebdd]/5 transition-colors last:border-0 hover:bg-[#f2ebdd]/[0.03]">
                        <td className="px-4 py-3 font-medium">{u.name}</td>
                        <td className="px-4 py-3">
                          {u.role === 'admin' ? (
                            <span className={`${displayFont.className} rounded-[2px] bg-[#f2ebdd] px-1.5 pb-px pt-0.5 text-[11px] uppercase tracking-[0.08em] text-[#1a1714]`}>
                              {t.admin.roleAdmin}
                            </span>
                          ) : (
                            <span className={`${displayFont.className} rounded-[2px] border border-[#f2ebdd]/30 px-1.5 pb-px pt-0.5 text-[11px] uppercase tracking-[0.08em] text-[#f2ebdd]/70`}>
                              {t.admin.roleUser}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-[#f2ebdd]/50">{u.id.substring(0, 8)}…</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              className="rounded-[3px] border border-[#f2ebdd]/20 px-2.5 py-1 text-xs text-[#f2ebdd]/80 transition-colors hover:border-[#f2ebdd]/50 hover:text-[#f2ebdd]"
                              onClick={() => alert(t.admin.comingSoon)}
                            >
                              {u.role === 'admin' ? t.admin.demote : t.admin.promote}
                            </button>
                            <button
                              type="button"
                              className="rounded-[3px] border border-[#dc2626]/40 px-2.5 py-1 text-xs text-[#f87171] transition-colors hover:bg-[#dc2626]/10"
                              onClick={() => alert(t.admin.comingSoon)}
                            >
                              {t.admin.disable}
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
          <div className={panel}>
            <div className="flex items-center justify-between border-b border-[#f2ebdd]/10 p-4">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#f2ebdd]/60">{t.admin.activityLogs}</h2>
              <button
                type="button"
                onClick={fetchActivityLogs}
                className="inline-flex items-center gap-1.5 rounded-md border border-[#f2ebdd]/15 px-3 py-1.5 text-sm text-[#f2ebdd]/80 transition-colors hover:border-[#f2ebdd]/50 hover:text-[#f2ebdd]"
              >
                <RefreshCw size={14} className={isLoadingLogs ? 'motion-safe:animate-spin' : ''} />
                {t.common.refresh}
              </button>
            </div>

            {isLoadingLogs ? (
              <p className={`${editorialFont.className} p-12 text-center text-lg text-[#f2ebdd]/70`} role="status">
                {t.admin.loadingActivity}
              </p>
            ) : activityLogs.length === 0 ? (
              <div className="p-12 text-center">
                <p className={`${editorialFont.className} text-xl text-[#f2ebdd]/80`}>{t.admin.noActivity}</p>
                <p className="mt-2 text-sm text-[#f2ebdd]/55">{t.admin.noActivityMessage}</p>
              </div>
            ) : (
              <ol className="divide-y divide-[#f2ebdd]/5">
                {activityLogs.map(log => {
                  const Icon = actionIcons[log.action] || FileText
                  return (
                    <li key={log._id} className="flex gap-3 px-4 py-3.5">
                      <span
                        className={`mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-full border ${
                          log.action === 'delete' ? 'border-[#dc2626]/40 text-[#f87171]' : 'border-[#f2ebdd]/15 text-[#f2ebdd]/70'
                        }`}
                      >
                        <Icon size={14} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                          <p className="min-w-0 text-sm text-[#f2ebdd]">{formatActivityDescription(log)}</p>
                          <time dateTime={log.timestamp} className="shrink-0 font-mono text-[11px] text-[#f2ebdd]/45">
                            {formatDateTime(log.timestamp, language)}
                          </time>
                        </div>
                        {log.details && (
                          <p className={`${editorialFont.className} mt-0.5 text-xs text-[#f2ebdd]/50`}>{log.details}</p>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ol>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
