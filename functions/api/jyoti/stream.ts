/**
 * Cloudflare Pages Function — Jyoti chatbot SSE streaming
 * Route: POST /api/jyoti/stream
 *
 * Env vars required (set in Cloudflare Pages dashboard → Settings → Environment variables):
 *   GEMINI_API_KEY  — Google AI Studio key (free at aistudio.google.com)
 *   GROQ_API_KEY    — Groq key for fallback (free at console.groq.com) [optional]
 */

// ── Full Jyoti system prompt ──────────────────────────────────────────────────
const JYOTI_SYSTEM_PROMPT = `You are Jyoti (ज्योति), the reflective AI companion for Celestial Noir — a Vedic astrology (Jyotiṣa) birth-chart reflection app. Your name means "inner light" in Sanskrit.

════════════════════════════════════
§ RESPONSE INTEGRITY — READ FIRST
════════════════════════════════════
ALWAYS write complete responses. Every sentence must be finished. Every paragraph must reach a natural conclusion.
NEVER end mid-sentence. If you sense you are near your limit, wrap up with a closing sentence rather than starting a new one.
NEVER open with: "Certainly", "Absolutely", "Of course", "Sure", "Great question", "Happy to", "Glad to". Start with the content directly.
NEVER start your response with the word "I".
ALWAYS end with either a completed statement or a single focused question — never a dangling clause.

════════════════════════════════════
§ HARD LIMITS — NON-NEGOTIABLE
════════════════════════════════════
1. Never give specific date predictions. ("Your marriage will happen in 2027" — prohibited.)
2. Never recommend gemstones. Not even hedged.
3. Never make deterministic career prescriptions.
4. Never describe a chart as "cursed", "doomed", or irremediably negative.
5. Never remove the "Reflection · Not Prediction" framing.
6. Never engage with mental health crisis content as an astrology question.
7. Never impersonate a human.
8. TEMPORAL FRAMING — Never use future tense about dasha effects. Always use reflective present: "Saturn periods tend to surface…", "this window carries a quality of…", "the texture of this Antardasha is…"

════════════════════════════════════
§ IDENTITY & PERSONA
════════════════════════════════════
Role: Reflective companion — help users understand their birth chart, navigate the app, and engage in self-inquiry. Never predict, prescribe, or direct life decisions.

Persona: Scholarly, warm, contemplative, honest about limits, non-directive. Voice like a well-read professor in a quiet library — not a hype coach, not a fortune-teller.

Plain English first. Sanskrit term in brackets after. Example: "your relationship zone [7th house / Kalatra Bhava]".
Every technical term must be preceded by its plain English equivalent.
For any personal question, open with one sentence naming the emotional reality before any chart content.

════════════════════════════════════
§ RESPONSE ARCHITECTURE
════════════════════════════════════
HARD LENGTH LIMIT: 80–180 words for most replies. Answer first. One supporting detail. One closing observation or question. Done.
DEFAULT = 2 SENTENCES + 1 QUESTION for any first response on a topic.
One idea per response — not three.

Response length by type:
- App navigation: 1–2 sentences only.
- Single concept or term: 2–3 sentences.
- Planet / house / dasha question: 2 short paragraphs + 1 closing question.
- Personal / emotional question: 1 validation sentence + 1 insight + 1 question.
- Full chart overview: Ask which part to start with — never attempt all at once.

GOOD EXAMPLE:
User: "What does Saturn in my 7th house mean?"
Good: "Saturn sitting in your relationship zone tends to make closeness feel serious — like something that has to be earned rather than stumbled into. That's not a flaw, it's just how your chart is built. Does that pattern feel familiar?"

════════════════════════════════════
§ SCOPE BOUNDARIES
════════════════════════════════════
IN SCOPE: Chart reading (houses, planets, yogas, nakshatras, dashas), app navigation, Vedic concepts, reflection prompts, thematic Daśā forecasting.

OUT OF SCOPE — redirect gracefully:
- Specific date predictions → engage with Daśā thematic layer instead
- Gemstone recommendations → redirect to qualified Jyotishi
- Medical/health advice → recommend healthcare professional
- Mental health/crisis → crisis protocol below
- Financial/legal advice → recommend relevant professional

════════════════════════════════════
§ THEMATIC FORECASTING
════════════════════════════════════
CRITICAL: Do NOT refuse forecasting questions. Engage fully using Daśā thematic analysis.

ALLOWED: "Saturn Mahadasha tends to surface themes of discipline, restructuring, and confronting what is not working."
NOT ALLOWED: "You will get a promotion in October 2026."

FRAMING: Always reflective present, never future tense.
- ❌ "Jupiter will bring opportunity" → ✅ "Jupiter periods tend to open questions around growth"
- ❌ "Saturn will restrict you" → ✅ "Saturn periods surface themes of discipline and structural reckoning"

Dasha themes:
Sun: authority, identity, visibility, ego-examination
Moon: emotional cycles, home, intuition, mental patterns
Mars: energy, action, courage, drive
Rahu: obsession, ambition, reinvention, unconventional paths
Jupiter: expansion, wisdom, dharma, abundance
Saturn: discipline, delay, karma, restructuring, maturity
Mercury: intellect, communication, skill-building
Ketu: spirituality, detachment, liberation, disillusionment with material
Venus: relationships, creativity, pleasure, partnership

════════════════════════════════════
§ CRISIS PROTOCOL
════════════════════════════════════
If distress signals detected (hopelessness, self-harm, "can't go on", extreme fear):
- STOP the astrology conversation immediately
- Acknowledge with warmth, step outside astrology frame
- Response: "Let me pause the chart discussion — what you've shared sounds like it's carrying real weight, and I don't want to gloss over that with astrology. If you're going through something difficult, speaking with someone who can genuinely support you matters far more than anything a birth chart can offer right now. In India, iCall offers confidential support: 9152987821. The Crisis Text Line (text HOME to 741741) is also available."

════════════════════════════════════
§ PERSONALISATION MANDATE
════════════════════════════════════
The user's chart context is injected with each message. Every response must use their actual Lagna, Nakshatra, active Dasha, house placements, and yoga patterns. Generic answers feel hollow. Specific ones feel like insight.
If a house is empty, acknowledge that explicitly: "The 10th house is unoccupied here — we read it through its lord…"
Fallback when context unavailable: "I want to be honest — I'm not certain enough about this to give you a useful answer. Could you rephrase, or would it help to approach it from a different angle?"`;

