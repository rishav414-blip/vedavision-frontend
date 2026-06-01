import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useShaderBackground } from '@/lib/useShaderBackground';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChartData } from '@/lib/chartTypes';
import { getSignStr } from '@/lib/chartTypes';

interface AppShellProps {
  chart: ChartData | null
  user: { name: string; email: string; plan: string }
  activeTab: string
  onTabChange: (tab: string) => void
  onLogout: () => void
  onPasscode: () => void
  children: React.ReactNode
}

// ── Design tokens ──────────────────────────────────────────────────────────────

const T = {
  bg: '#0F0524',
  surface: 'rgba(8,4,22,0.60)',
  border: 'rgba(114,166,183,0.18)',
  gold: '#D4B870',
  goldDim: 'rgba(212,184,112,0.08)',
  goldBorder: 'rgba(212,184,112,0.35)',
  teal: '#72A6B7',
  tealBg: 'rgba(114,166,183,0.08)',
  tealBorder: 'rgba(114,166,183,0.2)',
  violet: '#72A6B7',
  violetBg: 'rgba(114,166,183,0.12)',
  txt: '#E8E0F0',
  txt2: '#D0C8E0',
  txt3: '#9A90B8',
  summaryBg: 'rgba(8,4,22,0.78)',
  sidebarBg: 'rgba(6,2,16,0.82)',
  hoverBg: 'rgba(8,4,22,0.92)',
};

// ── Sidebar nav config ─────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: 'overview',  icon: '◈', label: 'Overview',        abbr: 'OVR' },
  { id: 'chart',     icon: '⬡', label: 'Natal Chart',     abbr: 'NAT' },
  { id: 'forecast',  icon: '↗', label: '5-Year Forecast', abbr: '5YR' },
  { id: 'calendar',  icon: '◷', label: 'Green/Red Days',  abbr: 'CAL' },
  { id: 'slider',    icon: '⊕', label: 'Time-Slider',     abbr: 'SLD' },
  { id: 'altar',     icon: '✦', label: 'Digital Altar',   abbr: 'ALT' },
  { id: 'remedies',  icon: '◫', label: 'Remedies',        abbr: 'REM' },
  { id: 'compat',    icon: '⚭', label: 'Compatibility',   abbr: 'COM' },
  { id: 'insights',  icon: '◉', label: 'Insights',        abbr: 'INS' },
  { id: 'dharma',    icon: '✧', label: 'Dharma Pass',     abbr: 'DHP', special: true },
] as const;

// Bottom tab bar tabs for mobile (5 primary)
const MOBILE_TABS = ['overview', 'chart', 'forecast', 'compat', 'dharma'] as const;

// ── Helper: initials ───────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');
}

// ── Helper: format DOB ─────────────────────────────────────────────────────────

function formatDOB(dob?: string): string {
  if (!dob) return '—';
  try {
    const d = new Date(dob);
    if (isNaN(d.getTime())) return dob;
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dob;
  }
}

// ── Summary chip ───────────────────────────────────────────────────────────────

interface ChipProps {
  label: string;
  value: string;
}

function SummaryChip({ label, value }: ChipProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 10px',
        background: 'rgba(8,4,22,0.60)',
        border: '1px solid rgba(114,166,183,0.2)',
        borderRadius: 20,
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 11, letterSpacing: '0.1em', color: T.txt3, fontFamily: 'Inter, system-ui, sans-serif', textTransform: 'uppercase' }}>
        {label}
      </span>
      <span style={{ fontSize: 12, color: T.txt, fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 500 }}>
        {value}
      </span>
    </span>
  );
}

// ── User menu dropdown ─────────────────────────────────────────────────────────

interface UserMenuProps {
  user: AppShellProps['user'];
  onLogout: () => void;
  onPasscode: () => void;
}

