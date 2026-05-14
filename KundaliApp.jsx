/**
 * KundaliApp.jsx — Celestial Noir Jyotish Interface
 * Design direction: dark-academia-meets-Jyotish, not neon-mystical
 * Palette: midnight blue · deep violet · muted gold · parchment
 * Typography: Cormorant Garamond (serif) + Inter (UI sans)
 *
 * HOW TO SWAP IN REAL CALCULATION:
 * Replace the SAMPLE_CHART object below with output from swisseph-wasm
 * (Lahiri ayanamsa). The data shape is intentionally kept minimal and
 * matches what the ephemeris will give you — one file edit, done.
 */

import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────
//  SAMPLE DATA  (replace with real ephemeris output)
// ─────────────────────────────────────────────
const SAMPLE_CHART = {
  native: { name: "Sample Native", dob: "1990-03-15", tob: "06:45", pob: "Mumbai, India" },
  lagna: { sign: "Pisces", lord: "Jupiter", degree: "14°22′" },
  houses: [
    { id: 1,  sign: "Pisces",      planets: ["Lagna"] },
    { id: 2,  sign: "Aries",       planets: [] },
    { id: 3,  sign: "Taurus",      planets: ["Mercury"] },
    { id: 4,  sign: "Gemini",      planets: [] },
    { id: 5,  sign: "Cancer",      planets: ["Moon"] },
    { id: 6,  sign: "Leo",         planets: [] },
    { id: 7,  sign: "Virgo",       planets: [] },
    { id: 8,  sign: "Libra",       planets: ["Saturn", "Rahu"] },
    { id: 9,  sign: "Scorpio",     planets: [] },
    { id: 10, sign: "Sagittarius", planets: ["Sun", "Mars"] },
    { id: 11, sign: "Capricorn",   planets: ["Venus"] },
    { id: 12, sign: "Aquarius",    planets: ["Jupiter", "Ketu"] },
  ],
  nakshatra: { name: "Uttara Bhadrapada", pada: 2, lord: "Saturn" },
  yoga: ["Gajakesari Yoga", "Budha-Aditya Yoga"],
  dasha: {
    current: { planet: "Jupiter", start: "2019-11-15", end: "2035-11-15" },
    antardasha: { planet: "Saturn", start: "2024-03-01", end: "2026-09-01" },
    sequence: [
      { planet: "Sun",     years: 6,  start: "2001", end: "2007" },
      { planet: "Moon",    years: 10, start: "2007", end: "2017" },
      { planet: "Mars",    years: 7,  start: "2017", end: "2024" },
      { planet: "Rahu",    years: 18, start: "2024", end: "2042" },
      { planet: "Jupiter", years: 16, start: "2042", end: "2058" },
      { planet: "Saturn",  years: 19, start: "2058", end: "2077" },
      { planet: "Mercury", years: 17, start: "2077", end: "2094" },
      { planet: "Ketu",    years: 7,  start: "2094", end: "2101" },
      { planet: "Venus",   years: 20, start: "2101", end: "2121" },
    ],
  },
};

// ─────────────────────────────────────────────
//  CONSTANTS & HELPERS
// ─────────────────────────────────────────────
const PLANET_GLYPHS = {
  Sun: "☉", Moon: "☽", Mercury: "☿", Venus: "♀", Mars: "♂",
  Jupiter: "♃", Saturn: "♄", Rahu: "☊", Ketu: "☋", Lagna: "Asc",
};

const SIGN_ABBR = {
  Aries: "Ar", Taurus: "Ta", Gemini: "Ge", Cancer: "Ca",
  Leo: "Le", Virgo: "Vi", Libra: "Li", Scorpio: "Sc",
  Sagittarius: "Sg", Capricorn: "Cp", Aquarius: "Aq", Pisces: "Pi",
};

