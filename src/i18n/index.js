import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import hi from './locales/hi.json'
import bn from './locales/bn.json'
import ta from './locales/ta.json'
import te from './locales/te.json'
import ml from './locales/ml.json'
import mr from './locales/mr.json'

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'ml', label: 'മലയാളം' },
  { code: 'mr', label: 'मराठी' },
]

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    bn: { translation: bn },
    ta: { translation: ta },
    te: { translation: te },
    ml: { translation: ml },
    mr: { translation: mr },
  },
  lng: localStorage.getItem('bmc:lang') || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('bmc:lang', lng)
})

export default i18n