function UserMenu({ user, onLogout, onPasscode }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          background: T.violetBg,
          border: `1.5px solid ${T.violet}`,
          color: T.txt,
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
        aria-label="User menu"
      >
        {getInitials(user.name)}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.14 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              minWidth: 210,
              background: 'rgba(8,4,22,0.92)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(114,166,183,0.15)',
              borderRadius: 16,
              boxShadow: '0 8px 32px rgba(0,0,0,0.55)',
              overflow: 'hidden',
              zIndex: 200,
            }}
          >
            {/* User info */}
            <div style={{ padding: '12px 16px 10px', borderBottom: '1px solid rgba(114,166,183,0.15)' }}>
              <div style={{ fontSize: 13, color: T.txt, fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 500, marginBottom: 2 }}>
                {user.name}
              </div>
              <div style={{ fontSize: 11, color: T.txt3, fontFamily: 'Inter, system-ui, sans-serif' }}>
                {user.email}
              </div>
              <div style={{
                display: 'inline-block',
                marginTop: 6,
                fontSize: 10,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: T.gold,
                background: 'rgba(212,184,112,0.1)',
                border: `1px solid rgba(212,184,112,0.25)`,
                borderRadius: 4,
                padding: '1px 6px',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}>
                {user.plan}
              </div>
            </div>

            {/* Menu items */}
            <button
              onClick={() => { onPasscode(); setOpen(false); }}
              style={menuItemStyle}
              onMouseEnter={e => (e.currentTarget.style.background = T.hoverBg)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ color: T.gold }}>✧</span>
              <span>Dharma Pass</span>
              <span style={{ marginLeft: 'auto', color: T.txt3, fontSize: 11 }}>→</span>
            </button>
            <button
              onClick={() => { onLogout(); setOpen(false); }}
              style={{ ...menuItemStyle, color: T.txt3 }}
              onMouseEnter={e => (e.currentTarget.style.background = T.hoverBg)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <span>⎋</span>
              <span>Sign Out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const menuItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  width: '100%',
  padding: '10px 16px',
  background: 'transparent',
  border: 'none',
  color: T.txt2,
  fontSize: 13,
  fontFamily: 'Inter, system-ui, sans-serif',
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'background 0.12s',
};

// ── Summary bar ────────────────────────────────────────────────────────────────

interface SummaryBarProps {
  chart: ChartData | null;
  user: AppShellProps['user'];
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  onPasscode: () => void;
  isMobile: boolean;
}

function SummaryBar({ chart, user, onTabChange, onLogout, onPasscode, isMobile }: SummaryBarProps) {
  const name = chart?.native?.name ?? '—';
  const dob = formatDOB(chart?.native?.dob);
  const lagna = chart?.lagna?.signEn ?? chart?.lagna?.sign ?? '—';
  const moon = getSignStr(chart?.moonSign) || '—';
  const sun  = getSignStr(chart?.sunSign)  || '—';
  const mdPlanet = chart?.dasha?.current?.planet ?? '—';
  const adPlanet = chart?.dasha?.antardasha?.planet;
  const mdLabel = adPlanet ? `${mdPlanet}/${adPlanet}` : mdPlanet;

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: 48,
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        gap: 8,
        background: T.summaryBg,
        borderBottom: '1px solid rgba(114,166,183,0.12)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        boxShadow: '0 4px 30px rgba(0,0,0,0.4)',
      }}
    >
      {/* Logo mark */}
      <span
        style={{
          fontSize: 16,
          color: T.gold,
          flexShrink: 0,
          marginRight: 4,
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontStyle: 'italic',
        }}
      >
        ☽
      </span>

      {/* Chips row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          flex: 1,
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
        className="no-scrollbar"
      >
        <SummaryChip label="YOU" value={name} />
        {!isMobile && <SummaryChip label="BORN" value={dob} />}
        <SummaryChip label="LAGNA" value={lagna} />
        {!isMobile && <SummaryChip label="MOON" value={moon} />}
        {!isMobile && <SummaryChip label="SUN" value={sun} />}
        <SummaryChip label="MD" value={mdLabel} />
      </div>

      {/* Edit button */}
      <button
        onClick={() => onTabChange('hero')}
        style={{
          flexShrink: 0,
          background: 'transparent',
          border: '1px solid rgba(114,166,183,0.18)',
          borderRadius: 6,
          color: T.txt3,
          fontSize: 12,
          fontFamily: 'Inter, system-ui, sans-serif',
          padding: '4px 10px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          transition: 'color 0.15s, border-color 0.15s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.color = T.gold;
          e.currentTarget.style.borderColor = T.gold;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = T.txt3;
          e.currentTarget.style.borderColor = 'rgba(114,166,183,0.18)';
        }}
      >
        <span>✎</span>
        {!isMobile && <span>Edit</span>}
      </button>

      {/* Avatar + user menu */}
      <UserMenu user={user} onLogout={onLogout} onPasscode={onPasscode} />
    </div>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────────

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onPasscode: () => void;
}