// North-Indian chart house positions (grid coords 0-3 for a 4×4 grid)
// Each entry: [col, row, shape] where shape drives the SVG clip
const HOUSE_GRID = {
  1:  { col: 1, row: 0, w: 1, h: 1, label: "top-mid-upper" },
  2:  { col: 0, row: 0, w: 1, h: 1 },
  3:  { col: 0, row: 1, w: 1, h: 1 },
  4:  { col: 0, row: 2, w: 1, h: 1 },  // ← left column
  5:  { col: 1, row: 2, w: 1, h: 1 },
  6:  { col: 2, row: 2, w: 1, h: 1 },
  7:  { col: 3, row: 2, w: 1, h: 1 },
  8:  { col: 3, row: 1, w: 1, h: 1 },
  9:  { col: 3, row: 0, w: 1, h: 1 },
  10: { col: 2, row: 0, w: 1, h: 1 },
  11: { col: 2, row: 1, w: 1, h: 1 },
  12: { col: 1, row: 1, w: 1, h: 1 },  // center-left
};

const TABS = ["Chart", "Planets", "Time Cycles", "Themes", "Practices"];

const PLANET_COLOR = {
  Sun: "#F5C842", Moon: "#D0D8F0", Mercury: "#7EC8A0", Venus: "#E48DB0",
  Mars: "#E05050", Jupiter: "#F0A830", Saturn: "#A08050", Rahu: "#8855CC",
  Ketu: "#CC8855", Lagna: "#AACCFF",
};

// ─────────────────────────────────────────────
//  STAR FIELD
// ─────────────────────────────────────────────
function StarField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;

    const stars = Array.from({ length: 180 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.2 + 0.2,
      alpha: Math.random(),
      speed: Math.random() * 0.008 + 0.002,
      phase: Math.random() * Math.PI * 2,
    }));

    let raf;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      stars.forEach((s) => {
        const a = prefersReduced ? s.alpha : 0.3 + 0.7 * Math.abs(Math.sin(t * s.speed + s.phase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(210,220,255,${a.toFixed(3)})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed", inset: 0, width: "100%", height: "100%",
        pointerEvents: "none", zIndex: 0,
      }}
    />
  );
}

