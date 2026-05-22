import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Design tokens ──────────────────────────────────────────────────────────
const T = {
  bg: "#0D0A1E",
  violet: "#8B7CC8",
  violet2: "#A99BD9",
  gold: "#D4B870",
  goldDim: "#A08050",
  txt: "#F0EBF4",
  txt2: "#B0A0C8",
  txt3: "#8090B5",
  glass: "rgba(255,255,255,0.05)",
  glassBorder: "rgba(255,255,255,0.10)",
  glassBorderHover: "rgba(212,184,112,0.35)",
  error: "#E05050",
};

const FONTS = {
  display: "'Syne', sans-serif",
  heading: "'Outfit', sans-serif",
  body: "'Inter', sans-serif",
};

// ── Shared styles ──────────────────────────────────────────────────────────
const S = {
  input: {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: `1px solid ${T.glassBorder}`,
    borderRadius: 8,
    padding: "10px 14px",
    color: T.txt,
    fontFamily: FONTS.body,
    fontSize: 14,
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  },
  label: {
    display: "block",
    fontFamily: FONTS.heading,
    fontSize: 11,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: T.txt3,
    marginBottom: 6,
  },
  pill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "rgba(139,124,200,0.12)",
    border: `1px solid rgba(139,124,200,0.25)`,
    borderRadius: 20,
    padding: "4px 12px",
    fontFamily: FONTS.heading,
    fontSize: 11,
    letterSpacing: "0.06em",
    color: T.violet2,
  },
};

// ── Animation variants ─────────────────────────────────────────────────────
const pageVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.10, delayChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const logoVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const cardContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

// ── Orb ───────────────────────────────────────────────────────────────────
function FloatingOrb({ size, color, initial, animate, style }) {
  return (
    <motion.div
      initial={initial}
      animate={animate}
      transition={{ repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        filter: "blur(60px)",
        opacity: 0.18,
        pointerEvents: "none",
        ...style,
      }}
    />
  );
}

// ── Feature card ──────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ scale: 1.02 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        flex: 1,
        minWidth: 0,
        background: T.glass,
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: `1px solid ${hovered ? T.glassBorderHover : T.glassBorder}`,
        borderRadius: 12,
        padding: "16px 14px",
        textAlign: "center",
        cursor: "default",
        transition: "border-color 0.25s",
      }}
    >
      <div style={{ fontSize: 22, marginBottom: 8, color: T.gold }}>{icon}</div>
      <div style={{ fontFamily: FONTS.heading, fontSize: 13, fontWeight: 600, color: T.txt, marginBottom: 4 }}>
        {title}
      </div>
      <div style={{ fontFamily: FONTS.body, fontSize: 11, color: T.txt3, lineHeight: 1.5 }}>{desc}</div>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────
const BACKEND = "https://vedavision-backend.onrender.com";

