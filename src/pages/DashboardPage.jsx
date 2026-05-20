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

export default function DashboardPage({ chart, user, onBack, onLogout, onPasscode, onNewChart }) {
  const [activeTab, setActiveTab] = useState('overview')
  const dharmaUnlocked = !!localStorage.getItem('vv_dharma_pass')

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
      user={user ?? { name:'Guest', email:'', plan:'free' }}
      activeTab={activeTab}
      onTabChange={tab => { if (tab === 'hero') { onNewChart ? onNewChart() : onBack(); return } setActiveTab(tab) }}
      onLogout={onLogout}
      onPasscode={onPasscode}
    >
      {tabContent[activeTab] ?? tabContent['overview']}
    </AppShell>
  )
}
