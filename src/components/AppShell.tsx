import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Types ──────────────────────────────────────────────────────────────────────

interface ChartData {
  native?: { name?: string; dob?: string; tob?: string; pob?: string }
  lagna?: { sign?: string; signEn?: string; lord?: string }
  moonSign?: { sign?: string; signEn?: string }
  sunSign?: { sign?: string; signEn?: string }
  nakshatra?: { name?: string; pada?: number; lord?: string }
  dasha?: { current?: { planet?: string; start?: string; end?: string }; antardasha?: { planet?: string; end?: string } }
  yoga?: string[]
  houses?: { id: number; sign: string; planets: string[] }[]
  planetTable?: { planet: string; sign: string; house: number; dignity: string; notes?: string }[]
}

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
  bg: '#0A0618',
  surface: 'rgba(255,255,255,0.04)',
  border: 'rgba(192,160,96,0.18)',
  gold: '#D4B870',
  goldDim: 'rgba(212,184,112,0.08)',
  goldBorder: 'rgba(212,184,112,0.35)',
  violet: '#8B7CC8',
  violetBg: 'rgba(139,124,200,0.18)',
  txt: '#F0EBF4',
  txt2: '#B0A0C8',
  txt3: '#8090B5',
  summaryBg: 'rgba(8,5,18,0.95)',
  sidebarBg: 'rgba(10,6,24,0.97)',
  hoverBg: 'rgba(255,255,255,0.05)',
};

// ── Sidebar nav config ─────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: 'overview',  icon: '◈', label: 'Overview' },
  { id: 'chart',     icon: '⬡', label: 'Natal Chart' },
  { id: 'forecast',  icon: '↗', label: '5-Year Forecast' },
  { id: 'calendar',  icon: '◷', label: 'Green/Red Days' },
  { id: 'slider',    icon: '⊕', label: 'Time-Slider' },
  { id: 'altar',     icon: '✦', label: 'Digital Altar' },
  { id: 'remedies',  icon: '◫', label: 'Remedies' },
  { id: 'compat',    icon: '⚭', label: 'Compatibility' },
  { id: 'insights',  icon: '◉', label: 'Insights' },
  { id: 'dharma',    icon: '✧', label: 'Dharma Pass', special: true },
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
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 20,
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 9, letterSpacing: '0.1em', color: T.txt3, fontFamily: 'Inter, system-ui, sans-serif', textTransform: 'uppercase' }}>
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
              background: 'rgba(14,9,30,0.98)',
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              boxShadow: '0 8px 32px rgba(0,0,0,0.55)',
              overflow: 'hidden',
              zIndex: 200,
            }}
          >
            {/* User info */}
            <div style={{ padding: '12px 16px 10px', borderBottom: `1px solid ${T.border}` }}>
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
  const moon = chart?.moonSign?.signEn ?? chart?.moonSign?.sign ?? '—';
  const sun = chart?.sunSign?.signEn ?? chart?.sunSign?.sign ?? '—';
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
        borderBottom: `1px solid ${T.border}`,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
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
          border: `1px solid ${T.border}`,
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
          e.currentTarget.style.borderColor = T.border;
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
  const isDharmaUnlocked = typeof window !== 'undefined'
    ? !!localStorage.getItem('vv_dharma_pass')
    : false;

  const expanded = hovered;

  return (
    <motion.nav
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      animate={{ width: expanded ? 220 : 48 }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      style={{
        flexShrink: 0,
        height: '100%',
        background: T.sidebarBg,
        borderRight: `1px solid ${T.border}`,
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
          fontSize: 9,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: T.txt3,
          fontFamily: 'Inter, system-ui, sans-serif',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          borderBottom: `1px solid ${T.border}`,
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
              title={!expanded ? item.label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                width: '100%',
                padding: '0 13px',
                height: 40,
                background: isActive
                  ? (isDharma ? 'rgba(212,184,112,0.08)' : 'rgba(139,124,200,0.1)')
                  : 'transparent',
                border: 'none',
                borderLeft: isActive
                  ? `2px solid ${isDharma ? T.gold : T.violet}`
                  : '2px solid transparent',
                color: isActive
                  ? (isDharma ? T.gold : T.txt)
                  : isDharma
                    ? T.gold
                    : T.txt2,
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
                  fontSize: 15,
                  flexShrink: 0,
                  width: 20,
                  textAlign: 'center',
                  color: isActive
                    ? (isDharma ? T.gold : T.violet)
                    : isDharma ? T.gold : T.txt3,
                  fontFamily: 'system-ui, sans-serif',
                }}
              >
                {item.icon}
              </span>

              {/* Label */}
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
                }}
              >
                {item.label}
              </motion.span>

              {/* Lock icon for dharma */}
              {isLocked && (
                <motion.span
                  animate={{ opacity: expanded ? 1 : 0 }}
                  transition={{ duration: 0.15 }}
                  style={{ fontSize: 11, flexShrink: 0, color: T.txt3 }}
                >
                  🔒
                </motion.span>
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
  const isDharmaUnlocked = typeof window !== 'undefined'
    ? !!localStorage.getItem('vv_dharma_pass')
    : false;

  const tabItems = NAV_ITEMS.filter(n => (MOBILE_TABS as readonly string[]).includes(n.id));

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 150,
        background: T.summaryBg,
        borderTop: `1px solid ${T.border}`,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
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
                ? `2px solid ${isDharma ? T.gold : T.violet}`
                : '2px solid transparent',
              color: isActive
                ? (isDharma ? T.gold : T.violet)
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

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: T.bg,
        color: T.txt,
        fontFamily: 'Inter, system-ui, sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Inject no-scrollbar style once */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        * { box-sizing: border-box; }
      `}</style>

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
