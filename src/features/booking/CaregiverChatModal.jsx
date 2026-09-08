import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Send } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import { getChatThread, sendChatMessage } from '../../lib/mockApi'

export default function CaregiverChatModal({ staff, userId, userName, open, onClose }) {
  const { t } = useTranslation()
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const listRef = useRef(null)

  useEffect(() => {
    if (open && staff) {
      setText('')
      setLoading(true)
      getChatThread(staff.id, userId).then((msgs) => {
        setMessages(msgs)
        setLoading(false)
      })
    }
  }, [open, staff?.id, userId])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  async function handleSend(e) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    setSending(true)
    const message = await sendChatMessage({ staffId: staff.id, userId, userName, from: 'user', text: trimmed })
    setMessages((m) => [...m, message])
    setText('')
    setSending(false)
  }

  if (!staff) return null

  return (
    <Modal open={open} onClose={onClose} title={t('booking.chatWithCaregiver', { name: staff.name })}>
      <div ref={listRef} className="flex max-h-80 min-h-[10rem] flex-col gap-2 overflow-y-auto pr-1">
        {loading ? (
          <p className="my-auto text-center text-sm text-slate-400">{t('booking.chatLoading')}</p>
        ) : messages.length === 0 ? (
          <p className="my-auto text-center text-sm text-slate-400">
            {t('booking.chatEmptyState', { name: staff.name.split(' ')[0] })}
          </p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                m.from === 'user' ? 'self-end bg-brand-600 text-white' : 'self-start bg-slate-900/[0.03] text-slate-700'
              }`}
            >
              {m.text}
            </div>
          ))
        )}
      </div>
      <form onSubmit={handleSend} className="mt-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('booking.chatPlaceholder')}
          className="h-11 flex-1 rounded-lg border border-line bg-surface text-slate-900 placeholder:text-slate-400/70 px-3.5 text-sm text-slate-800 outline-none transition-shadow focus:border-brand-600/70 focus:ring-4 focus:ring-brand-600/15"
        />
        <Button type="submit" size="sm" disabled={!text.trim() || sending} aria-label={t('booking.chatSend')}>
          <Send size={16} />
        </Button>
      </form>
      <p className="mt-2 text-center text-[11px] text-slate-400">{t('booking.chatDisclaimer')}</p>
    </Modal>
  )
}
