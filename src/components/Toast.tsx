import React, { useState, useEffect, useCallback } from 'react'

declare global {
  interface Window {
    showToast: (msg: string, type?: 'success' | 'error' | 'info') => void
  }
}

interface ToastItem {
  id: number
  msg: string
  type: 'success' | 'error' | 'info'
}

const TYPE_STYLES = {
  success: { color: '#6EC97A', icon: '✓' },
  error:   { color: '#E05050', icon: '✕' },
  info:    { color: '#8B7CC8', icon: 'ℹ' },
} as const

let _nextId = 1

const KEYFRAME_ID = 'vv-toast-keyframes'

function injectKeyframes() {
  if (document.getElementById(KEYFRAME_ID)) return
  const style = document.createElement('style')
  style.id = KEYFRAME_ID
  style.textContent = `
    @keyframes vv-toast-in {
      from { opacity: 0; transform: translateY(12px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0)    scale(1); }
    }
  `
  document.head.appendChild(style)
}

export default function Toast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const remove = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const add = useCallback((msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = _nextId++
    setToasts(prev => [...prev, { id, msg, type }])
    setTimeout(() => remove(id), 3000)
  }, [remove])

  useEffect(() => {
    injectKeyframes()
    window.showToast = add
    return () => { delete (window as any).showToast }
  }, [add])

  if (toasts.length === 0) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 20,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        pointerEvents: 'none',
      }}
    >
      {toasts.map(t => {
        const s = TYPE_STYLES[t.type]
        return (
          <div
            key={t.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 16px',
              background: 'rgba(14,9,30,0.97)',
              border: '1px solid rgba(212,184,112,0.3)',
              borderRadius: 999,
              boxShadow: '0 4px 24px rgba(0,0,0,0.55)',
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 13,
              color: '#E8E0F0',
              animation: 'vv-toast-in 0.22s ease both',
              pointerEvents: 'auto',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ color: s.color, fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
              {s.icon}
            </span>
            <span>{t.msg}</span>
          </div>
        )
      })}
    </div>
  )
}
