/* VedaVision — Data Layer */

const SAMPLE_CHART = {
  native: { name: "Arjun Sharma", dob: "15/08/1990", tob: "6:30 AM", pob: "New Delhi, India" },
  lagna: { sign: "Vrishchika", signEn: "Scorpio", lord: "Mars", degree: 14.5 },
  moonSign: { sign: "Vrishabha", signEn: "Taurus" },
  sunSign: { sign: "Simha", signEn: "Leo" },
  nakshatra: { name: "Rohini", pada: 2, lord: "Moon" },
  ak: { planet: "Jupiter", reason: "Highest degree (28°14') in Pisces" },
  amk: { planet: "Sun", reason: "Second highest degree (24°52') in Leo" },
  leadershipType: "Commander",
  houses: [
    { id:1,  sign:"Scorpio",     short:"Sco", planets:["As"] },
    { id:2,  sign:"Sagittarius", short:"Sag", planets:["Ke"] },
    { id:3,  sign:"Capricorn",   short:"Cap", planets:[] },
    { id:4,  sign:"Aquarius",    short:"Aqu", planets:["Sa"] },
    { id:5,  sign:"Pisces",      short:"Pis", planets:["Ju"] },
    { id:6,  sign:"Aries",       short:"Ari", planets:[] },
    { id:7,  sign:"Taurus",      short:"Tau", planets:["Mo","Ve"] },
    { id:8,  sign:"Gemini",      short:"Gem", planets:["Me"] },
    { id:9,  sign:"Cancer",      short:"Can", planets:[] },
    { id:10, sign:"Leo",         short:"Leo", planets:["Su","Ma"] },
    { id:11, sign:"Virgo",       short:"Vir", planets:[] },
    { id:12, sign:"Libra",       short:"Lib", planets:["Ra"] }
  ],
  dasha: {
    current:    { planet:"Saturn",  skt:"Shani", start:"2019-03-15", end:"2038-03-15", yearsTotal:19 },
    antardasha: { planet:"Jupiter", skt:"Guru",  start:"2025-01-10", end:"2027-07-22" },
    pratyantar: { planet:"Mercury", skt:"Budha", start:"2025-03-01", end:"2025-08-15" }
  },
  yogas: [
    { name:"Gaja Kesari Yoga",  formation:"Jupiter in kendra from Moon",          effect:"Prosperity and authority",       activation:"Jupiter Antardasha" },
    { name:"Dhana Yoga",        formation:"2nd & 11th lords in favorable exchange",effect:"Wealth accumulation",            activation:"Saturn Mahadasha" },
    { name:"Budhaditya Yoga",   formation:"Sun + Mercury in 10th house",           effect:"Intelligence-based career rise",  activation:"Mercury Pratyantar" }
  ],
  planetTable: [
    { planet:"Sun",     skt:"Surya",   glyph:"☉", sign:"Leo",       house:10, dignity:"Own Sign",  color:"#F59E0B", notes:"10th lord in own sign" },
    { planet:"Moon",    skt:"Chandra", glyph:"☽", sign:"Taurus",    house:7,  dignity:"Exalted",   color:"#94A3B8", notes:"Exalted Moon — strong mind" },
    { planet:"Mars",    skt:"Mangal",  glyph:"♂", sign:"Leo",       house:10, dignity:"Friendly",  color:"#EF4444", notes:"Lagna lord in 10th" },
    { planet:"Mercury", skt:"Budha",   glyph:"☿", sign:"Gemini",    house:8,  dignity:"Own Sign",  color:"#10B981", notes:"Own sign — intellect" },
    { planet:"Jupiter", skt:"Guru",    glyph:"♃", sign:"Pisces",    house:5,  dignity:"Own Sign",  color:"#F97316", notes:"5th lord, own sign" },
    { planet:"Venus",   skt:"Shukra",  glyph:"♀", sign:"Taurus",    house:7,  dignity:"Own Sign",  color:"#EC4899", notes:"7th house, own sign" },
    { planet:"Saturn",  skt:"Shani",   glyph:"♄", sign:"Aquarius",  house:4,  dignity:"Own Sign",  color:"#6366F1", notes:"Disciplined foundation" },
    { planet:"Rahu",    skt:"Rahu",    glyph:"☊", sign:"Libra",     house:12, dignity:"Neutral",   color:"#8B5CF6", notes:"Foreign connections" },
    { planet:"Ketu",    skt:"Ketu",    glyph:"☋", sign:"Sagittarius",house:2, dignity:"Neutral",   color:"#78716C", notes:"Past-life service" }
  ],
  wealthScore: { total:74, parashari:44, bnn:30 },
  chartStrength: 74
};

// Pre-computed chart variants — selected by birth date hash
const CHART_VARIANTS = [
  { lagna:{sign:"Vrishchika",signEn:"Scorpio",lord:"Mars",degree:14.5}, moonSign:{sign:"Vrishabha",signEn:"Taurus"}, sunSign:{sign:"Simha",signEn:"Leo"}, nakshatra:{name:"Rohini",pada:2,lord:"Moon"}, leadershipType:"Commander", ak:{planet:"Jupiter"}, amk:{planet:"Sun"} },
  { lagna:{sign:"Mithuna",signEn:"Gemini",lord:"Mercury",degree:22.3}, moonSign:{sign:"Karka",signEn:"Cancer"}, sunSign:{sign:"Kanya",signEn:"Virgo"}, nakshatra:{name:"Punarvasu",pada:3,lord:"Jupiter"}, leadershipType:"Specialist", ak:{planet:"Mercury"}, amk:{planet:"Venus"} },
  { lagna:{sign:"Dhanu",signEn:"Sagittarius",lord:"Jupiter",degree:8.7}, moonSign:{sign:"Mesha",signEn:"Aries"}, sunSign:{sign:"Vrishchika",signEn:"Scorpio"}, nakshatra:{name:"Vishakha",pada:4,lord:"Jupiter"}, leadershipType:"Founder", ak:{planet:"Sun"}, amk:{planet:"Mars"} },
  { lagna:{sign:"Simha",signEn:"Leo",lord:"Sun",degree:17.1}, moonSign:{sign:"Makara",signEn:"Capricorn"}, sunSign:{sign:"Mesha",signEn:"Aries"}, nakshatra:{name:"Shravana",pada:1,lord:"Moon"}, leadershipType:"Commander", ak:{planet:"Moon"}, amk:{planet:"Jupiter"} }
];

function getChartVariant(dobStr) {
  // dobStr = YYYY-MM-DD from date input
  const h = hashBirthData(dobStr);
  return CHART_VARIANTS[h % CHART_VARIANTS.length];
}

const PLANET_COLORS = {
  Sun:"#F59E0B", Moon:"#94A3B8", Mars:"#EF4444", Mercury:"#10B981",
  Jupiter:"#F97316", Venus:"#EC4899", Saturn:"#6366F1", Rahu:"#8B5CF6", Ketu:"#78716C",
  As:"#AACCFF"
};

const PLANET_FREQUENCIES = {
  Sun:126.22, Moon:210.42, Mars:144.72, Mercury:141.27,
  Jupiter:183.58, Venus:221.23, Saturn:147.85, Rahu:168.05, Ketu:168.05
};

const PLANET_MANTRAS = {
  Sun:     { beej:"Om Hraam Hreem Hraum Sah Suryaya Namaha",        dev:"ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः",        day:"Sunday",    reps:108 },
  Moon:    { beej:"Om Shraam Shreem Shraum Sah Chandraya Namaha",   dev:"ॐ श्रां श्रीं श्रौं सः चन्द्राय नमः",      day:"Monday",    reps:108 },
  Mars:    { beej:"Om Kraam Kreem Kraum Sah Bhaumaya Namaha",       dev:"ॐ क्रां क्रीं क्रौं सः भौमाय नमः",         day:"Tuesday",   reps:108 },
  Mercury: { beej:"Om Braam Breem Braum Sah Budhaya Namaha",        dev:"ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः",         day:"Wednesday", reps:108 },
  Jupiter: { beej:"Om Graam Greem Graum Sah Gurave Namaha",         dev:"ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः",          day:"Thursday",  reps:108 },
  Venus:   { beej:"Om Draam Dreem Draum Sah Shukraya Namaha",       dev:"ॐ द्रां द्रीं द्रौं सः शुक्राय नमः",        day:"Friday",    reps:108 },
  Saturn:  { beej:"Om Praam Preem Praum Sah Shanaischaraya Namaha", dev:"ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः",     day:"Saturday",  reps:108 },
  Rahu:    { beej:"Om Bhraam Bhreem Bhraum Sah Rahave Namaha",      dev:"ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः",          day:"Saturday",  reps:108 },
  Ketu:    { beej:"Om Shraam Shreem Shraum Sah Ketave Namaha",      dev:"ॐ श्रां श्रीं श्रौं सः केतवे नमः",          day:"Tuesday",   reps:108 }
};

