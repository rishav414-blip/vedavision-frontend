import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// ── Types ──────────────────────────────────────────────────────────────────────

interface JyotiChatProps {
  chartContext?: Record<string, any>;
  lang?: 'en' | 'hi';
}

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  rendered?: string;
  timestamp: number;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const TOKENS = {
  bg: '#0D0A1E',
  bgPanel: '#060310',
  bgMid: '#160F2A',
  violet: '#8B7CC8',
  violetDim: 'rgba(139,124,200,0.18)',
  gold: '#D4B870',
  goldDim: 'rgba(212,184,112,0.15)',
  txt: '#F0EBF4',
  txt2: '#B0A0C8',
  txt3: '#8090B5',
  glass: 'rgba(12,6,28,0.92)',
  border: 'rgba(114,166,183,0.2)',
  borderAccent: 'rgba(139,124,200,0.30)',
  userBubble: 'rgba(139,124,200,0.22)',
  botBubble: 'rgba(8,4,22,0.88)',
  danger: '#E05050',
};

const STREAM_URL = '/api/jyoti/stream';
const TIMEOUT_MS = 25_000;
const MAX_HISTORY = 20;

const CRISIS_PATTERNS = /\b(suicide|suicidal|kill myself|end my life|want to die|no reason to live|hopeless|self.harm|hurt myself|ending it all|can't go on)\b/i;

const CRISIS_RESPONSE = `I'm here. What you're feeling matters.\n\n**Please reach out to someone who can help right now:**\n\n*iCall (India):* **9152987821**\n*Crisis Text Line:* text **HOME** to **741741**\n\nYou don't have to face this alone.`;

// ── Scope blocks (checked before API call) ────────────────────────────────────

interface ScopeBlock { pattern: RegExp; response: string }

const SCOPE_BLOCKS: ScopeBlock[] = [
  {
    pattern: /\b(predict|will i|when will|what year|exact date|specific date)\b/i,
    response: "Jyoti reflects patterns, not predictions. I can explore themes and tendencies in your chart, but specific forecasts aren't within my scope — that would require a qualified Jyotishi in person.",
  },
  {
    pattern: /\b(medicine|medication|dosage|doctor|diagnos|treat|cure|illness|disease|symptom)\b/i,
    response: "Medical questions are outside my scope. Please consult a qualified healthcare professional. I can explore wellness themes in your chart, but never as medical guidance.",
  },
  {
    pattern: /\b(invest|stock|crypto|buy|sell|trading|portfolio|financial advice)\b/i,
    response: "Specific financial advice is outside my scope. Your chart's 2nd and 11th houses show wealth themes — I can reflect on those patterns, but investment decisions need a financial advisor.",
  },
  {
    pattern: /\b(legal|lawsuit|court|lawyer|attorney|sue|contract)\b/i,
    response: "Legal advice is outside my scope. I can reflect on Saturn's role in your chart around discipline and consequence, but please consult a qualified legal professional.",
  },
];

// ── Chart context serializer ──────────────────────────────────────────────────

function buildSystemPrompt(chart?: Record<string, any>): string {
  const base = `You are Jyoti — a scholarly Vedic astrology guide for Celestial Noir. You speak in a restrained, contemplative, dark-academia tone. You surface patterns and symbolism for self-inquiry. You never predict specific outcomes, recommend gemstones, give career directives, medical advice, or financial advice. You frame everything on the reflection axis, not the prediction axis.`;

  if (!chart) return base;

  const lagna = chart.lagna
    ? `Lagna: ${chart.lagna.sign ?? '—'} (lord: ${chart.lagna.lord ?? '—'})`
    : '';

  const houses: string = Array.isArray(chart.houses)
    ? 'Houses: ' + chart.houses
        .map((h: any) => `H${h.id}(${Array.isArray(h.planets) && h.planets.length ? h.planets.join(',') : '∅'})`)
        .join(', ')
    : '';

  const md = chart.dasha?.current;
  const ad = chart.dasha?.antardasha;
  const dashaLine = md
    ? `Current Dasha: ${md.planet ?? '—'} MD / ${ad?.planet ?? '—'} AD (${md.start ?? '?'} – ${md.end ?? '?'})`
    : '';

  const yogaLine = Array.isArray(chart.yoga) && chart.yoga.length
    ? `Yogas: ${chart.yoga.join(', ')}`
    : '';

  const nak = chart.nakshatra;
  const nakLine = nak
    ? `Nakshatra: ${nak.name ?? '—'} Pada ${nak.pada ?? '—'} (lord: ${nak.lord ?? '—'})`
    : '';

  const karakas = chart.karakas;
  const karakaLine = karakas
    ? `Karakas: ${Object.entries(karakas).map(([k, v]) => `${k}=${v}`).join(', ')}`
    : '';

  const contextLines = [lagna, houses, dashaLine, yogaLine, nakLine, karakaLine]
    .filter(Boolean)
    .join('\n');

  return `${base}\n\nCHART CONTEXT:\n${contextLines}`;
}

const QUICK_REPLIES_EN = ['Career outlook?', 'Wealth this period?', 'Relationship outlook?', 'Health check?'];
const QUICK_REPLIES_HI = ['करियर का भविष्य?', 'इस काल में धन?', 'संबंध दृष्टिकोण?', 'स्वास्थ्य जांच?'];

// ── Helpers ────────────────────────────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function buildOpener(lang: 'en' | 'hi', chartContext?: Record<string, any>): string {
  const lagna = chartContext?.lagna?.sign ?? (lang === 'hi' ? 'वृश्चिक' : 'Scorpio');
  const dashaLord = chartContext?.dasha?.current?.planet ?? (lang === 'hi' ? 'शनि' : 'Saturn');

  if (lang === 'hi') {
    return `${lagna} लग्न · ${dashaLord} महादशा। मैं ज्योति हूँ — क्या जानना चाहते हैं?`;
  }
  return `${lagna} Lagna · ${dashaLord} Mahādaśā. I'm Jyoti — what's on your mind?`;
}

