/**
 * LagnaChartSVG.jsx
 * North Indian (diamond-grid) Lagna Chart for VedaVision Vedic Astrology SaaS.
 * Exports: LagnaChartSVG (default), TimeSlider (named)
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PLANET_COLORS = {
  Sun:     "#F5C842",
  Moon:    "#D0D8F0",
  Mercury: "#7EC8A0",
  Venus:   "#E48DB0",
  Mars:    "#E05050",
  Jupiter: "#F0A830",
  Saturn:  "#A08050",
  Rahu:    "#8855CC",
  Ketu:    "#CC8855",
  Lagna:   "#AACCFF",
  As:      "#AACCFF",
};

const PLANET_GLYPHS = {
  Sun:     "☉",
  Moon:    "☽",
  Mercury: "☿",
  Venus:   "♀",
  Mars:    "♂",
  Jupiter: "♃",
  Saturn:  "♄",
  Rahu:    "☊",
  Ketu:    "☋",
  As:      "As",
  Lagna:   "As",
};

/**
 * North Indian chart polygon definitions for a 420×420 viewBox.
 *
 * Layout principle:
 *   The outer 420×420 square is divided by diagonals connecting
 *   the midpoints of each side — (210,0), (420,210), (210,420), (0,210) —
 *   forming a central diamond.  The 12 houses fill the space between the
 *   outer border and that central diamond.
 *
 *   Corner houses (2, 6, 8, 12) are small axis-aligned squares occupying
 *   each corner (105×105 px).
 *   Side trapezoid houses (1, 4, 7, 10) span the full side width.
 *   Small triangle houses (3, 5, 9, 11) fill the remaining gaps between
 *   a corner square and its adjacent trapezoid.
 */
const HOUSE_POLYGONS = {
  1:  "105,0 315,0 210,105",               // top trapezoid (triangle)
  2:  "315,0 420,0 420,105 315,105",        // top-right corner square
  3:  "420,105 420,210 315,105",            // right-top small triangle
  4:  "315,105 420,210 315,315 210,210",    // right trapezoid
  5:  "420,210 420,315 315,315",            // right-bottom small triangle
  6:  "315,315 420,315 420,420 315,420",    // bottom-right corner square
  7:  "105,420 315,420 210,315",            // bottom trapezoid (triangle)
  8:  "0,315 105,315 105,420 0,420",        // bottom-left corner square
  9:  "0,210 105,315 0,315",               // left-bottom small triangle
  10: "0,105 105,105 210,210 105,315",      // left trapezoid
  11: "0,105 105,105 0,210",               // left-top small triangle
  12: "0,0 105,0 105,105 0,105",           // top-left corner square
};

/**
 * Compute the arithmetic centroid of a polygon given its SVG points string.
 * Used to position planet glyphs and house numbers.
 */
function centroid(pointsStr) {
  const pts = pointsStr.split(" ").map((p) => {
    const [x, y] = p.split(",").map(Number);
    return { x, y };
  });
  const n = pts.length;
  const cx = pts.reduce((s, p) => s + p.x, 0) / n;
  const cy = pts.reduce((s, p) => s + p.y, 0) / n;
  return { cx, cy };
}

// Pre-compute centroids for every house.
const HOUSE_CENTROIDS = Object.fromEntries(
  Object.entries(HOUSE_POLYGONS).map(([id, pts]) => [id, centroid(pts)])
);

// ---------------------------------------------------------------------------
// Theme tokens
// ---------------------------------------------------------------------------

const THEMES = {
  dark: {
    bg:           "#0D0D1A",
    stroke:       "#3A3560",
    strokeWidth:  1.5,
    houseText:    "rgba(170,160,220,0.55)",
    planetText:   (planet) => PLANET_COLORS[planet] ?? "#FFFFFF",
    defaultFill:  "rgba(255,255,255,0.03)",
    centerFill:   "rgba(255,255,255,0.02)",
    centerStroke: "#2A2550",
    sliderBg:     "#1A1A2E",
    sliderText:   "#C8C0E8",
  },
  light: {
    bg:           "#F8F6F0",
    stroke:       "#B0A8C8",
    strokeWidth:  1.2,
    houseText:    "rgba(80,60,120,0.6)",
    planetText:   (planet) => PLANET_COLORS[planet] ?? "#333333",
    defaultFill:  "rgba(0,0,0,0.02)",
    centerFill:   "rgba(255,255,255,0.6)",
    centerStroke: "#C8C0D8",
    sliderBg:     "#FFFFFF",
    sliderText:   "#4A3A6A",
  },
};