const FIVE_YEAR_FORECAST = [
  {
    year: 2026,
    dasha: "Saturn MD / Saturn AD",
    dashaColor: "#6366F1",
    dashaTheme: "The Karmic Ledger — Discipline, Dues & Structural Rebuilding",
    rating: { career: 2, wealth: 2 },
    signal: "low",
    score: 42,
    career: "Saturn Antardasha within Saturn Mahadasha — the most intensely Saturnian period of the entire 19-year cycle — places maximum karmic pressure on your 10th house of career. Saturn as 3rd and 4th lord occupying the 4th house natally creates a foundational tension: professional ambitions are deliberately slowed to force structural rebuilding at the roots. The 10th house Sun-Mars conjunction (your Amatyakaraka and Lagna lord) chafes under this suppression, and impatience is the primary trap to avoid. Colleagues or institutions may appear to block progress — interpret this as Saturn's quality-testing mechanism rather than external opposition. Any role or project that survives this period intact is built on something genuinely solid. The discipline installed in 2026 becomes the scaffolding for the Mercury Antardasha surge beginning in 2028.",
    careerHardTruth: "Saturn-Saturn is not a year to launch; it is a year to audit what you have already built and remove what cannot bear weight. Your Lagna lord Mars combust Sun in the 10th creates a combative career signature that reads as ambition but can register as aggression when Saturn is the sub-period ruler — and senior figures will notice. The hard truth is that the career slowdown in 2026 is proportional to unresolved structural issues in your professional identity, not to external bad luck. Treat any demotion, stall, or setback as diagnostic data, not verdict.",
    careerActions: [
      "Identify one role, responsibility, or professional relationship that has become dead weight — and formally exit it before May 2026 before Saturn's retrograde amplifies entanglement.",
      "Invest in a structured skill credential (not a short course — a certifiable programme) that aligns with Mercury-ruled domains: analytics, writing, communication, or systems design, to prime the Budhaditya Yoga for 2028.",
      "Document your professional methodology and outputs systematically — Saturn rewards those who build institutional memory, and this archive will be the proof-of-competence asset that Mercury AD monetises."
    ],
    wealth: "The 2nd house Ketu natally suppresses accumulation, and Saturn-Saturn's aspect on the 2nd from its 4th house position compounds this — liquidity feels thinner than income justifies. Jupiter, as 2nd and 5th lord in the 5th house, offers some protective cushion, but its antardasha has ended, removing the buffer that softened Saturn's impact in 2025. Property-related outflows are strongly indicated: repairs, rent pressure, or a family property matter demanding capital. The 11th house Virgo is untenanted natally, and gains through networks require deliberate cultivation rather than passive receipt — attend to this systematically. Avoid leveraging existing assets for new ventures; preservation is the wealth strategy of 2026. The score of 42 reflects a year where every rupee defended is a rupee compounding for 2028.",
    wealthHardTruth: "February and September 2026 carry the sharpest debt-risk signals of this year — Saturn's 10th-house transit aspect combines with unfavourable Tithi cycles to create contractual vulnerability. Do not sign financial instruments, take on guarantees, or make large discretionary purchases in these windows. The deeper hard truth is structural: your chart's Dhana Yoga (2nd–11th lord exchange) is fully suppressed during Saturn-Saturn and will not activate until Mercury AD arrives — rushing wealth-building in 2026 is working against the planetary current, not with it.",
    wealthActions: [
      "Clear or significantly reduce one liability — a loan, credit balance, or outstanding dues — before October 2026 to structurally open the 2nd house channel ahead of Mercury AD.",
      "Build a cash reserve equivalent to six months of fixed expenses and treat it as untouchable until Mercury AD begins; this is the capital base that Mercury AD will deploy.",
      "Audit all recurring financial commitments (subscriptions, retainers, EMIs) and eliminate those that do not directly support skill-building or core operations."
    ],
    health: "Saturn Mahadasha demands consistent attention to skeletal structure, joints, and the nervous system — this is not optional maintenance but a Mahadasha-level imperative. Saturn-Saturn intensifies this: dental health, knees, lower spine, and chronic stress patterns all require scheduled preventive intervention in Q1 2026. The psycho-emotional dimension is equally important — prolonged Saturnian pressure without adequate rest and solitude creates a slow-burn depletion that does not announce itself dramatically until it becomes acute.",
    keyMonths: ["Feb 2026", "May 2026", "Sep 2026", "Dec 2026"],
    do: [
      "Audit one professional role or relationship that has become dead weight — formally exit it",
      "Build a 6-month cash reserve and treat it as untouchable until Mercury AD begins",
      "Clear or significantly reduce one liability — loan, credit balance, or outstanding dues",
      "Invest in a certifiable credential in analytics, writing, or systems design",
      "Schedule preventive health checks for joints, spine, and dental — defer nothing"
    ],
    dont: [
      "Launch new ventures, businesses, or make impulsive career jumps for short-term salary",
      "Sign financial instruments or take on guarantees in February or September",
      "Speculate or concentrate wealth into a single bet — preserve, don't expand",
      "Over-extend spending when pressure briefly eases — Saturn tests the permanence of discipline",
      "Ignore the body's signals under the illusion that pressure is temporary"
    ]
  },
  {
    year: 2027,
    dasha: "Saturn MD / Saturn AD",
    dashaColor: "#6366F1",
    dashaTheme: "The Discipline Dividend — Consolidation Matures Into Credibility",
    rating: { career: 3, wealth: 3 },
    signal: "medium",
    score: 65,
    career: "The second year of Saturn-Saturn brings a perceptible shift in register — the karmic audit of 2026 begins yielding credibility if the work was done honestly. Saturn's natural significations of seniority, authority, and institutional recognition start to activate as the sub-period matures toward its final phase (Saturn-Saturn runs approximately December 2025 through November 2028). The 10th house Mars-Sun conjunction receives a strengthening aspect from Jupiter as it transits Cancer in mid-2027, briefly exalted — this transit window (roughly May through October 2027) is the most powerful career-support interval of the Saturn-Saturn period. Professional recognition for sustained competence is the primary career theme; new ventures are still premature, but consolidating your position with visible deliverables now sets the stage for the Mercury AD leap. Systems built in 2026 begin to function as infrastructure rather than burden.",
    careerHardTruth: "The medium signal in 2027 is not guaranteed — it is conditional on the groundwork laid in 2026. If 2026 was spent resisting Saturn's consolidation impulse rather than working with it, the 2027 dividend does not materialise. Additionally, mid-year authority dynamics remain live: Saturn aspecting your 10th house creates a recurring pattern of institutional hierarchy imposing constraints on your Mars-Sun ambition. The discipline is to demonstrate results within the structure rather than fighting the structure — the chart rewards patience here with compound interest in 2028.",
    careerActions: [
      "Present a documented record of professional output from 2025–2027 to a senior decision-maker or institutional gatekeeping body between May and September 2027 — the Jupiter-in-Cancer transit provides exceptional support for formal recognition bids.",
      "Begin actively cultivating Mercury-ruled professional skills (data analysis, written communication strategy, systems architecture) that will be immediately deployed when Mercury AD begins.",
      "Identify the one high-value professional relationship — mentor, institutional patron, or senior collaborator — that needs deepening before Mercury AD, and invest in it deliberately through Q3 2027."
    ],
    wealth: "Saturn-Saturn's grip on wealth eases incrementally through 2027 as the sub-period's midpoint passes. The score of 65 reflects a year where the consolidation of 2026 begins to yield a modest surplus — income stabilises and discretionary capacity returns. Jupiter's exaltation transit through Cancer aspects your 9th house (fortune/dharma), creating a favourable window for long-horizon financial commitments: index-linked instruments, provident fund enhancements, or systematic investment plans that mature in 2029–2030. Avoid speculative instruments entirely — Saturn's influence rewards methodical accumulation over high-risk positioning. The 11th lord Mercury in its own sign (Gemini, 8th house) creates gains through intellectual work and research-based activities — follow these income threads deliberately.",
    wealthHardTruth: "The wealth score of 65 in 2027 is relative — it is medium compared to the cycle, but it does not mean wealth flows freely. Saturn-Saturn still suppresses 2nd house accumulation, and the Ketu in the 2nd house natally has not changed. The temptation in 2027, when conditions ease slightly from 2026's pressure, is to overextend — to begin spending or investing at the level Saturn-Mercury AD will support, one year too early. Resist this. The medium signal is permission to stabilise, not to accelerate.",
    wealthActions: [
      "Increase systematic investment contributions by a fixed percentage in Q2 2027 during Jupiter's Cancer transit — this window will not recur for 12 years and is structurally supportive of long-term wealth vehicles.",
      "Formalise any income from intellectual or advisory work through proper documentation and agreements — Mercury-ruled income benefits disproportionately from contractual clarity under Saturn's influence.",
      "Review the liability cleared or reduced in 2026 and ensure it has not crept back — Saturn tests the permanence of structural improvements, not just their initial achievement."
    ],
    health: "Jupiter's exaltation in Cancer mid-year provides a genuine vitality boost — this is the best health window of the Saturn-Saturn period and should be used to address anything deferred from 2026. The second half of 2027 sees Saturn's influence reassert as it prepares for the Mercury handoff — maintain the structural health practices (sleep hygiene, joint care, regular exercise) that Saturn demands as non-negotiable baseline. Avoid the common trap of neglecting health when work intensity increases in Q3.",
    keyMonths: ["Mar 2027", "Jun 2027", "Sep 2027", "Nov 2027"],
    do: [
      "Present documented professional output to a decision-maker between May and September",
      "Increase SIP or systematic investment contributions in Q2 during Jupiter-Cancer transit",
      "Formalise any income from intellectual or advisory work through written agreements",
      "Deepen one high-value professional relationship — mentor, patron, or senior collaborator",
      "Address health matters deferred from 2026 during Jupiter's vitality window mid-year"
    ],
    dont: [
      "Spend or invest as though Saturn-Mercury AD has already arrived — it hasn't",
      "Let liabilities cleared in 2026 quietly re-accumulate",
      "Skip health maintenance when work intensity increases in Q3",
      "Make speculative or high-risk financial moves — the medium signal is permission to stabilise, not accelerate",
      "Force career acceleration before the Mercury AD window is properly open"
    ]
  },
  {
    year: 2028,
    dasha: "Saturn MD / Mercury AD",
    dashaColor: "#10B981",
    dashaTheme: "The Intelligence Activation — Budhaditya Yoga Comes Online",
    rating: { career: 4, wealth: 4 },
    signal: "high",
    score: 78,
    career: "Mercury Antardasha beginning in mid-2028 triggers one of the most potent yogas in your chart: Budhaditya Yoga, formed by Sun and Mercury conjoined in the 10th house in Leo. Mercury as 8th and 11th lord combined with Sun as 10th lord creates an intelligence-based career engine — analytical capability, written communication, and systems thinking become the primary vehicles of professional advancement. The shift from Saturn-Saturn's consolidation energy to Mercury's nimbleness is palpable: opportunities that were inaccessible under Saturn-Saturn's weight now present themselves rapidly, and the documentation and skill-building investments of 2026–2027 provide immediate return. By Q4 2028, the career trajectory is measurably higher than the Saturn-Saturn baseline. Expect recognition for intellectual contributions specifically, not just execution — the Amatyakaraka Sun in own sign, activated by Mercury AD, seeks roles with strategic visibility.",
    careerHardTruth: "Mercury in the 8th house natally means Mercury AD does not deliver clean, uncomplicated career advancement — gains come through transformation, research, hidden information, or navigating complexity that others avoid. The intelligence surge is real, but so is the tendency for Mercury in the 8th to create overthinking, anxiety about hidden variables, or involvement in politically sensitive situations at work. The path through: deliver outputs in writing, create paper trails, and avoid verbal commitments on sensitive matters. Mercury rules communication — use that rulership deliberately.",
    careerActions: [
      "Position yourself for a role transition that specifically values analytical or communicative competence — Mercury AD is wasted in roles that reward pure execution over intelligence; make the move or make the case by Q3 2028.",
      "Launch or significantly develop one public-facing intellectual output: a publication, a documented methodology, a system or tool — Mercury AD amplifies public intellectual credibility and the 10th house Sun ensures it is career-relevant.",
      "Build a direct relationship with one Rahu-or-Mercury-ruled domain (technology, data, finance, media, consulting) — Mercury as 11th lord means income from networks surges during this AD, and Mercury-domain networks compound fastest."
    ],
    wealth: "The wealth signal rises to high (78/100) as Mercury AD activates the 11th house gains channel. Mercury as 11th lord is the primary Dhana significator in your chart, and its activation within Saturn MD (the Mahadasha of Dhana Yoga's activation period) creates a multiplicative effect. Income from multiple sources — salary, intellectual work, advisory activity, or investments made in 2026–2027 — converges into a materially higher liquidity position by Q3 2028. The score of 78 is specifically driven by the 11th lord sub-period: wealth through networks, information, and intelligence-based work is the primary channel. Property gains remain modest due to Saturn's continued Mahadasha influence on the 4th house.",
    wealthHardTruth: "Mercury in the 8th house means gains can arrive through unexpected or inheritance-adjacent channels — but it also means financial complexity increases. Tax situations, joint-account matters, or hidden liabilities from past decisions can surface during Mercury AD. A proactive financial audit in Q1 2028 — before Mercury AD fully activates — is not optional; it is a structural prerequisite for maximising the gains window. The high signal is an opportunity, not a guarantee.",
    wealthActions: [
      "Conduct a full financial audit (assets, liabilities, tax position, investment returns) in Q1 2028 and resolve any outstanding complexity before Mercury AD amplifies all active financial themes — both positive and negative.",
      "Deploy capital from the reserve built in 2026–2027 into a Mercury-domain investment: technology equity, intellectual property, or a business with strong information or communication components — these align with the AD lord's significations.",
      "Formalise any income diversification (consulting, advisory, freelance intellectual work) through proper structures — Mercury AD rewards those who have built multiple income architectures, and formalisation amplifies returns."
    ],
    health: "Mercury governs the nervous system and skin — watch for anxiety-pattern intensification as Mercury AD's rapid cognitive pace conflicts with Saturn MD's structural demands. The combination can create a specific stress signature: high mental output, insufficient physical recovery. Prioritise a consistent physical practice (not just mental work) and schedule quarterly health check-ins. Mercury in the 8th house natally suggests metabolic or digestive sensitivity that benefits from dietary regularity.",
    keyMonths: ["Feb 2028", "Jun 2028", "Sep 2028", "Dec 2028"],
    do: [
      "Conduct a full financial audit in Q1 before Mercury AD fully activates — resolve any complexity first",
      "Transition into a role that specifically values analytical or communicative competence",
      "Launch one public-facing intellectual output: a publication, methodology, or documented system",
      "Deploy capital from 2026-2027 reserves into Mercury-domain investments — tech, data, or advisory",
      "Build direct relationships in Rahu/Mercury-ruled domains where network income compounds fastest"
    ],
    dont: [
      "Stay in execution-only roles that suppress intelligence — Mercury AD is wasted there",
      "Make verbal-only financial commitments — get all significant agreements in writing",
      "Over-leverage in the first gains window — Mercury in the 8th carries hidden complexity",
      "Ignore anxiety or nervous system signals — the rapid cognitive pace has a physical cost",
      "Skip the proactive financial audit that clears the path for Mercury AD gains"
    ]
  },
  {
    year: 2029,
    dasha: "Saturn MD / Mercury AD",
    dashaColor: "#10B981",
    dashaTheme: "The Mercurial Peak — Intelligence, Gains & the Budhaditya Zenith",
    rating: { career: 5, wealth: 5 },
    signal: "bullish",
    score: 86,
    career: "This is the peak career year of the five-year window and one of the strongest professional periods in the full Saturn Mahadasha. Mercury Antardasha reaches its zenith with the Budhaditya Yoga fully active — Sun in own sign (Leo) as 10th lord with Mercury as 8th-11th lord in the same house creates an intelligence-career engine that is specifically suited to roles requiring analytical authority, public intellectual presence, or information-based leadership. Jupiter's transit through Leo in late 2029 creates a powerful temporary conjunction with your natal 10th house, adding the expansive blessing of the 2nd and 5th lord (Jupiter) to an already activated career house. The professional milestone that was seeded in 2027 and accelerated in 2028 reaches its most visible expression in 2029. This is the year when external recognition catches up with the internal quality that Saturn-Saturn built invisibly.",
    careerHardTruth: "The bullish career signal is specifically tied to intelligence-based and visibility-demanding roles — if you are in a role that suppresses your analytical or communicative expression, the planetary configuration has nowhere to manifest, and the peak year becomes a missed window. The chart's Amatyakaraka Sun in Leo is unambiguous: leadership with public accountability is the correct expression of your professional archetype. A behind-the-scenes, execution-only role underperforms the chart regardless of its financial compensation. The hard directive for 2029: be visible, be specific about your intellectual contribution, and own the authorship of your work.",
    careerActions: [
      "Pursue the most ambitious role transition available to you in H1 2029 — the Jupiter-in-Leo transit window (roughly August through December 2029) is a 12-year-recurrence event that specifically amplifies the 10th house; do not let it pass without a formal career-level bid.",
      "Develop and present a strategic initiative or thought-leadership output that carries your name publicly — Mercury AD combined with 10th house Sun specifically rewards attributed intellectual work, not anonymous contribution.",
      "Begin building the foundations for post-Mercury AD sustainability: document your methodology, build a personal professional brand, and establish one institutional relationship that will continue to support you when Mercury AD ends and Ketu AD begins."
    ],
    wealth: "The peak wealth signal (86/100) reflects Mercury AD's full activation of the 11th house gains channel combined with Jupiter's transit through Leo (10th house) amplifying career-income alignment. The Dhana Yoga formed by the 2nd-11th lord exchange reaches its highest expression under these conditions — income from multiple channels converges, and assets from 2026–2028's patient accumulation begin compounding at an accelerated rate. This is the year to make the boldest investment of the five-year cycle: the planetary support for wealth decisions made in 2029 does not recur until the mid-2030s. Property gains remain modest but income-based wealth creation is exceptional. The key is to act within the window rather than after it — the second half of 2029 is specifically powerful.",
    wealthHardTruth: "Mercury in the 8th house natally means that even in the peak year, financial complexity does not disappear — it intensifies. The gains are real and large, but so are the stakes of financial decisions made carelessly. Two specific risks: over-leveraging during the bullish window (Mercury's optimism + 8th house hidden risk = dangerous debt if unchecked), and partnership-related financial entanglement (Mercury as 11th lord creates network-based opportunities that sometimes carry undisclosed liabilities). Conduct every significant financial transaction in 2029 with full documentation and independent review.",
    wealthActions: [
      "Make the primary wealth-building investment of the five-year cycle in H2 2029 during Jupiter's Leo transit — align the instrument with Mercury-domain or long-horizon assets; this is the deployment moment the reserves of 2026–2027 were protecting.",
      "Establish or formalise a passive income stream (equity dividends, interest income, licensing revenue, or advisory retainer) that will continue generating returns after Mercury AD ends — Ketu AD disrupts active income channels; passive income is immune to this.",
      "Review all partnership and network-based financial arrangements (joint ventures, shared accounts, business partnerships) and ensure they are governed by written agreements — Mercury as 11th lord creates wealth through networks, but the 8th house placement means undocumented arrangements carry hidden risk."
    ],
    health: "The peak activity year creates a specific health vulnerability: neglecting physical recovery while riding the professional and financial momentum. Mercury AD's high cognitive pace has been running for 12+ months by 2029, and the nervous system's reserves require deliberate replenishment. Schedule a full health assessment in Q1 2029 and treat it as non-negotiable infrastructure maintenance, not a luxury. Jupiter in Leo provides vitality support through H2 2029 — leverage this window for any elective health interventions or intensive physical rehabilitation.",
    keyMonths: ["Jan 2029", "Apr 2029", "Aug 2029", "Nov 2029"],
    do: [
      "Make the primary wealth-building investment of the five-year cycle in H2 during Jupiter-Leo transit",
      "Pursue the most ambitious role transition available in H1 — the Jupiter-Leo window is a 12-year event",
      "Formalise a passive income stream — equity, licensing, advisory retainer — before Mercury AD ends",
      "Present attributed thought-leadership work publicly — own the authorship of your contributions",
      "Build the professional brand and institutional relationships that will outlast Mercury AD"
    ],
    dont: [
      "Over-leverage during the bullish window — Mercury's optimism plus 8th house = dangerous if unchecked",
      "Enter undocumented financial partnerships or joint arrangements without written agreements",
      "Let the Jupiter-Leo transit window (Aug–Dec) pass without a formal career-level bid",
      "Neglect physical recovery while riding professional and financial momentum",
      "Restructure existing passive income arrangements — Ketu AD is approaching; protect what works"
    ]
  },
  {
    year: 2030,
    dasha: "Saturn MD / Ketu AD",
    dashaColor: "#78716C",
    dashaTheme: "The Great Stripping — Ketu's Dissolution & the Karmic Reset",
    rating: { career: 2, wealth: 1 },
    signal: "critical",
    score: 29,
    career: "Ketu Antardasha beginning in late 2029 or early 2030 creates the most disruptive career period of the five-year window. Ketu as a natural malefic with separative, dissolving qualities occupies your 2nd house natally — its Antardasha activates 2nd house themes of accumulated resources, established professional identity, and the foundations of material security. Combined with Saturn Mahadasha's karmic weight, Ketu AD tends to strip away professional structures that were built on inadequate foundations or that no longer align with the soul's deeper trajectory. This can manifest as a role ending, an industry disruption, a significant shift in organisational structure, or a profound internal disconnection from previously motivating work. The critical signal is not a prediction of catastrophe — it is a pattern indicator that external career ambition tends to yield poor returns during Ketu periods, and that the most productive use of 2030 is inward consolidation and preparation for the next cycle.",
    careerHardTruth: "Ketu periods are specifically hostile to careers built on ego-identification, status-signalling, or purely external validation — and your chart's Mars-Sun combination in the 10th has a strong ego-invested career signature. The hard truth: if your professional identity is tightly fused with your self-worth, Ketu AD will be painful regardless of what actions you take. The dissolution it brings is often proportional to the rigidity of attachment. Careers built on genuine competence and documented contribution (as outlined in 2026–2027's Saturn discipline work) survive Ketu AD relatively intact; careers built on visibility, relationships, or informal authority are more vulnerable.",
    careerActions: [
      "Proactively document and protect your professional intellectual property, contractual rights, and institutional relationships before Q2 2030 — Ketu AD can create confusion or loss around 2nd house matters, and pre-emptive protection is more effective than post-hoc recovery.",
      "Identify which aspects of your professional role carry genuine long-term meaning versus which are purely status-or-income-driven — Ketu AD forces this audit anyway; doing it deliberately reduces the pain and allows you to retain what matters.",
      "Use the relative professional quietude of 2030 to invest in skills or knowledge domains that transcend the current role or industry — Ketu periods are exceptionally productive for deep study, retreat, and the absorption of knowledge that will inform the next 7-year cycle."
    ],
    wealth: "The critical wealth signal (29/100) reflects Ketu AD's natural tendency to dissolve material accumulation and create unexpected outflows. Ketu in the 2nd house natally combined with its Antardasha creates a double activation of 2nd house disruption: savings may erode through unexpected expenses, investments may underperform or require liquidation, and income channels disrupted by career instability reduce inflows simultaneously. This is the wealth year to treat purely as preservation and survival, not growth. Saturn Mahadasha's aspect on the 2nd house compounds the weight on accumulated resources. The entire wealth strategy for 2030 is defensive: protect what was built in 2028–2029, eliminate leverage, and hold maximum liquidity.",
    wealthHardTruth: "Ketu AD is the most financially dangerous period of the five-year window — not because large losses are certain, but because the combination of unexpected outflows, income disruption, and psychological detachment from material concerns creates conditions where significant assets can be lost through inattention or impulsive spiritual-idealistic decisions. The specific risk pattern: Ketu's influence can create a paradoxical wealth indifference (money feels unimportant, renunciation seems appealing) precisely when careful stewardship is most needed. The passive income structures and documented assets established in 2029 are the primary financial defences for 2030.",
    wealthActions: [
      "Move a significant portion of investable assets into low-volatility, hands-off instruments before Q1 2030 — Ketu AD's disruptive energy most impacts actively managed positions; set-and-forget structures are more resilient.",
      "Eliminate all leverage and non-essential financial complexity before Ketu AD fully activates — every liability, every joint financial arrangement requiring active management, and every speculative position should be reviewed and ideally closed.",
      "Maintain the passive income stream formalised in 2029 as the primary financial anchor — do not restructure or renegotiate these arrangements during Ketu AD unless absolutely necessary; Ketu disrupts renegotiations more often than it improves them."
    ],
    health: "Ketu AD is associated with unexplained health presentations — symptoms that are real but diagnostically elusive, or chronic conditions that intensify without clear cause. Prioritise immune system support, mental health practices, and regular sleep as the baseline. The specific risk pattern for Ketu in the 2nd house involves the face, mouth, and throat — dental and ENT preventive care is particularly relevant. Spiritual or contemplative practices are not merely psychological comfort during Ketu periods; they are physiologically protective, reducing the chronic stress load that Ketu-Saturn combinations can generate.",
    keyMonths: ["Feb 2030", "May 2030", "Aug 2030", "Nov 2030"],
    do: [
      "Protect intellectual property, contractual rights, and institutional relationships before Q2",
      "Move investable assets into low-volatility, hands-off instruments before Ketu AD fully activates",
      "Use the professional quietude for deep study, retreat, and knowledge absorption",
      "Maintain the passive income structures formalised in 2029 without renegotiating them",
      "Prioritise immune support, mental health practices, and dental/ENT preventive care"
    ],
    dont: [
      "Take on new leverage, joint financial complexity, or speculative positions",
      "Restructure or renegotiate financial arrangements during Ketu AD — it disrupts more than it improves",
      "Make impulsive career moves or new venture launches during this stripping period",
      "Let wealth indifference created by Ketu's energy lead to inattentive asset loss",
      "Fuse professional identity with external validation — Ketu will dissolve what ego cannot hold"
    ]
  }
];

