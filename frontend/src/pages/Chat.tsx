import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Send, Hash, Users, MessageSquare } from 'lucide-react'
import { supabase, type Channel, type Message } from '@/lib/supabase'
import { cn } from '@/lib/utils'

const COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-purple-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-indigo-500',
  'bg-teal-500',
]

function getAvatarColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return COLORS[Math.abs(hash) % COLORS.length]
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDateSeparator(dateStr: string, lang: string) {
  const d = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (d.toDateString() === today.toDateString()) {
    return lang === 'fr' ? "Aujourd'hui" : 'Today'
  }
  if (d.toDateString() === yesterday.toDateString()) {
    return lang === 'fr' ? 'Hier' : 'Yesterday'
  }
  return d.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', {
    day: 'numeric',
    month: 'long',
  })
}

export function Chat() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language

  const [channels, setChannels] = useState<Channel[]>([])
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [authorName, setAuthorName] = useState(() => {
    return localStorage.getItem('deckreview_author') || ''
  })
  const [showNamePrompt, setShowNamePrompt] = useState(!authorName)
  const [nameInput, setNameInput] = useState(authorName)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Load channels
  useEffect(() => {
    async function loadChannels() {
      const { data } = await supabase
        .from('channels')
        .select('*')
        .order('created_at')
      if (data) {
        setChannels(data)
        if (data.length > 0 && !activeChannel) {
          setActiveChannel(data[0])
        }
      }
    }
    loadChannels()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Load messages when channel changes
  useEffect(() => {
    if (!activeChannel) return

    async function loadMessages() {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('channel_id', activeChannel!.id)
        .order('created_at')
      if (data) {
        setMessages(data)
        setTimeout(scrollToBottom, 100)
      }
    }
    loadMessages()

    // Real-time subscription
    const subscription = supabase
      .channel(`messages:${activeChannel.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${activeChannel.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
          setTimeout(scrollToBottom, 100)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [activeChannel, scrollToBottom])

  const handleSend = async () => {
    if (!newMessage.trim() || !activeChannel || !authorName) return

    const content = newMessage.trim()
    setNewMessage('')

    await supabase.from('messages').insert({
      channel_id: activeChannel.id,
      author_name: authorName,
      content,
    })

    inputRef.current?.focus()
  }

  const handleSetName = () => {
    if (!nameInput.trim()) return
    const name = nameInput.trim()
    setAuthorName(name)
    localStorage.setItem('deckreview_author', name)
    setShowNamePrompt(false)
  }

  // Name prompt modal
  if (showNamePrompt) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-8 max-w-sm w-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-[#003B80] rounded-lg">
              <MessageSquare size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-[#003B80]">{t('chat.welcomeTitle')}</h2>
              <p className="text-sm text-gray-500">{t('chat.welcomeDesc')}</p>
            </div>
          </div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('chat.yourName')}
          </label>
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSetName()}
            placeholder={lang === 'fr' ? 'Ex : Marie Dupont' : 'E.g., John Smith'}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#009EE0] focus:border-transparent"
            autoFocus
          />
          <button
            onClick={handleSetName}
            disabled={!nameInput.trim()}
            className="mt-4 w-full bg-[#009EE0] text-white py-2.5 rounded-lg font-medium text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            {t('chat.join')}
          </button>
        </div>
      </div>
    )
  }

  // Group messages by date
  const groupedMessages: { date: string; messages: Message[] }[] = []
  for (const msg of messages) {
    const dateKey = new Date(msg.created_at).toDateString()
    const last = groupedMessages[groupedMessages.length - 1]
    if (last && last.date === dateKey) {
      last.messages.push(msg)
    } else {
      groupedMessages.push({ date: dateKey, messages: [msg] })
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] -mt-2">
      {/* Channel sidebar */}
      <div className="w-64 shrink-0 bg-white border-r border-gray-200 flex flex-col rounded-l-xl">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-[#003B80] flex items-center gap-2">
            <MessageSquare size={18} />
            {t('chat.title')}
          </h2>
        </div>

        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {channels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => setActiveChannel(channel)}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors cursor-pointer',
                activeChannel?.id === channel.id
                  ? 'bg-blue-50 text-[#009EE0] font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              <Hash size={15} className="shrink-0" />
              <span className="truncate">{channel.name}</span>
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-2 px-2">
            <div
              className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold',
                getAvatarColor(authorName)
              )}
            >
              {getInitials(authorName)}
            </div>
            <span className="text-sm font-medium text-[#003B80] truncate">
              {authorName}
            </span>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-white rounded-r-xl">
        {/* Channel header */}
        {activeChannel && (
          <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-[#003B80] flex items-center gap-2">
                <Hash size={16} />
                {activeChannel.name}
              </h3>
              {activeChannel.description && (
                <p className="text-xs text-gray-500 mt-0.5">{activeChannel.description}</p>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Users size={13} />
              {t('chat.openToAll')}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <MessageSquare size={40} className="mb-3" />
              <p className="text-sm">{t('chat.noMessages')}</p>
            </div>
          )}

          {groupedMessages.map((group) => (
            <div key={group.date}>
              {/* Date separator */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400 font-medium">
                  {formatDateSeparator(group.messages[0].created_at, lang)}
                </span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {group.messages.map((msg, i) => {
                const prev = i > 0 ? group.messages[i - 1] : null
                const sameAuthor = prev?.author_name === msg.author_name
                const timeDiff = prev
                  ? (new Date(msg.created_at).getTime() - new Date(prev.created_at).getTime()) / 60000
                  : Infinity
                const compact = sameAuthor && timeDiff < 5

                return (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex gap-3 hover:bg-gray-50 px-2 py-0.5 rounded-md -mx-2',
                      compact ? '' : 'mt-3'
                    )}
                  >
                    {compact ? (
                      <div className="w-8 shrink-0" />
                    ) : (
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5',
                          getAvatarColor(msg.author_name)
                        )}
                      >
                        {getInitials(msg.author_name)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      {!compact && (
                        <div className="flex items-baseline gap-2">
                          <span className="font-semibold text-sm text-[#003B80]">
                            {msg.author_name}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatTime(msg.created_at)}
                          </span>
                        </div>
                      )}
                      <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {activeChannel && (
          <div className="px-6 py-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder={
                  lang === 'fr'
                    ? `Message dans #${activeChannel.name}...`
                    : `Message in #${activeChannel.name}...`
                }
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#009EE0] focus:border-transparent"
                autoFocus
              />
              <button
                onClick={handleSend}
                disabled={!newMessage.trim()}
                className="p-2.5 bg-[#009EE0] text-white rounded-lg hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
