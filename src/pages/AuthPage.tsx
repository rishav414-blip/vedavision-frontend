import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Design tokens ──────────────────────────────────────────────────────────
const T = {
  bg: "#0F0524",
  surface: "rgba(26,14,50,0.75)",
  border: "rgba(114,166,183,0.18)",
  violet: "#72A6B7",
  violet2: "#72A6B7",
  gold: "#D4B870",
  txt: "#E8E0F0",
  txt2: "#B8B0C8",
  txt3: "#7A6A9A",
  error: "#E05050",
};

const FONTS = {
  display: "'Syne', sans-serif",
  heading: "'Outfit', sans-serif",
  body: "'Inter', sans-serif",
};

// ── Session utilities (exported) ───────────────────────────────────────────
export interface VVUser {
  name: string;
  email: string;
  plan: string;
}

const SESSION_KEY = "vv_session";
const USERS_KEY = "vv_users";

export function getSession(): VVUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as VVUser) : null;
  } catch {
    return null;
  }
}

export function saveSession(user: VVUser): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

interface StoredUser {
  name: string;
  email: string;
  password: string;
  plan: string;
}

function getUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as StoredUser[]) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'vv_salt_2026')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// ── Props ──────────────────────────────────────────────────────────────────
interface AuthPageProps {
  onEnter: (user: VVUser) => void;
  onPreviewTour: () => void;
}

// ── Shine keyframes (injected once) ───────────────────────────────────────
const SHINE_ID = "vv-auth-shine-style";
if (!document.getElementById(SHINE_ID)) {
  const style = document.createElement("style");
  style.id = SHINE_ID;
  style.textContent = `
    @keyframes vv-shine {
      0%   { transform: translateX(-120%) skewX(-20deg); }
      100% { transform: translateX(300%)  skewX(-20deg); }
    }
    @keyframes vv-spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    @keyframes vv-pulse-ring {
      0%, 100% { opacity: 0.55; }
      50%       { opacity: 1; }
    }
    .vv-input:focus {
      border-color: rgba(114,166,183,0.5) !important;
      outline: none;
    }
    .vv-link {
      color: #72A6B7;
      cursor: pointer;
      text-decoration: none;
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      transition: color 0.2s;
    }
    .vv-link:hover { color: #D4B870; }
  `;
  document.head.appendChild(style);
}

// ── Floating Orb ──────────────────────────────────────────────────────────
interface OrbProps {
  size: number;
  color: string;
  top?: string | number;
  left?: string | number;
  right?: string | number;
  bottom?: string | number;
  duration: number;
  yRange: number;
}

function FloatingOrb({ size, color, top, left, right, bottom, duration, yRange }: OrbProps) {
  return (
    <motion.div
      animate={{ y: [0, -yRange, 0], x: [0, yRange * 0.4, 0] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        filter: `blur(${size * 0.55}px)`,
        opacity: 0.18,
        pointerEvents: "none",
        top,
        left,
        right,
        bottom,
      }}
    />
  );
}

// ── Input field ───────────────────────────────────────────────────────────
interface FieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}

function Field({ label, type = "text", value, onChange, placeholder, autoComplete }: FieldProps) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label
        style={{
          display: "block",
          fontFamily: FONTS.heading,
          fontSize: 11,
          letterSpacing: "0.08em",
          textTransform: "uppercase" as const,
          color: T.txt3,
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      <input
        className="vv-input"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        style={{
          width: "100%",
          background: "rgba(255,255,255,0.04)",
          border: `1px solid rgba(114,166,183,0.2)`,
          borderRadius: 10,
          padding: "11px 14px",
          color: T.txt,
          fontFamily: FONTS.body,
          fontSize: 14,
          transition: "border-color 0.2s",
          boxSizing: "border-box" as const,
        }}
      />
    </div>
  );
}

// ── Primary button ────────────────────────────────────────────────────────
interface BtnProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}

function PrimaryBtn({ children, onClick, type = "button", disabled }: BtnProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.97 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        padding: "13px 0",
        background: "linear-gradient(135deg, #C0A860, #D4B870)",
        border: "none",
        borderRadius: 50,
        color: "#0F0524",
        fontFamily: FONTS.heading,
        fontSize: 14,
        fontWeight: 700,
        letterSpacing: "0.04em",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "box-shadow 0.3s",
        marginTop: 4,
        boxShadow: hovered
          ? "0 6px 30px rgba(192,168,96,0.45)"
          : "0 4px 20px rgba(192,168,96,0.3)",
      }}
    >
      {/* Shine sweep */}
      {hovered && (
        <span
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "40%",
            height: "100%",
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
            animation: "vv-shine 0.6s ease forwards",
            pointerEvents: "none",
          }}
        />
      )}
      {children}
    </motion.button>
  );
}