const WEALTH_RATINGS = {
  bullish:  { label:"🚀 BULLISH",  color:"#22C55E", bg:"rgba(34,197,94,0.12)" },
  high:     { label:"💰 HIGH",     color:"#F97316", bg:"rgba(249,115,22,0.12)" },
  medium:   { label:"🟢 MEDIUM",   color:"#06B6D4", bg:"rgba(6,182,212,0.12)" },
  low:      { label:"🟡 LOW",      color:"#F59E0B", bg:"rgba(245,158,11,0.12)" },
  critical: { label:"🔴 CRITICAL", color:"#EF4444", bg:"rgba(239,68,68,0.12)" }
};

function generateCalendar(days) {
  const today = new Date();
  const dayWeights = [0.55,0.60,0.72,0.65,0.80,0.50,0.45]; // Sun-Sat
  const result = [];
  const factors = {
    green:  ["Jupiter hora — expansion favored","Shukla Paksha — waxing Moon","Jupiter in 11th from Moon — gains window","Auspicious Tithi — Panchami","Thursday — Jupiter's day"],
    neutral:["Mixed planetary influences","Waning Moon — consolidate","Saturn in upachaya — steady work","Neutral Tithi — regular day"],
    red:    ["Sade Sati phase — caution advised","Ashtami — challenging tithi","Saturn opposite natal Moon","Rahu transit — unpredictable energy","Amavasya — rest and reflect"]
  };
  for (let i = 0; i < days; i++) {
    const d = new Date(today); d.setDate(today.getDate() + i);
    const dow = d.getDay();
    const wave = 0.5 + 0.4 * Math.sin((i / 9) * Math.PI);
    const base = dayWeights[dow] * 0.6 + wave * 0.4;
    const noise = (Math.sin(i * 7.3 + 13) + 1) / 2 * 0.15;
    const raw = Math.min(0.97, Math.max(0.05, base + noise - 0.1));
    const score = Math.round(raw * 100);
    const signal = score >= 70 ? "green" : score >= 40 ? "neutral" : "red";
    const fList = factors[signal];
    result.push({
      date: new Date(d),
      signal,
      score,
      factor: fList[i % fList.length],
      guidance: signal === "green" ? "Favorable for decisions and new initiatives." :
                signal === "red"   ? "Consolidate; avoid major financial commitments." :
                                     "Steady execution. No bold moves needed."
    });
  }
  return result;
}