function Sidebar({ activeTab, onTabChange, onPasscode }: SidebarProps) {
  const [hovered, setHovered] = useState(false);
  const isDharmaUnlocked = typeof window !== 'undefined' ? (() => {
    if (localStorage.getItem('vv_dharma_pass')) return true
    try { const t = localStorage.getItem('vv_dharma_timed'); if (!t) return false; const { expiry } = JSON.parse(t); return Date.now() < expiry } catch { return false }
  })() : false;

  const expanded = hovered;

  return (
    <motion.nav
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      animate={{ width: expanded ? 220 : 56 }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      style={{
        flexShrink: 0,
        height: '100%',
        background: T.sidebarBg,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderRight: '1px solid rgba(114,166,183,0.1)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* "Navigation" title */}
      <motion.div
        animate={{ opacity: expanded ? 1 : 0 }}
        transition={{ duration: 0.15, delay: expanded ? 0.08 : 0 }}
        style={{
          padding: '14px 16px 8px',
          fontSize: 11,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: '#9A90B8',
          fontFamily: 'Inter, system-ui, sans-serif',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          borderBottom: '1px solid rgba(114,166,183,0.1)',
          minHeight: 36,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        Navigation
      </motion.div>

      {/* Nav items */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', scrollbarWidth: 'none', padding: '6px 0' }}>
        {NAV_ITEMS.map(item => {
          const isActive = activeTab === item.id;
          const isDharma = item.id === 'dharma';
          const isLocked = isDharma && !isDharmaUnlocked;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (isDharma && !isDharmaUnlocked) {
                  onPasscode();
                } else {
                  onTabChange(item.id);
                }
              }}
              style={{
                display: 'flex',
                alignItems: expanded ? 'center' : 'center',
                flexDirection: expanded ? 'row' : 'column',
                justifyContent: expanded ? 'flex-start' : 'center',
                gap: expanded ? 12 : 2,
                width: '100%',
                padding: expanded ? '0 16px' : '4px 0',
                height: 44,
                background: isActive
                  ? (isDharma ? 'rgba(212,184,112,0.08)' : 'rgba(114,166,183,0.08)')
                  : 'transparent',
                border: 'none',
                borderLeft: isActive
                  ? `3px solid ${isDharma ? T.gold : T.teal}`
                  : '3px solid transparent',
                color: isActive
                  ? (isDharma ? T.gold : T.teal)
                  : isDharma
                    ? T.gold
                    : T.txt3,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.13s, color 0.13s',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                if (!isActive) e.currentTarget.style.background = T.hoverBg;
              }}
              onMouseLeave={e => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              {/* Icon */}
              <span
                style={{
                  fontSize: expanded ? 18 : 20,
                  flexShrink: 0,
                  width: expanded ? 20 : undefined,
                  textAlign: 'center',
                  color: isActive
                    ? (isDharma ? T.gold : T.teal)
                    : isDharma ? T.gold : T.txt3,
                  fontFamily: 'Segoe UI Symbol, Apple Color Emoji, system-ui, sans-serif',
                  lineHeight: 1,
                }}
              >
                {item.icon}
              </span>

              {/* Abbreviated label — shown only when collapsed */}
              {!expanded && (
                <span
                  style={{
                    fontSize: 10,
                    fontFamily: 'Inter, system-ui, sans-serif',
                    color: isActive
                      ? (isDharma ? T.gold : T.teal)
                      : isDharma ? T.gold : '#9A90B8',
                    textAlign: 'center',
                    lineHeight: 1,
                    letterSpacing: '0.05em',
                    pointerEvents: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.abbr}
                </span>
              )}

              {/* Full label — shown when expanded */}
              <motion.span
                animate={{ opacity: expanded ? 1 : 0, x: expanded ? 0 : -4 }}
                transition={{ duration: 0.15, delay: expanded ? 0.06 : 0 }}
                style={{
                  fontSize: 13,
                  fontFamily: 'Inter, system-ui, sans-serif',
                  whiteSpace: 'nowrap',
                  fontWeight: isActive ? 500 : 400,
                  flex: 1,
                  pointerEvents: 'none',
                  position: expanded ? 'static' : 'absolute',
                  visibility: expanded ? 'visible' : 'hidden',
                }}
              >
                {item.label}
              </motion.span>

              {/* Lock icon for dharma */}
              {isLocked && expanded && (
                <motion.span style={{ fontSize: 11, flexShrink: 0, color: T.txt3 }}>🔒</motion.span>
              )}
            </button>
          );
        })}
      </div>
    </motion.nav>
  );
}

// ── Mobile bottom tab bar ──────────────────────────────────────────────────────

interface MobileTabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onPasscode: () => void;
}

function MobileTabBar({ activeTab, onTabChange, onPasscode }: MobileTabBarProps) {
  const isDharmaUnlocked = typeof window !== 'undefined' ? (() => {
    if (localStorage.getItem('vv_dharma_pass')) return true
    try { const t = localStorage.getItem('vv_dharma_timed'); if (!t) return false; const { expiry } = JSON.parse(t); return Date.now() < expiry } catch { return false }
  })() : false;

  const tabItems = NAV_ITEMS.filter(n => (MOBILE_TABS as readonly string[]).includes(n.id));

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 150,
        background: 'rgba(8,4,22,0.78)',
        borderTop: '1px solid rgba(114,166,183,0.12)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'stretch',
        height: 56,
        overflowX: 'auto',
        scrollbarWidth: 'none',
      }}
    >
      {tabItems.map(item => {
        const isActive = activeTab === item.id;
        const isDharma = item.id === 'dharma';
        const isLocked = isDharma && !isDharmaUnlocked;

        return (
          <button
            key={item.id}
            onClick={() => {
              if (isDharma && !isDharmaUnlocked) onPasscode();
              else onTabChange(item.id);
            }}
            style={{
              flex: 1,
              minWidth: 56,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              background: 'transparent',
              border: 'none',
              borderTop: isActive
                ? `2px solid ${isDharma ? T.gold : T.teal}`
                : '2px solid transparent',
              color: isActive
                ? (isDharma ? T.gold : T.teal)
                : T.txt3,
              cursor: 'pointer',
              padding: '0 4px',
              transition: 'color 0.15s',
            }}
          >
            <span style={{ fontSize: 18 }}>
              {isLocked ? '🔒' : item.icon}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ── AppShell ───────────────────────────────────────────────────────────────────

export default function AppShell({
  chart,
  user,
  activeTab,
  onTabChange,
  onLogout,
  onPasscode,
  children,
}: AppShellProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isOffline, setIsOffline] = useState(() => !navigator.onLine);
  const shaderCanvasRef = useShaderBackground();

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const onOnline = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0F0524',
        color: T.txt,
        fontFamily: 'Inter, system-ui, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* ── WebGL shader — fixed, full-viewport, behind everything ── */}
      <canvas
        ref={shaderCanvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          opacity: 0.68,
          pointerEvents: 'none',
          display: 'block',
        }}
      />
      {/* ── Inject no-scrollbar style once ── */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        * { box-sizing: border-box; }
        .shimmer-bar {
          background: linear-gradient(90deg, #72A6B7 0%, #9ABFCC 45%, #72A6B7 60%, #4A8A9A 100%);
          background-size: 200% 100%;
          animation: shimmer 2.5s ease infinite;
        }
        .shimmer-bar-gold {
          background: linear-gradient(90deg, #C0A860 0%, #D4B870 45%, #C0A860 60%, #A08050 100%);
          background-size: 200% 100%;
          animation: shimmer 2.5s ease infinite;
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .scroll-reveal { opacity: 0; transform: translateY(20px); }
        .scroll-reveal.visible {
          opacity: 1; transform: translateY(0);
          transition: opacity 0.65s cubic-bezier(0.22,1,0.36,1), transform 0.65s cubic-bezier(0.22,1,0.36,1);
        }
      `}</style>

      {/* Offline banner */}
      {isOffline && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            background: '#E05050',
            color: '#fff',
            textAlign: 'center',
            fontSize: 13,
            fontFamily: 'Inter, system-ui, sans-serif',
            padding: '7px 16px',
            letterSpacing: '0.01em',
          }}
        >
          You are offline — some features unavailable
        </div>
      )}

      {/* Summary bar */}
      <SummaryBar
        chart={chart}
        user={user}
        onTabChange={onTabChange}
        onLogout={onLogout}
        onPasscode={onPasscode}
        isMobile={isMobile}
      />

      {/* Body: sidebar + main */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          minHeight: 'calc(100vh - 48px)',
          paddingBottom: isMobile ? 56 : 0,
        }}
      >
        {/* Sidebar — desktop only */}
        {!isMobile && (
          <Sidebar
            activeTab={activeTab}
            onTabChange={onTabChange}
            onPasscode={onPasscode}
          />
        )}

        {/* Main content */}
        <main
          data-chart-export=""
          style={{
            flex: 1,
            minWidth: 0,
            padding: isMobile ? '1.25rem' : '2rem',
            overflowY: 'auto',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              style={{ minHeight: '100%' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      {isMobile && (
        <MobileTabBar
          activeTab={activeTab}
          onTabChange={onTabChange}
          onPasscode={onPasscode}
        />
      )}
    </div>
  );
}
