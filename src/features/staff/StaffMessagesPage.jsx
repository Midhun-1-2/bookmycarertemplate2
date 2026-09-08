import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'
import { getStaffChatThreads } from '../../lib/mockApi'
import { useSession } from '../../lib/session'
import Card from '../../components/ui/Card'
import PageHeader from '../../components/dashboard/PageHeader'

export default function StaffMessagesPage() {
  const { t } = useTranslation()
  const { session } = useSession()
  const [threads, setThreads] = useState(null)

  useEffect(() => {
    async function load() {
      setThreads(await getStaffChatThreads(session.id))
    }
    load()
  }, [session.id])

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={t('staffMessages.title')} subtitle={t('staffMessages.subtitle')} />

      {threads === null ? (
        <p className="mt-6 text-sm text-slate-400">{t('staffMessages.loading')}</p>
      ) : threads.length === 0 ? (
        <Card className="mt-6 text-center text-sm text-slate-500">{t('staffMessages.empty')}</Card>
      ) : (
        <div className="mt-6 space-y-3">
          {threads.map((thread) => (
            <Link key={thread.userId} to={`/staff/messages/${thread.userId}`}>
              <Card className="flex items-center justify-between gap-3 transition-[border-color,transform] duration-400 hover:-translate-y-0.5 hover:border-brand-600/45">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600/12 font-semibold text-brand-700">
                    {thread.userName?.split(' ').map((n) => n[0]).join('') || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{thread.userName || t('staffMessages.careSeeker')}</p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">{thread.lastMessage?.text}</p>
                  </div>
                </div>
                <ArrowRight size={16} className="shrink-0 text-slate-400 transition-colors group-hover:text-brand-700" />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
