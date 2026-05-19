import { useState, useEffect } from 'react'
import HeroPage from './pages/HeroPage'
import DashboardPage from './pages/DashboardPage'
import TimelinePage from './pages/TimelinePage'
import JyotiChat from './components/JyotiChat'
import HindiToggle from './components/HindiToggle'
import TourOnboarding from './components/TourOnboarding'
import PrivacyModal from './components/PrivacyModal'
import PasscodeModal from './components/PasscodeModal'

export default function App() {
  const [page, setPage] = useState('hero')
  const [chartData, setChartData] = useState(null)
  const [lang, setLang] = useState(() => localStorage.getItem('vv_lang') || 'en')
  const [showTour, setShowTour] = useState(() => !localStorage.getItem('vv_tour_done'))
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [showPasscode, setShowPasscode] = useState(false)
  const [dharmaUnlocked, setDharmaUnlocked] = useState(() => !!localStorage.getItem('vv_dharma_pass'))

  const handleChartReady = (data) => { setChartData(data); setPage('dashboard') }
  const toggleLang = () => setLang(l => l === 'en' ? 'hi' : 'en')

  // Expose modal openers globally for legacy compatibility
  useEffect(() => {
    window.openPrivacyModal = () => setShowPrivacy(true)
    window.openPasscodeModal = () => setShowPasscode(true)
    return () => { delete window.openPrivacyModal; delete window.openPasscodeModal }
  }, [])

  return (
    <>
      {/* Pages */}
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
          onBack={() => setPage('hero')}
          lang={lang}
          dharmaUnlocked={dharmaUnlocked}
          onPasscode={() => setShowPasscode(true)}
        />
      )}
      {page === 'timeline' && <TimelinePage onBack={() => setPage('hero')} />}

      {/* Global persistent widgets */}
      <JyotiChat chartContext={chartData} lang={lang} />
      <HindiToggle lang={lang} onToggle={toggleLang} />

      {/* Modals */}
      <TourOnboarding key="tour" onDone={() => setShowTour(false)} />
      {!showTour && (
        <>
          <PrivacyModal open={showPrivacy} onClose={() => setShowPrivacy(false)} />
          <PasscodeModal open={showPasscode} onClose={() => setShowPasscode(false)} onUnlock={() => setDharmaUnlocked(true)} />
        </>
      )}
    </>
  )
}