// ---------------------------------------------------------------------------
// Signal → fill / glow helpers
// ---------------------------------------------------------------------------

function signalFill(signal) {
  switch (signal) {
    case "green":   return "rgba(34,197,94,0.15)";
    case "red":     return "rgba(239,68,68,0.12)";
    case "neutral": return "rgba(255,255,255,0.04)";
    default:        return null;
  }
}

function signalGlow(signal) {
  switch (signal) {
    case "green":   return "drop-shadow(0 0 10px rgba(34,197,94,0.6))";
    case "red":     return "drop-shadow(0 0 10px rgba(239,68,68,0.55))";
    default:        return null;
  }
}

// ---------------------------------------------------------------------------
// HousePolygon — single house cell
// ---------------------------------------------------------------------------

/**
 * Renders one house polygon with dynamic fill/glow driven by transit state.
 */
function HousePolygon({ houseId, points, isHighlighted, activation, themeTokens, onClick }) {
  const signal = activation?.signal ?? null;

  // Resolve fill
  let fill = themeTokens.defaultFill;
  if (signal) {
    fill = signalFill(signal) ?? fill;
  }

  // Resolve filter
  let filter = "none";
  if (signal && signalGlow(signal)) {
    filter = signalGlow(signal);
  } else if (isHighlighted) {
    filter = "drop-shadow(0 0 8px rgba(192,168,96,0.4))";
  }

  return (
    <polygon
      points={points}
      fill={fill}
      stroke={themeTokens.stroke}
      strokeWidth={themeTokens.strokeWidth}
      style={{
        cursor: "pointer",
        transition: "fill 600ms ease, filter 600ms ease",
        filter,
      }}
      onClick={() => onClick(houseId)}
      role="button"
      aria-label={`House ${houseId}`}
    />
  );
}

// ---------------------------------------------------------------------------
// PlanetGlyphs — renders glyphs for all planets in one house
// ---------------------------------------------------------------------------

/**
 * Lays out planet glyphs around the house centroid.
 * If multiple planets share a house, they are spread in a small grid.
 */