const SLIDER_KEYFRAMES = [
  { day:0,    dasha:"Saturn/Jupiter",  saturn:"Aquarius", jupiter:"Taurus",  rahu:"Aries",    h2:"neutral", h10:"red",     h11:"neutral", score:58, event:"Jupiter Antardasha active" },
  { day:180,  dasha:"Saturn/Jupiter",  saturn:"Aquarius", jupiter:"Gemini",  rahu:"Aries",    h2:"neutral", h10:"neutral", h11:"neutral", score:62, event:null },
  { day:365,  dasha:"Saturn/Jupiter",  saturn:"Pisces",   jupiter:"Cancer",  rahu:"Pisces",   h2:"green",   h10:"neutral", h11:"green",   score:78, event:"Jupiter exalted in Cancer — peak gains" },
  { day:540,  dasha:"Saturn/Mercury",  saturn:"Pisces",   jupiter:"Leo",     rahu:"Pisces",   h2:"green",   h10:"green",   h11:"green",   score:88, event:"Mercury AD begins — Budhaditya Yoga peak" },
  { day:730,  dasha:"Saturn/Mercury",  saturn:"Aries",    jupiter:"Leo",     rahu:"Aquarius", h2:"green",   h10:"green",   h11:"green",   score:85, event:"The Great Switch window — Aug 2027" },
  { day:912,  dasha:"Saturn/Ketu",     saturn:"Aries",    jupiter:"Virgo",   rahu:"Aquarius", h2:"red",     h10:"neutral", h11:"neutral", score:31, event:"Ketu AD begins — consolidation phase" },
  { day:1095, dasha:"Saturn/Ketu",     saturn:"Taurus",   jupiter:"Libra",   rahu:"Capricorn",h2:"red",     h10:"red",     h11:"neutral", score:28, event:"Caution: Saturn in Taurus — 7th from Moon" },
  { day:1277, dasha:"Saturn/Venus",    saturn:"Taurus",   jupiter:"Scorpio", rahu:"Capricorn",h2:"neutral", h10:"green",   h11:"green",   score:82, event:"Venus AD begins — partnership wealth" },
  { day:1460, dasha:"Saturn/Venus",    saturn:"Gemini",   jupiter:"Leo",     rahu:"Sagittarius",h2:"green", h10:"green",   h11:"green",   score:85, event:"Jupiter in Leo — career + wealth alignment" },
  { day:1825, dasha:"Saturn/Venus",    saturn:"Gemini",   jupiter:"Virgo",   rahu:"Sagittarius",h2:"green", h10:"green",   h11:"neutral", score:79, event:null }
];

function getFrameForDay(dayIndex) {
  let prev = SLIDER_KEYFRAMES[0], next = SLIDER_KEYFRAMES[1];
  for (let i = 0; i < SLIDER_KEYFRAMES.length - 1; i++) {
    if (dayIndex >= SLIDER_KEYFRAMES[i].day && dayIndex <= SLIDER_KEYFRAMES[i+1].day) {
      prev = SLIDER_KEYFRAMES[i]; next = SLIDER_KEYFRAMES[i+1]; break;
    }
  }
  const t = (dayIndex - prev.day) / Math.max(1, next.day - prev.day);
  const score = Math.round(prev.score + (next.score - prev.score) * t);
  const date = new Date(); date.setDate(date.getDate() + dayIndex);
  return { dayIndex, date, dasha: prev.dasha, saturn: prev.saturn, jupiter: prev.jupiter,
           rahu: prev.rahu, h2: prev.h2, h10: prev.h10, h11: prev.h11, score,
           signal: score >= 70 ? "green" : score >= 40 ? "neutral" : "red",
           keyEvent: Math.abs(dayIndex - prev.day) < 15 ? prev.event : null };
}

function findAuspiciousDates(activityType, calData) {
  const minScore = { travel:65, investment:75, new_venture:70, meeting:60 }[activityType] || 65;
  const prefDow  = { travel:[1], investment:[4], new_venture:[3,4], meeting:[1,3,4] }[activityType] || [4];
  return calData
    .filter(d => d.score >= minScore && prefDow.includes(d.date.getDay()))
    .sort((a,b) => b.score - a.score)
    .slice(0, 3);
}

function hashBirthData(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 1000;
  return h;
}