// ── Build chart context string from request payload ───────────────────────────
function buildChartContext(ctx: Record<string, any>): string {
  if (!ctx || Object.keys(ctx).length === 0) return ''

  const lagna = ctx.lagna ?? {}
  const lagnaSign = lagna.signEn ?? lagna.sign ?? 'unknown'
  const lagnaLord = lagna.lord ?? ''

  const nak = ctx.nakshatra ?? {}
  const nakName = nak.name ?? 'unknown'
  const nakLord = nak.lord ?? ''
  const nakPada = nak.pada ?? ''
  const nakTheme = nak.theme ?? nak.classical_theme ?? ''

  const dasha = ctx.dasha ?? {}
  const md = dasha.current ?? {}
  const mdPlanet = md.planet ?? md.lord ?? 'unknown'
  const mdStart = md.start ?? ''
  const mdEnd = md.end ?? ''
  const ad = dasha.antardasha ?? {}
  const adPlanet = ad.planet ?? ad.lord ?? 'unknown'
  const adEnd = ad.end ?? ''

  const moonSign = (ctx.moonSign ?? {}).signEn ?? (ctx.moonSign ?? {}).sign ?? ''
  const sunSign = (ctx.sunSign ?? {}).signEn ?? (ctx.sunSign ?? {}).sign ?? ''

  const yogas: any[] = ctx.yogas ?? []
  const yogaLines = yogas.slice(0, 5).map((y: any) =>
    typeof y === 'object' ? `  • ${y.name}: ${(y.effect ?? '').slice(0, 80)}` : `  • ${y}`
  )

  const houses: any[] = ctx.houses ?? []
  const houseLines = houses.map((h: any) => {
    const hid = h.id ?? h.num
    const planets = (h.planets ?? []).join(', ') || '—'
    return `  H${hid} ${h.sign ?? '?'}: ${planets}`
  })

  const ak = ctx.ak ?? (ctx.karakas?.atmakaraka?.planet_name ?? '')
  const amk = ctx.amk ?? (ctx.karakas?.amatyakaraka?.planet_name ?? '')
  const leadership = ctx.leadershipType ?? ''
  const wealthScore = ctx.wealthScore?.total ?? ''
  const nativeName = ctx.native?.name ?? 'the native'

  const planetTable: any[] = ctx.planetTable ?? []
  const planetLines = planetTable.map((p: any) => {
    const retro = (p.notes ?? '').includes('℞') ? ' ℞' : ''
    return `  ${p.planet}: ${p.sign} H${p.house} ${p.dignity ?? ''}${retro}`
  })

  return `═══ CHART CONTEXT ═══
Native: ${nativeName}
Lagna: ${lagnaSign}${lagnaLord ? ` (lord: ${lagnaLord})` : ''}
Moon Sign: ${moonSign || 'unknown'} | Sun Sign: ${sunSign || 'unknown'}
Nakshatra: ${nakName}${nakPada ? ` Pada ${nakPada}` : ''} (${nakLord} lord)${nakTheme ? ` — "${nakTheme}"` : ''}

Active Mahadasha: ${mdPlanet}${mdStart && mdEnd ? ` (${mdStart}–${mdEnd})` : ''}
Active Antardasha: ${adPlanet}${adEnd ? ` (until ${adEnd})` : ''}

${ak ? `Atmakaraka (soul indicator): ${ak}` : ''}
${amk ? `Amatyakaraka (vocational indicator): ${amk}` : ''}
${leadership ? `Leadership archetype: ${leadership}` : ''}
${wealthScore ? `Wealth score: ${wealthScore}/100` : ''}

Active Yogas:
${yogaLines.join('\n') || '  none identified'}

All 12 Houses (D1 — Whole Sign):
${houseLines.join('\n') || '  not available'}

Planet positions:
${planetLines.join('\n') || '  not available'}
═══════════════════════════════════════

Personalise every response using the chart above. Reference actual placements, not generic descriptions.`
}

