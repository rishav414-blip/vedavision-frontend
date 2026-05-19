import React, { useState, useEffect } from "react"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export default function PWAInstall() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [hov, setHov] = useState(false)

  useEffect(() => {
    if ((navigator as Navigator & { standalone?: boolean }).standalone || window.matchMedia("(display-mode: standalone)").matches) return
    const h = (e: Event) => { e.preventDefault(); setPrompt(e as BeforeInstallPromptEvent) }
    window.addEventListener("beforeinstallprompt", h)
    window.addEventListener("appinstalled", () => setPrompt(null))
    return () => window.removeEventListener("beforeinstallprompt", h)
  }, [])

  if (!prompt) return null

  async function install() {
    if (!prompt) return
    await prompt.prompt()
    await prompt.userChoice
    setPrompt(null)
  }

  return (
    <button onClick={install} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"5px 13px", background: hov ? "rgba(139,124,200,0.12)" : "transparent", border:"1px solid #8B7CC8", borderRadius:999, color: hov ? "#B0A0E8" : "#8B7CC8", fontSize:12, fontFamily:"Inter,sans-serif", fontWeight:500, cursor:"pointer", transition:"background 0.18s, color 0.18s" }}>
      ⊕ Install App
    </button>
  )
}
