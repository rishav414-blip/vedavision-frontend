import { useState } from 'react'
import AppShell from '../components/AppShell'
import OverviewTab from '../tabs/OverviewTab'
import NatalChartTab from '../tabs/NatalChartTab'
import ForecastTab from '../tabs/ForecastTab'
import GreenDaysTab from '../tabs/GreenDaysTab'
import TimeSliderTab from '../tabs/TimeSliderTab'
import AltarTab from '../tabs/AltarTab'
import RemediesTab from '../tabs/RemediesTab'
import CompatibilityTab from '../tabs/CompatibilityTab'
import InsightsTab from '../tabs/InsightsTab'
import DharmaPassTab from '../tabs/DharmaPassTab'

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

export default function DashboardPage({ chart, isSample, user, onBack, onLogout, onPasscode, onNewChart }) {
  const [activeTab, setActiveTab] = useState('overview')
  const dharmaUnlocked = !!localStorage.getItem('vv_dharma_pass')
  const goNew = () => { if (onNewChart) onNewChart(); else onBack() }

  const tabContent = {
    overview:   <OverviewTab chart={chart} />,
    chart:      <NatalChartTab chart={chart} />,
    forecast:   <ForecastTab chart={chart} />,
    calendar:   <GreenDaysTab chart={chart} />,
    slider:     <TimeSliderTab chart={chart} />,
    altar:      <AltarTab chart={chart} />,
    remedies:   <RemediesTab chart={chart} />,
    compat:     <CompatibilityTab chart={chart} />,
    insights:   <InsightsTab chart={chart} />,
    dharma:     <DharmaPassTab unlocked={dharmaUnlocked} onOpenPasscode={onPasscode} />,
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
      {tabContent[activeTab] ?? tabContent['overview']}
    </AppShell>
  )
}
