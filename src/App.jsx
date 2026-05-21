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

export default function App() {
  const [page, setPage] = useState('auth')   // auth | hero | dashboard | timeline
  const [user, setUser] = useState(null)
  const [chartData, setChartData] = useState(SAMPLE_CHART)   // always populated
  const [lang, setLang] = useState(() => localStorage.getItem('vv_lang') || 'en')
  const [showTour, setShowTour] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [showPasscode, setShowPasscode] = useState(false)

  // Restore session on mount — go straight to dashboard
  useEffect(() => {
    const session = getSession()
    if (session) { setUser(session); setPage('dashboard') }
  }, [])

  function handleEnter(u) {
    saveSession(u)
    setUser(u)
    setPage('dashboard')
    if (!localStorage.getItem('vv_tour_done')) setShowTour(true)
  }

  function handleLogout() {
    clearSession()
    setUser(null)
    setChartData(SAMPLE_CHART)
    setPage('auth')
  }

  function handleChartReady(data) {
    if (data) setChartData(data)
    setPage('dashboard')
  }

  // Expose globally for legacy compat
  useEffect(() => {
    window.openPrivacyModal = () => setShowPrivacy(true)
    window.openPasscodeModal = () => setShowPasscode(true)
    return () => { delete window.openPrivacyModal; delete window.openPasscodeModal }
  }, [])

  return (
    <>
      {page === 'auth' && (
        <AuthPage onEnter={handleEnter} onPreviewTour={() => { setPage('dashboard') }} />
      )}
      {page === 'hero' && (
        <HeroPage
          onChartReady={handleChartReady}
          onLogout={handleLogout}
          onTimeline={() => setPage('timeline')}
          onPrivacy={() => setShowPrivacy(true)}
          onPasscode={() => setShowPasscode(true)}
          lang={lang}
        />
      )}
      {page === 'dashboard' && (
        <DashboardPage
          chart={chartData}
          user={user}
          onBack={() => setPage('hero')}
          onLogout={handleLogout}
          onPasscode={() => setShowPasscode(true)}
          onNewChart={() => setPage('hero')}
          lang={lang}
        />
      )}
      {page === 'timeline' && <TimelinePage onBack={() => setPage('dashboard')} />}

      {/* Global widgets */}
      {page !== 'auth' && (
        <>
          <JyotiChat chartContext={chartData} lang={lang} />
          <HindiToggle lang={lang} onToggle={() => setLang(l => l === 'en' ? 'hi' : 'en')} />
        </>
      )}

      {showTour && <TourOnboarding onDone={() => setShowTour(false)} />}

      <PrivacyModal open={showPrivacy} onClose={() => setShowPrivacy(false)} />
      <PasscodeModal
        open={showPasscode}
        onClose={() => setShowPasscode(false)}
        onUnlock={() => { localStorage.setItem('vv_dharma_pass', '1') }}
      />
      <Toast />
    </>
  )
}