// ─────────────────────────────────────────────
//  NORTH-INDIAN SVG CHART
// ─────────────────────────────────────────────
function NorthIndianChart({ chart, onHouseClick }) {
  const SIZE = 340;
  const CELL = SIZE / 4;

  // Build diamond paths for each house
  // Houses 1,2,3... map to cells using HOUSE_GRID
  const houseBoxes = Object.entries(HOUSE_GRID).map(([hNum, g]) => {
    const h = chart.houses[parseInt(hNum) - 1];
    const x = g.col * CELL;
    const y = g.row * CELL;
    const cx = x + CELL / 2;
    const cy = y + CELL / 2;

    // For houses 1,4,7,10 (corners of the big square) use diamond; others use square
    const corner = [1, 4, 7, 10].includes(parseInt(hNum));
    let path;
    if (corner) {
      // Diamond inside the cell
      path = `M${cx},${y} L${x + CELL},${cy} L${cx},${y + CELL} L${x},${cy} Z`;
    } else {
      path = `M${x},${y} L${x + CELL},${y} L${x + CELL},${y + CELL} L${x},${y + CELL} Z`;
    }

    return { hNum: parseInt(hNum), h, x, y, cx, cy, CELL, path, corner };
  });

  return (
    <svg
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      style={{ display: "block", margin: "0 auto" }}
    >
      {/* Outer border */}
      <rect x={1} y={1} width={SIZE - 2} height={SIZE - 2}
        fill="none" stroke="#4A3A6A" strokeWidth={1.5} />

      {/* Cross lines */}
      <line x1={0} y1={0} x2={SIZE} y2={SIZE} stroke="#3A2A5A" strokeWidth={0.6} />
      <line x1={SIZE} y1={0} x2={0} y2={SIZE} stroke="#3A2A5A" strokeWidth={0.6} />

      {houseBoxes.map(({ hNum, h, x, y, cx, cy, CELL, path, corner }) => (
        <g key={hNum} onClick={() => onHouseClick(hNum)} style={{ cursor: "pointer" }}>
          {/* House cell background */}
          <path
            d={path}
            fill={corner ? "rgba(30,20,55,0.85)" : "rgba(18,12,40,0.7)"}
            stroke="#5A3A8A"
            strokeWidth={0.8}
          />

          {/* House number */}
          <text
            x={cx}
            y={corner ? cy - 14 : cy - 18}
            textAnchor="middle"
            fontSize={9}
            fill="#7A6A9A"
            fontFamily="Cormorant Garamond, Georgia, serif"
          >
            {hNum}
          </text>

          {/* Sign abbreviation */}
          <text
            x={cx}
            y={corner ? cy - 2 : cy - 6}
            textAnchor="middle"
            fontSize={10}
            fill="#C0A860"
            fontFamily="Cormorant Garamond, Georgia, serif"
            fontStyle="italic"
          >
            {SIGN_ABBR[h.sign] || h.sign.slice(0, 2)}
          </text>

          {/* Planets */}
          {h.planets.map((p, i) => (
            <text
              key={p}
              x={cx + (i % 2 === 0 ? -8 : 8)}
              y={corner ? cy + 12 + Math.floor(i / 2) * 12 : cy + 8 + Math.floor(i / 2) * 12}
              textAnchor="middle"
              fontSize={13}
              fill={PLANET_COLOR[p] || "#E8E0D0"}
              fontFamily="serif"
              style={{ filter: `drop-shadow(0 0 3px ${PLANET_COLOR[p] || "#E8E0D0"})` }}
            >
              {PLANET_GLYPHS[p] || p.slice(0, 2)}
            </text>
          ))}
        </g>
      ))}

      {/* Center label */}
      <text
        x={SIZE / 2} y={SIZE / 2 - 6}
        textAnchor="middle"
        fontSize={9}
        fill="#7A6A9A"
        fontFamily="Cormorant Garamond, Georgia, serif"
        letterSpacing={1}
      >
        RĀŚI
      </text>
      <text
        x={SIZE / 2} y={SIZE / 2 + 8}
        textAnchor="middle"
        fontSize={8}
        fill="#5A4A7A"
        fontFamily="Cormorant Garamond, Georgia, serif"
      >
        CHART
      </text>
    </svg>
  );
}

