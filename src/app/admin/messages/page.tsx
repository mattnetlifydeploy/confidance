'use client'

import { useState, useEffect } from 'react'
import { getSupabase } from '@/lib/supabase'
import type { AdminMessagesLog } from '@/lib/database.types'
import { AdminCard, AdminPageHeader, FilterSelect, EmptyState, AdminSpinner, StatusBadge } from '@/components/admin'

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
      <AdminCard>
        <AdminPageHeader
          title="Messages Log"
          description="View all sent emails and banners with delivery status"
        />

        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FilterSelect
              label="Channel"
              value={channelFilter}
              onChange={(e) => setChannelFilter(e as 'all' | 'email' | 'banner')}
              options={[
                { value: 'all', label: 'All channels' },
                { value: 'email', label: 'Email' },
                { value: 'banner', label: 'Banner' },
              ]}
            />
            <div>
              <label className="block text-sm font-medium text-charcoal">From date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="mt-2 w-full rounded-lg border border-charcoal/20 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal">To date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="mt-2 w-full rounded-lg border border-charcoal/20 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
              />
            </div>
          </div>

          {messagesLoading ? (
            <AdminSpinner />
          ) : messages.length === 0 ? (
            <EmptyState title="No messages found" description="Try adjusting your filters" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-charcoal/10">
                    <th className="text-left px-4 py-2 font-medium text-charcoal/80">Sent at</th>
                    <th className="text-left px-4 py-2 font-medium text-charcoal/80">Channel</th>
                    <th className="text-left px-4 py-2 font-medium text-charcoal/80">Subject</th>
                    <th className="text-left px-4 py-2 font-medium text-charcoal/80">Count</th>
                    <th className="text-left px-4 py-2 font-medium text-charcoal/80">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((msg) => (
                    <tr key={msg.id} className="border-b border-charcoal/5 hover:bg-cream/20">
                      <td className="px-4 py-2 text-charcoal/70">
                        {new Date(msg.sent_at).toLocaleDateString('en-GB', {
                          year: '2-digit',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-2">
                        <StatusBadge
                          label={msg.channel}
                          tone={msg.channel === 'email' ? 'teal' : 'info'}
                        />
                      </td>
                      <td className="px-4 py-2 truncate max-w-xs text-charcoal/70">{msg.subject || 'N/A'}</td>
                      <td className="px-4 py-2 text-charcoal/70">{msg.recipient_count || '-'}</td>
                      <td className="px-4 py-2 text-xs text-charcoal/60">
                        {formatDeliveryStatus(msg.delivery_status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </AdminCard>
    </div>
  )
}
