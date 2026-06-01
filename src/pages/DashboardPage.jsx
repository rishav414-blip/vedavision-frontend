import { useState, lazy, Suspense } from 'react'
import AppShell from '../components/AppShell'
const OverviewTab      = lazy(() => import('../tabs/OverviewTab'))
const NatalChartTab    = lazy(() => import('../tabs/NatalChartTab'))
const ForecastTab      = lazy(() => import('../tabs/ForecastTab'))
const GreenDaysTab     = lazy(() => import('../tabs/GreenDaysTab'))
const TimeSliderTab    = lazy(() => import('../tabs/TimeSliderTab'))
const AltarTab         = lazy(() => import('../tabs/AltarTab'))
const RemediesTab      = lazy(() => import('../tabs/RemediesTab'))
const CompatibilityTab = lazy(() => import('../tabs/CompatibilityTab'))
const InsightsTab      = lazy(() => import('../tabs/InsightsTab'))
const DharmaPassTab    = lazy(() => import('../tabs/DharmaPassTab'))

function SampleBanner({ onCast }) {
  return (
    <div style={{
      margin: '0 0 20px',
      padding: '14px 20px',
      background: 'rgba(212,184,112,0.08)',
      border: '1px solid rgba(212,184,112,0.35)',
      borderRadius: 12,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      flexWrap: 'wrap',
    }}>
      <div>
        <p style={{ margin: 0, fontFamily: 'Outfit,sans-serif', fontSize: 13, color: '#D4B870', fontWeight: 600 }}>
          ✦ Viewing sample chart — Arjun Sharma
        </p>
        <p style={{ margin: '2px 0 0', fontFamily: 'Outfit,sans-serif', fontSize: 12, color: '#B0A0C8' }}>
          Enter your birth details to see your personal Vedic chart.
        </p>
      </div>
      <button
        onClick={onCast}
        style={{
          padding: '10px 20px',
          borderRadius: 10,
          border: 'none',
          background: 'linear-gradient(135deg,#C0A860,#D4B870)',
          color: '#0A0618',
          fontFamily: 'Outfit,sans-serif',
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        Cast My Chart →
      </button>
    </div>
  )
}

export default function DashboardPage({ chart, isSample, user, onBack, onLogout, onPasscode, onNewChart, lang = 'en' }) {
  const [activeTab, setActiveTab] = useState('overview')
  const dharmaUnlocked = (() => {
    if (localStorage.getItem('vv_dharma_pass')) return true
    try {
      const t = localStorage.getItem('vv_dharma_timed')
      if (!t) return false
      const { expiry } = JSON.parse(t)
      if (Date.now() >= expiry) { localStorage.removeItem('vv_dharma_timed'); return false }
      return true
    } catch { return false }
  })()
  const goNew = () => { if (onNewChart) onNewChart(); else onBack() }

  function ActiveTab() {
    switch (activeTab) {
      case 'chart':    return <NatalChartTab chart={chart} />
      case 'forecast': return <ForecastTab chart={chart} lang={lang} />
      case 'calendar': return <GreenDaysTab chart={chart} />
      case 'slider':   return <TimeSliderTab chart={chart} />
      case 'altar':    return <AltarTab chart={chart} />
      case 'remedies': return <RemediesTab chart={chart} lang={lang} />
      case 'compat':   return <CompatibilityTab chart={chart} />
      case 'insights': return <InsightsTab chart={chart} lang={lang} />
      case 'dharma':   return <DharmaPassTab unlocked={dharmaUnlocked} onOpenPasscode={onPasscode} />
      default:         return <OverviewTab chart={chart} lang={lang} />
    }
  }

  return (
    <AppShell
      chart={chart}
      user={user ?? { name: 'Guest', email: '', plan: 'free' }}
      activeTab={activeTab}
      onTabChange={tab => { if (tab === 'hero') { goNew(); return } setActiveTab(tab) }}
      onLogout={onLogout}
      onPasscode={onPasscode}
    >
      {isSample && <SampleBanner onCast={goNew} />}
      <Suspense fallback={<div style={{ color: '#8090B5', padding: '40px', textAlign: 'center', fontFamily: 'Outfit,sans-serif', fontSize: 13 }}>Loading…</div>}>
        <ActiveTab />
      </Suspense>
    </AppShell>
  )
}
