import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Phone, ShieldCheck, ArrowLeft, KeyRound } from 'lucide-react'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import AuthShell from './AuthShell'
import { useSession } from '../../lib/session'
import { generateOtp } from '../../lib/mockApi'
import { ROLE_HOME, ROLE_LABEL } from '../../app/roleConfig'
import { EASE_OUT_EXPO } from '../../lib/motion'

const COPY = {
  user: {
    headingKey: 'auth.user.heading',
    subKey: 'auth.user.sub',
    demoPhones: ['9700000001 (existing) or any new number'],
  },
  staff: {
    headingKey: 'auth.staff.heading',
    subKey: 'auth.staff.sub',
    demoPhones: ['9800000001', '9800000002', '9800000003'],
  },
  admin: {
    headingKey: 'auth.admin.heading',
    subKey: 'auth.admin.sub',
    demoPhones: ['9600000001'],
  },
  'super-admin': {
    headingKey: 'auth.superAdmin.heading',
    subKey: 'auth.superAdmin.sub',
    demoPhones: ['9500000001'],
  },
}

/** Two-step form: the panel slides sideways rather than swapping in place, so
 *  the direction of travel matches "next step" / "go back". */
const stepVariants = {
  enter: (dir) => ({ opacity: 0, x: dir * 32 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE_OUT_EXPO } },
  exit: (dir) => ({ opacity: 0, x: dir * -32, transition: { duration: 0.2 } }),
}

export default function LoginPage({ role }) {
  const { t } = useTranslation()
  const [step, setStep] = useState('phone')
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [otp, setOtp] = useState('')
  const [sentOtp, setSentOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const otpRef = useRef(null)

  const { loginUser, loginStaff, loginAdmin } = useSession()
  const navigate = useNavigate()
  const location = useLocation()
  const copy = COPY[role]

  // Reaching the OTP step with the cursor still in the phone field means the
  // user has to click before they can type the code they were just shown.
  useEffect(() => {
    if (step === 'otp') otpRef.current?.focus()
  }, [step])

  function handleSendOtp(e) {
    e.preventDefault()
    setError('')
    if (!/^\d{10}$/.test(phone)) {
      setError(t('auth.errors.invalidPhone'))
      return
    }
    const code = generateOtp()
    setSentOtp(code)
    setStep('otp')
  }

  async function handleVerifyOtp(e) {
    e.preventDefault()
    setError('')
    if (otp.length < 4) {
      setError(t('auth.errors.invalidOtp'))
      return
    }
    setLoading(true)
    let result
    if (role === 'user') {
      result = await loginUser(phone, name)
    } else if (role === 'staff') {
      result = await loginStaff(phone)
    } else {
      result = await loginAdmin(phone, role)
    }
    setLoading(false)

    if (!result.ok) {
      setError(result.message)
      return
    }
    const dest = location.state?.from?.pathname ?? ROLE_HOME[result.session.role]
    navigate(dest, { replace: true })
  }

  return (
    <AuthShell>
      <span className="eyebrow inline-flex items-center gap-2.5 text-brand-700">
        <span className="h-px w-7 bg-gradient-to-r from-brand-600 to-transparent" />
        {t(ROLE_LABEL[role])}
      </span>

      <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-slate-900">
        {t(copy.headingKey)}
      </h1>
      <p className="mt-2.5 text-sm leading-relaxed text-slate-500">{t(copy.subKey)}</p>

      {/* Step rail — two ticks that fill as the flow advances. */}
      <div className="mt-7 flex items-center gap-2">
        {['phone', 'otp'].map((s, i) => (
          <motion.span
            key={s}
            animate={{
              backgroundColor:
                step === s || (step === 'otp' && i === 0) ? '#dd222b' : 'rgba(255,255,255,0.09)',
              width: step === s ? 32 : 16,
            }}
            transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
            className="h-1 rounded-full"
          />
        ))}
        <span className="ml-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-brand-700">
          {step === 'phone' ? '01' : '02'} / 02
        </span>
      </div>

      <div className="relative mt-7 overflow-hidden">
        <AnimatePresence mode="wait" initial={false} custom={step === 'phone' ? -1 : 1}>
          {step === 'phone' ? (
            <motion.form
              key="phone"
              custom={-1}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              onSubmit={handleSendOtp}
              className="flex flex-col gap-5"
            >
              {role === 'user' && (
                <Input
                  label={t('auth.fullNameLabel')}
                  placeholder={t('auth.fullNamePlaceholder')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              )}
              <Input
                label={t('auth.mobileLabel')}
                placeholder={t('auth.mobilePlaceholder')}
                inputMode="numeric"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                error={error}
              />
              <Button type="submit" size="lg" className="mt-1 w-full">
                <Phone size={17} />
                {t('auth.sendOtp')}
              </Button>
            </motion.form>
          ) : (
            <motion.form
              key="otp"
              custom={1}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              onSubmit={handleVerifyOtp}
              className="flex flex-col gap-5"
            >
              <div className="flex items-start gap-3 rounded-2xl border border-brand-600/25 bg-brand-600/[0.08] px-4 py-3.5">
                <KeyRound size={15} className="mt-0.5 shrink-0 text-brand-700" />
                <p className="text-[13px] leading-relaxed text-slate-500">
                  {t('auth.demoOtpSentPrefix')}{' '}
                  <strong className="font-mono text-slate-800">{phone}</strong>:{' '}
                  <strong className="font-mono text-base tracking-[0.2em] text-brand-700">
                    {sentOtp}
                  </strong>
                </p>
              </div>
              <Input
                ref={otpRef}
                label={t('auth.enterOtpLabel')}
                placeholder={t('auth.otpPlaceholder')}
                inputMode="numeric"
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                error={error}
                className="text-center font-mono text-xl tracking-[0.5em]"
              />
              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                <ShieldCheck size={17} />
                {loading ? t('auth.verifying') : t('auth.verifyContinue')}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setError('')
                  setStep('phone')
                }}
                className="group flex cursor-pointer items-center justify-center gap-1.5 text-[13px] font-medium text-slate-500 transition-colors hover:text-brand-700"
              >
                <ArrowLeft
                  size={14}
                  className="transition-transform duration-300 group-hover:-translate-x-0.5"
                />
                {t('auth.changeNumber')}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {role === 'staff' && (
        <p className="mt-7 text-center text-sm text-slate-500">
          {t('caregiverRegister.notRegistered')}{' '}
          <Link to="/become-a-caregiver" className="font-semibold text-brand-700 hover:underline">
            {t('caregiverRegister.registerHere')}
          </Link>
        </p>
      )}

      {copy.demoPhones && role !== 'user' && (
        <p className="mt-7 rounded-xl border border-line bg-slate-900/[0.025] px-3.5 py-3 font-mono text-[11px] leading-relaxed text-slate-400">
          {copy.demoPhones.length > 1
            ? t('auth.demoNumbersPlural', {
                role: t(ROLE_LABEL[role]),
                numbers: copy.demoPhones.join(', '),
              })
            : t('auth.demoNumbersSingular', {
                role: t(ROLE_LABEL[role]),
                numbers: copy.demoPhones.join(', '),
              })}
        </p>
      )}
    </AuthShell>
  )
}
