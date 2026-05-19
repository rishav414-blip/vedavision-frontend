import { Star, Moon, Clock, MessageCircle, Compass } from "lucide-react"
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline"

interface TimelinePageProps {
  onBack: () => void
}

const VEDIC_TIMELINE_DATA = [
  {
    id: 1, title: "Birth Chart", date: "Rāśi",
    content: "The North Indian Rāśi chart maps the twelve bhāvas at the moment of birth — a snapshot of cosmic geometry, not a directive. Foundation of all reflection.",
    category: "Foundation", icon: Star, relatedIds: [2, 3],
    status: "completed" as const, energy: 95,
  },
  {
    id: 2, title: "Nakshatra", date: "Lunar",
    content: "The Moon's nakshatra reveals the instinctive texture of mind and perception. Each of the 27 lunar mansions carries a presiding deity, ruling planet, and pada.",
    category: "Lunar", icon: Moon, relatedIds: [1, 3],
    status: "completed" as const, energy: 88,
  },
  {
    id: 3, title: "Daśā Period", date: "Vimśottarī",
    content: "The 120-year Vimśottarī daśā sequence marks planetary periods as lenses for reflection — a quality of time, never a prediction of fixed events.",
    category: "Time", icon: Clock, relatedIds: [1, 2, 4],
    status: "in-progress" as const, energy: 72,
  },
  {
    id: 4, title: "Jyoti AI", date: "Chatbot",
    content: "Jyoti is the contemplative guide within Celestial Noir. She surfaces Vedic patterns for self-inquiry. She does not forecast, prescribe gemstones, or offer medical counsel.",
    category: "Guide", icon: MessageCircle, relatedIds: [3, 5],
    status: "in-progress" as const, energy: 65,
  },
  {
    id: 5, title: "Dharma Pass", date: "Premium",
    content: "Dharma Pass unlocks extended daśā commentary, the compatibility engine, and deeper practice recommendations to support the ongoing reflection framework.",
    category: "Access", icon: Compass, relatedIds: [4],
    status: "pending" as const, energy: 40,
  },
]

export default function TimelinePage({ onBack }: TimelinePageProps) {
  return (
    <div className="relative w-full h-screen" style={{ background: "#0A0618" }}>
      {/* Back button */}
      <div className="absolute top-4 left-4 z-50">
        <button
          onClick={onBack}
          style={{ color: "#C0A860", border: "1px solid rgba(192,168,96,0.3)", background: "rgba(10,6,24,0.8)", backdropFilter: "blur(8px)" }}
          className="px-4 py-2 text-xs font-semibold tracking-widest uppercase transition-colors hover:border-[rgba(192,168,96,0.7)]"
        >
          ← Back
        </button>
      </div>

      {/* Title */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-1 pointer-events-none">
        <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#C0A860" }}>Celestial Noir</span>
        <span className="text-xs tracking-wider" style={{ color: "#7A6A9A" }}>Reflection · Not Prediction</span>
      </div>

      <RadialOrbitalTimeline timelineData={VEDIC_TIMELINE_DATA} />
    </div>
  )
}