// ── HOUSE THEMES (lifted from vedic-chart-explorer/sampleChart.js) ──
const HOUSE_THEMES_RICH = {
  1:  { title:"The Self",        subtitle:"Body, Vitality, Outward Persona" },
  2:  { title:"Resources",       subtitle:"Speech, Family Wealth, Inheritance" },
  3:  { title:"Courage",         subtitle:"Siblings, Skill, Communication" },
  4:  { title:"Roots",           subtitle:"Home, Mother, Inner Peace" },
  5:  { title:"Creation",        subtitle:"Children, Romance, Intelligence" },
  6:  { title:"Service",         subtitle:"Work, Health, Adversaries" },
  7:  { title:"Partnership",     subtitle:"Marriage, Contracts, the Other" },
  8:  { title:"Transformation",  subtitle:"Crisis, Inheritance, the Hidden" },
  9:  { title:"Dharma",          subtitle:"Father, Teachers, Higher Learning" },
  10: { title:"Vocation",        subtitle:"Career, Public Role, Authority" },
  11: { title:"Gains",           subtitle:"Networks, Aspirations, Elder Siblings" },
  12: { title:"Liberation",      subtitle:"Loss, Foreign Lands, the Subconscious" }
};

// ── 27 NAKSHATRAS (lifted from vedic-chart-explorer/backend/main.py) ──
// [name, dashaLord, deity, symbol, classicalTheme]
const NAKSHATRAS_27 = [
  ["Ashwini",           "Ketu",    "Ashwini Kumaras", "Horse's head",           "Swift beginnings, healing, the rush of new energy."],
  ["Bharani",           "Venus",   "Yama",            "Yoni",                   "Bearing, restraint, the crucible of transformation."],
  ["Krittika",          "Sun",     "Agni",            "Razor / flame",          "Cutting clarity, purification through fire."],
  ["Rohini",            "Moon",    "Brahma",          "Ox-cart",                "Growth, beauty, and the act of creating something lasting in the material world."],
  ["Mrigashira",        "Mars",    "Soma",            "Deer's head",            "Seeking, gentle pursuit, the restlessness of the curious mind."],
  ["Ardra",             "Rahu",    "Rudra",           "Teardrop",               "Storm and renewal, the necessity of breaking down to rebuild."],
  ["Punarvasu",         "Jupiter", "Aditi",           "Bow and quiver",         "Return, recovery, the soul's perennial homecoming."],
  ["Pushya",            "Saturn",  "Brihaspati",      "Cow's udder",            "Nourishment, providing, the discipline of care."],
  ["Ashlesha",          "Mercury", "Nagas",           "Coiled serpent",         "Penetrating insight, the wisdom that arrives through entanglement."],
  ["Magha",             "Ketu",    "Pitrs",           "Throne",                 "Ancestral inheritance, the weight and gift of lineage."],
  ["Purva Phalguni",    "Venus",   "Bhaga",           "Front legs of a bed",    "Enjoyment, creative partnership, the pleasure that fuels work."],
  ["Uttara Phalguni",   "Sun",     "Aryaman",         "Back legs of a bed",     "Generous patronage, dependable partnership, the steady gift."],
  ["Hasta",             "Moon",    "Savitr",          "Hand",                   "Skill, craft, the precise grasp of the world."],
  ["Chitra",            "Mars",    "Tvashtar",        "Bright jewel",           "Brilliance, design, the gem cut to catch the light."],
  ["Swati",             "Rahu",    "Vayu",            "Young shoot in the wind","Independence, the flexibility that survives the storm."],
  ["Vishakha",          "Jupiter", "Indra-Agni",      "Triumphal arch",         "Goal-oriented intensity, the focused will of ambition."],
  ["Anuradha",          "Saturn",  "Mitra",           "Lotus",                  "Friendship, devotion, the bonds that organise a life."],
  ["Jyeshtha",          "Mercury", "Indra",           "Earring / umbrella",     "Eldership, authority, the burden of being the one who knows."],
  ["Mula",              "Ketu",    "Nirriti",         "Bunch of roots",         "Root-cutting, the search beneath surfaces."],
  ["Purva Ashadha",     "Venus",   "Apas",            "Elephant tusk",          "Invincibility, the conviction of one's own water."],
  ["Uttara Ashadha",    "Sun",     "Vishvadevas",     "Elephant tusk",          "Lasting victory, the slow accumulation of unassailable position."],
  ["Shravana",          "Moon",    "Vishnu",          "Ear",                    "Listening, learning, the receptivity that becomes wisdom."],
  ["Dhanishta",         "Mars",    "Vasus",           "Drum",                   "Rhythm, abundance, the music of accomplishment."],
  ["Shatabhisha",       "Rahu",    "Varuna",          "Empty circle",           "Healing through mystery, the secret medicine."],
  ["Purva Bhadrapada",  "Jupiter", "Aja Ekapada",     "Two-faced man",          "Spiritual fire, the heat that transforms."],
  ["Uttara Bhadrapada", "Saturn",  "Ahir Budhnya",    "Two-faced man",          "Deep waters, the wisdom of stillness."],
  ["Revati",            "Mercury", "Pushan",          "Fish",                   "Safe passage, the kindly guide to the next shore."]
];

// Lookup by name → object
function getNakshatraData(name) {
  const n = NAKSHATRAS_27.find(r => r[0] === name);
  if (!n) return null;
  return { name:n[0], lord:n[1], deity:n[2], symbol:n[3], theme:n[4] };
}

// Jaimini Karaka roles (for full 7-karaka display)
const KARAKA_ROLES = [
  { key:"atmakaraka",   label:"Ātmakāraka (AK)",   desc:"Soul indicator — the planet with highest degree" },
  { key:"amatyakaraka", label:"Amātyakāraka (AmK)", desc:"Vocational minister — professional path" },
  { key:"bhratrukaraka",label:"Bhrātṛkāraka (BK)",  desc:"Sibling / courage indicator" },
  { key:"matrukaraka",  label:"Mātṛkāraka (MK)",   desc:"Mother / property indicator" },
  { key:"putrakaraka",  label:"Putrakāraka (PK)",   desc:"Child / creative intelligence indicator" },
  { key:"gnatikaraka",  label:"Gnātikāraka (GK)",   desc:"Spiritual struggle / cousin indicator" },
  { key:"darakaraka",   label:"Dārakāraka (DK)",    desc:"Spouse / partnership indicator" }
];

/* ═══ DYNAMIC FORECAST GENERATOR ═══ */

// Dasha theme templates — career/wealth/health text by planet combination
const DASHA_THEMES = {
  Sun: {
    career: "This is your time to step into the spotlight. Think of it as a period where the universe is literally shining a light on you — promotions, recognition, and leadership opportunities tend to find you rather than the other way around. If you have been working hard in the background, people in authority will start to notice. This is the time to raise your hand, ask for that raise, and stop playing small.",
    wealth: "Money tends to come through your position, reputation, or official work during this period. Government jobs, corporate salaries, and income from established institutions are favored. Be careful of spending on status symbols — the urge to look successful can cost more than the actual success earns.",
    health: "Your energy levels are high but so is the risk of burning yourself out chasing achievement. Your eyes and heart deserve special attention — schedule that check-up you have been postponing. Sun periods can make you feel invincible, which is exactly when people push too hard."
  },
  Moon: {
    career: "Work feels more personal during this time — your relationships at work matter more than your strategy. Roles that involve caring for people, working with the public, or creating emotional connections will flourish. If you are in a purely analytical or isolated role, you may feel a pull toward something more human. Trust that instinct.",
    wealth: "Your income may fluctuate month to month rather than following a steady upward line — this is normal for Moon periods and not a reason to panic. Real estate, food businesses, and anything that serves people's daily needs are good financial themes. Build a buffer for the leaner months.",
    health: "Your mental and emotional health is the barometer for everything else this period. When you feel good emotionally, everything works better. When you don't, everything suffers. Prioritise sleep above almost everything — Moon periods punish sleep deprivation hard."
  },
  Mars: {
    career: "You have more energy and drive than usual, and you will feel it every morning. New projects, entrepreneurial moves, and competitive situations are where you will shine. The trap is that Mars energy can make you impatient and combative with colleagues — the same force that makes you productive can make you difficult to work with if you don't channel it well.",
    wealth: "Short-term gains are very possible if you are willing to move fast and take calculated risks. Property, technical work, and anything requiring physical effort or courage can pay off. Avoid reckless financial decisions made in the heat of the moment — Mars periods produce both bold wins and impulsive losses.",
    health: "Your physical energy is high but accidents, cuts, and injuries are more likely when you are rushing. Blood pressure deserves monitoring. Channel the physical energy into structured exercise rather than letting it build up as stress and aggression."
  },
  Mercury: {
    career: "Your mind is your greatest asset right now. Writing, speaking, analyzing, selling, coding, teaching — anything that requires sharp thinking and clear communication will go better than usual. If you have been sitting on an idea for a business, book, or project, this is the period to actually start it. Mercury periods reward people who communicate clearly and think fast.",
    wealth: "Multiple income streams suit you now — don't rely on just one source. Trading, consulting, content creation, and knowledge-based work are all strong wealth themes. Mercury periods tend to produce income in smaller, more frequent amounts rather than one big windfall.",
    health: "Your nervous system is working overtime and it will show — anxiety, restlessness, and overthinking are the characteristic challenges. Build deliberate rest into your schedule. Your skin and digestive system can also act up when Mercury is under pressure."
  },
  Jupiter: {
    career: "This is genuinely one of the best periods for professional growth in the entire cycle. Opportunities come easily — sometimes frustratingly so, because there are almost too many good options. Teaching, advising, leading, publishing, and any work involving wisdom or guidance fits this period. Even if you don't feel ready, say yes to the bigger opportunity.",
    wealth: "Jupiter is the planet of abundance, and this period tends to deliver. Investments made now have a good track record of growing. Multiple income sources, bonuses, inheritances, and unexpected financial good news are all possibilities. The main risk is overconfidence — not every Jupiter period makes everyone rich, but it does create real opportunities if you act on them.",
    health: "Physical health is generally good, but weight gain and overindulgence are the classic Jupiter challenges. The abundance mentality that helps you financially can also show up as eating too much, doing too little, or taking your good health for granted. Maintain your routines."
  },
  Venus: {
    career: "Partnership and collaboration are your superpowers right now. Business alliances, joint ventures, and client relationships formed during Venus periods tend to be lasting and valuable. Creative work, design, luxury goods, beauty industries, and anything requiring taste and aesthetics are strongly supported. Diplomacy will take you further than confrontation.",
    wealth: "Material comfort increases — this is one of the better periods for enjoying life's pleasures while also building wealth. Income through partnerships, commissions, creative work, and relationship-based enterprise flows naturally. Property acquisition is well-supported. The risk is spending on luxury faster than you earn.",
    health: "Reproductive health, kidneys, and your lower back deserve attention. Venus periods can bring a softness and indulgence that, left unchecked, becomes overindulgence. Keep moving — Venus periods make it tempting to be sedentary."
  },
  Saturn: {
    career: "This is not a glamorous period — it is a building period. Think of it as the universe sending you back to basics: fix what is broken, build systems that last, stop cutting corners. Progress will feel slow but every step you take is permanent. The people who use Saturn periods to consolidate and build structure tend to be the ones who rocket forward in the next Jupiter or Mercury period.",
    wealth: "Saturn rewards patience and punishes greed. This is not the time for speculative investments or get-rich-quick moves — they will almost certainly backfire. Instead, clear debts, build savings, and make conservative long-term investments. Slow and steady genuinely works better during Saturn periods.",
    health: "Your joints, spine, teeth, and bones need more attention than usual. Anything you have been ignoring in your body will likely announce itself during Saturn periods. This is actually a good thing — better to catch and fix now than ignore until it becomes serious. Routine and structure in your daily health habits will serve you enormously."
  },
  Rahu: {
    career: "Rahu periods are wild cards — unconventional opportunities appear from unexpected directions. Technology, foreign connections, new industries, and paths that didn't exist five years ago are all strong Rahu themes. The career moves that feel slightly risky or unusual are often exactly the right ones during this period. Stay ethically grounded — Rahu periods can tempt you toward shortcuts that cost you later.",
    wealth: "Unusual gains are genuinely possible — Rahu can produce windfalls from unexpected sources. But it can also produce unexpected losses with equal surprise. The financial theme of Rahu periods is volatility, which means both the gains and the risks are larger than normal. Diversify, keep some reserves liquid, and don't put everything into one bet.",
    health: "Rahu periods can produce health symptoms that are hard to diagnose or that come and go mysteriously. Gut health, sleep quality, and mental clarity deserve consistent attention. Reduce chemical exposure, processed food, and screen time where possible — Rahu is associated with toxins in the classical tradition."
  },
  Ketu: {
    career: "Ketu periods are about going inward rather than outward. External ambition tends to feel hollow or frustrating — and that frustration is actually the planet's gift, redirecting you toward deeper work. Research, spiritual practice, behind-the-scenes contributions, and work that requires deep focus rather than visibility suit this period. Don't force career launches during Ketu — let things complete and consolidate instead.",
    wealth: "Finances can feel out of your control during Ketu periods — expenses appear unexpectedly and income can feel elusive despite your effort. This is a period to protect what you have, clear old debts, and avoid new financial commitments unless absolutely necessary. The silver lining: Ketu periods often create the space that the next Dasha fills with something better.",
    health: "Ketu periods can produce subtle or neurological symptoms — fatigue, vague discomfort, or a general feeling of being ungrounded. Grounding practices (walking barefoot, time in nature, meditation, consistent sleep schedule) help significantly. Avoid excessive technology and news consumption."
  }
};

