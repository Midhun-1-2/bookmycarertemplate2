import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { MessageCircle, X, ArrowUp, Headset } from 'lucide-react'
import { cn } from '../../lib/cn'
import { EASE_OUT_EXPO, SPRING_SNAPPY } from '../../lib/motion'

const FAQS = [
  {
    id: 'pricing',
    keywords: ['price', 'pricing', 'cost', 'rate', 'charge'],
  },
  {
    id: 'services',
    keywords: ['service', 'services', 'offer', 'category', 'categories'],
  },
  {
    id: 'booking',
    keywords: ['book', 'booking', 'schedule', 'appointment'],
  },
  {
    id: 'payment',
    keywords: ['payment', 'pay', 'razorpay', 'upi'],
  },
  {
    id: 'cancel',
    keywords: ['cancel', 'refund'],
  },
  {
    id: 'caregiver',
    keywords: ['caregiver', 'staff', 'nurse', 'verified'],
  },
]

export default function ChatbotWidget({ raised = false }) {
  const { t } = useTranslation()

  const faqAnswers = {
    pricing: t('chatbot.faqPricing'),
    services: t('chatbot.faqServices'),
    booking: t('chatbot.faqBooking'),
    payment: t('chatbot.faqPayment'),
    cancel: t('chatbot.faqCancel'),
    caregiver: t('chatbot.faqCaregiver'),
  }

  function findAnswer(message) {
    const lower = message.toLowerCase()
    const match = FAQS.find((faq) => faq.keywords.some((k) => lower.includes(k)))
    return match ? faqAnswers[match.id] : undefined
  }

  const GREETING = {
    role: 'bot',
    text: t('chatbot.greeting', { brand: 'Book My Carer' }),
  }

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([GREETING])
  const [input, setInput] = useState('')
  const [escalated, setEscalated] = useState(false)
  const scrollRef = useRef(null)

  // Without this the newest reply lands below the fold of the panel and the
  // conversation looks like it stopped responding.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, open])

  function handleSend(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text) return
    const userMsg = { role: 'user', text }
    const answer = findAnswer(text)
    const botMsg = {
      role: 'bot',
      text: answer ?? t('chatbot.fallbackAnswer'),
    }
    setMessages((m) => [...m, userMsg, botMsg])
    setInput('')
  }

  function handleEscalate() {
    setEscalated(true)
    setMessages((m) => [...m, { role: 'bot', text: t('chatbot.escalationMessage') }])
  }

  return (
    <>
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        transition={SPRING_SNAPPY}
        className={cn(
          'fixed right-5 z-40 flex h-14 w-14 cursor-pointer items-center justify-center rounded-2xl bg-brand-600 text-white ember-glow',
          raised ? 'bottom-28 lg:bottom-5' : 'bottom-5'
        )}
        aria-label={t('chatbot.openChatAriaLabel')}
      >
        {/* Idle attention ring — only while closed, so it never competes with an
            open conversation. */}
        {!open && (
          <span
            aria-hidden
            className="absolute inset-0 animate-pulse-ring rounded-2xl border border-brand-500"
          />
        )}
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? 'close' : 'open'}
            initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.22, ease: EASE_OUT_EXPO }}
          >
            {open ? <X size={21} /> : <MessageCircle size={21} />}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96, transition: { duration: 0.16 } }}
            transition={SPRING_SNAPPY}
            style={{ transformOrigin: 'bottom right' }}
            className={cn(
              'glass fixed right-5 z-40 flex h-[30rem] max-h-[72vh] w-[23rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-3xl',
              raised ? 'bottom-[11.5rem] lg:bottom-24' : 'bottom-24'
            )}
          >
            <div className="relative flex items-center gap-3 border-b border-line px-4 py-3.5">
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/70 to-transparent"
              />
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-600/30 bg-brand-600/12 text-brand-700">
                <MessageCircle size={16} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold tracking-tight text-slate-900">
                  {t('chatbot.supportTitle', { brand: 'Book My Carer' })}
                </p>
                <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#2fc98f]" />
                  {t('chatbot.repliesInstantly')}
                </p>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
                  className={cn(
                    'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed',
                    m.role === 'bot'
                      ? 'rounded-bl-md border border-line bg-slate-900/[0.035] text-slate-700'
                      : 'ml-auto rounded-br-md bg-brand-600 text-white'
                  )}
                >
                  {m.text}
                </motion.div>
              ))}
              {!escalated && (
                <button
                  onClick={handleEscalate}
                  className="flex cursor-pointer items-center gap-1.5 rounded-full border border-line bg-slate-900/[0.025] px-3 py-1.5 text-[11px] font-semibold text-brand-700 transition-colors hover:border-brand-600/45"
                >
                  <Headset size={12} />
                  {t('chatbot.talkToHuman')}
                </button>
              )}
            </div>

            <form
              onSubmit={handleSend}
              className="flex items-center gap-2 border-t border-line p-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('chatbot.inputPlaceholder')}
                className="h-10 flex-1 rounded-full border border-line bg-surface px-4 text-[13px] text-slate-900 placeholder:text-slate-400/70 outline-none transition-colors focus:border-brand-600/60"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.07 }}
                whileTap={{ scale: 0.92 }}
                transition={SPRING_SNAPPY}
                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-brand-600 text-white"
                aria-label={t('chatbot.sendAriaLabel')}
              >
                <ArrowUp size={16} />
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
