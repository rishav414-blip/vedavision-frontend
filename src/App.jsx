import { useState } from 'react'
import HeroPage from './pages/HeroPage'
import DashboardPage from './pages/DashboardPage'
import TimelinePage from './pages/TimelinePage'

export default function App() {
  const [page, setPage] = useState('hero') // 'hero' | 'dashboard' | 'timeline'
  const [chartData, setChartData] = useState(null)

  const handleChartReady = (data) => {
    setChartData(data)
    setPage('dashboard')
  }

  return (
    <>
      {page === 'hero' && <HeroPage onChartReady={handleChartReady} onTimeline={() => setPage('timeline')} />}
      {page === 'dashboard' && <DashboardPage chart={chartData} onBack={() => setPage('hero')} />}
      {page === 'timeline' && <TimelinePage onBack={() => setPage('hero')} />}
    </>
  )
}