// ─────────────────────────────────────────────
//  DASHA TIMELINE BAR
// ─────────────────────────────────────────────
function DashaTimeline({ dasha }) {
  const total = dasha.sequence.reduce((s, d) => s + d.years, 0);
  const now = new Date().getFullYear();
  const COLORS = {
    Sun: "#F5C842", Moon: "#D0D8F0", Mars: "#E05050", Rahu: "#8855CC",
    Jupiter: "#F0A830", Saturn: "#A08050", Mercury: "#7EC8A0",
    Ketu: "#CC8855", Venus: "#E48DB0",
  };

  // Find which segment "now" falls in
  const currentPlanet = dasha.current.planet;

  return (
    <div style={{ marginTop: 24 }}>
      <p style={{ color: "#9A8AB0", fontSize: 12, marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" }}>
        Vimshottari Dasha — 120-year cycle
      </p>
      <div style={{ display: "flex", height: 28, borderRadius: 4, overflow: "hidden", border: "1px solid #3A2A5A" }}>
        {dasha.sequence.map((d) => {
          const pct = (d.years / total) * 100;
          const isCurrent = d.planet === currentPlanet;
          return (
            <div
              key={d.planet}
              title={`${d.planet} · ${d.start}–${d.end}`}
              style={{
                width: `${pct}%`,
                background: isCurrent
                  ? `${COLORS[d.planet]}33`
                  : "rgba(30,18,50,0.6)",
                borderRight: "1px solid #2A1A3A",
                borderTop: isCurrent ? `2px solid ${COLORS[d.planet]}` : "2px solid transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 9,
                color: isCurrent ? COLORS[d.planet] : "#5A4A7A",
                cursor: "default",
                transition: "background 0.2s",
                overflow: "hidden",
              }}
            >
              {pct > 6 ? d.planet.slice(0, 3) : ""}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, gap: 12 }}>
        <div style={{
          background: "rgba(88,55,140,0.18)", border: "1px solid #5A3A8A",
          borderRadius: 6, padding: "8px 14px", flex: 1,
        }}>
          <p style={{ color: "#7A6A9A", fontSize: 10, margin: 0, letterSpacing: 1 }}>MAHĀDAŚĀ</p>
          <p style={{ color: COLORS[dasha.current.planet], fontSize: 16, margin: "2px 0 0",
            fontFamily: "Cormorant Garamond, Georgia, serif" }}>
            {dasha.current.planet}
          </p>
          <p style={{ color: "#5A4A7A", fontSize: 10, margin: 0 }}>
            {dasha.current.start} — {dasha.current.end}
          </p>
        </div>
        <div style={{
          background: "rgba(88,55,140,0.18)", border: "1px solid #5A3A8A",
          borderRadius: 6, padding: "8px 14px", flex: 1,
        }}>
          <p style={{ color: "#7A6A9A", fontSize: 10, margin: 0, letterSpacing: 1 }}>ANTARADAŚĀ</p>
          <p style={{ color: COLORS[dasha.antardasha.planet], fontSize: 16, margin: "2px 0 0",
            fontFamily: "Cormorant Garamond, Georgia, serif" }}>
            {dasha.antardasha.planet}
          </p>
          <p style={{ color: "#5A4A7A", fontSize: 10, margin: 0 }}>
            {dasha.antardasha.start} — {dasha.antardasha.end}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  HOUSE DETAIL PANEL
// ─────────────────────────────────────────────
const HOUSE_THEMES = {
  1: "Self, body, vitality, appearance, and the overall direction of life. The Lagna lord is the chart's primary indicator of agency.",
  2: "Accumulated wealth, speech, family lineage, early education, and the sense of personal worth.",
  3: "Courage, communication, short travels, siblings, and the expression of initiative.",
  4: "Home, land, mother, emotional security, vehicles, and ancestral roots.",
  5: "Creativity, children, speculation, higher intellect, mantras, and past-life merit (pūrva puṇya).",
  6: "Health, daily discipline, service, litigation, obstacles, and the refinement of skill under pressure.",
  7: "Partnership, marriage, open contracts, trade, and long-term agreements.",
  8: "Transformation, longevity, hidden resources, inheritance, occult knowledge, and fundamental change.",
  9: "Dharma, higher learning, teachers, father, long journeys, and philosophical worldview.",
  10: "Career, public standing, authority, dharmic action in the world, and the father's legacy.",
  11: "Gains, social networks, elder siblings, desires fulfilled, and the fruits of effort.",
  12: "Liberation, foreign lands, retreat, expenditure, sleep, and dissolution of ego-boundaries.",
};

function HousePanel({ houseNum, chart, onClose }) {
  const h = chart.houses[houseNum - 1];
  return (
    <div style={{
      position: "fixed", right: 0, top: 0, bottom: 0, width: 320,
      background: "linear-gradient(160deg, #130D28 0%, #0E0820 100%)",
      borderLeft: "1px solid #4A3A6A",
      padding: 28, overflowY: "auto", zIndex: 50,
      boxShadow: "-8px 0 32px rgba(0,0,0,0.6)",
    }}>
      <button
        onClick={onClose}
        style={{
          position: "absolute", top: 16, right: 16,
          background: "none", border: "none", color: "#7A6A9A",
          fontSize: 20, cursor: "pointer", lineHeight: 1,
        }}
      >✕</button>

      <p style={{ color: "#7A6A9A", fontSize: 11, margin: "0 0 4px", letterSpacing: 2, textTransform: "uppercase" }}>
        House {houseNum}
      </p>
      <h2 style={{ color: "#C0A860", fontFamily: "Cormorant Garamond, Georgia, serif",
        fontSize: 26, margin: "0 0 4px", fontWeight: 400 }}>
        {h.sign}
      </h2>

      <div style={{ height: 1, background: "linear-gradient(90deg, #5A3A8A, transparent)", margin: "14px 0" }} />

      <p style={{ color: "#C8C0D8", fontSize: 13, lineHeight: 1.7, fontFamily: "Cormorant Garamond, Georgia, serif" }}>
        {HOUSE_THEMES[houseNum]}
      </p>

      {h.planets.length > 0 && (
        <>
          <p style={{ color: "#7A6A9A", fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
            margin: "20px 0 10px" }}>
            Planets here
          </p>
          {h.planets.map((p) => (
            <div key={p} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "8px 12px", marginBottom: 8,
              background: "rgba(88,55,140,0.15)", borderRadius: 6,
              border: `1px solid ${PLANET_COLOR[p]}33`,
            }}>
              <span style={{ fontSize: 20, color: PLANET_COLOR[p],
                filter: `drop-shadow(0 0 4px ${PLANET_COLOR[p]})` }}>
                {PLANET_GLYPHS[p]}
              </span>
              <span style={{ color: "#D8D0E8", fontFamily: "Cormorant Garamond, Georgia, serif",
                fontSize: 16 }}>
                {p}
              </span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
//  TAB CONTENT PANELS
// ─────────────────────────────────────────────
function TabChart({ chart, onHouseClick }) {
  return (
    <div>
      <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        <InfoPill label="Lagna" value={`${chart.lagna.sign} · ${chart.lagna.degree}`} />
        <InfoPill label="Nakṣatra" value={`${chart.nakshatra.name} · Pāda ${chart.nakshatra.pada}`} />
        <InfoPill label="Nak. Lord" value={chart.nakshatra.lord} />
      </div>

      <NorthIndianChart chart={chart} onHouseClick={onHouseClick} />

      <div style={{ marginTop: 20 }}>
        <p style={{ color: "#7A6A9A", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>
          Active Yogas
        </p>
        {chart.yoga.map((y) => (
          <div key={y} style={{
            display: "inline-block", marginRight: 8, marginBottom: 8,
            padding: "4px 12px", border: "1px solid #5A3A8A",
            borderRadius: 20, color: "#C0A860", fontSize: 12,
            fontFamily: "Cormorant Garamond, Georgia, serif",
            background: "rgba(88,55,140,0.15)",
          }}>
            {y}
          </div>
        ))}
      </div>
    </div>
  );
}

function TabPlanets({ chart }) {
  const allPlanets = chart.houses.flatMap((h) =>
    h.planets.filter((p) => p !== "Lagna").map((p) => ({ planet: p, sign: h.sign, house: h.id }))
  );

  return (
    <div>
      <p style={{ color: "#9A8AB0", fontSize: 13, lineHeight: 1.7, marginBottom: 20,
        fontFamily: "Cormorant Garamond, Georgia, serif" }}>
        Each planet carries an essential quality. Where it sits shapes the domain it colours;
        the sign it occupies describes the mode of expression.
      </p>
      <div style={{ display: "grid", gap: 10 }}>
        {allPlanets.map(({ planet, sign, house }) => (
          <div key={planet} style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "12px 16px", borderRadius: 8,
            background: "rgba(30,18,55,0.7)",
            border: `1px solid ${PLANET_COLOR[planet]}22`,
          }}>
            <span style={{ fontSize: 24, width: 32, textAlign: "center",
              color: PLANET_COLOR[planet],
              filter: `drop-shadow(0 0 5px ${PLANET_COLOR[planet]})` }}>
              {PLANET_GLYPHS[planet]}
            </span>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, color: "#D8D0E8", fontSize: 15,
                fontFamily: "Cormorant Garamond, Georgia, serif" }}>
                {planet}
              </p>
              <p style={{ margin: 0, color: "#7A6A9A", fontSize: 11 }}>
                {sign} · House {house}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TabTimeCycles({ chart }) {
  return (
    <div>
      <p style={{ color: "#9A8AB0", fontSize: 13, lineHeight: 1.7,
        fontFamily: "Cormorant Garamond, Georgia, serif", marginBottom: 4 }}>
        The Vimśottarī system divides life into planetary periods. These are climates,
        not calendars — they describe the quality of attention a period invites,
        not outcomes it guarantees.
      </p>
      <DashaTimeline dasha={chart.dasha} />
    </div>
  );
}

function TabThemes({ chart }) {
  const themes = [
    {
      title: "The quality of mind",
      body: `With Moon in ${chart.houses[4].sign} (House 5), the reflective mind finds nourishment
      through creative play and contemplative inquiry. Emotional grounding comes through
      structured solitude rather than constant social stimulation.`,
    },
    {
      title: "The arc of work",
      body: `Sun and Mars placed together in House 10 indicate a dharmic call toward visible,
      purposeful action. The tension between solar authority and Martian drive is the
      chart's most productive friction — when channelled consciously.`,
    },
    {
      title: "Relational patterns",
      body: `The 7th lord's placement suggests partnerships flourish when they carry an
      intellectual dimension. Long-term alliances built on shared inquiry tend to be
      more sustaining than those built primarily on affection.`,
    },
    {
      title: "The inner teacher",
      body: `Jupiter and Ketu conjunct in House 12 point toward wisdom traditions and
      contemplative withdrawal as recurring themes. Losses, when they come, often
      carry hidden instruction.`,
    },
  ];

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {themes.map((t) => (
        <div key={t.title} style={{
          padding: "16px 20px", borderRadius: 8,
          background: "rgba(30,18,55,0.7)",
          border: "1px solid #3A2A5A",
        }}>
          <h3 style={{ color: "#C0A860", fontFamily: "Cormorant Garamond, Georgia, serif",
            fontSize: 17, fontWeight: 400, margin: "0 0 8px" }}>
            {t.title}
          </h3>
          <p style={{ color: "#B8B0C8", fontSize: 13, lineHeight: 1.75, margin: 0,
            fontFamily: "Cormorant Garamond, Georgia, serif" }}>
            {t.body}
          </p>
        </div>
      ))}
    </div>
  );
}

function TabPractices({ chart }) {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <SectionHead>Behavioural suggestions</SectionHead>
        <ul style={{ paddingLeft: 20, color: "#B8B0C8", fontSize: 13, lineHeight: 2,
          fontFamily: "Cormorant Garamond, Georgia, serif" }}>
          <li>Begin mornings with ten minutes of unstructured stillness before the phone.</li>
          <li>Cultivate one form of sustained creative practice — not consumption, production.</li>
          <li>Where Saturn touches the 8th, meet bureaucratic obstacles with patience rather than force.</li>
          <li>Service activities aligned with the 6th lord support the nervous system.</li>
        </ul>
      </div>

      <div style={{ marginBottom: 24 }}>
        <SectionHead>Mantra resonance</SectionHead>
        <div style={{ display: "grid", gap: 8 }}>
          {[
            { deity: "Jupiter", mantra: "Oṃ Bṛhaspataye namaḥ", note: "For clarity and discernment" },
            { deity: "Moon", mantra: "Oṃ Soṃ Somāya namaḥ", note: "For emotional steadiness" },
          ].map((m) => (
            <div key={m.deity} style={{
              padding: "12px 16px", borderRadius: 6,
              background: "rgba(88,55,140,0.12)", border: "1px solid #4A3A6A",
            }}>
              <p style={{ margin: 0, color: "#C0A860", fontSize: 14,
                fontFamily: "Cormorant Garamond, Georgia, serif", fontStyle: "italic" }}>
                {m.mantra}
              </p>
              <p style={{ margin: "4px 0 0", color: "#7A6A9A", fontSize: 11 }}>
                {m.deity} · {m.note}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <SectionHead>Charity & offering</SectionHead>
        <p style={{ color: "#B8B0C8", fontSize: 13, lineHeight: 1.75,
          fontFamily: "Cormorant Garamond, Georgia, serif" }}>
          Offering aligned with the dasha planet supports the period's unfolding.
          During a Jupiter period: support teachers, scholars, or children's education.
          Intention and consistency matter more than scale.
        </p>
      </div>

      <div style={{
        padding: "14px 18px", borderRadius: 8,
        background: "rgba(140,100,50,0.12)", border: "1px solid #7A5A2A",
      }}>
        <p style={{ margin: 0, color: "#C0A860", fontSize: 13,
          fontFamily: "Cormorant Garamond, Georgia, serif" }}>
          <strong style={{ color: "#D4B870" }}>On gemstones:</strong>{" "}
          Planetary gemstone recommendations carry real energetic weight and depend on factors
          that cannot be assessed through a digital chart alone — the practitioner must
          evaluate the full chart, physical constitution, and current circumstances in person.
          This application deliberately does not recommend gems. Please consult a trusted,
          credentialled Jyotiṣī directly.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  SMALL COMPONENTS
// ─────────────────────────────────────────────
function InfoPill({ label, value }) {
  return (
    <div style={{
      padding: "6px 12px", borderRadius: 6,
      background: "rgba(88,55,140,0.18)", border: "1px solid #4A3A6A",
    }}>
      <span style={{ color: "#7A6A9A", fontSize: 10, letterSpacing: 1,
        textTransform: "uppercase", marginRight: 6 }}>
        {label}
      </span>
      <span style={{ color: "#C0A860", fontFamily: "Cormorant Garamond, Georgia, serif",
        fontSize: 13 }}>
        {value}
      </span>
    </div>
  );
}

function SectionHead({ children }) {
  return (
    <p style={{
      color: "#7A6A9A", fontSize: 11, letterSpacing: 2,
      textTransform: "uppercase", marginBottom: 10,
    }}>
      {children}
    </p>
  );
}

// ─────────────────────────────────────────────
//  DISCLAIMER MODAL
// ─────────────────────────────────────────────
function DisclaimerModal({ onClose }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100, padding: 20,
    }} onClick={onClose}>
      <div style={{
        background: "linear-gradient(160deg, #130D28 0%, #0E0820 100%)",
        border: "1px solid #4A3A6A", borderRadius: 12,
        maxWidth: 480, padding: 32,
        boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
      }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ color: "#C0A860", fontFamily: "Cormorant Garamond, Georgia, serif",
          fontSize: 22, fontWeight: 400, margin: "0 0 16px" }}>
          Reflection · not prediction
        </h2>
        <p style={{ color: "#B8B0C8", fontSize: 13, lineHeight: 1.8,
          fontFamily: "Cormorant Garamond, Georgia, serif", margin: "0 0 14px" }}>
          Jyotiṣa is a framework for self-understanding — a lens, not an oracle.
          This application presents archetypal themes drawn from your birth chart as
          invitations for reflection, not as forecasts or life instructions.
        </p>
        <p style={{ color: "#B8B0C8", fontSize: 13, lineHeight: 1.8,
          fontFamily: "Cormorant Garamond, Georgia, serif", margin: "0 0 20px" }}>
          Specific predictions, gemstone recommendations, and medical or financial guidance
          are intentionally absent. For those, please work with a qualified Jyotiṣī in person.
        </p>
        <button
          onClick={onClose}
          style={{
            padding: "8px 24px", borderRadius: 6,
            background: "rgba(88,55,140,0.3)", border: "1px solid #5A3A8A",
            color: "#C0A860", fontFamily: "Cormorant Garamond, Georgia, serif",
            fontSize: 14, cursor: "pointer",
          }}
        >
          Understood
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  ROOT APP
// ─────────────────────────────────────────────
export default function KundaliApp() {
  const [activeTab, setActiveTab] = useState("Chart");
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const chart = SAMPLE_CHART;

  const tabContent = {
    Chart: <TabChart chart={chart} onHouseClick={setSelectedHouse} />,
    Planets: <TabPlanets chart={chart} />,
    "Time Cycles": <TabTimeCycles chart={chart} />,
    Themes: <TabThemes chart={chart} />,
    Practices: <TabPractices chart={chart} />,
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0A0618 0%, #100A22 50%, #0A0618 100%)",
      fontFamily: "Inter, system-ui, sans-serif",
      color: "#E8E0F0",
      position: "relative",
    }}>
      <StarField />

      {/* Content layer */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: 680, margin: "0 auto", padding: "24px 20px 80px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "4px 14px", borderRadius: 20,
            background: "rgba(88,55,140,0.2)", border: "1px solid #4A3A6A",
            marginBottom: 16, cursor: "pointer",
          }} onClick={() => setShowDisclaimer(true)}>
            <span style={{ color: "#C0A860", fontSize: 11, letterSpacing: 2 }}>
              REFLECTION · NOT PREDICTION
            </span>
            <span style={{ color: "#7A6A9A", fontSize: 10 }}>ⓘ</span>
          </div>

          <h1 style={{
            fontFamily: "Cormorant Garamond, Georgia, serif",
            fontSize: 36, fontWeight: 300, margin: "0 0 4px",
            color: "#E8E0F0", letterSpacing: 2,
          }}>
            Jyotiṣa
          </h1>
          <p style={{ color: "#7A6A9A", fontSize: 12, margin: 0, letterSpacing: 3 }}>
            BIRTH CHART REFLECTION
          </p>

          <div style={{ marginTop: 16 }}>
            <p style={{ color: "#C0A860", fontFamily: "Cormorant Garamond, Georgia, serif",
              fontSize: 17, margin: "0 0 2px" }}>
              {chart.native.name}
            </p>
            <p style={{ color: "#5A4A7A", fontSize: 11, margin: 0 }}>
              {chart.native.dob} · {chart.native.tob} · {chart.native.pob}
            </p>
          </div>
        </div>

        {/* Horizontal rule */}
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, #5A3A8A, transparent)", marginBottom: 24 }} />

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 4, marginBottom: 28, overflowX: "auto", paddingBottom: 2 }}>
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "7px 14px", borderRadius: 6, border: "none",
                background: activeTab === tab ? "rgba(88,55,140,0.4)" : "transparent",
                borderBottom: activeTab === tab ? "2px solid #C0A860" : "2px solid transparent",
                color: activeTab === tab ? "#C0A860" : "#7A6A9A",
                fontSize: 12, cursor: "pointer", whiteSpace: "nowrap",
                fontFamily: "inherit", letterSpacing: 0.5,
                transition: "all 0.15s",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Active tab panel */}
        <div style={{ animationName: "fadeIn", animationDuration: "0.25s" }}>
          {tabContent[activeTab]}
        </div>
      </div>

      {/* House detail panel */}
      {selectedHouse && (
        <HousePanel
          houseNum={selectedHouse}
          chart={chart}
          onClose={() => setSelectedHouse(null)}
        />
      )}

      {/* Disclaimer modal */}
      {showDisclaimer && <DisclaimerModal onClose={() => setShowDisclaimer(false)} />}

      {/* Persistent disclaimer footer */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "rgba(8,4,18,0.95)", borderTop: "1px solid #2A1A3A",
        padding: "8px 20px", textAlign: "center", zIndex: 10,
        backdropFilter: "blur(8px)",
      }}>
        <p style={{ margin: 0, color: "#4A3A6A", fontSize: 10, letterSpacing: 0.5 }}>
          For reflection only · Not a substitute for personalised guidance from a qualified Jyotiṣī ·
          No specific predictions, gemstone recommendations, or health/financial advice
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0A0618; }
        ::-webkit-scrollbar-thumb { background: #3A2A5A; border-radius: 2px; }
      `}</style>
    </div>
  );
}