const PLANET_COLORS_DASHA = {
  Sun:"#F59E0B", Moon:"#94A3B8", Mars:"#EF4444", Mercury:"#10B981",
  Jupiter:"#F97316", Venus:"#EC4899", Saturn:"#6366F1", Rahu:"#8B5CF6", Ketu:"#78716C"
};

const RATING_BY_PLANET = {
  Sun:{career:4,wealth:3}, Moon:{career:3,wealth:3}, Mars:{career:4,wealth:3},
  Mercury:{career:5,wealth:4}, Jupiter:{career:5,wealth:5}, Venus:{career:4,wealth:5},
  Saturn:{career:2,wealth:2}, Rahu:{career:3,wealth:3}, Ketu:{career:2,wealth:2}
};

const SIGNAL_BY_PLANET = {
  Sun:"medium", Moon:"medium", Mars:"high", Mercury:"bullish",
  Jupiter:"bullish", Venus:"high", Saturn:"low", Rahu:"medium", Ketu:"critical"
};

const SCORE_BY_PLANET = {
  Sun:65, Moon:60, Mars:72, Mercury:85, Jupiter:88, Venus:78, Saturn:42, Rahu:58, Ketu:30
};

function parseDashaDate(str) {
  // Parse "Aug 2022", "May 2025" etc → Date object
  if (!str) return new Date();
  const months = {Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11};
  const parts = str.trim().split(' ');
  if (parts.length >= 2) return new Date(parseInt(parts[1]), months[parts[0]] || 0, 1);
  return new Date();
}

function getDashaForYear(chart, targetYear) {
  // Determine which MD/AD is active in the middle of targetYear (July 1)
  const targetDate = new Date(targetYear, 6, 1);
  const md = chart.dasha.current;
  const ad = chart.dasha.antardasha;
  const mdStart = parseDashaDate(md.start);
  const mdEnd   = parseDashaDate(md.end);
  const adStart = parseDashaDate(ad.start);
  const adEnd   = parseDashaDate(ad.end);

  let mdPlanet = md.planet || md.lord || 'Saturn';
  let adPlanet = ad.planet || ad.lord || 'Jupiter';

  // If target year is beyond current AD, estimate next AD
  // Simple approximation: use MD planet for out-of-range years
  if (targetDate > adEnd) {
    // Next AD is unknown without full sequence; use MD planet as approximation
    adPlanet = mdPlanet;
  }
  if (targetDate < mdStart || targetDate > mdEnd) {
    // Outside MD range — use available data
    mdPlanet = md.planet || 'Saturn';
  }
  return { mdPlanet, adPlanet };
}

function generateKeyMonths(year, adPlanet) {
  const PLANET_MONTHS = {
    Sun:["Feb","Jun","Oct"], Moon:["Jan","May","Sep"], Mars:["Mar","Jul","Nov"],
    Mercury:["Apr","Aug","Dec"], Jupiter:["Mar","Jul","Nov"], Venus:["Feb","Jun","Oct"],
    Saturn:["May","Sep","Jan"], Rahu:["Apr","Aug","Dec"], Ketu:["Mar","Sep","Dec"]
  };
  const months = PLANET_MONTHS[adPlanet] || ["Mar","Jul","Oct"];
  return months.map(m => `${m} ${year}`);
}

function computeChartStrength(chart) {
  if (!chart || !chart.planetTable) return 74;
  // Count planets in strong dignities
  let score = 40; // base
  const dignityScores = { 'Exalted': 15, 'Own Sign': 10, 'Moolatrikona': 8, 'Friendly': 4, 'Neutral/Friendly': 3, 'Neutral': 2, 'Enemy': -2, 'Debilitated': -8 };
  chart.planetTable.forEach(p => {
    score += dignityScores[p.dignity] || 2;
  });
  // Bonus for yogas
  if (chart.yogas) score += chart.yogas.length * 4;
  // Bonus for wealth score
  if (chart.wealthScore && chart.wealthScore.total > 60) score += 5;
  return Math.min(98, Math.max(20, score));
}