function renderMarkdown(raw: string): string {
  return raw
    .replace(/\*\*(.+?)\*\*/g, `<strong style="color:${TOKENS.gold};font-weight:600">$1</strong>`)
    .replace(/\*(.+?)\*/g, `<em style="color:${TOKENS.gold};font-style:italic">$1</em>`)
    .replace(/\n\n/g, '</p><p style="margin:0 0 8px 0">')
    .replace(/\n/g, '<br/>');
}

function wrapParagraphs(html: string): string {
  return `<p style="margin:0 0 8px 0">${html}</p>`;
}

// ── Typewriter hook ────────────────────────────────────────────────────────────

function useTypewriter(target: string, enabled: boolean, onDone?: () => void) {
  const [displayed, setDisplayed] = useState('');
  const idxRef = useRef(0);
  const words = useRef<string[]>([]);

  useEffect(() => {
    if (!enabled || !target) return;
    words.current = target.split(' ');
    idxRef.current = 0;
    setDisplayed('');

    const interval = setInterval(() => {
      if (idxRef.current >= words.current.length) {
        clearInterval(interval);
        onDone?.();
        return;
      }
      idxRef.current += 1;
      setDisplayed(words.current.slice(0, idxRef.current).join(' '));
    }, 30);

    return () => clearInterval(interval);
  }, [target, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  return displayed;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

const TypingDots: React.FC = () => {
  const dotStyle = (delay: string): React.CSSProperties => ({
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: TOKENS.txt3,
    display: 'inline-block',
    margin: '0 2px',
    animation: 'jyoti-bounce 1.2s infinite',
    animationDelay: delay,
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <span style={dotStyle('0s')} />
      <span style={dotStyle('0.2s')} />
      <span style={dotStyle('0.4s')} />
    </div>
  );
};

interface BubbleProps {
  msg: Message;
  isLast: boolean;
  isTyping: boolean;
  typedText: string;
}

const Bubble: React.FC<BubbleProps> = ({ msg, isLast, isTyping, typedText }) => {
  const isBot = msg.role === 'bot';
  const textToShow = isBot && isLast && isTyping ? typedText : msg.text;
  const rendered = isBot ? wrapParagraphs(renderMarkdown(textToShow)) : undefined;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isBot ? 'flex-start' : 'flex-end',
        marginBottom: 10,
      }}
    >
      {isBot && (
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${TOKENS.violet}, #5B4A9A)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            flexShrink: 0,
            marginRight: 8,
            marginTop: 2,
            border: `1px solid ${TOKENS.borderAccent}`,
          }}
        >
          ✦
        </div>
      )}
      <div
        style={{
          maxWidth: '82%',
          background: isBot ? TOKENS.botBubble : 'rgba(114,166,183,0.18)',
          border: `1px solid ${isBot ? 'rgba(114,166,183,0.15)' : 'rgba(114,166,183,0.3)'}`,
          borderRadius: isBot ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
          padding: '9px 13px',
          fontSize: 13.5,
          lineHeight: 1.55,
          color: isBot ? TOKENS.txt : TOKENS.txt,
          backdropFilter: 'blur(8px)',
        }}
      >
        {isBot ? (
          <div dangerouslySetInnerHTML={{ __html: rendered ?? '' }} />
        ) : (
          <span>{textToShow}</span>
        )}
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────

const JyotiChat: React.FC<JyotiChatProps> = ({ chartContext, lang = 'en' }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusLabel, setStatusLabel] = useState<string>('AI');
  const [typingTarget, setTypingTarget] = useState('');
  const [isTypingAnimating, setIsTypingAnimating] = useState(false);
  const [lastBotId, setLastBotId] = useState<string | null>(null);
  const [hasOpened, setHasOpened] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const quickReplies = lang === 'hi' ? QUICK_REPLIES_HI : QUICK_REPLIES_EN;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  const showOpener = useCallback(() => {
    const openerText = buildOpener(lang, chartContext);
    const openerMsg: Message = {
      id: uid(),
      role: 'bot',
      text: openerText,
      timestamp: Date.now(),
    };
    setMessages([openerMsg]);
    setLastBotId(openerMsg.id);
    setTypingTarget(openerText);
    setIsTypingAnimating(true);
  }, [lang, chartContext]);

  const handleOpen = useCallback(() => {
    setOpen(true);
    if (!hasOpened) {
      setHasOpened(true);
      showOpener();
    }
    setTimeout(() => inputRef.current?.focus(), 300);
  }, [hasOpened, showOpener]);

  const handleClear = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setLoading(false);
    setStatusLabel('AI');
    setTypingTarget('');
    setIsTypingAnimating(false);
    setLastBotId(null);
    showOpener();
  }, [showOpener]);

  const addBotMessage = useCallback((text: string, model?: string) => {
    const id = uid();
    setMessages(prev => [...prev, { id, role: 'bot', text, timestamp: Date.now() }]);
    setLastBotId(id);
    setTypingTarget(text);
    setIsTypingAnimating(true);
    if (model) setStatusLabel(model);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setInput('');

    // Crisis check
    if (CRISIS_PATTERNS.test(trimmed)) {
      setMessages(prev => [...prev, { id: uid(), role: 'user', text: trimmed, timestamp: Date.now() }]);
      addBotMessage(CRISIS_RESPONSE);
      return;
    }

    // Scope-block check (hard stops — no API call)
    const scopeHit = SCOPE_BLOCKS.find(b => b.pattern.test(trimmed));
    if (scopeHit) {
      setMessages(prev => [...prev, { id: uid(), role: 'user', text: trimmed, timestamp: Date.now() }]);
      addBotMessage(scopeHit.response);
      return;
    }

    const userMsg: Message = { id: uid(), role: 'user', text: trimmed, timestamp: Date.now() };
    setMessages(prev => {
      const updated = [...prev, userMsg];
      return updated;
    });

    setLoading(true);
    setStatusLabel('thinking…');

    // Build history (last MAX_HISTORY entries, excluding opener if it's the only bot msg)
    const history = messages
      .slice(-MAX_HISTORY)
      .map(m => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.text }));

    abortRef.current = new AbortController();
    const timeoutId = setTimeout(() => abortRef.current?.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(STREAM_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          message: trimmed,
          history,
          chart_context: chartContext ?? null,
          system_prompt: buildSystemPrompt(chartContext),
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (!response.body) throw new Error('No stream body');

      // Create an empty bot message immediately, then fill it incrementally
      const streamId = uid();
      setMessages(prev => [...prev, { id: streamId, role: 'bot', text: '', timestamp: Date.now() }]);
      setLastBotId(streamId);
      setIsTypingAnimating(false); // no typewriter — real streaming

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullText = '';
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6).trim();
          if (payload === '[DONE]') { streamDone = true; break; }
          try {
            const parsed = JSON.parse(payload);
            if (parsed.chunk) {
              fullText += parsed.chunk;
              setMessages(prev =>
                prev.map(m => m.id === streamId ? { ...m, text: fullText } : m)
              );
            }
            if (parsed.error) throw new Error(parsed.error);
          } catch (parseErr) {
            // ignore malformed SSE lines
          }
        }
      }
      // final update to ensure full text is set (handles any leftover buffer)
      if (fullText) {
        setMessages(prev =>
          prev.map(m => m.id === streamId ? { ...m, text: fullText } : m)
        );
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name !== 'AbortError') {
        addBotMessage('Connection issue — the server may be warming up. Try again in a moment.');
      }
    } finally {
      setLoading(false);
      setStatusLabel('AI');
    }
  }, [loading, messages, chartContext, addBotMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }, [input, sendMessage]);

  // Typewriter complete callback
  const handleTypeDone = useCallback(() => {
    setIsTypingAnimating(false);
  }, []);

  const typedText = useTypewriter(typingTarget, isTypingAnimating, handleTypeDone);

  // Pulse animation keyframes injected once
  useEffect(() => {
    const styleId = 'jyoti-keyframes';
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes jyoti-pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(0.85); }
      }
      @keyframes jyoti-bounce {
        0%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-5px); }
      }
    `;
    document.head.appendChild(style);
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────────

  const triggerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 24,
    right: 24,
    zIndex: 400,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: `linear-gradient(135deg, rgba(139,124,200,0.20), rgba(90,70,150,0.25))`,
    border: `1px solid ${TOKENS.borderAccent}`,
    borderRadius: 999,
    padding: '10px 18px 10px 14px',
    cursor: 'pointer',
    backdropFilter: 'blur(6px)',
    boxShadow: `0 4px 24px rgba(139,124,200,0.25), 0 1px 4px rgba(0,0,0,0.4)`,
    transition: 'transform 0.15s, box-shadow 0.15s',
    userSelect: 'none',
  };

  return (
    <>
      {/* Floating trigger */}
      {!open && (
        <button
          style={triggerStyle}
          onClick={handleOpen}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 8px 32px rgba(139,124,200,0.35), 0 2px 8px rgba(0,0,0,0.5)`;
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 4px 24px rgba(139,124,200,0.25), 0 1px 4px rgba(0,0,0,0.4)`;
          }}
          aria-label="Open Jyoti chat"
        >
          {/* Pulsing orb */}
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: '50%',
              background: TOKENS.violet,
              display: 'inline-block',
              animation: 'jyoti-pulse 2s ease-in-out infinite',
              boxShadow: `0 0 8px ${TOKENS.violet}`,
              flexShrink: 0,
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: TOKENS.txt, letterSpacing: '0.02em' }}>
              ✦ Jyoti
            </span>
            <span style={{ fontSize: 10, color: TOKENS.txt3, letterSpacing: '0.04em', fontStyle: 'italic' }}>
              your cosmic guide
            </span>
          </div>
        </button>
      )}

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="jyoti-panel"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            style={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 400,
              width: 340,
              height: 480,
              display: 'flex',
              flexDirection: 'column',
              background: TOKENS.bgPanel,
              border: `1px solid ${TOKENS.border}`,
              borderRadius: 20,
              boxShadow: `0 16px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(114,166,183,0.08), 0 4px 24px rgba(114,166,183,0.12)`,
              backdropFilter: 'blur(8px)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 14px 11px',
                borderBottom: `1px solid ${TOKENS.border}`,
                background: `linear-gradient(180deg, rgba(139,124,200,0.10) 0%, transparent 100%)`,
                flexShrink: 0,
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${TOKENS.violet}, #5B4A9A)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  flexShrink: 0,
                  border: `1px solid ${TOKENS.borderAccent}`,
                  color: '#fff',
                }}
              >
                ✦
              </div>

              {/* Title */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: TOKENS.txt, letterSpacing: '0.02em' }}>
                  ✦ Jyoti
                </div>
                <div style={{ fontSize: 10.5, color: TOKENS.txt3, fontStyle: 'italic', marginTop: 0 }}>
                  your cosmic guide
                </div>
              </div>

              {/* Status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginRight: 6 }}>
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: loading ? TOKENS.gold : '#5ED97E',
                    display: 'inline-block',
                    animation: loading ? 'jyoti-pulse 1s ease-in-out infinite' : 'none',
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 11, color: TOKENS.txt3, letterSpacing: '0.02em', minWidth: 60 }}>
                  {statusLabel}
                </span>
              </div>

              {/* Clear */}
              <button
                onClick={handleClear}
                title="Clear chat"
                style={{
                  background: 'none',
                  border: `1px solid ${TOKENS.border}`,
                  borderRadius: 6,
                  color: TOKENS.txt3,
                  fontSize: 10,
                  padding: '3px 7px',
                  cursor: 'pointer',
                  letterSpacing: '0.04em',
                  transition: 'color 0.15s, border-color 0.15s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.color = TOKENS.txt2;
                  (e.currentTarget as HTMLButtonElement).style.borderColor = TOKENS.borderAccent;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.color = TOKENS.txt3;
                  (e.currentTarget as HTMLButtonElement).style.borderColor = TOKENS.border;
                }}
              >
                Clear
              </button>

              {/* Close */}
              <button
                onClick={() => setOpen(false)}
                title="Close"
                style={{
                  background: 'none',
                  border: 'none',
                  color: TOKENS.txt3,
                  fontSize: 17,
                  lineHeight: 1,
                  padding: '2px 4px',
                  cursor: 'pointer',
                  borderRadius: 4,
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = TOKENS.txt; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = TOKENS.txt3; }}
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '14px 12px 6px',
                scrollbarWidth: 'thin',
                scrollbarColor: `${TOKENS.border} transparent`,
              }}
            >
              {messages.map((msg, i) => {
                const isLast = i === messages.length - 1;
                const isThisTyping = isLast && msg.role === 'bot' && msg.id === lastBotId && isTypingAnimating;
                return (
                  <Bubble
                    key={msg.id}
                    msg={msg}
                    isLast={isLast}
                    isTyping={isThisTyping}
                    typedText={typedText}
                  />
                );
              })}

              {/* Typing indicator */}
              {loading && !isTypingAnimating && (
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 10 }}>
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${TOKENS.violet}, #5B4A9A)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      flexShrink: 0,
                      marginRight: 8,
                      marginTop: 2,
                      border: `1px solid ${TOKENS.borderAccent}`,
                    }}
                  >
                    ✦
                  </div>
                  <div
                    style={{
                      background: TOKENS.botBubble,
                      border: `1px solid ${TOKENS.border}`,
                      borderRadius: '18px 18px 18px 4px',
                      padding: '10px 14px',
                    }}
                  >
                    <TypingDots />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick replies */}
            {messages.length <= 1 && !loading && (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 6,
                  padding: '4px 12px 8px',
                  flexShrink: 0,
                }}
              >
                {quickReplies.map(qr => (
                  <button
                    key={qr}
                    onClick={() => sendMessage(qr)}
                    style={{
                      background: TOKENS.violetDim,
                      border: `1px solid ${TOKENS.borderAccent}`,
                      borderRadius: 999,
                      color: TOKENS.txt2,
                      fontSize: 11.5,
                      padding: '4px 10px',
                      cursor: 'pointer',
                      transition: 'background 0.15s, color 0.15s',
                      letterSpacing: '0.01em',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = `rgba(139,124,200,0.30)`;
                      (e.currentTarget as HTMLButtonElement).style.color = TOKENS.txt;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = TOKENS.violetDim;
                      (e.currentTarget as HTMLButtonElement).style.color = TOKENS.txt2;
                    }}
                  >
                    {qr}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 12px 12px',
                borderTop: `1px solid rgba(114,166,183,0.15)`,
                flexShrink: 0,
                background: `rgba(8,4,22,0.95)`,
              }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={lang === 'hi' ? 'कुछ पूछें…' : 'Ask anything…'}
                disabled={loading}
                style={{
                  flex: 1,
                  background: 'rgba(114,166,183,0.08)',
                  border: `1px solid ${input ? TOKENS.borderAccent : TOKENS.border}`,
                  borderRadius: 12,
                  color: TOKENS.txt,
                  fontSize: 13.5,
                  padding: '8px 12px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  caretColor: TOKENS.violet,
                }}
                onFocus={e => { (e.currentTarget as HTMLInputElement).style.borderColor = TOKENS.violet; }}
                onBlur={e => { (e.currentTarget as HTMLInputElement).style.borderColor = input ? TOKENS.borderAccent : TOKENS.border; }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                aria-label="Send"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: input.trim() && !loading
                    ? `linear-gradient(135deg, #C0A860, #D4B870)`
                    : 'rgba(8,4,22,0.72)',
                  border: `1px solid ${input.trim() && !loading ? TOKENS.gold : TOKENS.border}`,
                  color: input.trim() && !loading ? '#060310' : TOKENS.txt3,
                  fontSize: 16,
                  cursor: input.trim() && !loading ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.2s',
                }}
              >
                ➤
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default JyotiChat;
