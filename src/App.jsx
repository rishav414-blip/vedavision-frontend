import { useState, useEffect } from 'react'
import AuthPage, { getSession, saveSession, clearSession } from './pages/AuthPage'
import HeroPage from './pages/HeroPage'
import DashboardPage from './pages/DashboardPage'
import TimelinePage from './pages/TimelinePage'
import JyotiChat from './components/JyotiChat'
import HindiToggle from './components/HindiToggle'
import TourOnboarding from './components/TourOnboarding'
import PrivacyModal from './components/PrivacyModal'
import PasscodeModal from './components/PasscodeModal'
import Toast from './components/Toast'
import SAMPLE_CHART from './lib/sampleChart'

const CHART_KEY = 'vv_chart_data'

function loadSavedChart() {
  try {
    const raw = localStorage.getItem(CHART_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export default function App() {
  const [page, setPage] = useState('auth')
  const [user, setUser] = useState(null)
  const [chartData, setChartData] = useState(SAMPLE_CHART)
  const [hasRealChart, setHasRealChart] = useState(false)
  const [lang, setLang] = useState(() => localStorage.getItem('vv_lang') || 'en')
  const [showTour, setShowTour] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [showPasscode, setShowPasscode] = useState(false)
  const [offline, setOffline] = useState(() => !navigator.onLine)

  useEffect(() => {
    const on = () => setOffline(false)
    const off = () => setOffline(true)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  // Restore session on mount
  useEffect(() => {
    const session = getSession()
    if (!session) return
    setUser(session)
    const saved = loadSavedChart()
    if (saved) {
      setChartData(saved)
      setHasRealChart(true)
      setPage('dashboard')
    } else {
      // No chart yet — send to birth form
      setPage('hero')
    }
  }, [])

  function handleEnter(u) {
    saveSession(u)
    setUser(u)
    const saved = loadSavedChart()
    if (saved) {
      setChartData(saved)
      setHasRealChart(true)
      setPage('dashboard')
    } else {
      setPage('hero')
    }
    if (!localStorage.getItem('vv_tour_done')) setShowTour(true)
  }

  function handleLogout() {
    clearSession()
    setUser(null)
    setChartData(SAMPLE_CHART)
    setHasRealChart(false)
    setPage('auth')
  }

  function handleChartReady(data) {
    if (data && data.lagna) {
      // Real chart from API — save it
      localStorage.setItem(CHART_KEY, JSON.stringify(data))
      setChartData(data)
      setHasRealChart(true)
    }
    setPage('dashboard')
  }

  useEffect(() => {
    window.openPrivacyModal = () => setShowPrivacy(true)
    window.openPasscodeModal = () => setShowPasscode(true)
    return () => { delete window.openPrivacyModal; delete window.openPasscodeModal }
  }, [])

  // First-visit disclaimer: auto-show after 1 s if never dismissed
  useEffect(() => {
    if (localStorage.getItem('vv_disclaimer_shown')) return
    const id = setTimeout(() => setShowPrivacy(true), 1000)
    return () => clearTimeout(id)
  }, [])

  return (
    <>
      {offline && (
        <div style={{ position:'fixed', top:0, left:0, right:0, zIndex:10000, background:'rgba(224,80,80,0.92)', color:'#fff', textAlign:'center', padding:'8px 16px', fontSize:13, fontFamily:'Outfit,sans-serif' }}>
          You are offline — some features may be unavailable
        </div>
      )}

      {page === 'auth' && (
        <AuthPage onEnter={handleEnter} onPreviewTour={() => setPage('hero')} />
      )}
      {page === 'hero' && (
        <HeroPage
          onChartReady={handleChartReady}
          onBack={hasRealChart ? () => setPage('dashboard') : undefined}
          onLogout={user ? handleLogout : undefined}
          onTimeline={() => setPage('timeline')}
          onPrivacy={() => setShowPrivacy(true)}
          onPasscode={() => setShowPasscode(true)}
          lang={lang}
        />
      )}
      {page === 'dashboard' && (
        <DashboardPage
          chart={hasRealChart ? chartData : SAMPLE_CHART}
          isSample={!hasRealChart}
          user={user}
          onBack={() => setPage('hero')}
          onLogout={handleLogout}
          onPasscode={() => setShowPasscode(true)}
          onNewChart={() => setPage('hero')}
          lang={lang}
        />
      )}
      {page === 'timeline' && <TimelinePage onBack={() => setPage('dashboard')} />}

      {page !== 'auth' && (
        <>
          <JyotiChat chartContext={hasRealChart ? chartData : null} lang={lang} />
          <HindiToggle lang={lang} onToggle={() => setLang(l => l === 'en' ? 'hi' : 'en')} />
        </>
      )}

      {showTour && <TourOnboarding onDone={() => setShowTour(false)} />}

      <PrivacyModal open={showPrivacy} onClose={() => { setShowPrivacy(false); localStorage.setItem('vv_disclaimer_shown', 'true') }} />
      <PasscodeModal
        open={showPasscode}
        onClose={() => setShowPasscode(false)}
        onUnlock={() => {
          // PasscodeModal already wrote the correct key (permanent or timed).
          // Only set the permanent flag if it's not a timed session.
          try {
            const t = localStorage.getItem('vv_dharma_timed')
            if (!t) localStorage.setItem('vv_dharma_pass', '1')
          } catch { localStorage.setItem('vv_dharma_pass', '1') }
        }}
      />
      <Toast />
    </>
  )
}