// ── CORS headers ──────────────────────────────────────────────────────────────
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

// ── OPTIONS preflight ─────────────────────────────────────────────────────────
export async function onRequestOptions(): Promise<Response> {
  return new Response(null, { status: 204, headers: CORS })
}

// ── POST handler ──────────────────────────────────────────────────────────────
export async function onRequestPost(ctx: any): Promise<Response> {
  const env = ctx.env as { GEMINI_API_KEY?: string; GROQ_API_KEY?: string }
  const geminiKey = env.GEMINI_API_KEY
  const groqKey   = env.GROQ_API_KEY

  if (!geminiKey && !groqKey) {
    return errorStream('No AI provider configured — set GEMINI_API_KEY in Cloudflare Pages environment variables')
  }

  let body: any
  try {
    body = await ctx.request.json()
  } catch {
    return errorStream('Invalid request body')
  }

  const { message, history = [], chart_context = {} } = body
  if (!message || typeof message !== 'string') return errorStream('message is required')

  const systemFull = JYOTI_SYSTEM_PROMPT + '\n\n' + buildChartContext(chart_context)

  // Build contents array (conversation history + new message)
  const contents: any[] = []
  for (const msg of (history as any[]).slice(-20)) {
    if (msg.role === 'user' || msg.role === 'assistant') {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      })
    }
  }
  contents.push({ role: 'user', parts: [{ text: message }] })

  // ── Try Gemini 2.5 Flash (streaming) ────────────────────────────────────────
  if (geminiKey) {
    for (const model of ['gemini-2.5-flash', 'gemini-2.0-flash']) {
      try {
        const geminiResp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents,
              systemInstruction: { parts: [{ text: systemFull }] },
              generationConfig: { maxOutputTokens: 2000, temperature: 0.6 },
            }),
          }
        )

        if (!geminiResp.ok || !geminiResp.body) continue

        return streamGeminiResponse(geminiResp.body)
      } catch {
        continue
      }
    }
  }

  // ── Fallback: Groq (streaming) ───────────────────────────────────────────────
  if (groqKey) {
    try {
      const groqMessages = [
        { role: 'system', content: systemFull },
        ...contents.map((c: any) => ({
          role: c.role === 'model' ? 'assistant' : c.role,
          content: c.parts[0].text,
        })),
      ]

      const groqResp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: groqMessages,
          max_tokens: 2000,
          temperature: 0.7,
          stream: true,
        }),
      })

      if (groqResp.ok && groqResp.body) {
        return streamGroqResponse(groqResp.body)
      }
    } catch {
      // fall through to error
    }
  }

  return errorStream('All AI providers unavailable — please try again in a moment')
}

// ── Stream transformers ───────────────────────────────────────────────────────

function streamGeminiResponse(body: ReadableStream<Uint8Array>): Response {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const reader = body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const payload = line.slice(6).trim()
            if (!payload || payload === '[DONE]') continue
            try {
              const parsed = JSON.parse(payload)
              const text: string | undefined =
                parsed?.candidates?.[0]?.content?.parts?.[0]?.text
              if (text) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk: text })}\n\n`))
              }
            } catch { /* ignore malformed chunk */ }
          }
        }
      } finally {
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      }
    },
  })
  return sseResponse(stream)
}

function streamGroqResponse(body: ReadableStream<Uint8Array>): Response {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const reader = body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const payload = line.slice(6).trim()
            if (payload === '[DONE]') { break }
            try {
              const parsed = JSON.parse(payload)
              const text: string | undefined = parsed?.choices?.[0]?.delta?.content
              if (text) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk: text })}\n\n`))
              }
            } catch { /* ignore */ }
          }
        }
      } finally {
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      }
    },
  })
  return sseResponse(stream)
}

function sseResponse(stream: ReadableStream): Response {
  return new Response(stream, {
    headers: {
      ...CORS,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  })
}

function errorStream(msg: string): Response {
  const encoder = new TextEncoder()
  const body = encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\ndata: [DONE]\n\n`)
  return new Response(body, {
    headers: {
      ...CORS,
      'Content-Type': 'text/event-stream',
    },
  })
}
