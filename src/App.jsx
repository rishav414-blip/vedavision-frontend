import { useState } from 'react'
import HeroPage from './pages/HeroPage'
import DashboardPage from './pages/DashboardPage'

export default function App() {
  const [page, setPage] = useState('hero') // 'hero' | 'dashboard'
  const [chartData, setChartData] = useState(null)

  const handleChartReady = (data) => {
    setChartData(data)
    setPage('dashboard')
  }

  return (
    <>
      {page === 'hero' && <HeroPage onChartReady={handleChartReady} />}
      {page === 'dashboard' && <DashboardPage chart={chartData} onBack={() => setPage('hero')} />}
    </>
  )
}