// ── Error message ─────────────────────────────────────────────────────────
function ErrorMsg({ msg }: { msg: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      style={{
        background: "rgba(224,80,80,0.12)",
        border: `1px solid rgba(224,80,80,0.3)`,
        borderRadius: 8,
        padding: "10px 14px",
        fontFamily: FONTS.body,
        fontSize: 13,
        color: T.error,
        marginBottom: 16,
      }}
    >
      {msg}
    </motion.div>
  );
}

// ── Login Form ────────────────────────────────────────────────────────────
function LoginForm({
  onEnter,
  onPreviewTour,
  onSwitchTab,
}: {
  onEnter: (u: VVUser) => void;
  onPreviewTour: () => void;
  onSwitchTab: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const users = getUsers();
    const candidate = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!candidate) {
      setError("Invalid email or password");
      return;
    }
    const hashed = await hashPassword(password);
    // Migration: if stored password is not 64 chars it's plain text — compare plain, then upgrade
    if (candidate.password.length !== 64) {
      if (candidate.password !== password) {
        setError("Invalid email or password");
        return;
      }
      // Upgrade to hashed
      const updated = users.map((u) =>
        u.email.toLowerCase() === email.toLowerCase() ? { ...u, password: hashed } : u
      );
      saveUsers(updated);
    } else if (candidate.password !== hashed) {
      setError("Invalid email or password");
      return;
    }
    const user: VVUser = { name: candidate.name, email: candidate.email, plan: candidate.plan };
    saveSession(user);
    onEnter(user);
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: "28px 24px" }}>
      <AnimatePresence mode="wait">
        {error && <ErrorMsg key="err" msg={error} />}
      </AnimatePresence>

      <Field
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="you@example.com"
        autoComplete="email"
      />
      <Field
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
        placeholder="••••••••"
        autoComplete="current-password"
      />

      <PrimaryBtn type="submit">Sign In →</PrimaryBtn>

      <div style={{ textAlign: "center", marginTop: 18 }}>
        <span style={{ fontFamily: FONTS.body, fontSize: 13, color: T.txt3 }}>
          Don't have an account?{" "}
        </span>
        <span className="vv-link" onClick={onSwitchTab}>
          Create one →
        </span>
      </div>

      <div style={{ textAlign: "center", marginTop: 12 }}>
        <span
          className="vv-link"
          style={{ fontSize: 12, color: T.txt3 }}
          onClick={onPreviewTour}
        >
          Or continue with demo account
        </span>
      </div>
    </form>
  );
}

// ── Signup Form ───────────────────────────────────────────────────────────
function SignupForm({
  onEnter,
  onSwitchTab,
}: {
  onEnter: (u: VVUser) => void;
  onSwitchTab: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be 6+ characters");
      return;
    }

    const users = getUsers();
    const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      setError("Email already registered");
      return;
    }

    const hashed = await hashPassword(password);
    const newUser: StoredUser = { name: name.trim(), email: email.toLowerCase(), password: hashed, plan: "free" };
    saveUsers([...users, newUser]);

    const session: VVUser = { name: newUser.name, email: newUser.email, plan: "free" };
    saveSession(session);
    onEnter(session);
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: "28px 24px" }}>
      <AnimatePresence mode="wait">
        {error && <ErrorMsg key="err" msg={error} />}
      </AnimatePresence>

      <Field
        label="Full Name"
        value={name}
        onChange={setName}
        placeholder="Arjuna Sharma"
        autoComplete="name"
      />
      <Field
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="you@example.com"
        autoComplete="email"
      />
      <Field
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
        placeholder="Min. 6 characters"
        autoComplete="new-password"
      />

      <PrimaryBtn type="submit">Create Account →</PrimaryBtn>

      <div style={{ textAlign: "center", marginTop: 18 }}>
        <span style={{ fontFamily: FONTS.body, fontSize: 13, color: T.txt3 }}>
          Already have an account?{" "}
        </span>
        <span className="vv-link" onClick={onSwitchTab}>
          Sign in →
        </span>
      </div>
    </form>
  );
}

