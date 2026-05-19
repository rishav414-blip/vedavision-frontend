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

export default function App() {
  const [page, setPage] = useState('auth')   // auth | hero | dashboard | timeline
  const [user, setUser] = useState(null)
  const [chartData, setChartData] = useState(null)
  const [lang, setLang] = useState(() => localStorage.getItem('vv_lang') || 'en')
  const [showTour, setShowTour] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [showPasscode, setShowPasscode] = useState(false)

  // Restore session on mount
  useEffect(() => {
    const session = getSession()
    if (session) { setUser(session); setPage('hero') }
  }, [])

  function handleEnter(u) {
    saveSession(u)
    setUser(u)
    setPage('hero')
    if (!localStorage.getItem('vv_tour_done')) setShowTour(true)
  }

  function handleLogout() {
    clearSession()
    setUser(null)
    setChartData(null)
    setPage('auth')
  }

  function handleChartReady(data) {
    setChartData(data)
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
        <AuthPage onEnter={handleEnter} onPreviewTour={() => { setPage('hero') }} />
      )}
      {page === 'hero' && (
        <HeroPage
          onChartReady={handleChartReady}
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
          lang={lang}
        />
      )}
      {page === 'timeline' && <TimelinePage onBack={() => setPage('hero')} />}

      {/* Global widgets — shown on hero + dashboard */}
      {page !== 'auth' && (
        <>
          <JyotiChat chartContext={chartData} lang={lang} />
          <HindiToggle lang={lang} onToggle={() => setLang(l => l === 'en' ? 'hi' : 'en')} />
        </>
      )}

      {/* Tour — shown after first login */}
      {showTour && <TourOnboarding onDone={() => setShowTour(false)} />}

      {/* Modals */}
      <PrivacyModal open={showPrivacy} onClose={() => setShowPrivacy(false)} />
      <PasscodeModal
        open={showPasscode}
        onClose={() => setShowPasscode(false)}
        onUnlock={() => { localStorage.setItem('vv_dharma_pass', '1') }}
      />
    </>
  )
}
