'use client'

import { useState, useEffect } from 'react'
import { getSupabase } from '@/lib/supabase'
import type { AdminMessagesLog } from '@/lib/database.types'

export default function MessagesPage() {
  const [messages, setMessages] = useState<AdminMessagesLog[]>([])
  const [messagesLoading, setMessagesLoading] = useState(true)
  const [channelFilter, setChannelFilter] = useState<'all' | 'email' | 'banner'>('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  useEffect(() => {
    const loadMessages = async () => {
      setMessagesLoading(true)
      try {
        const supabase = getSupabase()
        let query = supabase
          .from('admin_messages_log')
          .select('*')
          .order('sent_at', { ascending: false })

        if (channelFilter !== 'all') {
          query = query.eq('channel', channelFilter)
        }

        if (fromDate) {
          query = query.gte('sent_at', new Date(fromDate).toISOString())
        }

        if (toDate) {
          const endOfDay = new Date(toDate)
          endOfDay.setHours(23, 59, 59, 999)
          query = query.lte('sent_at', endOfDay.toISOString())
        }

        const { data, error } = await query

        if (error) throw new Error(error.message)
        setMessages((data || []) as AdminMessagesLog[])
      } catch (err) {
        console.error('Failed to load messages:', err)
        setMessages([])
      } finally {
        setMessagesLoading(false)
      }
    }

    loadMessages()
  }, [channelFilter, fromDate, toDate])

  const formatDeliveryStatus = (status: Record<string, unknown>) => {
    const entries = Object.entries(status || {})
    if (entries.length === 0) return 'Pending'
    return entries.map(([k]) => k.charAt(0).toUpperCase() + k.slice(1)).join(', ')
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-8 shadow-sm card-glow">
        <h2 className="font-heading text-xl font-bold">Messages Log</h2>
        <p className="mt-2 text-sm text-warm-gray">
          View all sent emails and banners with delivery status
        </p>

        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium">Channel</label>
              <select
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value as 'all' | 'email' | 'banner')}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
              >
                <option value="all">All channels</option>
                <option value="email">Email</option>
                <option value="banner">Banner</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">From date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">To date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
              />
            </div>
          </div>

          {messagesLoading ? (
            <div className="flex justify-center py-8">
              <div className="text-sm text-warm-gray">Loading messages...</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="text-sm text-warm-gray">No messages found</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left px-4 py-2 font-medium">Sent at</th>
                    <th className="text-left px-4 py-2 font-medium">Channel</th>
                    <th className="text-left px-4 py-2 font-medium">Subject</th>
                    <th className="text-left px-4 py-2 font-medium">Count</th>
                    <th className="text-left px-4 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((msg) => (
                    <tr key={msg.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-2">
                        {new Date(msg.sent_at).toLocaleDateString('en-GB', {
                          year: '2-digit',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-2">
                        <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                          msg.channel === 'email' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {msg.channel}
                        </span>
                      </td>
                      <td className="px-4 py-2 truncate max-w-xs">{msg.subject || 'N/A'}</td>
                      <td className="px-4 py-2">{msg.recipient_count || '—'}</td>
                      <td className="px-4 py-2 text-xs">
                        {formatDeliveryStatus(msg.delivery_status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