function generateDynamicForecast(chart) {
  const years = [2026, 2027, 2028, 2029, 2030];
  const lagna = chart.lagna ? (chart.lagna.signEn || chart.lagna.sign) : 'Scorpio';
  const moonSign = chart.moonSign ? (chart.moonSign.signEn || chart.moonSign.sign) : 'Taurus';

  // Classical house lord assignments per Lagna (Parashari Whole Sign)
  const LAGNA_HOUSE_LORDS = {
    Aries:       {1:'Mars',2:'Venus',3:'Mercury',4:'Moon',5:'Sun',6:'Mercury',7:'Venus',8:'Mars',9:'Jupiter',10:'Saturn',11:'Saturn',12:'Jupiter'},
    Taurus:      {1:'Venus',2:'Mercury',3:'Mars',4:'Sun',5:'Mercury',6:'Venus',7:'Mars',8:'Jupiter',9:'Saturn',10:'Saturn',11:'Jupiter',12:'Mars'},
    Gemini:      {1:'Mercury',2:'Moon',3:'Sun',4:'Mercury',5:'Venus',6:'Mars',7:'Jupiter',8:'Saturn',9:'Saturn',10:'Jupiter',11:'Mars',12:'Venus'},
    Cancer:      {1:'Moon',2:'Sun',3:'Mercury',4:'Venus',5:'Mars',6:'Jupiter',7:'Saturn',8:'Saturn',9:'Jupiter',10:'Mars',11:'Venus',12:'Mercury'},
    Leo:         {1:'Sun',2:'Mercury',3:'Venus',4:'Mars',5:'Jupiter',6:'Saturn',7:'Saturn',8:'Jupiter',9:'Mars',10:'Venus',11:'Mercury',12:'Moon'},
    Virgo:       {1:'Mercury',2:'Venus',3:'Mars',4:'Jupiter',5:'Saturn',6:'Saturn',7:'Jupiter',8:'Mars',9:'Venus',10:'Mercury',11:'Moon',12:'Sun'},
    Libra:       {1:'Venus',2:'Mars',3:'Jupiter',4:'Saturn',5:'Saturn',6:'Jupiter',7:'Mars',8:'Venus',9:'Mercury',10:'Moon',11:'Sun',12:'Mercury'},
    Scorpio:     {1:'Mars',2:'Jupiter',3:'Saturn',4:'Saturn',5:'Jupiter',6:'Mars',7:'Venus',8:'Mercury',9:'Moon',10:'Sun',11:'Mercury',12:'Venus'},
    Sagittarius: {1:'Jupiter',2:'Saturn',3:'Saturn',4:'Jupiter',5:'Mars',6:'Venus',7:'Mercury',8:'Moon',9:'Sun',10:'Mercury',11:'Venus',12:'Mars'},
    Capricorn:   {1:'Saturn',2:'Saturn',3:'Jupiter',4:'Mars',5:'Venus',6:'Mercury',7:'Moon',8:'Sun',9:'Mercury',10:'Venus',11:'Mars',12:'Jupiter'},
    Aquarius:    {1:'Saturn',2:'Jupiter',3:'Mars',4:'Venus',5:'Mercury',6:'Moon',7:'Sun',8:'Mercury',9:'Venus',10:'Mars',11:'Jupiter',12:'Saturn'},
    Pisces:      {1:'Jupiter',2:'Mars',3:'Venus',4:'Mercury',5:'Moon',6:'Sun',7:'Mercury',8:'Venus',9:'Mars',10:'Jupiter',11:'Saturn',12:'Saturn'}
  };

  // Which houses each planet rules for this Lagna
  const houseLords = LAGNA_HOUSE_LORDS[lagna] || LAGNA_HOUSE_LORDS.Scorpio;

  // Find which houses a planet rules
  function ruledHouses(planet) {
    return Object.entries(houseLords).filter(([h,p]) => p === planet).map(([h]) => parseInt(h));
  }

  // House signification labels
  const HOUSE_LABELS = {1:'self/body',2:'wealth/speech',3:'courage/siblings',4:'home/mother',5:'intellect/children',6:'enemies/health',7:'partnership',8:'transformation/longevity',9:'fortune/dharma',10:'career/status',11:'gains/income',12:'expenditure/liberation'};

  // Classify planet as benefic/malefic for this lagna based on house lordship
  function planetQuality(planet) {
    const houses = ruledHouses(planet);
    const beneficHouses = [1,5,9,4,7,10,11]; // trikona + kendra + labha
    const maleficHouses = [6,8,12]; // dusthana
    const beneficCount = houses.filter(h => beneficHouses.includes(h)).length;
    const maleficCount = houses.filter(h => maleficHouses.includes(h)).length;
    if (maleficCount > 0 && beneficCount === 0) return 'challenging';
    if (beneficCount >= 1 && houses.includes(9)) return 'highly_benefic';
    if (beneficCount >= 1 && (houses.includes(10) || houses.includes(11))) return 'career_benefic';
    if (beneficCount >= 1 && houses.includes(5)) return 'dharma_benefic';
    if (beneficCount > 0) return 'benefic';
    return 'neutral';
  }

  return years.map((year) => {
    const { mdPlanet, adPlanet } = getDashaForYear(chart, year);
    const mdTheme = DASHA_THEMES[mdPlanet] || DASHA_THEMES.Saturn;
    const adTheme = DASHA_THEMES[adPlanet] || DASHA_THEMES.Jupiter;

    // Lagna-specific analysis
    const mdHouses = ruledHouses(mdPlanet);
    const adHouses = ruledHouses(adPlanet);
    const mdQuality = planetQuality(mdPlanet);
    const adQuality = planetQuality(adPlanet);

    const mdHouseStr = mdHouses.map(h => `${h}th (${HOUSE_LABELS[h]})`).join(' and ');
    const adHouseStr = adHouses.map(h => `${h}th (${HOUSE_LABELS[h]})`).join(' and ');

    const qualityNote = {
      highly_benefic: 'This is a dharmic period — fortune, teachers, and higher purpose are strongly activated.',
      career_benefic: 'Career and income houses are actively supported — a structurally productive period.',
      dharma_benefic: 'Intelligence, creativity, and meritorious activity are highlighted.',
      benefic: 'The period carries constructive energy for the activated house themes.',
      neutral: 'Mixed results — some areas progress while others require patience.',
      challenging: 'This period activates difficult house themes — caution, patience, and remedies are advised.'
    }[adQuality] || '';

    const rating = adQuality === 'highly_benefic' ? {career:5,wealth:5} :
                   adQuality === 'career_benefic'  ? {career:4,wealth:4} :
                   adQuality === 'dharma_benefic'  ? {career:4,wealth:3} :
                   adQuality === 'benefic'         ? {career:3,wealth:3} :
                   adQuality === 'challenging'     ? {career:2,wealth:2} :
                                                     {career:3,wealth:3};

    const signal = adQuality === 'highly_benefic' ? 'bullish' :
                   adQuality === 'career_benefic'  ? 'high' :
                   adQuality === 'dharma_benefic'  ? 'medium' :
                   adQuality === 'benefic'         ? 'medium' :
                   adQuality === 'challenging'     ? 'critical' : 'low';

    const score = {bullish:86, high:74, medium:62, low:44, critical:30}[signal] || 55;
    const color = PLANET_COLORS_DASHA[mdPlanet] || '#6366F1';

    const career = `For ${lagna} Lagna, ${mdPlanet} rules the ${mdHouseStr} — making this Mahadasha fundamentally about these life areas. ${mdTheme.career} During ${year}, the ${adPlanet} Antardasha activates the ${adHouseStr} from your Lagna. ${adTheme.career} ${qualityNote}`;

    const wealth = `${mdPlanet} as lord of the ${mdHouseStr} sets the wealth context for this Mahadasha. ${mdTheme.wealth} The ${adPlanet} Antardasha (lord of ${adHouseStr}) ${adQuality === 'career_benefic' || adQuality === 'highly_benefic' ? `supports financial growth — the activated houses are constructive for ${moonSign} Moon natives.` : 'requires careful financial management — the activated house themes carry expenditure or transformation themes.'} ${adTheme.wealth}`;

    return {
      year,
      dasha: `${mdPlanet} MD / ${adPlanet} AD`,
      dashaColor: color,
      dashaTheme: `${mdPlanet} Mahadasha · ${adPlanet} Antardasha — ${signal.charAt(0).toUpperCase()+signal.slice(1)} for ${lagna} Lagna`,
      rating,
      signal,
      score,
      career,
      careerHardTruth: `For ${lagna} Lagna specifically, ${adPlanet} as lord of the ${adHouseStr} carries a precise karmic weight during ${year}. ${adQuality === 'challenging' ? `The dusthana (difficult house) lordship means this Antardasha period requires working through obstacles rather than bypassing them — shortcuts will compound the challenge.` : `The house lordship structure means professional actions aligned with ${adHouseStr} themes will be rewarded, while those misaligned will face structural resistance.`} The specific months when ${adPlanet} receives favorable transit support are your highest-leverage windows.`,
      careerActions: [
        `Identify the ${adHouseStr} themes in your life and make one concrete structural improvement in that area before the ${adPlanet} Antardasha ends.`,
        `Track when Jupiter transits your ${mdHouses.includes(10) || adHouses.includes(10) ? '10th' : '11th'} house — that 12-month window is your strongest career action period within this Dasha cycle.`,
        `For ${lagna} Lagna, ${mdPlanet} Mahadasha rewards ${mdQuality === 'challenging' ? 'patience, remedies, and working within constraints rather than against them.' : `consistent action aligned with ${mdPlanet}'s natural significations — embody those qualities daily.`}`
      ],
      wealth,
      wealthHardTruth: `The ${adPlanet} Antardasha for ${lagna} Lagna activates the ${adHouseStr}. ${adHouses.includes(2) || adHouses.includes(11) ? 'Both wealth houses (2nd and 11th) connection makes this a structurally important period for financial decisions — actions taken now have compounding effects.' : adHouses.includes(12) ? 'The 12th house activation means expenditure is the dominant theme — prioritise debt clearance and asset protection over growth.' : adHouses.includes(8) ? 'The 8th house activation brings transformation to finances — unexpected events require a liquid reserve.' : 'The activated houses carry specific wealth themes — align financial decisions with these areas for optimal results.'}`,
      wealthActions: [
        adQuality === 'challenging' ? 'Build a 6-month emergency reserve before making any new financial commitments.' : `Identify one investment category aligned with your ${adPlanet} Antardasha themes and make a systematic entry.`,
        `When Jupiter transits your 11th house from Moon (${moonSign}), that is your 12-month gains window — time larger financial moves to coincide with it.`,
        `For ${lagna} Lagna, ${mdPlanet} Mahadasha wealth comes through ${mdHouses.includes(2) ? 'accumulated savings and family resources.' : mdHouses.includes(11) ? 'income, networks, and fulfilled desires.' : mdHouses.includes(9) ? 'fortune, dharma, and long-distance connections.' : mdHouses.includes(10) ? 'career achievements and authority.' : `the significations of the houses ${mdPlanet} rules in your chart.`}`
      ],
      health: `${mdTheme.health} During ${adPlanet} Antardasha: ${adTheme.health}`,
      keyMonths: generateKeyMonths(year, adPlanet)
    };
  });
}

/* ═══ INSIGHTS TAB — PLAIN ENGLISH DATA ═══ */

const DIGNITY_STRENGTH = {
  'Exalted':          { stars:5, label:'Very Strong',   color:'#06B6D4', plain:'At peak power — effects are amplified and mostly positive' },
  'Own Sign':         { stars:4, label:'Strong',        color:'#22C55E', plain:'Comfortable and stable — delivers reliable, consistent results' },
  'Moolatrikona':     { stars:4, label:'Strong',        color:'#22C55E', plain:'Near peak — performs with confidence and consistency' },
  'Friendly':         { stars:3, label:'Good',          color:'#F97316', plain:'Comfortable environment — works well with some effort' },
  'Neutral/Friendly': { stars:3, label:'Moderate',      color:'#F59E0B', plain:'Neither boosted nor suppressed — results depend on other factors' },
  'Neutral':          { stars:2, label:'Moderate',      color:'#F59E0B', plain:'Average strength — consistent but unremarkable' },
  'Enemy':            { stars:1, label:'Challenged',    color:'#EF4444', plain:'Under pressure — requires more effort to express positively' },
  'Debilitated':      { stars:1, label:'Needs Support', color:'#EF4444', plain:'At minimum strength — remedies and conscious effort help significantly' }
};