// ── Main Component ────────────────────────────────────────────────────────
export default function AuthPage({ onEnter, onPreviewTour }: AuthPageProps) {
  const [tab, setTab] = useState<"login" | "signup">("login");

  const formVariants = {
    enter: (dir: number) => ({ opacity: 0, y: dir * 12 }),
    center: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const } },
    exit: (dir: number) => ({ opacity: 0, y: dir * -8, transition: { duration: 0.2 } }),
  };

  const [tabDir, setTabDir] = useState(1);

  const switchTo = (next: "login" | "signup") => {
    if (next === tab) return;
    setTabDir(next === "signup" ? 1 : -1);
    setTab(next);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: T.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        fontFamily: FONTS.body,
      }}
    >
      {/* Background radial nebula */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(114,166,183,0.12) 0%, transparent 70%), " +
            "radial-gradient(ellipse 60% 40% at 10% 90%, rgba(114,166,183,0.07) 0%, transparent 60%), " +
            "radial-gradient(ellipse 50% 50% at 90% 80%, rgba(212,184,112,0.07) 0%, transparent 55%)",
          pointerEvents: "none",
        }}
      />

      {/* Floating orbs */}
      <FloatingOrb size={320} color="#72A6B7" top="-8%" left="-6%" duration={9} yRange={30} />
      <FloatingOrb size={260} color="#4A8A9A" top="55%" right="-5%" duration={11} yRange={24} />
      <FloatingOrb size={200} color="#D4B870" bottom="-4%" left="38%" duration={8} yRange={20} />

      {/* Centered card column */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: 420,
          padding: "0 20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Logo ring */}
        <div style={{ position: "relative", width: 80, height: 80, marginBottom: 20 }}>
          {/* Spinning outer ring */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: `2px solid ${T.gold}`,
              borderTopColor: "transparent",
              animation: "vv-spin 4s linear infinite",
            }}
          />
          {/* Pulsing inner ring */}
          <div
            style={{
              position: "absolute",
              inset: 8,
              borderRadius: "50%",
              border: `1px solid rgba(212,184,112,0.35)`,
              animation: "vv-pulse-ring 3s ease-in-out infinite",
            }}
          />
          {/* Center dot */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: T.gold,
              boxShadow: `0 0 16px ${T.gold}`,
            }}
          />
        </div>

        {/* Title */}
        <h1
          style={{
            fontFamily: FONTS.display,
            fontWeight: 800,
            fontSize: 30,
            margin: "0 0 8px",
            background: `linear-gradient(135deg, #D4B870 0%, #72A6B7 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "-0.02em",
            textAlign: "center",
          }}
        >
          VedaVision
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontFamily: FONTS.heading,
            fontSize: 14,
            color: T.txt2,
            margin: "0 0 28px",
            textAlign: "center",
            letterSpacing: "0.01em",
          }}
        >
          Your cosmic destiny, decoded.
        </p>

        {/* Tab switcher */}
        <div
          style={{
            display: "flex",
            background: "rgba(26,14,50,0.5)",
            border: `1px solid ${T.border}`,
            borderRadius: 12,
            padding: 4,
            marginBottom: 16,
            width: "100%",
          }}
        >
          {(["login", "signup"] as const).map((t) => (
            <button
              key={t}
              onClick={() => switchTo(t)}
              style={{
                flex: 1,
                padding: "9px 0",
                border: "none",
                borderRadius: 9,
                fontFamily: FONTS.heading,
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "0.03em",
                cursor: "pointer",
                transition: "background 0.25s, color 0.25s",
                background: tab === t ? T.violet : "transparent",
                color: tab === t ? "#fff" : T.txt3,
              }}
            >
              {t === "login" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        {/* Glass card with animated form */}
        <div
          style={{
            width: "100%",
            background: "rgba(26,14,50,0.75)",
            border: "1px solid rgba(114,166,183,0.18)",
            borderRadius: 24,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            overflow: "hidden",
            position: "relative",
            boxShadow: "0 8px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          <AnimatePresence mode="wait" custom={tabDir}>
            {tab === "login" ? (
              <motion.div
                key="login"
                custom={tabDir}
                variants={formVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <LoginForm
                  onEnter={onEnter}
                  onPreviewTour={onPreviewTour}
                  onSwitchTab={() => switchTo("signup")}
                />
              </motion.div>
            ) : (
              <motion.div
                key="signup"
                custom={tabDir}
                variants={formVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <SignupForm onEnter={onEnter} onSwitchTab={() => switchTo("login")} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom "see sample chart" link */}
        <div style={{ marginTop: 22, textAlign: "center" }}>
          <span
            className="vv-link"
            style={{ fontSize: 13, color: T.txt3 }}
            onClick={onPreviewTour}
          >
            See a sample chart first →
          </span>
        </div>
      </motion.div>
    </div>
  );
}