function PlanetGlyphs({ planets, centroid: c, themeTokens, scaleFactor }) {
  if (!planets || planets.length === 0) return null;

  const fontSize = Math.round(13 * scaleFactor);
  const spacing  = Math.round(16 * scaleFactor);

  // For single planet, center directly. For multiples, create a compact grid.
  const positions = planetPositions(planets.length, c, spacing);

  return (
    <>
      {planets.map((planet, i) => {
        const glyph = PLANET_GLYPHS[planet] ?? planet.slice(0, 2);
        const color = themeTokens.planetText(planet);
        const { x, y } = positions[i];

        return (
          <text
            key={`${planet}-${i}`}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={fontSize}
            fontFamily="'Noto Sans Symbols', 'Segoe UI Symbol', sans-serif"
            fontWeight="600"
            fill={color}
            style={{
              filter: `drop-shadow(0 0 3px ${color})`,
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            {glyph}
          </text>
        );
      })}
    </>
  );
}

/**
 * Distributes n planets around a centroid in a compact grid pattern.
 * Returns array of {x, y} positions.
 */
function planetPositions(n, { cx, cy }, spacing) {
  if (n === 1) return [{ x: cx, y: cy }];

  const cols = Math.ceil(Math.sqrt(n));
  const rows = Math.ceil(n / cols);
  const offsetX = ((cols - 1) * spacing) / 2;
  const offsetY = ((rows - 1) * spacing) / 2;

  return Array.from({ length: n }, (_, i) => ({
    x: cx - offsetX + (i % cols) * spacing,
    y: cy - offsetY + Math.floor(i / cols) * spacing,
  }));
}

// ---------------------------------------------------------------------------
// HouseNumber label
// ---------------------------------------------------------------------------

function HouseNumber({ houseId, cx, cy, themeTokens, scaleFactor }) {
  // Nudge label slightly toward the outer border so it doesn't collide
  // with planets clustered near the centroid.
  const fontSize = Math.round(9 * scaleFactor);
  return (
    <text
      x={cx}
      y={cy - Math.round(14 * scaleFactor)}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={fontSize}
      fontFamily="'Inter', 'Segoe UI', sans-serif"
      fill={themeTokens.houseText}
      style={{ pointerEvents: "none", userSelect: "none" }}
    >
      {houseId}
    </text>
  );
}

// ---------------------------------------------------------------------------
// LagnaChartSVG — main component
// ---------------------------------------------------------------------------

/**
 * North Indian Lagna Chart rendered as an SVG polygon grid.
 *
 * @param {object} props
 * @param {object} props.chartData         - Chart data (lagna, houses, highlighted_houses)
 * @param {object|null} props.timeSliderFrame - Current transit frame from TimeSlider
 * @param {function} props.onHouseClick    - Called with houseId (number) on click
 * @param {number}   [props.size=420]      - SVG dimensions in px
 * @param {"dark"|"light"} [props.theme="dark"] - Visual theme
 */
export default function LagnaChartSVG({
  chartData,
  timeSliderFrame = null,
  onHouseClick,
  size = 420,
  theme = "dark",
}) {
  const tokens = THEMES[theme] ?? THEMES.dark;

  // Scale factor for coordinates (all constants are designed for 420px)
  const BASE = 420;
  const scale = size / BASE;

  // Build a lookup: houseId → planet array
  const housePlanets = useMemo(() => {
    const map = {};
    if (!chartData?.houses) return map;
    for (const house of chartData.houses) {
      map[house.id] = house.planets ?? [];
    }
    return map;
  }, [chartData]);

  // Build highlighted set
  const highlightedSet = useMemo(
    () => new Set(chartData?.highlighted_houses ?? []),
    [chartData]
  );

  // House activation map from timeSliderFrame
  const houseActivation = timeSliderFrame?.house_activation ?? null;

  const handleClick = useCallback(
    (houseId) => {
      if (typeof onHouseClick === "function") onHouseClick(houseId);
    },
    [onHouseClick]
  );

  // The SVG uses a fixed 420×420 viewBox and scales via width/height props.
  // This keeps all polygon math in one coordinate space.
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${BASE} ${BASE}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{
        background: tokens.bg,
        borderRadius: 8,
        display: "block",
      }}
      aria-label="North Indian Lagna Chart"
      role="img"
    >
      {/* Outer border */}
      <rect
        x={0} y={0}
        width={BASE} height={BASE}
        fill="none"
        stroke={tokens.stroke}
        strokeWidth={tokens.strokeWidth * 1.5}
      />

      {/* Center diamond (visual only — marks the empty center region) */}
      <polygon
        points="210,105 315,210 210,315 105,210"
        fill={tokens.centerFill}
        stroke={tokens.centerStroke}
        strokeWidth={tokens.strokeWidth}
        style={{ pointerEvents: "none" }}
      />

      {/* House polygons */}
      {Object.entries(HOUSE_POLYGONS).map(([idStr, points]) => {
        const houseId = Number(idStr);
        const activation = houseActivation ? houseActivation[idStr] ?? null : null;
        return (
          <HousePolygon
            key={houseId}
            houseId={houseId}
            points={points}
            isHighlighted={highlightedSet.has(houseId)}
            activation={activation}
            themeTokens={tokens}
            onClick={handleClick}
          />
        );
      })}

      {/* House numbers + planet glyphs */}
      {Object.entries(HOUSE_POLYGONS).map(([idStr]) => {
        const houseId = Number(idStr);
        const { cx, cy } = HOUSE_CENTROIDS[idStr];
        const planets = housePlanets[houseId] ?? [];

        return (
          <g key={`content-${houseId}`}>
            <HouseNumber
              houseId={houseId}
              cx={cx}
              cy={cy}
              themeTokens={tokens}
              scaleFactor={1} // viewBox is fixed; scale handled by SVG viewport
            />
            <PlanetGlyphs
              planets={planets}
              centroid={{ cx, cy }}
              themeTokens={tokens}
              scaleFactor={1}
            />
          </g>
        );
      })}

      {/* Lagna "As" label in house 1 if not already in planet list */}
      {(() => {
        const h1Planets = housePlanets[1] ?? [];
        const hasLagna = h1Planets.some((p) => p === "Lagna" || p === "As");
        if (hasLagna) return null;
        const { cx, cy } = HOUSE_CENTROIDS["1"];
        return (
          <text
            x={cx}
            y={cy + 14}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={11}
            fontFamily="'Inter', 'Segoe UI', sans-serif"
            fontWeight="700"
            fill={PLANET_COLORS.Lagna}
            style={{
              filter: `drop-shadow(0 0 4px ${PLANET_COLORS.Lagna})`,
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            As
          </text>
        );
      })()}

      {/* Lagna sign label inside center diamond */}
      {chartData?.lagna && (
        <text
          x={210}
          y={210}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={12}
          fontFamily="'Inter', 'Segoe UI', sans-serif"
          fontWeight="500"
          fill={tokens.houseText}
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          {chartData.lagna.sign}
        </text>
      )}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// TimeSlider
// ---------------------------------------------------------------------------

const TOTAL_DAYS = 1825; // 5 years

/** Format a Date to a short readable label, e.g. "11 May 2026" */
function formatDate(date) {
  return date.toLocaleDateString("en-IN", {
    day:   "2-digit",
    month: "short",
    year:  "numeric",
  });
}

/** Add `days` to a base Date, returning a new Date. */
function addDays(base, days) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Deterministically generate a mock TimeSliderFrame for a given day offset.
 * In production, replace this with a real API call or precomputed dataset.
 *
 * @param {number} dayOffset - 0..1825
 * @returns {object} TimeSliderFrame
 */
function generateFrame(dayOffset) {
  // Cycle signals with a pseudo-periodic function so the demo looks dynamic.
  const t = dayOffset / TOTAL_DAYS;
  const scoreRaw = Math.sin(t * Math.PI * 8) * 50 + 50; // 0–100
  const score = Math.round(scoreRaw);

  function signalAt(offset) {
    const v = Math.sin((t + offset) * Math.PI * 12);
    if (v > 0.35) return "green";
    if (v < -0.35) return "red";
    return "neutral";
  }

  return {
    house_activation: {
      "2":  { signal: signalAt(0),    theme: "Wealth & Speech" },
      "10": { signal: signalAt(0.15), theme: "Career & Status" },
      "11": { signal: signalAt(0.3),  theme: "Gains & Network" },
    },
    active_dasha: { mahadasha: "Jupiter", antardasha: "Saturn" },
    green_red_score: score,
  };
}

/**
 * TimeSlider — horizontal range input that drives the transit overlay.
 *
 * @param {object}   props
 * @param {Date}     [props.baseDate]       - Start date (default: today)
 * @param {function} props.onFrameChange    - Called with TimeSliderFrame on change
 * @param {"dark"|"light"} [props.theme="dark"]
 */
export function TimeSlider({
  baseDate,
  onFrameChange,
  theme = "dark",
}) {
  const tokens   = THEMES[theme] ?? THEMES.dark;
  const base     = useMemo(() => baseDate ?? new Date(2026, 4, 11), [baseDate]); // 11 May 2026
  const [day, setDay]       = useState(0);
  const [playing, setPlaying] = useState(false);
  const rafRef   = useRef(null);
  const lastRef  = useRef(null);

  const currentDate  = useMemo(() => addDays(base, day), [base, day]);
  const currentFrame = useMemo(() => generateFrame(day), [day]);

  // Notify parent whenever frame changes
  useEffect(() => {
    if (typeof onFrameChange === "function") onFrameChange(currentFrame);
  }, [currentFrame, onFrameChange]);

  // Animation loop — advances 1 day per 100 ms
  useEffect(() => {
    if (!playing) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    function tick(ts) {
      if (lastRef.current === null) lastRef.current = ts;
      const elapsed = ts - lastRef.current;

      if (elapsed >= 100) {
        lastRef.current = ts;
        setDay((prev) => {
          const next = prev + 1;
          if (next >= TOTAL_DAYS) {
            setPlaying(false);
            return TOTAL_DAYS;
          }
          return next;
        });
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    lastRef.current = null;
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing]);

  const handleSliderChange = (e) => {
    setDay(Number(e.target.value));
    setPlaying(false);
  };

  const togglePlay = () => {
    if (day >= TOTAL_DAYS) setDay(0);
    setPlaying((p) => !p);
  };

  const score = currentFrame.green_red_score;
  const scoreDotColor =
    score >= 60 ? "#22C55E" :
    score <= 40 ? "#EF4444" :
    "#A0A0A0";

  const containerStyle = {
    display:       "flex",
    flexDirection: "column",
    gap:           8,
    padding:       "12px 16px",
    background:    tokens.sliderBg,
    borderRadius:  8,
    userSelect:    "none",
    fontFamily:    "'Inter', 'Segoe UI', sans-serif",
  };

  const rowStyle = {
    display:    "flex",
    alignItems: "center",
    gap:        10,
  };

  const labelStyle = {
    color:    tokens.sliderText,
    fontSize: 13,
    minWidth: 100,
  };

  const dotStyle = {
    width:        10,
    height:       10,
    borderRadius: "50%",
    background:   scoreDotColor,
    boxShadow:    `0 0 6px ${scoreDotColor}`,
    flexShrink:   0,
  };

  const scoreStyle = {
    color:    scoreDotColor,
    fontSize: 12,
    fontWeight: "600",
    minWidth: 28,
  };

  const dashaStyle = {
    color:    tokens.houseText,
    fontSize: 11,
    opacity:  0.8,
  };

  const btnStyle = {
    background:   "none",
    border:       `1px solid ${tokens.stroke}`,
    borderRadius: 4,
    color:        tokens.sliderText,
    cursor:       "pointer",
    fontSize:     16,
    lineHeight:   1,
    padding:      "2px 8px",
    flexShrink:   0,
  };

  return (
    <div style={containerStyle} aria-label="Transit Time Slider">
      {/* Date row */}
      <div style={rowStyle}>
        <button
          style={btnStyle}
          onClick={togglePlay}
          aria-label={playing ? "Pause" : "Play"}
          title={playing ? "Pause animation" : "Play animation"}
        >
          {playing ? "⏸" : "▶"}
        </button>

        <span style={labelStyle}>{formatDate(currentDate)}</span>

        <div style={dotStyle} title={`Score: ${score}`} />
        <span style={scoreStyle}>{score}</span>

        {currentFrame.active_dasha && (
          <span style={dashaStyle}>
            {currentFrame.active_dasha.mahadasha} / {currentFrame.active_dasha.antardasha}
          </span>
        )}
      </div>

      {/* Slider */}
      <input
        type="range"
        min={0}
        max={TOTAL_DAYS}
        value={day}
        onChange={handleSliderChange}
        style={{ width: "100%", cursor: "pointer", accentColor: "#8B7FCC" }}
        aria-label="Transit day offset"
      />

      {/* Activation themes row */}
      {currentFrame.house_activation && (
        <div style={{ ...rowStyle, flexWrap: "wrap", gap: 6 }}>
          {Object.entries(currentFrame.house_activation).map(([hId, act]) => {
            const color =
              act.signal === "green" ? "#22C55E" :
              act.signal === "red"   ? "#EF4444" :
              "#808080";
            return (
              <span
                key={hId}
                style={{
                  fontSize:     11,
                  color,
                  border:       `1px solid ${color}`,
                  borderRadius: 4,
                  padding:      "1px 6px",
                  opacity:      0.85,
                }}
                title={`House ${hId}: ${act.theme}`}
              >
                H{hId} · {act.theme}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