const PLANET_IN_HOUSE_PLAIN = {
  Sun:{ 1:'Your personality radiates authority. People notice you naturally.',2:'You earn through leadership roles. Your speech carries natural gravitas.',3:'Bold, direct communicator. You lead through courage.',4:'Home and family are a matter of pride. Identity is tied to your roots.',5:'Creative leadership and self-expression come naturally.',6:'You overcome obstacles through sheer willpower and work ethic.',7:'Strong, authoritative partners are attracted to you.',8:'Deep transformations shape your core identity.',9:'Philosophy and higher learning define your worldview.',10:'Career and public recognition are central to your life purpose.',11:'Gains come through powerful connections and visible goals.',12:'Strength in solitude and research. Behind-the-scenes work thrives.' },
  Moon:{ 1:'Emotionally expressive and highly intuitive. Your mood influences those around you.',2:'Wealth fluctuates with emotional cycles. Family nourishment is important.',3:'Communication is emotionally rich. Deep connection with siblings.',4:'Deep bond with home and mother. Inner happiness needs domestic stability.',5:'Creative and emotionally engaged. Strong connection with children.',6:'Service-oriented with a nurturing approach to work.',7:'You attract nurturing, emotionally connected partners.',8:'Emotional depth and strong intuition about hidden matters.',9:'Emotional fulfillment through travel and spiritual exploration.',10:'Public role involves emotional connection or nurturing.',11:'Gains through large public networks. Social circles are fulfilling.',12:'Deep inner life and spiritual sensitivity. Energy flows best in quiet spaces.' },
  Mars:{ 1:'High energy, physical drive, and competitive spirit.',2:'Earns through effort or physical work. Speech is assertive.',3:'Courageous communicator. Excellent for competitive fields.',4:'Energy channeled into building and protecting home and assets.',5:'Competitive and passionate in creative pursuits.',6:'Exceptional ability to defeat enemies and overcome obstacles.',7:'Dynamic partnerships. Business benefits from your drive.',8:'Investigative instincts. Ability to transform through crisis.',9:'Philosophy of action. You practice what you preach.',10:'Career in leadership, engineering, law enforcement, or entrepreneurship.',11:'Gains through competitive effort and bold action.',12:'Energy well-spent in foreign lands or spiritual practice.' },
  Mercury:{ 1:'Sharp, articulate mind. Quick thinker who adapts and communicates easily.',2:'Income through communication or commerce. Financially articulate.',3:'Excellent writer, speaker, or teacher. Intellectual sibling bonds.',4:'Analytical approach to home. Education is an important foundation.',5:'Creative intelligence. Excellent for writing, teaching, and speculation.',6:'Analytical problem-solver. Excel at identifying inefficiencies.',7:'Intellectually compatible partnerships. Commerce and communication skills shine.',8:'Research-oriented mind. Interest in investigation and analysis.',9:'Philosophical intellect. Love of learning and cross-cultural communication.',10:'Career in communication, media, technology, or any intellectual field.',11:'Gains through networks, ideas, and information sharing.',12:'Intellectual depth in solitude. Writing and research thrive.' },
  Jupiter:{ 1:'Wise, generous, and optimistic personality. Natural teacher and advisor.',2:'Wealth comes naturally and grows over time. Family values education.',3:'Wisdom shared through communication. Philosophical approach to life.',4:'Fortunate home life. Property and education are blessed.',5:'Exceptional intelligence and creativity. Children bring joy.',6:'Service to others brings fulfillment. Legal fields are supported.',7:'Wise, generous partners. Business partnerships expand naturally.',8:'Wisdom through transformation. Joint finances tend to grow.',9:'Exceptional placement — philosophy, fortune, and higher education maximized.',10:'Career in teaching, law, religion, counseling, or expanding institutions.',11:'Significant gains and fulfilled desires. Networks are wise and supportive.',12:'Spiritual growth and liberation. Wisdom in solitude.' },
  Venus:{ 1:'Attractive, charming personality. Others are naturally drawn to you.',2:'Wealth through arts, beauty, or relationships. Family life is harmonious.',3:'Creative communicator with artistic flair.',4:'Beautiful home environment. Happiness through aesthetics and comfort.',5:'Creative and romantic. Love affairs are passionate and artistic.',6:'Service in healthcare, beauty, or hospitality.',7:'Excellent for marriage and partnerships — Venus rules relationships naturally.',8:'Deep intimacy. Joint finances can be favorable.',9:'Love of beauty through travel and cultural exploration.',10:'Career in arts, fashion, beauty, entertainment, or diplomacy.',11:'Gains through creative work and relationships. Desires are fulfilled pleasurably.',12:'Pleasure in solitude and foreign lands.' },
  Saturn:{ 1:'Disciplined, serious, resilient personality. Life lessons come through structure.',2:'Wealth built slowly and methodically. Speech is measured and careful.',3:'Discipline in communication. Persistence overcomes skill development obstacles.',4:'Home life requires effort and patience. Property acquired through hard work lasts.',5:'Creative discipline. Deep rather than quick intelligence.',6:'Excellent — Saturn excels in service, health routines, and defeating enemies through persistence.',7:'Serious, committed partnerships that last. Require patience and maturity.',8:'Longevity and resilience through crisis. Strong potential for long life.',9:'Wisdom earned through hard experience rather than given freely.',10:'Career built methodically — slow rise, lasting recognition.',11:'Gains come slowly but accumulate significantly over time.',12:'Excellent for spiritual practice and patient work in isolated environments.' },
  Rahu:{ 1:'Unconventional personality with strong ambition and drive to break tradition.',2:'Unconventional sources of wealth. Persuasive and sometimes exaggerated speech.',3:'Bold, unconventional communication style.',4:'Foreign influences transform home life.',5:'Unconventional creative expression. Unexpected circumstances around children.',6:'Excellent for overcoming enemies through unconventional methods.',7:'Unconventional partnerships, often cross-cultural.',8:'Deep fascination with the hidden and transformative.',9:'Unconventional philosophy. Non-traditional paths to higher wisdom.',10:'Sudden career rise through unconventional paths. Technology excels.',11:'Unusual and potentially large gains through diverse networks.',12:'Strong pull toward foreign lands and liberation from convention.' },
  Ketu:{ 1:'Detached, spiritual, introspective personality. Past-life wisdom expressed.',2:'Detachment from material accumulation. Inner wisdom about wealth.',3:'Past-life skill in communication. Less need for external validation.',4:'Inner peace found through spiritual practice rather than domestic life.',5:'Past-life intelligence and creative gifts. Spiritual approach to children.',6:'Past-life service and healing abilities.',7:'Karmic partnerships bringing spiritual lessons.',8:'Deep spiritual insight into transformation and the hidden.',9:'Past-life dharmic wisdom. Detachment from dogmatic religion.',10:'Career serving spiritual or research purposes beyond conventional ambition.',11:'Fulfillment from non-material achievements.',12:'Excellent — Ketu naturally excels in liberation and spiritual practice.' }
};

const KARAKA_PLAIN = {
  Sun:     { soul:'Your soul is here to express authority, confidence, and leadership. At your deepest level, you are driven to be recognised for who you truly are — not just what you do.', career:'Your professional path involves visibility, authority, and leadership. Roles where you are seen and respected align with your cosmic career signature.' },
  Moon:    { soul:'Your soul is here to nurture, feel deeply, and connect emotionally with the world. Inner peace and emotional security are your deepest drives.', career:'Your professional path involves caring for others, emotional intelligence, or public-facing work. You thrive where human connection matters most.' },
  Mars:    { soul:'Your soul is here to act with courage, build, and overcome obstacles. You are driven by the warrior\'s need to create through direct effort and initiative.', career:'Your professional path involves initiative, physical energy, engineering, or entrepreneurship. You thrive where boldness and decisive action are rewarded.' },
  Mercury: { soul:'Your soul is here to communicate, learn, and connect ideas. Intellectual curiosity and the exchange of knowledge are your deepest drives.', career:'Your professional path involves communication, analysis, trade, or technology. You thrive where sharp thinking and clear expression are valued.' },
  Jupiter: { soul:'Your soul is here to grow, teach, and expand wisdom. You are driven by a deep need to understand life\'s meaning and help others grow alongside you.', career:'Your professional path involves teaching, advising, law, finance, or any work that helps others prosper. You thrive where wisdom is the currency.' },
  Venus:   { soul:'Your soul is here to experience beauty, love, and the richness of material life. Connection, harmony, and creative expression are your deepest drives.', career:'Your professional path involves beauty, creativity, relationships, or luxury. You thrive where taste, harmony, and human connection are central.' },
  Saturn:  { soul:'Your soul is here to build, endure, and master through discipline and patience. You are driven to create something that outlasts you.', career:'Your professional path involves structure, responsibility, or service to the masses. You thrive where patience and long-term thinking are rewarded.' },
  Rahu:    { soul:'Your soul is here to push beyond the familiar into unknown territory. Ambition, disruption, and the pursuit of unconventional experience are your deepest drives.', career:'Your professional path involves technology, foreign connections, or unconventional innovation. You thrive where breaking new ground is the job.' },
  Ketu:    { soul:'Your soul carries deep wisdom from past experiences. You are driven toward liberation, spiritual understanding, and letting go of what no longer serves.', career:'Your professional path involves research, spirituality, healing, or work that transcends conventional ambition. You thrive where depth matters over visibility.' }
};

const BNN_TRANSIT_PLAIN = {
  Jupiter: (sign, house, theme) => ({ headline:`Jupiter is opening doors in your ${house} area of life`, plain:`Jupiter is moving through ${sign} and activating your ${house}. This planet brings expansion, opportunity, and good fortune wherever it travels. Over the next 12 months, expect growth in the life areas connected to this house.`, practical:`Good time to: Take on bigger opportunities, seek guidance from mentors, invest in education, and say yes to expansion.`, duration:'Active for approximately 12 months' }),
  Saturn:  (sign, house, theme) => ({ headline:`Saturn is restructuring your ${house} area of life`, plain:`Saturn is moving through ${sign} and activating your ${house}. This planet brings discipline, testing, and long-term restructuring. The area it touches requires patience and serious attention — but work done here will last.`, practical:`Focus on: Building solid foundations, clearing what doesn't work, developing discipline, and making decisions you can live with for years.`, duration:'Active for approximately 2.5 years' }),
  Rahu:    (sign, house, theme) => ({ headline:`Rahu is creating new opportunities and disruptions in your ${house} area`, plain:`Rahu is moving through ${sign} and activating your ${house}. This node brings unconventional opportunities, sudden changes, and a magnetic pull toward new experiences. Things may feel destabilising but also exciting.`, practical:`Stay grounded: Pursue the opportunities here but maintain ethical boundaries. The gains can be significant but the path is unusual.`, duration:'Active for approximately 18 months' })
};

const TAROT_JOURNAL_PROMPTS = {
  'The Sun':           'Where in my life am I ready to step into full visibility and stop hiding my light?',
  'The Emperor':       'Where do I need to apply more structure and discipline to build something lasting?',
  'The High Priestess':'What do I already know intuitively that I have been choosing to ignore?',
  'The Moon':          'What fears or illusions are preventing me from seeing a situation clearly?',
  'The Chariot':       'What goal requires my complete, focused willpower right now?',
  'The Tower':         'What structure in my life needs to come down so something better can be built?',
  'The Magician':      'What skills and resources do I already have that I am underutilising?',
  'The Lovers':        'What important choice am I avoiding that I need to make with full awareness?',
  'The Wheel of Fortune':'Where in my life is a cycle turning — and how can I align with rather than resist that change?',
  'The Star':          'After recent difficulty, what hope or direction am I beginning to feel again?',
  'The Empress':       'Where in my life am I being called to nurture, create, and allow things to flourish naturally?',
  'The World':         'What chapter of my life is completing, and what does that completion require from me?',
  'The Hermit':        'Where do I need to slow down, seek solitude, and find wisdom within rather than outside?',
  'The Judgement':     'What old pattern or identity is asking to be released so I can rise into something new?',
  'The Fool':          'Where in my life am I being called to take a leap of faith without needing certainty first?',
  'The Hanged Man':    'What situation in my life would look completely different if I viewed it from a new angle?'
};
