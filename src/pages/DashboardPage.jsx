import { motion } from 'framer-motion'

export default function DashboardPage({ chart, onBack }) {
  const name = chart?.native?.name ?? 'Unknown'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      style={{
        minHeight: '100vh',
        background: '#0A0618',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        fontFamily: "'Outfit', Inter, system-ui, sans-serif",
        color: '#E8E0F0',
      }}
    >
      <h1 style={{ fontSize: '1.75rem', fontWeight: 300, color: '#C0A860' }}>
        Dashboard coming soon
      </h1>
      <p style={{ color: '#B8B0C8', fontSize: '1rem' }}>
        Chart for <strong style={{ color: '#E8E0F0' }}>{name}</strong>
      </p>
      <button
        onClick={onBack}
        style={{
          marginTop: '1rem', padding: '0.5rem 1.5rem',
          background: 'transparent', border: '1px solid #4A3A6A',
          borderRadius: '6px', color: '#C0A860', cursor: 'pointer',
          fontSize: '0.875rem', letterSpacing: '0.05em', fontFamily: 'inherit',
        }}
      >← Back</button>
    </motion.div>
  )
}