export default function HeroPage({ onChartReady, onLogout, onBack }) {
  const [form, setForm] = useState({ name: "", dob: "", tob: "", pob: "", gender: "" });
  const [approxTime, setApproxTime] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [btnHover, setBtnHover] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.dob) e.dob = "Date of birth is required";
    if (!form.pob.trim()) e.pob = "Place of birth is required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    setErrors(e2);
    if (Object.keys(e2).length) return;
    setLoading(true);
    setApiError("");
    try {
      const res = await fetch(`${BACKEND}/chart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          dob: form.dob,
          tob: form.tob || "00:00",
          pob: form.pob.trim(),
          gender: form.gender,
          approxTime,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Server error ${res.status}`);
      }
      const chart = await res.json();
      onChartReady(chart);
    } catch (err) {
      setApiError(err.message || "Could not reach server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (ev) => {
    setForm((f) => ({ ...f, [field]: ev.target.value }));
    if (errors[field]) setErrors((e) => { const n = { ...e }; delete n[field]; return n; });
  };

  const inputStyle = (field) => ({
    ...S.input,
    borderColor: errors[field] ? T.error : T.glassBorder,
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: T.bg,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: 48,
        paddingBottom: 64,
      }}
    >
      {/* ── Nebula background ── */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          background: [
            `radial-gradient(ellipse 80% 60% at 20% 10%, rgba(139,124,200,0.18) 0%, transparent 65%)`,
            `radial-gradient(ellipse 60% 50% at 80% 80%, rgba(80,50,140,0.14) 0%, transparent 60%)`,
            `radial-gradient(ellipse 40% 40% at 55% 45%, rgba(212,184,112,0.06) 0%, transparent 55%)`,
            T.bg,
          ].join(", "),
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ── Floating orbs ── */}
      <FloatingOrb
        size={360}
        color="rgba(139,124,200,0.7)"
        initial={{ x: 0, y: 0 }}
        animate={{ x: 30, y: -40 }}
        style={{ top: "5%", left: "5%", zIndex: 0 }}
        transition={{ duration: 8 }}
      />
      <FloatingOrb
        size={280}
        color="rgba(212,184,112,0.6)"
        initial={{ x: 0, y: 0 }}
        animate={{ x: -25, y: 35 }}
        style={{ bottom: "10%", right: "8%", zIndex: 0 }}
        transition={{ duration: 11 }}
      />
      <FloatingOrb
        size={200}
        color="rgba(80,50,180,0.7)"
        initial={{ x: 0, y: 0 }}
        animate={{ x: 20, y: -20 }}
        style={{ top: "40%", right: "20%", zIndex: 0 }}
        transition={{ duration: 14 }}
      />

      {/* ── Top-right nav ── */}
      <div style={{ position: 'fixed', top: 16, right: 20, zIndex: 100, display: 'flex', gap: 8 }}>
        {onBack && (
          <button onClick={onBack} style={{ background:'rgba(212,184,112,0.10)', border:'1px solid rgba(212,184,112,0.30)', borderRadius:8, padding:'7px 14px', fontFamily:FONTS.body, fontSize:12, color:'#D4B870', cursor:'pointer' }}>
            ← My Dashboard
          </button>
        )}
        {onLogout && (
          <button onClick={onLogout} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.10)', borderRadius:8, padding:'7px 14px', fontFamily:FONTS.body, fontSize:12, color:T.txt3, cursor:'pointer' }}>
            Sign out
          </button>
        )}
      </div>

      {/* ── Content ── */}
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 520,
          padding: "0 20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
        }}
      >
        {/* Logo ring */}
        <motion.div variants={logoVariants} style={{ marginBottom: 24 }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              border: `2px solid ${T.gold}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              boxShadow: `0 0 28px rgba(212,184,112,0.18)`,
            }}
          >
            {/* Inner dot */}
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: T.gold,
                boxShadow: `0 0 12px ${T.gold}`,
              }}
            />
            {/* Tick mark at top */}
            <div
              style={{
                position: "absolute",
                top: -4,
                left: "50%",
                transform: "translateX(-50%)",
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: T.gold,
              }}
            />
          </motion.div>
        </motion.div>

        {/* Badge */}
        <motion.div variants={itemVariants} style={{ marginBottom: 20 }}>
          <div style={S.pill}>✦ AI-Powered · Vedic-first · Free</div>
        </motion.div>

        {/* H1 */}
        <motion.h1
          variants={itemVariants}
          style={{
            fontFamily: FONTS.display,
            fontSize: "clamp(48px, 10vw, 72px)",
            fontWeight: 700,
            margin: "0 0 14px",
            textAlign: "center",
            lineHeight: 1.05,
            background: `linear-gradient(135deg, ${T.gold} 0%, ${T.violet2} 55%, ${T.txt} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          VedaVision
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          style={{
            fontFamily: FONTS.body,
            fontSize: 15,
            color: T.txt2,
            textAlign: "center",
            margin: "0 0 22px",
            lineHeight: 1.6,
            maxWidth: 400,
          }}
        >
          Your birth chart decoded —{" "}
          <em style={{ color: T.violet2, fontStyle: "italic" }}>reflection, not prediction</em>
        </motion.p>

        {/* Meta pills */}
        <motion.div
          variants={itemVariants}
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            justifyContent: "center",
            marginBottom: 28,
          }}
        >
          {["Swiss Ephemeris", "Lahiri Ayanamsa", "Reflection Only"].map((label) => (
            <div
              key={label}
              style={{
                ...S.pill,
                fontSize: 10,
                padding: "3px 10px",
                background: "rgba(255,255,255,0.04)",
                borderColor: "rgba(255,255,255,0.10)",
                color: T.txt3,
              }}
            >
              {label}
            </div>
          ))}
        </motion.div>

        {/* Feature cards */}
        <motion.div
          variants={cardContainerVariants}
          style={{
            display: "flex",
            gap: 10,
            width: "100%",
            marginBottom: 28,
          }}
        >
          <FeatureCard icon="⬡" title="Birth Chart" desc="North Indian Rāśi chart with planetary positions & dignities" />
          <FeatureCard icon="✦" title="Jyoti AI" desc="Scholarly Vedic guide for reflection — never directs decisions" />
          <FeatureCard icon="◷" title="Daśā Timeline" desc="Vimśottarī 120-year sequence for contemplative inquiry" />
        </motion.div>

        {/* Birth form */}
        <motion.div
          variants={itemVariants}
          style={{
            width: "100%",
            background: T.glass,
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            border: `1px solid ${T.glassBorder}`,
            borderRadius: 16,
            padding: "28px 24px",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              fontFamily: FONTS.heading,
              fontSize: 13,
              fontWeight: 600,
              color: T.txt2,
              letterSpacing: "0.05em",
              marginBottom: 20,
              textAlign: "center",
            }}
          >
            Enter your birth details
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Full Name */}
              <div>
                <label style={S.label}>Full Name</label>
                <input
                  type="text"
                  placeholder="As it appears on records"
                  value={form.name}
                  onChange={handleChange("name")}
                  style={inputStyle("name")}
                  autoComplete="name"
                />
                {errors.name && (
                  <div style={{ fontFamily: FONTS.body, fontSize: 11, color: T.error, marginTop: 4 }}>
                    {errors.name}
                  </div>
                )}
              </div>

              {/* DOB + TOB */}
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={S.label}>Date of Birth</label>
                  <input
                    type="date"
                    value={form.dob}
                    onChange={handleChange("dob")}
                    style={{
                      ...inputStyle("dob"),
                      colorScheme: "dark",
                    }}
                  />
                  {errors.dob && (
                    <div style={{ fontFamily: FONTS.body, fontSize: 11, color: T.error, marginTop: 4 }}>
                      {errors.dob}
                    </div>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <label style={S.label}>Time of Birth {approxTime && <span style={{ color: T.goldDim }}>(approx)</span>}</label>
                  <input
                    type="time"
                    value={form.tob}
                    onChange={handleChange("tob")}
                    style={{ ...S.input, colorScheme: "dark" }}
                    disabled={approxTime && !form.tob}
                  />
                </div>
              </div>

              {/* Approximate time toggle */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setApproxTime((v) => !v)}
                  style={{
                    width: 36,
                    height: 20,
                    borderRadius: 10,
                    background: approxTime ? T.violet : "rgba(255,255,255,0.10)",
                    border: "none",
                    cursor: "pointer",
                    position: "relative",
                    transition: "background 0.2s",
                    padding: 0,
                    flexShrink: 0,
                  }}
                  aria-label="Toggle approximate time"
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 2,
                      left: approxTime ? 18 : 2,
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: "#fff",
                      transition: "left 0.2s",
                    }}
                  />
                </button>
                <span style={{ fontFamily: FONTS.body, fontSize: 12, color: T.txt3 }}>
                  Approximate birth time (reduces accuracy of lagna)
                </span>
              </div>

              {/* Place */}
              <div>
                <label style={S.label}>Place of Birth</label>
                <input
                  type="text"
                  placeholder="City, Country"
                  value={form.pob}
                  onChange={handleChange("pob")}
                  style={inputStyle("pob")}
                  autoComplete="country"
                />
                {errors.pob && (
                  <div style={{ fontFamily: FONTS.body, fontSize: 11, color: T.error, marginTop: 4 }}>
                    {errors.pob}
                  </div>
                )}
              </div>

              {/* Gender */}
              <div>
                <label style={S.label}>Gender <span style={{ color:T.txt3, fontSize:10 }}>(optional)</span></label>
                <select
                  value={form.gender}
                  onChange={handleChange('gender')}
                  style={{ ...S.input, colorScheme:'dark' }}
                >
                  <option value="">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* API error */}
              {apiError && (
                <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(224,80,80,0.10)", border: "1px solid rgba(224,80,80,0.30)", fontFamily: FONTS.body, fontSize: 13, color: T.error }}>
                  {apiError}
                </div>
              )}

              {/* Submit */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onHoverStart={() => setBtnHover(true)}
                onHoverEnd={() => setBtnHover(false)}
                disabled={loading}
                style={{
                  position: "relative",
                  overflow: "hidden",
                  width: "100%",
                  padding: "13px 24px",
                  borderRadius: 10,
                  border: "none",
                  background: `linear-gradient(135deg, #A08050 0%, ${T.gold} 50%, #C8A850 100%)`,
                  color: "#0D0A1E",
                  fontFamily: FONTS.heading,
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.75 : 1,
                  transition: "opacity 0.2s",
                  marginTop: 4,
                }}
              >
                {/* Shine sweep */}
                <AnimatePresence>
                  {btnHover && !loading && (
                    <motion.div
                      initial={{ x: "-100%", opacity: 0.6 }}
                      animate={{ x: "120%", opacity: 0 }}
                      exit={{}}
                      transition={{ duration: 0.55, ease: "easeIn" }}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "60%",
                        height: "100%",
                        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
                        pointerEvents: "none",
                      }}
                    />
                  )}
                </AnimatePresence>
                {loading ? "Calculating positions…" : "Reveal My Chart →"}
              </motion.button>
            </div>
          </form>

          {/* Trust badges */}
          <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap', marginTop:12 }}>
            {['🔒 Private · never shared', '✓ Real Swiss Ephemeris', '⭐ 11 features'].map(b => (
              <span key={b} style={{
                fontSize:11, color:T.txt3, fontFamily:FONTS.body,
                background:'rgba(255,255,255,0.04)',
                border:'1px solid rgba(255,255,255,0.08)',
                borderRadius:20, padding:'3px 10px',
              }}>{b}</span>
            ))}
          </div>

          {/* Demo link */}
          <div style={{ textAlign: "center", marginTop: 14 }}>
            <button
              type="button"
              onClick={async () => {
                setLoading(true); setApiError('');
                try {
                  const res = await fetch(`${BACKEND}/chart`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name:'Demo Chart', dob:'1990-08-15', tob:'06:30', pob:'New Delhi, India' }) });
                  const chart = res.ok ? await res.json() : null;
                  onChartReady(chart || { name:'Demo Chart', dob:'1990-08-15', tob:'06:30', pob:'New Delhi, India' });
                } catch { onChartReady({ name:'Demo Chart', dob:'1990-08-15', tob:'06:30', pob:'New Delhi, India' }); }
                finally { setLoading(false); }
              }}
              style={{
                background: "none",
                border: "none",
                fontFamily: FONTS.body,
                fontSize: 12,
                color: T.txt3,
                cursor: "pointer",
                textDecoration: "underline",
                textDecorationColor: "rgba(128,144,181,0.35)",
                padding: 0,
              }}
            >
              See a sample chart first →
            </button>
          </div>
        </motion.div>

        {/* Bottom stats */}
        <motion.div
          variants={itemVariants}
          style={{
            display: "flex",
            gap: 24,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {[
            { value: "12", label: "Houses" },
            { value: "9", label: "Grahas" },
            { value: "27", label: "Nakshatras" },
            { value: "120y", label: "Daśā Span" },
          ].map(({ value, label }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: FONTS.display, fontSize: 20, fontWeight: 700, color: T.gold }}>
                {value}
              </div>
              <div style={{ fontFamily: FONTS.body, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: T.txt3 }}>
                {label}
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
