import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ChartData, DivHouse } from '@/lib/chartTypes'

// ── Design tokens ────────────────────────────────────────────────────────────
const T = {
  gold:    '#D4B870',
  violet:  '#8B7CC8',
  violet2: '#A99BD9',
  txt:     '#F0EBF4',
  txt2:    '#B0A0C8',
  txt3:    '#8090B5',
  cardBg:  'rgba(8,4,22,0.92)',
  cardBdr: 'rgba(114,166,183,0.2)',
}

const glass: React.CSSProperties = {
  background:   T.cardBg,
  border:       `1px solid ${T.cardBdr}`,
  borderRadius: 16,
  padding:      20,
}

// ── Planet colour palette ─────────────────────────────────────────────────────
const PLANET_COLORS: Record<string, string> = {
  Su:  '#F5C842', Sun:     '#F5C842',
  Mo:  '#D0D8F0', Moon:    '#D0D8F0',
  Ma:  '#E05050', Mars:    '#E05050',
  Me:  '#7EC8A0', Mercury: '#7EC8A0',
  Ju:  '#F0A830', Jupiter: '#F0A830',
  Ve:  '#E48DB0', Venus:   '#E48DB0',
  Sa:  '#A08050', Saturn:  '#A08050',
  Ra:  '#8855CC', Rahu:    '#8855CC',
  Ke:  '#CC8855', Ketu:    '#CC8855',
  Lg:  '#AACCFF', Lagna:   '#AACCFF',
  As:  '#AACCFF',
}

// Abbreviation → color (for divisional charts that use short codes)
const ABBR_COLORS: Record<string, string> = {
  Su:'#F5C842', Mo:'#D0D8F0', Ma:'#E05050', Me:'#7EC8A0',
  Ju:'#F0A830', Ve:'#E48DB0', Sa:'#A08050', Ra:'#8855CC', Ke:'#CC8855', As:'#AACCFF',
}

const PLANET_ABBR: Record<string, string> = {
  Sun: 'Su', Moon: 'Mo', Mars: 'Ma', Mercury: 'Me',
  Jupiter: 'Ju', Venus: 'Ve', Saturn: 'Sa', Rahu: 'Ra', Ketu: 'Ke',
}

// Full name lookup (for tooltip display)
const ABBR_FULL: Record<string, string> = {
  Su: 'Sun', Mo: 'Moon', Ma: 'Mars', Me: 'Mercury',
  Ju: 'Jupiter', Ve: 'Venus', Sa: 'Saturn', Ra: 'Rahu', Ke: 'Ketu', As: 'Lagna',
}

// Planet glyphs
const PLANET_GLYPHS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿', Jupiter: '♃',
  Venus: '♀', Saturn: '♄', Rahu: '☊', Ketu: '☋', Lagna: 'Lg',
  Su: '☉', Mo: '☽', Ma: '♂', Me: '☿', Ju: '♃',
  Ve: '♀', Sa: '♄', Ra: '☊', Ke: '☋', As: 'Lg',
}

function abbr(name: string): string {
  return PLANET_ABBR[name] ?? name.slice(0, 2)
}
function planetColor(name: string): string {
  return PLANET_COLORS[name] ?? PLANET_COLORS[abbr(name)] ?? ABBR_COLORS[name] ?? T.txt3
}
function fullName(nameOrAbbr: string): string {
  return ABBR_FULL[nameOrAbbr] ?? nameOrAbbr
}
function glyph(nameOrAbbr: string): string {
  return PLANET_GLYPHS[nameOrAbbr] ?? PLANET_GLYPHS[fullName(nameOrAbbr)] ?? ''
}

// ── House themes lookup ───────────────────────────────────────────────────────
const HOUSE_THEMES: Record<number, { title: string; sanskrit: string; keywords: string; description: string; themes: string[] }> = {
  1:  { title: 'Lagna — Self & Body',        sanskrit: 'Tanu Bhava',    keywords: 'Self · Physique · Personality · Vitality',          description: 'Governs the body, temperament, and the lens through which one meets the world — the seed of identity.',            themes: ['Identity','Appearance','Vitality','First impressions'] },
  2:  { title: 'Dhana — Wealth & Speech',    sanskrit: 'Dhana Bhava',   keywords: 'Wealth · Speech · Family · Values',                 description: 'Governs accumulated resources, the quality of speech, and the values inherited from family and early life.',        themes: ['Resources','Family','Voice','Values','Early childhood'] },
  3:  { title: 'Sahaja — Courage & Skill',   sanskrit: 'Sahaja Bhava',  keywords: 'Courage · Siblings · Communication · Craft',        description: 'Governs initiative, self-effort, siblings, short journeys, and the hands — the house of applied skill.',            themes: ['Siblings','Communication','Short journeys','Hands'] },
  4:  { title: 'Sukha — Home & Heart',       sanskrit: 'Sukha Bhava',   keywords: 'Home · Mother · Peace · Roots',                     description: 'Governs the inner emotional foundation, mother, property, and the private life that sustains the native.',           themes: ['Mother','Property','Inner peace','Education foundation'] },
  5:  { title: 'Putra — Creativity & Merit', sanskrit: 'Putra Bhava',   keywords: 'Creativity · Children · Intelligence · Merit',      description: 'Governs the fruits of past merit, creative intelligence, children, and the capacity for genuine self-expression.',   themes: ['Children','Intelligence','Speculation','Past merit'] },
  6:  { title: 'Ari — Service & Health',     sanskrit: 'Ari Bhava',     keywords: 'Service · Health · Discipline · Obstacles',         description: 'Governs daily work rhythms, the body\'s capacity to resist illness, debts, and the refinement that comes through obstacles.', themes: ['Enemies','Debt','Daily work','Digestion','Discipline'] },
  7:  { title: 'Kalatra — Partnerships',     sanskrit: 'Kalatra Bhava', keywords: 'Partnership · Spouse · Contracts · Other',          description: 'Governs the space of the other — marriage, business partners, open adversaries, and the mirroring function of relationship.', themes: ['Spouse','Business partners','Public','Contracts'] },
  8:  { title: 'Randhra — Transformation',   sanskrit: 'Randhra Bhava', keywords: 'Transformation · Hidden · Research · Longevity',    description: 'Governs hidden depths, sudden change, inheritance, occult inquiry, and the regenerative capacity of the psyche.',       themes: ['Longevity','Hidden matters','Research','Inheritance'] },
  9:  { title: 'Dharma — Higher Purpose',    sanskrit: 'Dharma Bhava',  keywords: 'Dharma · Guru · Philosophy · Grace',                description: 'Governs the guiding principle of one\'s life, father, teachers, pilgrimage, and the fortune that flows from dharmic alignment.', themes: ['Father','Guru','Long journeys','Philosophy','Luck'] },
  10: { title: 'Karma — Vocation & Status',  sanskrit: 'Karma Bhava',   keywords: 'Vocation · Authority · Reputation · Action',        description: 'Governs the public contribution, professional domain, the relationship with authority, and the legacy of one\'s actions.', themes: ['Career','Authority','Reputation','Public action'] },
  11: { title: 'Labha — Gains & Networks',   sanskrit: 'Labha Bhava',   keywords: 'Gains · Networks · Aspirations · Friends',          description: 'Governs the fulfilment of desires, income streams, elder siblings, and the web of connections that support one\'s aims.', themes: ['Income','Elder siblings','Aspirations','Friends'] },
  12: { title: 'Vyaya — Liberation & Loss',  sanskrit: 'Vyaya Bhava',   keywords: 'Liberation · Foreign · Solitude · Dissolution',     description: 'Governs withdrawal from the manifest world — expenses, foreign sojourns, sleep, spiritual practice, and liberation.',      themes: ['Foreign lands','Expenses','Spirituality','Sleep'] },
}

// ── Dignity descriptions ──────────────────────────────────────────────────────
const DIGNITY_DESC: Record<string, string> = {
  exalted:      'Peak expression of planetary energy — the planet radiates its highest qualities freely.',
  own:          'Planet in its natural home — comfortable, direct, and operating without constraint.',
  moolatrikona: 'Strong, purposeful expression — purposeful energy with a quality of refined authority.',
  neutral:      'Balanced, context-dependent expression — the planet takes its colour from surrounding influences.',
  debilitated:  'Energy turned inward, requiring conscious integration — a seed of latent strength.',
}

// ── Planet-in-house interpretations (108 entries) ────────────────────────────
// Keys: "Planet_House" e.g. "Sun_1", "Moon_3". Framed as tendencies, never predictions.
const PLANET_IN_HOUSE: Record<string, string> = {
  // ── Sun ──────────────────────────────────────────────────────────────────
  Sun_1:  'Vitality, authority, and self-expression radiate naturally from the core of the personality. There is a strong sense of identity and purpose that others tend to recognise immediately. Pride may sometimes overshadow receptivity, yet the underlying impulse is toward sovereign self-becoming.',
  Sun_2:  'A strong sense of values and a dignified relationship with material resources often characterise this placement. Speech tends to carry weight and authority, and the native may find identity closely interwoven with what they earn or own. Generosity and pride around family lineage are recurring themes.',
  Sun_3:  'Courage, initiative, and a talent for communication are highlighted. There is often a drive to lead through effort rather than inheritance, and creative projects or sibling dynamics may be especially formative. The Sun here illuminates the capacity for bold, self-directed action.',
  Sun_4:  'A deep pride in home, roots, and family heritage may colour the emotional life. The native may gravitate toward positions of private authority or feel a strong calling to protect and maintain lineage. Inner peace tends to come through stabilising one\'s foundations rather than outward recognition.',
  Sun_5:  'Creativity, play, and self-expression are solar in quality — radiant, deliberate, sometimes larger than life. There may be a strong identification with one\'s children or creative output. Leadership in educational, artistic, or speculative domains often emerges as a natural pattern.',
  Sun_6:  'The Sun in the house of service, enemies, and health suggests a drive to refine the self through discipline and overcoming obstacles. There may be a pattern of seeking authority within institutional or service contexts. Health vitality is often strong, though sustained effort is required to maintain it.',
  Sun_7:  'The Sun in the seventh illuminates the space of relationship — partnerships tend to involve powerful, identity-driven individuals, and questions of ego and recognition may be recurring themes in close bonds. There is often a pattern of seeking a partner who reflects one\'s own solar qualities.',
  Sun_8:  'Transformation, research, and an interest in the hidden dimensions of life may be deeply motivating. There may be a complex relationship with power, inheritance, or the institutions of others. The Sun here often indicates a capacity for profound regeneration through crisis.',
  Sun_9:  'A strong dharmic orientation and an identification with philosophy, wisdom traditions, or higher learning are central themes. The native may be drawn toward teaching, guiding, or embodying a life philosophy. The relationship with father or mentors is often formative and charged with meaning.',
  Sun_10: 'One of the most prominent placements for public recognition and vocation. The native tends toward leadership, authority, and positions where individual will shapes outcomes. There is a strong impulse to leave a visible legacy, and the career domain may feel like an expression of one\'s essential identity.',
  Sun_11: 'Ambitions and desires are illuminated by a solar quality — large in scope, sometimes idealistic. There may be a natural capacity to lead networks, communities, or group endeavours. Income and gains often come through authority, creativity, or government-adjacent domains.',
  Sun_12: 'The Sun in the twelfth often indicates a deep, if sometimes hidden, spiritual impulse. There may be a pattern of withdrawal, foreign connection, or behind-the-scenes influence. Identity may be refined through solitude, service in institutions, or letting go of the need for public recognition.',

  // ── Moon ─────────────────────────────────────────────────────────────────
  Moon_1:  'The emotional life is worn openly, and moods may colour the physical presence and first impression. There is deep sensitivity and intuitive responsiveness to one\'s environment. The native often carries a nurturing quality that others find comforting, though the inner world may be richly changeable.',
  Moon_2:  'Emotional security tends to be closely tied to material comfort and family belonging. Speech may carry an intuitive, rhythmic quality, and the native often has a deep memory for ancestral stories. Financial patterns may fluctuate with emotional cycles.',
  Moon_3:  'A rich inner life finds expression through communication, writing, and short travel. There is often an intuitive grasp of what an audience needs to hear. Sibling relationships and neighbourhood bonds carry an emotional depth that may be lifelong.',
  Moon_4:  'One of the Moon\'s most natural placements — the emotional world is nourished by home, mother, and the feeling of belonging. The native tends to be deeply attached to roots and heritage, and the quality of the domestic environment has an outsized effect on overall wellbeing.',
  Moon_5:  'Creativity, play, and the relationship with children are emotionally charged. The native may experience the creative process as deeply fulfilling and cathartic. There is often a playful, imaginative quality to the emotional expression.',
  Moon_6:  'Emotional rhythms may be closely tied to the experience of work, health habits, and service. The native may be drawn to caring professions, and emotional wellbeing often depends on feeling useful. Health patterns may fluctuate with emotional states.',
  Moon_7:  'The native tends to seek emotional nourishment through intimate partnership. There may be an idealistic quality to the vision of relationship, alongside a deep need for emotional mirroring from a partner. Partnerships often go through cycles of emotional ebb and flow.',
  Moon_8:  'Emotional depth, an interest in the hidden, and an intuitive grasp of what lies beneath the surface are characteristic. There may be transformative experiences around home, mother, or the emotional body. The Moon here often indicates a rich, if complex, inner emotional landscape.',
  Moon_9:  'The native\'s emotional sense of meaning is oriented toward philosophy, wisdom, and a feeling of being guided by something larger than the personal. Pilgrimages, long journeys, and spiritual practice may carry an emotional charge. The relationship with father or teachers is often emotionally significant.',
  Moon_10: 'The career and public life may be deeply influenced by emotional responsiveness — the native often succeeds by intuitively knowing what the public needs. There may be fluctuations in professional reputation, and the mother or maternal lineage may play a visible role in the life trajectory.',
  Moon_11: 'Emotional fulfilment tends to come through community, friendship, and the realisation of cherished aspirations. The native may have a natural empathy for collective needs, and friendships tend to be emotionally sustaining over long periods.',
  Moon_12: 'The inner emotional life tends toward sensitivity, privacy, and a desire for retreat. There may be a quality of emotional self-sacrifice, spiritual longing, or a connection to the collective unconscious. Dreams, solitude, and contemplative practice often nourish the soul.',

  // ── Mars ─────────────────────────────────────────────────────────────────
  Mars_1:  'Energy, directness, and a fiery presence are hallmarks of this placement. The native tends toward initiative, physical vitality, and a pioneering quality that others may find magnetic or intense. Impatience may arise, but so does an admirable capacity for sustained effort.',
  Mars_2:  'Mars in the second may bring an assertive quality to matters of resources and speech — the native may express opinions directly, sometimes bluntly. There can be a drive to build wealth through active effort. Caution around impulsive financial decisions may be a recurring theme for reflection.',
  Mars_3:  'Courage, competitive drive, and a talent for decisive action are amplified. The native may excel in domains requiring nerve and follow-through. Sibling relationships can be spirited, and short journeys often carry a sense of purpose or urgency.',
  Mars_4:  'There may be a quality of intensity or restlessness in the domestic sphere. The native may feel driven to transform the home environment or may carry an active quality inherited from the mother. Property matters can be dynamic, and finding inner peace may require conscious cultivation.',
  Mars_5:  'Creative energy is abundant and may find expression through competitive, athletic, or high-energy creative endeavours. There is often a passionate quality to the relationship with children and a dynamic speculative impulse. The native tends to invest effort into self-expression with vigour.',
  Mars_6:  'Often considered a strong placement — Mars\'s combative nature finds natural expression in the sixth house of obstacles and enemies. The native may have considerable capacity to overcome opposition, maintain health through discipline, and thrive in demanding work environments.',
  Mars_7:  'Partnerships may carry a passionate, sometimes combative quality. There is often an attraction to partners with strong, independent personalities. The native may need to cultivate patience and diplomacy in close relationships, as the drive for autonomy can create friction.',
  Mars_8:  'An intense fascination with the hidden, the transformative, and the occult may characterise this placement. There can be sudden changes in the domains of shared resources or longevity-related matters. The native often has a reservoir of inner strength that emerges most powerfully under pressure.',
  Mars_9:  'A passionate, sometimes combative relationship with belief systems, philosophy, or spiritual authority may be present. The native tends to pursue wisdom with vigour and may challenge received wisdom. Long journeys and encounters with diverse worldviews often serve as crucibles for growth.',
  Mars_10: 'One of the traditional indicators of professional drive and authority. The native tends toward leadership, bold career moves, and domains requiring initiative and courage. There may be a quality of productive ambition that, when channelled wisely, produces lasting achievement.',
  Mars_11: 'Aspirations and goals are pursued with drive and determination. There may be an energetic quality to the social network, and the native often finds that income requires active, effortful pursuit. Friendships with bold, action-oriented individuals are characteristic.',
  Mars_12: 'Energy may be directed toward hidden endeavours, foreign lands, or spiritual practice. There can be a quality of expenditure in the domains of effort and vitality. Viparita potential exists here — when channelled into solitary discipline or service in institutions, Mars in the twelfth can produce remarkable endurance.',

  // ── Mercury ───────────────────────────────────────────────────────────────
  Mercury_1:  'Intellectual curiosity, communicative ease, and an analytical quality colour the presentation of self. The native tends to be articulate and may rely on reason as a primary mode of engaging with the world. There is often a youthful, adaptable quality to the personality.',
  Mercury_2:  'The mind is engaged with questions of value, accumulation, and the management of resources. Speech tends to be precise and may have a business or commercial orientation. Early education and family communication patterns often shape the native\'s relationship with language.',
  Mercury_3:  'A natural writer, speaker, or communicator — Mercury here is in one of its most comfortable placements. The mind moves quickly, enjoys variety, and may find siblings or neighbourhood connections to be early intellectual stimulants. Short journeys often carry informational or communicative purpose.',
  Mercury_4:  'The domestic environment may carry an intellectual quality — books, learning, and conversation as household staples. There is often a close intellectual bond with the mother, and the native may find that thinking and writing are best done in private, comfortable settings.',
  Mercury_5:  'A quick, creative intelligence that may find expression through teaching, writing, games, or working with children. Speculation and creative projects may carry a strongly rational quality. There is often a delight in puzzles, language play, and the exchange of ideas.',
  Mercury_6:  'An analytical mind that engages readily with the practical, technical, and health-related. The native may excel in fields requiring precision, problem-solving, or service through expertise. There is often an ability to communicate complex information in a clear, useful way.',
  Mercury_7:  'Partnership and relationship often have an intellectual dimension — the native tends to be attracted to communicative, mentally stimulating partners. Business negotiations and contractual matters are approached with care and analytical clarity.',
  Mercury_8:  'A penetrating, investigative quality of mind that may be drawn to research, psychology, the occult, or hidden knowledge. The native may have a talent for uncovering what is concealed and for communicating complex, difficult subjects with precision.',
  Mercury_9:  'Higher learning, philosophy, and wisdom traditions are approached with intellectual curiosity. The native may be drawn to teaching or writing in the domain of ideas and worldview. Long journeys often carry a strongly educational or communicative dimension.',
  Mercury_10: 'Communication, writing, and intellectual skills may feature prominently in the vocational domain. The native often succeeds in careers requiring analytical ability, clear expression, or the management of information. Public reputation may be built on intellectual competence.',
  Mercury_11: 'A social intelligence that finds natural expression through networks, groups, and collective endeavours. The native may have a talent for connecting people and ideas. Income and aspirations are often linked to communication-related skills or information-based domains.',
  Mercury_12: 'The mind may have a quality of inwardness, privacy, or otherworldliness. There can be a talent for behind-the-scenes communication, research in solitude, or writing with a contemplative quality. Foreign languages or cultures may hold particular fascination.',

  // ── Jupiter ───────────────────────────────────────────────────────────────
  Jupiter_1:  'A quality of benevolence, wisdom, and expansive presence often characterises the personality. The native tends to attract goodwill and may have a naturally philosophical or optimistic outlook. There can be a tendency toward excess, but the underlying impulse is toward growth and generosity.',
  Jupiter_2:  'Jupiter in the second is traditionally considered auspicious for material prosperity, family harmony, and the richness of speech. The native tends to hold generous values and may be seen as a trusted voice in family or community contexts. Wealth may accumulate through ethical and expansive means.',
  Jupiter_3:  'A philosophical quality infuses communication and creative self-expression. The native may find that teaching, writing, or inspiring others through speech is a natural vocation. Sibling relationships often carry a dimension of wisdom or guidance.',
  Jupiter_4:  'The domestic life tends to be expansive, harmonious, and rich with learning. There may be a strong sense of gratitude for roots and heritage, and the mother may be a source of wisdom. Property and emotional security often expand over time.',
  Jupiter_5:  'One of Jupiter\'s most auspicious placements — creativity, children, and the capacity for insight all flourish. The native may have a talent for teaching, spiritual practice, or creative work with a quality of genuine wisdom. Past merit is often available as a resource.',
  Jupiter_6:  'Jupiter in the sixth may bring a quality of grace to the challenges of service, health, and opposition. The native tends to overcome obstacles through generosity and right understanding rather than aggression. There may also be an expansive approach to health that is worth moderating with discipline.',
  Jupiter_7:  'Partnerships tend to be expansive, growth-oriented, and philosophically enriching. The native often attracts a partner with wisdom or spiritual qualities. Business relationships may be characterised by mutual generosity and a shared vision.',
  Jupiter_8:  'An interest in esoteric wisdom, transformation, and the deeper currents of existence is characteristic. Jupiter here may bring a quality of grace to passages of change and crisis. Inheritances or shared resources may be a site of unexpected expansion.',
  Jupiter_9:  'One of Jupiter\'s most natural placements — philosophy, dharma, and wisdom traditions are a central theme. The native may have a strong connection to teachers, spiritual lineages, or higher learning. Fortune tends to come through alignment with one\'s guiding principles.',
  Jupiter_10: 'A quality of authority, wisdom, and ethical leadership may characterise the public life. The native often finds success in domains connected to law, education, philosophy, or guiding others. There is a pattern of gaining public trust through demonstrated integrity.',
  Jupiter_11: 'Aspirations are large, optimistic, and often realised through networks of goodwill. The native tends to attract friends and allies who are generous and growth-oriented. Gains may come from multiple sources, particularly in domains connected to wisdom, expansion, or public service.',
  Jupiter_12: 'A strong spiritual impulse, a connection to foreign lands or ashrams, and a quality of inner abundance that transcends the material. Jupiter in the twelfth often indicates previous spiritual merit available as a resource. Service in hidden or institutional contexts may be a source of profound meaning.',

  // ── Venus ─────────────────────────────────────────────────────────────────
  Venus_1:  'Grace, aesthetic sensibility, and a natural charm colour the outward personality. The native tends to create harmony in immediate surroundings and may have an attractive, refined quality to the physical presentation. Pleasure and beauty are orienting values in daily life.',
  Venus_2:  'A rich, aesthetically attuned relationship with material comfort and the pleasures of family life. Speech tends to be melodious and diplomatic, and the native may have a talent for financial acumen combined with an appreciation for quality. Family bonds are often warm and sustaining.',
  Venus_3:  'Creative self-expression, artistic communication, and a pleasure in short journeys or sibling connections are characteristic. The native may have a talent for music, writing, or other aesthetic arts. There is often a quality of ease and pleasure associated with learning and exchange.',
  Venus_4:  'A love of beauty, comfort, and domestic harmony creates a richly aesthetically ordered home environment. The native tends to have a deep affection for mother and roots, and the domestic space may be a site of genuine artistic expression. Emotional security is found through beauty and belonging.',
  Venus_5:  'Creativity, romance, and the pleasures of life are abundant themes. The native tends to have a naturally expressive, sometimes artistic, relationship with joy and play. Romantic connections in early life may be formative, and children are often a source of genuine delight.',
  Venus_6:  'Venus in the sixth may bring grace and aesthetic sensibility to the domains of service and daily work. The native may find pleasure in healing, beautifying, or attending to others\' wellbeing. There can also be a pattern of indulgence affecting health that invites mindful attention.',
  Venus_7:  'One of Venus\'s most comfortable placements — the domain of partnership is illuminated by beauty, harmony, and a genuine desire for connection. The native often attracts aesthetically refined or gracious partners. Artistic or diplomatic qualities may feature in professional partnerships.',
  Venus_8:  'An attraction to the hidden, the sensual, and the transformative dimensions of relationship. There may be themes of shared resources, inheritance, or deep psychological intimacy. Venus here often indicates a capacity for regeneration through love and aesthetic experience.',
  Venus_9:  'An aesthetic and devotional orientation toward philosophical or spiritual life. The native may find that beauty, art, and devotion are valid paths to wisdom. Long journeys may carry a pleasurable, culturally enriching quality, and teachers are often gracious or inspiring figures.',
  Venus_10: 'The public life and career may carry a quality of artistry, diplomacy, or aesthetic appeal. The native often finds success in domains connected to beauty, design, relationship, or the arts. Public recognition may come through charm, grace, or a talent for harmonising competing interests.',
  Venus_11: 'Social connections, friendships, and aspirations tend to carry a pleasurable, harmonious quality. The native may attract friends who are artistic, gracious, or emotionally attuned. Gains and income may come through artistic, relational, or socially oriented domains.',
  Venus_12: 'A deep spiritual quality of love, a connection to beauty in solitude, and an orientation toward the transcendent dimension of relationship. Venus in the twelfth may indicate a capacity for unconditional love and a rich inner aesthetic life that finds expression in contemplative practice.',

  // ── Saturn ────────────────────────────────────────────────────────────────
  Saturn_1:  'A quality of seriousness, discipline, and deliberate self-development marks the personality. The native may carry a sense of responsibility from an early age and often develops a resilient, enduring quality of character over time. Recognition tends to come through sustained effort rather than early ease.',
  Saturn_2:  'Material security and family bonds may be areas of sustained effort and gradual building. Speech may be measured, deliberate, or guarded. There is often a pattern of developing a disciplined relationship with resources over time, and financial stability typically improves with age and consistency.',
  Saturn_3:  'Courage and communication may develop through effort and delay rather than natural ease. The native often becomes a skilled, careful communicator through practice. There may be a seriousness to sibling relationships and a preference for purposeful, structured learning.',
  Saturn_4:  'The emotional foundations of home and family may carry a quality of heaviness, distance, or responsibility. The native may have taken on parental roles early in life or may carry a complex relationship with the mother or homeland. Inner peace is cultivated through sustained inner work.',
  Saturn_5:  'Creativity and self-expression may unfold slowly, requiring patience and disciplined practice. There can be a serious, perfectionistic quality to creative endeavours, and the relationship with children may carry themes of responsibility or delayed fulfilment. Wisdom accrues through creative persistence.',
  Saturn_6:  'Often considered one of Saturn\'s strongest placements — discipline in service, health, and the management of obstacles produces considerable power. The native tends to be methodical and long-suffering in the face of opposition, and the capacity for sustained work is a major resource.',
  Saturn_7:  'Partnership may be characterised by themes of duty, delay, karma, and gradual deepening. The native may attract older, more serious partners, or find that significant relationships require sustained commitment. Business partnerships tend to be stable and long-lasting when well chosen.',
  Saturn_8:  'A complex relationship with transformation, mortality, and the hidden dimensions of existence. The native may have an unusual capacity for endurance through crisis, and there may be themes of delayed inheritances or complex shared resources. Sustained inquiry into the nature of impermanence is a resource.',
  Saturn_9:  'A serious, rigorous approach to philosophy, dharma, and higher learning. The native may question received wisdom and develop their worldview through sustained personal inquiry. The relationship with father or teachers may carry a quality of distance, formality, or challenging growth.',
  Saturn_10: 'One of Saturn\'s most productive placements — disciplined effort in the vocational domain tends to produce lasting recognition and authority. The native often rises to prominence later in life through methodical, sustained work. The career domain is a primary arena for karma to unfold and be integrated.',
  Saturn_11: 'Aspirations may be large but tend to unfold slowly and through sustained effort. Friendships and networks may be fewer but deeply loyal. Gains accumulate over time through disciplined endeavour, and the native often finds that patience in the pursuit of goals is ultimately rewarded.',
  Saturn_12: 'A profound capacity for solitude, spiritual discipline, and work in hidden or institutional contexts. The Viparita dimension of Saturn in the twelfth is considerable — disciplined withdrawal, ascetic practice, or service in isolation may be sources of unexpected power and inner freedom.',

  // ── Rahu ─────────────────────────────────────────────────────────────────
  Rahu_1:  'An unusual, magnetic, and sometimes unconventional quality of personality. Rahu in the first may bring an insatiable desire for self-expansion and identity-experimentation. The native tends to be intensely ambitious for recognition and may present an enigmatic or charismatic quality to others.',
  Rahu_2:  'An amplified focus on wealth, accumulation, and the acquisition of resources. Speech may carry an unusual or persuasive quality, and there may be an attraction to foreign cultures\' values or unconventional means of earning. The relationship with family lineage may be complex or transformative.',
  Rahu_3:  'An intense drive for communication, creative self-expression, and ambitious self-promotion. The native may have an unusual communicative style and a restless desire to expand through every available channel. Sibling relationships or short-distance networks may be sites of karmic intensity.',
  Rahu_4:  'The emotional roots and domestic life may carry a quality of restlessness or desire for something beyond the ordinary. There may be unconventional living arrangements or an attraction to homes in foreign lands. The relationship with mother or homeland may contain complex karmic dimensions.',
  Rahu_5:  'Creativity, speculation, and the relationship with children may carry an amplified, unusual quality. There is often an attraction to unconventional creative forms or an intense desire for recognition through self-expression. Speculative impulses may be strong and warrant mindful channelling.',
  Rahu_6:  'An unusual capacity to overcome obstacles, enemies, and challenges. Rahu in the sixth can indicate a powerful ability to navigate complex service environments, foreign work contexts, or unconventional health approaches. The native may thrive in competitive domains that others find overwhelming.',
  Rahu_7:  'Partnership may involve attraction to unusual, foreign, or unconventional individuals. The desire for relationship is amplified, and there may be themes of karmic intensity in close bonds. Business partnerships in cross-cultural or innovative domains may be characteristic.',
  Rahu_8:  'A powerful attraction to the occult, hidden knowledge, and the transformative undercurrents of existence. The eighth house Rahu may indicate unexpected inheritances, unusual longevity patterns, or a capacity for profound transformation through crisis. Research and investigation may be a strong vocation.',
  Rahu_9:  'An amplified, sometimes unconventional relationship with philosophy, religion, or guiding principles. The native may question orthodox systems and seek wisdom through unusual teachers or cross-cultural study. Long journeys to foreign lands may carry a deeply formative karmic quality.',
  Rahu_10: 'One of Rahu\'s most potent placements for worldly ambition and public achievement. There is an intense drive toward career success, often through innovative, unconventional, or cross-cultural means. The native may rise to prominence rapidly, and the question of ethical alignment is worth ongoing reflection.',
  Rahu_11: 'Aspirations are large, somewhat insatiable, and oriented toward collective or unusual domains. The native tends to attract diverse, international, or unconventional networks. Income and gains may come through innovative channels, and the fulfilment of desires may require ongoing self-examination.',
  Rahu_12: 'A strong pull toward the otherworldly, foreign, or transcendent. Rahu in the twelfth may indicate extensive travel, residence in foreign lands, or an unusual relationship with isolation and spiritual practice. Expenditure may be unpredictable, and dream states may be vivid and significant.',

  // ── Ketu ─────────────────────────────────────────────────────────────────
  Ketu_1:  'A quality of detachment, spiritual depth, and sometimes self-effacement in the personality. The native may carry a sense of having already lived this life before, leading to a quietly confident or otherworldly manner. Identity is often refined through the letting-go of ego-driven self-assertion.',
  Ketu_2:  'A complex relationship with material security and family speech — the native may feel curiously indifferent to accumulation, or may carry a sense of having already resolved questions of wealth in a prior context. Speech may be sparse, precise, or carry an unusual depth.',
  Ketu_3:  'Communication may have a subtle, sometimes cryptic quality, and the native may feel that ordinary forms of expression are insufficient for what needs to be said. Self-effort is present but directed inward. There may be a quality of released attachment to siblings or local environments.',
  Ketu_4:  'A sense of emotional detachment from roots, home, or conventional domestic life. The native may feel that belonging to a particular place or family tradition is less defining than for others. Inner peace may be found through spiritual rather than domestic foundations.',
  Ketu_5:  'A contemplative, spiritually oriented relationship with creativity and self-expression. The native may find that ordinary forms of creative recognition hold little appeal, and may be drawn to wisdom traditions, mantra, or meditative practice as a primary creative outlet.',
  Ketu_6:  'A complex and sometimes paradoxical placement — Ketu\'s dissolving quality in the house of obstacles can either release the native from service-related burdens or create an elusive quality to health challenges. Spiritual practice may be a powerful tool for managing the dynamics of this house.',
  Ketu_7:  'Partnership may carry a quality of karmic release and the letting-go of conventional expectations around relationship. The native may feel that the ordinary satisfactions of partnership are insufficient, and may seek spiritual companionship or solitude as a counterbalance to relational life.',
  Ketu_8:  'A profound, sometimes eerie comfort with the hidden, the transformative, and the mysteries of existence. The native may have an unusual relationship with death, inheritance, or occult matters. Ketu in the eighth often indicates a capacity for deep inner investigation and the integration of shadow material.',
  Ketu_9:  'A released, sometimes iconoclastic relationship with religious or philosophical tradition. The native may feel that orthodox dharmic frameworks are not entirely adequate for their experience. Wisdom tends to be experiential and personally earned rather than received through institutional channels.',
  Ketu_10: 'A complex relationship with vocation and public ambition. The native may feel that career success is less central to identity than for others, or may find that their greatest contributions come through understated, behind-the-scenes domains. Spiritual vocation may eventually supersede conventional career.',
  Ketu_11: 'A released attachment to aspirations and social networks. The native may find that friendship circles are meaningful but shifting, and that the fulfilment of material desires is not an abiding source of satisfaction. Spiritual aspirations may eventually become the primary orientation.',
  Ketu_12: 'One of Ketu\'s most natural placements — solitude, spiritual practice, and the dissolution of the ego find a natural home in the twelfth house. There may be a quality of profound inner liberation available to the native who attends to the domain of retreat and contemplative life.',
}

// ── Graha drishti (aspects) ───────────────────────────────────────────────────
// Returns list of planet names that aspect a given house number.
// All planets aspect the 7th from their house; Mars also 4th+8th; Jupiter 5th+9th; Saturn 3rd+10th.
function grahaAspects(
  houseId: number,
  houseMap: Record<number, { id: number; sign: string; planets: string[] }>
): string[] {
  const aspecting: string[] = []
  const wrap = (n: number) => ((n - 1 + 12) % 12) + 1

  for (let fromHouse = 1; fromHouse <= 12; fromHouse++) {
    const entry = houseMap[fromHouse]
    if (!entry || entry.planets.length === 0) continue

    for (const planet of entry.planets) {
      const full = fullName(planet)
      // 7th aspect — all planets
      if (wrap(fromHouse + 6) === houseId) { aspecting.push(full); continue }
      // Mars special aspects: 4th (fromHouse+3) and 8th (fromHouse+7)
      if ((full === 'Mars') && (wrap(fromHouse + 3) === houseId || wrap(fromHouse + 7) === houseId)) {
        aspecting.push(full); continue
      }
      // Jupiter special aspects: 5th (fromHouse+4) and 9th (fromHouse+8)
      if ((full === 'Jupiter') && (wrap(fromHouse + 4) === houseId || wrap(fromHouse + 8) === houseId)) {
        aspecting.push(full); continue
      }
      // Saturn special aspects: 3rd (fromHouse+2) and 10th (fromHouse+9)
      if ((full === 'Saturn') && (wrap(fromHouse + 2) === houseId || wrap(fromHouse + 9) === houseId)) {
        aspecting.push(full); continue
      }
    }
  }
  // Deduplicate
  return [...new Set(aspecting)]
}

// House type classification
function houseType(h: number): string {
  if ([1, 4, 7, 10].includes(h)) return 'Kendra (Angular) — planets here gain strength and directness of expression'
  if ([5, 9].includes(h)) return 'Trikona (Trine) — auspicious; supports dharma and grace'
  if ([6, 8, 12].includes(h)) return 'Dusthana — house of challenge; malefics may find purpose here (Viparita yoga potential)'
  return 'Neutral — shaped by the quality of its lord and occupants'
}


// ── North Indian chart layout (CSS grid — used by D9 / D10 only) ─────────────
// 4×4 grid; each house has [col-start, col-end, row-start, row-end] (1-based)
const HOUSE_GRID: Record<number, [number, number, number, number]> = {
  12: [1, 2, 1, 2],
  1:  [2, 3, 1, 2],
  2:  [3, 4, 1, 2],
  3:  [4, 5, 1, 2],
  11: [1, 2, 2, 3],
  4:  [4, 5, 2, 3],
  10: [1, 2, 3, 4],
  5:  [4, 5, 3, 4],
  9:  [1, 2, 4, 5],
  8:  [2, 3, 4, 5],
  7:  [3, 4, 4, 5],
  6:  [4, 5, 4, 5],
}
// Center 2×2 spans cols 2-4, rows 2-4
const CENTER_GRID: React.CSSProperties = {
  gridColumn: '2 / 4',
  gridRow:    '2 / 4',
}

// ── SVG North Indian chart data ───────────────────────────────────────────────
// viewBox 420×420. Outer square S=10→E=410, center M=210.
// Structural lines: outer rect, both diagonals, H/V mid-lines, inner diamond.
// Produces 12 triangular regions. H1=Lagna at top, clockwise.
const S = 10, E = 410, M = 210

// House polygons and text centroid coordinates for the 12 NI houses.
// Outer square: S=10 to E=410, center M=210.
// Structural lines: outer rect + both diagonals + horizontal & vertical mid-lines + inner diamond.
// This produces 12 non-overlapping triangular/rhombus regions.
// Clockwise from top: H1(top △) H2(TR corner) H3(R top △) H4(R △ wide) H5(R bot △)
//   H6(BR corner) H7(bot △) H8(BL corner) H9(L bot △) H10(L △ wide) H11(L top △) H12(TL corner)
const NI_HOUSES: Record<number, { points: string; cx: number; cy: number }> = {
  // Top row (H12, H1, H2) — top horizontal strip split by diagonals
  12: { points: `${S},${S} ${M},${S} ${M},${M}`,             cx:  82, cy:  82 }, // top-left corner triangle
   1: { points: `${S},${S} ${E},${S} ${M},${M}`,             cx: 210, cy:  75 }, // top-center large triangle (Lagna)
   2: { points: `${E},${S} ${M},${S} ${M},${M}`,             cx: 338, cy:  82 }, // top-right corner triangle

  // Right column (H3, H4) — right strip split
   3: { points: `${E},${S} ${E},${M} ${M},${M}`,             cx: 355, cy: 145 }, // right-top triangle
   4: { points: `${E},${M} ${M},${M} ${E},${E}`,             cx: 338, cy: 210 }, // right-center "corner" (wide)
   5: { points: `${E},${E} ${E},${M} ${M},${M}`,             cx: 355, cy: 273 }, // right-bottom triangle

  // Bottom row (H6, H7, H8)
   6: { points: `${E},${E} ${M},${E} ${M},${M}`,             cx: 338, cy: 338 }, // bottom-right corner triangle
   7: { points: `${E},${E} ${S},${E} ${M},${M}`,             cx: 210, cy: 345 }, // bottom-center large triangle
   8: { points: `${S},${E} ${M},${E} ${M},${M}`,             cx:  82, cy: 338 }, // bottom-left corner triangle

  // Left column (H9, H10, H11)
   9: { points: `${S},${E} ${S},${M} ${M},${M}`,             cx:  55, cy: 273 }, // left-bottom triangle
  10: { points: `${S},${M} ${M},${M} ${S},${S}`,             cx:  72, cy: 210 }, // left-center "corner" (wide)
  11: { points: `${S},${S} ${S},${M} ${M},${M}`,             cx:  55, cy: 145 }, // left-top triangle
}

// ── SVG North Indian D1 Chart ────────────────────────────────────────────────
interface NISvgChartProps {
  houseMap:   Record<number, { id: number; sign: string; planets: string[] }>
  lagnaSign?: string
  selected:   number | null
  onSelect:   (id: number | null) => void
  nativeName?: string
}

function NISvgChart({ houseMap, selected, onSelect, nativeName }: NISvgChartProps) {
  // SVG constants
  const SV = 10, EV = 410, MV = 210

  // Lines that make up the chart:
  // 1. Outer border (rect)
  // 2. Inner diamond: midpoints of each side connected
  // 3. Both full diagonals of outer square
  const STROKE = '#4A3A6A'
  const STROKE_W = 1.5
  const SEL_FILL = 'rgba(192,168,96,0.13)'
  const DEF_FILL = 'rgba(16,10,34,0.0)'

  // For each house, decide whether to wrap planet glyphs across 2 rows
  function renderHouseContent(id: number, cx: number, cy: number) {
    const house   = houseMap[id] ?? { id, sign: '', planets: [] }
    const planets = house.planets ?? []
    const sign    = house.sign ?? ''
    const isLagna = id === 1

    // Corner houses (2,4,6,8,10,12) are smaller triangles → tighter layout
    const isCorner = [2, 4, 6, 8, 10, 12].includes(id)
    const isWide   = [1, 7].includes(id)   // top and bottom large triangles

    // Font sizes — bumped for legibility (SVG viewBox 420×420)
    const hNumSz  = isCorner ? 10 : 12
    const signSz  = isCorner ?  9 : 11
    const planSz  = isCorner ? 10 : 12
    const lagSz   = isCorner ?  9 : 11

    // Layout: arrange items vertically around cx,cy
    const lineH   = isCorner ? 13 : 14
    const items: { text: string; color: string; fontSize: number; fontWeight?: string; fontStyle?: string }[] = []

    // House number (tiny, gold)
    items.push({ text: String(id), color: '#C0A860', fontSize: hNumSz })

    // Sign abbreviation
    if (sign) items.push({ text: sign.slice(0, 3), color: '#7A6A9A', fontSize: signSz })

    // Lagna marker
    if (isLagna) items.push({ text: 'Lg ↑', color: '#AACCFF', fontSize: lagSz, fontWeight: '700' })

    // Planet glyphs — up to 2 per line for corners
    const colors  = planets.map(p => planetColor(p))
    const maxPerRow = isCorner ? 2 : isWide ? 5 : 3
    // Render planets grouped into rows
    const planetRows: { text: string; colors: string[] }[] = []
    for (let i = 0; i < planets.length; i += maxPerRow) {
      planetRows.push({
        text:   planets.slice(i, i + maxPerRow).map(p => glyph(p) || abbr(p)).join(' '),
        colors: planets.slice(i, i + maxPerRow).map(p => planetColor(p)),
      })
    }

    const totalLines = items.length + planetRows.length
    const startY     = cy - ((totalLines - 1) * lineH) / 2

    return (
      <g key={id} style={{ pointerEvents: 'none' }}>
        {items.map((item, i) => (
          <text
            key={i}
            x={cx}
            y={startY + i * lineH}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={item.color}
            fontSize={item.fontSize}
            fontFamily="Inter, system-ui, sans-serif"
            fontWeight={item.fontWeight ?? '400'}
            fontStyle={item.fontStyle}
          >
            {item.text}
          </text>
        ))}
        {planetRows.map((row, ri) => {
          const yPos = startY + (items.length + ri) * lineH
          // Render each planet glyph in its own color, spaced apart
          const glyphStrs = row.text.split(' ')
          const spacing   = isCorner ? 13 : 15
          const totalW    = (glyphStrs.length - 1) * spacing
          return glyphStrs.map((g2, gi) => (
            <text
              key={`${ri}-${gi}`}
              x={cx - totalW / 2 + gi * spacing}
              y={yPos}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={colors[ri * maxPerRow + gi] ?? T.txt3}
              fontSize={planSz}
              fontFamily="Inter, system-ui, sans-serif"
              fontWeight="600"
            >
              {g2}
            </text>
          ))
        })}
      </g>
    )
  }

  return (
    <svg
      viewBox="0 0 420 420"
      width="100%"
      style={{ maxWidth: 420, display: 'block', margin: '0 auto' }}
    >
      {/* Background */}
      <rect x={SV} y={SV} width={EV - SV} height={EV - SV} fill="#100A22" stroke={STROKE} strokeWidth={STROKE_W} />

      {/* Clickable house polygons (filled, then stroked) */}
      {(Object.entries(NI_HOUSES) as [string, { points: string; cx: number; cy: number }][]).map(([idStr, house]) => {
        const id  = Number(idStr)
        const sel = selected === id
        return (
          <polygon
            key={id}
            points={house.points}
            fill={sel ? SEL_FILL : DEF_FILL}
            stroke={sel ? 'rgba(192,168,96,0.55)' : STROKE}
            strokeWidth={sel ? 2 : STROKE_W}
            style={{ cursor: 'pointer', transition: 'fill 0.18s' }}
            onClick={() => onSelect(sel ? null : id)}
          />
        )
      })}

      {/* Inner diamond outline */}
      <polygon
        points={`${MV},${SV} ${EV},${MV} ${MV},${EV} ${SV},${MV}`}
        fill="none"
        stroke={STROKE}
        strokeWidth={STROKE_W}
        style={{ pointerEvents: 'none' }}
      />

      {/* Full diagonals */}
      <line x1={SV} y1={SV} x2={EV} y2={EV} stroke={STROKE} strokeWidth={STROKE_W - 0.5} style={{ pointerEvents: 'none' }} />
      <line x1={EV} y1={SV} x2={SV} y2={EV} stroke={STROKE} strokeWidth={STROKE_W - 0.5} style={{ pointerEvents: 'none' }} />

      {/* Horizontal and vertical mid-lines */}
      <line x1={SV} y1={MV} x2={EV} y2={MV} stroke={STROKE} strokeWidth={STROKE_W - 0.5} style={{ pointerEvents: 'none' }} />
      <line x1={MV} y1={SV} x2={MV} y2={EV} stroke={STROKE} strokeWidth={STROKE_W - 0.5} style={{ pointerEvents: 'none' }} />

      {/* Center diamond fill + label */}
      <polygon
        points={`${MV},${SV} ${EV},${MV} ${MV},${EV} ${SV},${MV}`}
        fill="rgba(139,124,200,0.04)"
        stroke="none"
        style={{ pointerEvents: 'none' }}
      />
      <text
        x={MV}
        y={MV - 9}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#C0A860"
        fontSize={13}
        fontFamily="Cormorant Garamond, serif"
        fontStyle="italic"
        style={{ pointerEvents: 'none' }}
      >
        {nativeName ? nativeName.split(' ')[0] : 'Celestial'}
      </text>
      <text
        x={MV}
        y={MV + 9}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#C0A860"
        fontSize={13}
        fontFamily="Cormorant Garamond, serif"
        fontStyle="italic"
        style={{ pointerEvents: 'none' }}
      >
        {nativeName ? nativeName.split(' ').slice(1).join(' ') || 'Noir' : 'Noir'}
      </text>

      {/* House content (text labels) */}
      {(Object.entries(NI_HOUSES) as [string, { points: string; cx: number; cy: number }][]).map(([idStr, h]) =>
        renderHouseContent(Number(idStr), h.cx, h.cy)
      )}
    </svg>
  )
}

// ── House cell (shared for D1 / D9 / D10) ────────────────────────────────────
interface HouseCellProps {
  houseId:   number
  sign:      string
  planets:   string[]
  isLagna:   boolean
  selected:  number | null
  onSelect:  (id: number | null) => void
}

function HouseCell({ houseId, sign, planets, isLagna, selected, onSelect }: HouseCellProps) {
  const [cs, ce, rs, re] = HOUSE_GRID[houseId]
  const isSelected = selected === houseId

  return (
    <div
      onClick={() => onSelect(isSelected ? null : houseId)}
      style={{
        gridColumn:    `${cs} / ${ce}`,
        gridRow:       `${rs} / ${re}`,
        border:        `1px solid ${isSelected ? 'rgba(212,184,112,0.6)' : T.cardBdr}`,
        borderRadius:  6,
        padding:       '4px 5px',
        position:      'relative',
        minHeight:     60,
        background:    isSelected ? 'rgba(212,184,112,0.07)' : 'transparent',
        transition:    'border-color 0.2s, background 0.2s',
        cursor:        'pointer',
        display:       'flex',
        flexDirection: 'column',
        gap:           2,
        overflow:      'hidden',
        userSelect:    'none',
      }}
    >
      {/* House number */}
      <span style={{
        fontSize:    11,
        fontWeight:  700,
        color:       T.gold,
        lineHeight:  1,
        fontFamily:  'Inter, system-ui, sans-serif',
        letterSpacing: '0.05em',
      }}>
        {houseId}
      </span>

      {/* Sign name */}
      <span style={{
        fontSize:   11,
        color:      T.txt3,
        fontFamily: 'Inter, system-ui, sans-serif',
        lineHeight: 1,
      }}>
        {sign?.slice(0, 3)}
      </span>

      {/* Lagna marker */}
      {isLagna && (
        <span style={{
          fontSize:    11,
          color:       PLANET_COLORS.Lg,
          fontFamily:  'Inter, system-ui, sans-serif',
          fontWeight:  700,
          lineHeight:  1,
        }}>
          Lg
        </span>
      )}

      {/* Planets */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginTop: 1 }}>
        {planets.map(p => (
          <span key={p} style={{
            fontSize:   11,
            color:      planetColor(p),
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 600,
            lineHeight: 1,
          }}>
            {abbr(p)}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── House detail panel (shown below chart on click) ───────────────────────────
interface HousePanelProps {
  houseId:     number
  sign:        string
  planets:     string[]
  planetTable?: { planet: string; sign: string; house: number; dignity: string; degree?: string | number; notes?: string }[]
  houseMap?:   Record<number, { id: number; sign: string; planets: string[] }>
  onClose:     () => void
}

const SECTION_LABEL: React.CSSProperties = {
  fontFamily:    'Inter, system-ui, sans-serif',
  fontSize:      11,
  fontWeight:    700,
  color:         'rgba(192,168,96,0.55)',
  letterSpacing: '0.15em',
  textTransform: 'uppercase' as const,
  margin:        '0 0 8px',
}

function HousePanel({ houseId, sign, planets, planetTable, houseMap, onClose }: HousePanelProps) {
  const theme = HOUSE_THEMES[houseId]

  // Dignity lookup from planetTable
  function dignityFor(p: string): string {
    if (!planetTable) return ''
    const row = planetTable.find(r =>
      r.planet === p || r.planet === fullName(p) || abbr(r.planet) === p
    )
    return row?.dignity ?? ''
  }

  // Degree lookup
  function degreeFor(p: string): string {
    if (!planetTable) return ''
    const row = planetTable.find(r =>
      r.planet === p || r.planet === fullName(p) || abbr(r.planet) === p
    )
    if (!row?.degree) return ''
    return `${Number(row.degree).toFixed(1)}°`
  }

  // Sign lookup
  function signFor(p: string): string {
    if (!planetTable) return sign
    const row = planetTable.find(r =>
      r.planet === p || r.planet === fullName(p) || abbr(r.planet) === p
    )
    return row?.sign ?? sign
  }

  // House lord
  const LORD_MAP: Record<string, string> = {
    Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon',
    Leo: 'Sun', Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Mars',
    Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Saturn', Pisces: 'Jupiter',
  }
  const houseSign   = sign
  const houseLord   = LORD_MAP[houseSign] ?? null
  const lordHouseRow = houseLord && planetTable
    ? planetTable.find(r => r.planet === houseLord || r.planet === abbr(houseLord) || fullName(r.planet) === houseLord)
    : null
  const lordHouseNum = lordHouseRow?.house ?? null

  // Aspects
  const aspectingPlanets = houseMap ? grahaAspects(houseId, houseMap) : []

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.22 }}
      style={{
        background:   'rgba(12,6,28,0.97)',
        border:       '1px solid rgba(192,168,96,0.22)',
        borderRadius: 16,
        padding:      20,
        marginTop:    12,
        position:     'relative',
      }}
    >
      {/* Dismiss */}
      <button
        onClick={onClose}
        style={{
          position:   'absolute',
          top:        12,
          right:      14,
          background: 'none',
          border:     'none',
          color:      T.txt3,
          fontSize:   20,
          cursor:     'pointer',
          lineHeight: 1,
          padding:    0,
        }}
        aria-label="Close"
      >
        ×
      </button>

      {/* ── A. House Signification block ── */}
      <div style={{ marginBottom: 18, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Sanskrit name + house number */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
          <span style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontStyle:  'italic',
            fontSize:   22,
            fontWeight: 500,
            color:      '#C0A860',
            lineHeight: 1,
          }}>
            {theme?.sanskrit ?? `House ${houseId}`}
          </span>
          <span style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize:   13,
            color:      T.txt3,
          }}>
            — House {houseId}
          </span>
        </div>

        {/* Domain keywords */}
        {theme && (
          <p style={{
            fontFamily:    'Inter, system-ui, sans-serif',
            fontSize:      13,
            color:         '#C0A860',
            letterSpacing: '0.07em',
            margin:        '0 0 8px',
            opacity:       0.8,
          }}>
            {theme.keywords}
          </p>
        )}

        {/* Sign of this house */}
        <p style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize:   14,
          color:      T.txt3,
          margin:     '0 0 8px',
          letterSpacing: '0.03em',
        }}>
          {sign}
        </p>

        {/* 1-sentence description */}
        {theme && (
          <p style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontStyle:  'italic',
            fontSize:   14,
            color:      T.txt2,
            margin:     '0 0 10px',
            lineHeight: 1.55,
          }}>
            {theme.description}
          </p>
        )}

        {/* House type classification */}
        <p style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize:   13,
          color:      T.txt3,
          margin:     0,
          fontStyle:  'italic',
        }}>
          {houseType(houseId)}
        </p>

        {/* Theme pills */}
        {theme && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 10 }}>
            {theme.themes.map(t => (
              <span key={t} style={{
                background:   'rgba(139,124,200,0.12)',
                border:       '1px solid rgba(139,124,200,0.22)',
                borderRadius: 20,
                padding:      '2px 9px',
                fontSize:     12,
                color:        T.violet2,
                fontFamily:   'Inter, system-ui, sans-serif',
              }}>
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── B. Planets in house ── */}
      <div style={{ marginBottom: 18 }}>
        <p style={SECTION_LABEL}>
          {planets.length > 0 ? 'Planets in this house' : 'No planets occupy this house'}
        </p>

        {planets.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {planets.map(p => {
              const full      = fullName(p)
              const glyphCh   = glyph(p)
              const col       = planetColor(p)
              const dig       = dignityFor(p)
              const digKey    = dig.toLowerCase()
              const degStr    = degreeFor(p)
              const pSign     = signFor(p)
              const interpKey = `${full}_${houseId}`
              const interp    = PLANET_IN_HOUSE[interpKey] ?? null
              const digDesc   = DIGNITY_DESC[digKey] ?? null

              return (
                <div key={p} style={{
                  borderRadius: 10,
                  border:       `1px solid rgba(255,255,255,0.06)`,
                  background:   'rgba(10,5,25,0.88)',
                  overflow:     'hidden',
                }}>
                  {/* Planet header row */}
                  <div style={{
                    display:    'flex',
                    alignItems: 'center',
                    gap:        10,
                    padding:    '9px 12px',
                    borderBottom: interp ? '1px solid rgba(255,255,255,0.05)' : undefined,
                  }}>
                    {/* Glyph */}
                    <span style={{
                      fontSize:   20,
                      color:      col,
                      lineHeight: 1,
                      minWidth:   24,
                      textAlign:  'center',
                    }}>
                      {glyphCh}
                    </span>

                    {/* Name + sign + degree */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{
                          fontFamily: 'Inter, system-ui, sans-serif',
                          fontSize:   13,
                          color:      col,
                          fontWeight: 700,
                        }}>
                          {full}
                        </span>
                        {pSign && (
                          <span style={{
                            fontFamily: 'Inter, system-ui, sans-serif',
                            fontSize:   13,
                            color:      T.txt3,
                          }}>
                            in {pSign}{degStr ? ` · ${degStr}` : ''}
                          </span>
                        )}
                      </div>
                      {/* Dignity badge + meaning */}
                      {dig && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                          <DignityBadge dignity={dig} />
                          {digDesc && (
                            <span style={{
                              fontFamily: 'Inter, system-ui, sans-serif',
                              fontSize:   12,
                              color:      T.txt3,
                              fontStyle:  'italic',
                            }}>
                              {digDesc}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Planet-in-house interpretation */}
                  {interp && (
                    <div style={{ padding: '10px 12px' }}>
                      <p style={{
                        fontFamily: 'Cormorant Garamond, serif',
                        fontSize:   14,
                        color:      T.txt2,
                        margin:     0,
                        lineHeight: 1.6,
                        fontStyle:  'italic',
                      }}>
                        {interp}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── C. House Lord info ── */}
      {houseLord && (
        <div style={{
          paddingTop:  14,
          borderTop:   '1px solid rgba(255,255,255,0.06)',
          marginBottom: 14,
        }}>
          <p style={SECTION_LABEL}>House Lord</p>
          <div style={{
            display:      'flex',
            alignItems:   'center',
            gap:          8,
            padding:      '8px 12px',
            background:   'rgba(10,5,25,0.88)',
            borderRadius: 8,
            border:       '1px solid rgba(255,255,255,0.06)',
            flexWrap:     'wrap',
          }}>
            <span style={{ fontSize: 16, color: planetColor(houseLord) }}>
              {glyph(houseLord)}
            </span>
            <span style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize:   13,
              color:      planetColor(houseLord),
              fontWeight: 700,
            }}>
              {houseLord}
            </span>
            {lordHouseNum !== null && (
              <>
                <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 14, color: T.txt3 }}>
                  · currently in House {lordHouseNum}
                </span>
                <span style={{
                  fontFamily:   'Inter, system-ui, sans-serif',
                  fontSize:     12,
                  color:        T.txt3,
                  fontStyle:    'italic',
                  marginLeft:   4,
                }}>
                  — {houseType(lordHouseNum).split(' — ')[0]}
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── D. Aspects received ── */}
      <div style={{ paddingTop: houseLord ? 0 : 14, borderTop: houseLord ? undefined : '1px solid rgba(255,255,255,0.06)' }}>
        <p style={SECTION_LABEL}>Aspects Received</p>
        {aspectingPlanets.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {aspectingPlanets.map(ap => (
              <div key={ap} style={{
                display:      'flex',
                alignItems:   'center',
                gap:          5,
                padding:      '4px 10px',
                background:   'rgba(10,5,25,0.88)',
                borderRadius: 20,
                border:       `1px solid rgba(255,255,255,0.07)`,
              }}>
                <span style={{ fontSize: 13, color: planetColor(ap) }}>{glyph(ap)}</span>
                <span style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize:   13,
                  color:      planetColor(ap),
                  fontWeight: 600,
                }}>
                  {ap}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize:   14,
            color:      T.txt3,
            fontStyle:  'italic',
            margin:     0,
          }}>
            No graha aspects this house
          </p>
        )}
      </div>
    </motion.div>
  )
}

// ── Dignity badge ─────────────────────────────────────────────────────────────
const DIGNITY_COLORS: Record<string, { bg: string; color: string }> = {
  exalted:     { bg: 'rgba(126,200,160,0.15)', color: '#7EC8A0' },
  own:         { bg: 'rgba(212,184,112,0.15)', color: T.gold },
  moolatrikona:{ bg: 'rgba(212,184,112,0.10)', color: '#C8A850' },
  debilitated: { bg: 'rgba(224,80,80,0.15)',  color: '#E05050' },
  neutral:     { bg: 'rgba(12,6,28,0.90)', color: T.txt3 },
}

function DignityBadge({ dignity }: { dignity: string }) {
  const key   = dignity?.toLowerCase() as keyof typeof DIGNITY_COLORS
  const style = DIGNITY_COLORS[key] ?? DIGNITY_COLORS.neutral
  return (
    <span style={{
      background:   style.bg,
      color:        style.color,
      borderRadius: 10,
      padding:      '2px 7px',
      fontSize:     10,
      fontFamily:   'Inter, system-ui, sans-serif',
      textTransform: 'capitalize',
    }}>
      {dignity ?? 'neutral'}
    </span>
  )
}

// ── Planet table ──────────────────────────────────────────────────────────────
interface PlanetRow {
  planet: string; sign: string; house: number; dignity: string; notes?: string
}

function PlanetTable({ rows }: { rows: PlanetRow[] }) {
  const thStyle: React.CSSProperties = {
    fontFamily:    'Inter, system-ui, sans-serif',
    fontSize:      12,
    fontWeight:    600,
    color:         T.txt3,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    paddingBottom: 8,
    textAlign:     'left',
    borderBottom:  `1px solid ${T.cardBdr}`,
  }
  const tdStyle: React.CSSProperties = {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize:   13,
    color:      T.txt2,
    padding:    '6px 0',
    borderBottom: `1px solid rgba(255,255,255,0.04)`,
    verticalAlign: 'middle',
  }

  return (
    <div style={{ ...glass, marginTop: '1.5rem' }}>
      <p style={{
        fontFamily: 'Syne, sans-serif',
        fontSize:   18,
        fontWeight: 700,
        color:      T.txt,
        margin:     '0 0 14px',
      }}>
        Planetary Positions
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Planet', 'Sign', 'House', 'Dignity', 'Notes'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.planet}>
                <td style={{ ...tdStyle, color: planetColor(row.planet), fontWeight: 600 }}>
                  {row.planet}
                </td>
                <td style={tdStyle}>{row.sign}</td>
                <td style={{ ...tdStyle, color: T.txt3 }}>{row.house}</td>
                <td style={tdStyle}><DignityBadge dignity={row.dignity} /></td>
                <td style={{ ...tdStyle, color: T.txt3, fontSize: 13, fontStyle: 'italic' }}>
                  {row.notes ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Divisional chart grid (D9 / D10 use short codes already) ─────────────────
interface DivChartProps {
  houses:      DivHouse[]
  centerLabel: string
  selected:    number | null
  onSelect:    (id: number | null) => void
}

function DivChart({ houses, centerLabel, selected, onSelect }: DivChartProps) {
  const houseMap = Object.fromEntries(houses.map(h => [h.id, h]))

  return (
    <div style={{
      display:             'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gridTemplateRows:    'repeat(4, 1fr)',
      gap:                 3,
      aspectRatio:         '1 / 1',
    }}>
      {Object.entries(HOUSE_GRID).map(([idStr]) => {
        const id    = Number(idStr)
        const house = houseMap[id] ?? { id, sign: '', short: '', planets: [] }
        return (
          <div
            key={id}
            onClick={() => onSelect(selected === id ? null : id)}
            style={{
              gridColumn:    `${HOUSE_GRID[id][0]} / ${HOUSE_GRID[id][1]}`,
              gridRow:       `${HOUSE_GRID[id][2]} / ${HOUSE_GRID[id][3]}`,
              border:        `1px solid ${selected === id ? 'rgba(212,184,112,0.6)' : T.cardBdr}`,
              borderRadius:  6,
              padding:       '4px 5px',
              minHeight:     60,
              background:    selected === id ? 'rgba(212,184,112,0.07)' : 'transparent',
              transition:    'border-color 0.2s, background 0.2s',
              cursor:        'pointer',
              display:       'flex',
              flexDirection: 'column',
              gap:           2,
              overflow:      'hidden',
              userSelect:    'none',
            }}
          >
            <span style={{
              fontSize:    11,
              fontWeight:  700,
              color:       T.gold,
              lineHeight:  1,
              fontFamily:  'Inter, system-ui, sans-serif',
              letterSpacing: '0.05em',
            }}>
              {id}
            </span>
            <span style={{
              fontSize:   11,
              color:      T.txt3,
              fontFamily: 'Inter, system-ui, sans-serif',
              lineHeight: 1,
            }}>
              {house.short || house.sign?.slice(0, 3)}
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginTop: 1 }}>
              {house.planets.map(p => (
                <span key={p} style={{
                  fontSize:   11,
                  color:      ABBR_COLORS[p] ?? planetColor(p),
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontWeight: 600,
                  lineHeight: 1,
                }}>
                  {p}
                </span>
              ))}
            </div>
          </div>
        )
      })}

      {/* Center label */}
      <div style={{
        ...CENTER_GRID,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        border:         `1px solid ${T.cardBdr}`,
        borderRadius:   6,
        background:     'rgba(139,124,200,0.04)',
        pointerEvents:  'none',
      }}>
        <span style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontStyle:  'italic',
          fontSize:   13,
          color:      T.gold,
          textAlign:  'center',
          lineHeight: 1.3,
        }}>
          {centerLabel}
        </span>
      </div>
    </div>
  )
}

// ── Divisional house tooltip panel ────────────────────────────────────────────
interface DivHousePanelProps {
  houseId: number
  sign:    string
  planets: string[]
  onClose: () => void
}

function DivHousePanel({ houseId, sign, planets, onClose }: DivHousePanelProps) {
  const theme = HOUSE_THEMES[houseId]
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2 }}
      style={{
        ...glass,
        marginTop:   12,
        position:    'relative',
        borderColor: 'rgba(212,184,112,0.25)',
      }}
    >
      <button
        onClick={onClose}
        style={{
          position:   'absolute',
          top:        12,
          right:      14,
          background: 'none',
          border:     'none',
          color:      T.txt3,
          fontSize:   18,
          cursor:     'pointer',
          lineHeight: 1,
          padding:    0,
        }}
        aria-label="Close"
      >
        ×
      </button>

      <p style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontSize:   18,
        fontWeight: 600,
        color:      T.gold,
        margin:     '0 0 4px',
        paddingRight: 24,
      }}>
        House {houseId} — {theme?.title ?? sign}
      </p>
      <p style={{
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize:   14,
        color:      T.txt3,
        margin:     '0 0 10px',
      }}>
        {sign}
      </p>

      {theme && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {theme.themes.map(t => (
            <span key={t} style={{
              background:   'rgba(139,124,200,0.15)',
              border:       '1px solid rgba(139,124,200,0.25)',
              borderRadius: 20,
              padding:      '2px 10px',
              fontSize:     13,
              color:        T.violet2,
              fontFamily:   'Inter, system-ui, sans-serif',
            }}>
              {t}
            </span>
          ))}
        </div>
      )}

      {planets.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {planets.map(p => {
            const col     = ABBR_COLORS[p] ?? planetColor(p)
            const glyphCh = glyph(p)
            const full    = fullName(p)
            return (
              <div key={p} style={{
                display:      'flex',
                alignItems:   'center',
                gap:          6,
                padding:      '5px 10px',
                background:   'rgba(10,5,25,0.88)',
                borderRadius: 8,
                border:       `1px solid rgba(255,255,255,0.06)`,
              }}>
                <span style={{ fontSize: 16, color: col }}>{glyphCh}</span>
                <span style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize:   14,
                  color:      col,
                  fontWeight: 600,
                }}>
                  {full}
                </span>
              </div>
            )
          })}
        </div>
      ) : (
        <p style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize:   13,
          color:      T.txt3,
          fontStyle:  'italic',
          margin:     0,
        }}>
          No planets in this house
        </p>
      )}
    </motion.div>
  )
}

// ── Planet Insights Section (always-visible accordion) ───────────────────────
interface PlanetInsightRowProps {
  row: { planet: string; sign: string; house: number; dignity: string; degree?: string | number; notes?: string }
}

function PlanetInsightRow({ row }: PlanetInsightRowProps) {
  const [open, setOpen] = useState(false)
  const full     = fullName(row.planet) || row.planet
  const col      = planetColor(row.planet)
  const glyphCh  = glyph(row.planet)
  const interpKey = `${full}_${row.house}`
  const interp    = PLANET_IN_HOUSE[interpKey] ?? null
  const digKey    = (row.dignity ?? '').toLowerCase()
  const digDesc   = DIGNITY_DESC[digKey] ?? null

  return (
    <div style={{ borderBottom: `1px solid rgba(114,166,183,0.10)` }}>
      {/* Header row — always visible, click to expand */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 12, width: '100%',
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '12px 0', textAlign: 'left',
        }}
      >
        <span style={{ fontSize: 22, color: col, minWidth: 26, textAlign: 'center', lineHeight: 1 }}>{glyphCh}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 14, color: col, fontWeight: 700 }}>{full}</span>
            <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13, color: T.txt3 }}>
              in {row.sign} · House {row.house}{row.degree ? ` · ${Number(row.degree).toFixed ? Number(row.degree).toFixed(1) + '°' : row.degree}` : ''}
            </span>
          </div>
          {row.dignity && (
            <div style={{ marginTop: 3 }}>
              <DignityBadge dignity={row.dignity} />
              {digDesc && <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 12, color: T.txt3, fontStyle: 'italic', marginLeft: 6 }}>{digDesc}</span>}
            </div>
          )}
        </div>
        <span style={{ fontSize: 14, color: T.txt3, flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>▾</span>
      </button>

      {/* Expanded interpretation */}
      {open && interp && (
        <div style={{ paddingBottom: 14, paddingLeft: 38 }}>
          <p style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontStyle:  'italic',
            fontSize:   14,
            color:      T.txt2,
            margin:     0,
            lineHeight: 1.65,
          }}>
            {interp}
          </p>
          {row.notes && row.notes !== '—' && (
            <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13, color: T.txt3, margin: '6px 0 0', fontStyle: 'italic' }}>
              Note: {row.notes}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function PlanetInsightsSection({ planetTable }: { planetTable: { planet: string; sign: string; house: number; dignity: string; degree?: string | number; notes?: string }[] }) {
  const PLANET_ORDER = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu']
  const sorted = [...planetTable].sort((a, b) => {
    const ai = PLANET_ORDER.indexOf(a.planet)
    const bi = PLANET_ORDER.indexOf(b.planet)
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })

  return (
    <div style={{ ...glass, marginTop: '1.5rem' }}>
      <div style={{ marginBottom: 14 }}>
        <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, color: T.txt, margin: '0 0 4px' }}>
          Planet Interpretations
        </p>
        <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13, color: T.txt3, margin: 0, fontStyle: 'italic' }}>
          Tap each planet to reveal its house placement reading
        </p>
      </div>
      <div>
        {sorted.map(row => <PlanetInsightRow key={row.planet} row={row} />)}
      </div>
    </div>
  )
}

// ── Chart type tab selector ───────────────────────────────────────────────────
type ChartTab = 'd1' | 'd9' | 'd10'

interface ChartTabBarProps {
  active:    ChartTab
  hasD9:     boolean
  hasD10:    boolean
  onChange:  (t: ChartTab) => void
}

function ChartTabBar({ active, hasD9, hasD10, onChange }: ChartTabBarProps) {
  const tabs: { id: ChartTab; label: string; disabled: boolean }[] = [
    { id: 'd1',  label: 'D1 — Rāśi',     disabled: false },
    { id: 'd9',  label: 'D9 — Navamsa',   disabled: !hasD9 },
    { id: 'd10', label: 'D10 — Dashamsha', disabled: !hasD10 },
  ]

  return (
    <div style={{
      display:      'flex',
      gap:          4,
      marginBottom: 14,
      background:   'rgba(10,5,25,0.88)',
      borderRadius: 10,
      padding:      4,
      border:       `1px solid ${T.cardBdr}`,
    }}>
      {tabs.map(tab => {
        const isActive = active === tab.id
        return (
          <button
            key={tab.id}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && onChange(tab.id)}
            style={{
              flex:         1,
              padding:      '7px 6px',
              borderRadius: 8,
              border:       `1px solid ${isActive ? 'rgba(212,184,112,0.5)' : 'transparent'}`,
              background:   isActive ? 'rgba(212,184,112,0.08)' : 'transparent',
              color:        tab.disabled ? T.txt3 : isActive ? T.gold : T.txt2,
              fontFamily:   'Inter, system-ui, sans-serif',
              fontSize:     13,
              fontWeight:   isActive ? 600 : 400,
              cursor:       tab.disabled ? 'not-allowed' : 'pointer',
              transition:   'all 0.18s',
              letterSpacing: '0.02em',
              opacity:      tab.disabled ? 0.45 : 1,
            }}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
interface Props { chart: ChartData | null }

export default function NatalChartTab({ chart }: Props) {
  const [activeTab,    setActiveTab]    = useState<ChartTab>('d1')
  const [selectedD1,   setSelectedD1]   = useState<number | null>(null)
  const [selectedD9,   setSelectedD9]   = useState<number | null>(null)
  const [selectedD10,  setSelectedD10]  = useState<number | null>(null)

  if (!chart || !chart.houses) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{ ...glass, textAlign: 'center', paddingTop: 48, paddingBottom: 48 }}
      >
        <p style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontStyle:  'italic',
          fontSize:   20,
          color:      T.txt3,
          margin:     '0 0 8px',
        }}>
          Rāśi Chart
        </p>
        <p style={{ color: T.txt3, fontSize: 13, margin: 0 }}>
          Cast your chart above to see the Rāśi chart
        </p>
      </motion.div>
    )
  }

  const houseMap     = Object.fromEntries(chart.houses.map(h => [h.id, h]))
  const hasD9        = !!(chart.d9Houses  && chart.d9Houses.length  > 0)
  const hasD10       = !!(chart.d10Houses && chart.d10Houses.length > 0)

  // Sub-label below tab bar
  const subLabel: Record<ChartTab, string> = {
    d1:  'Rāśi — Birth / Physical Chart',
    d9:  'Navamsa — Soul & Marriage Chart',
    d10: 'Dashamsha — Career & Vocation Chart',
  }

  // Helpers to get sign/planets for selected house in divisional charts
  function d9InfoFor(id: number) {
    const h = chart?.d9Houses?.find(x => x.id === id)
    return { sign: h?.sign ?? '', planets: h?.planets ?? [] }
  }
  function d10InfoFor(id: number) {
    const h = chart?.d10Houses?.find(x => x.id === id)
    return { sign: h?.sign ?? '', planets: h?.planets ?? [] }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Chart area */}
      <div style={{ maxWidth: 380, margin: '0 auto', width: '100%' }}>
        {/* Tab bar */}
        <ChartTabBar
          active   ={activeTab}
          hasD9    ={hasD9}
          hasD10   ={hasD10}
          onChange ={(t) => {
            setActiveTab(t)
            setSelectedD1(null)
            setSelectedD9(null)
            setSelectedD10(null)
          }}
        />

        {/* Sub-label */}
        <p style={{
          fontFamily:    'Inter, system-ui, sans-serif',
          fontSize:      13,
          color:         T.txt3,
          letterSpacing: '0.04em',
          textAlign:     'center',
          margin:        '0 0 10px',
          fontStyle:     'italic',
        }}>
          {subLabel[activeTab]}
        </p>

        {/* ── D1 chart (SVG North Indian) ── */}
        {activeTab === 'd1' && (
          <>
            <NISvgChart
              houseMap  ={houseMap}
              lagnaSign ={chart.lagna?.sign}
              selected  ={selectedD1}
              onSelect  ={setSelectedD1}
              nativeName={chart.native?.name}
            />

            {/* D1 house detail panel */}
            <AnimatePresence>
              {selectedD1 !== null && (
                <HousePanel
                  key        ={selectedD1}
                  houseId    ={selectedD1}
                  sign       ={houseMap[selectedD1]?.sign ?? ''}
                  planets    ={houseMap[selectedD1]?.planets ?? []}
                  planetTable={chart.planetTable}
                  houseMap   ={houseMap}
                  onClose    ={() => setSelectedD1(null)}
                />
              )}
            </AnimatePresence>
          </>
        )}

        {/* ── D9 chart ── */}
        {activeTab === 'd9' && hasD9 && (
          <>
            <DivChart
              houses     ={chart.d9Houses!}
              centerLabel={'Navamsa'}
              selected   ={selectedD9}
              onSelect   ={setSelectedD9}
            />
            <AnimatePresence>
              {selectedD9 !== null && (() => {
                const { sign, planets } = d9InfoFor(selectedD9)
                return (
                  <DivHousePanel
                    key    ={selectedD9}
                    houseId={selectedD9}
                    sign   ={sign}
                    planets={planets}
                    onClose={() => setSelectedD9(null)}
                  />
                )
              })()}
            </AnimatePresence>
          </>
        )}

        {/* ── D10 chart ── */}
        {activeTab === 'd10' && hasD10 && (
          <>
            <DivChart
              houses     ={chart.d10Houses!}
              centerLabel={'Dashamsha'}
              selected   ={selectedD10}
              onSelect   ={setSelectedD10}
            />
            <AnimatePresence>
              {selectedD10 !== null && (() => {
                const { sign, planets } = d10InfoFor(selectedD10)
                return (
                  <DivHousePanel
                    key    ={selectedD10}
                    houseId={selectedD10}
                    sign   ={sign}
                    planets={planets}
                    onClose={() => setSelectedD10(null)}
                  />
                )
              })()}
            </AnimatePresence>
          </>
        )}
      </div>

      {/* Planet table — only on D1 tab */}
      {activeTab === 'd1' && chart.planetTable && chart.planetTable.length > 0 && (
        <>
          <PlanetTable rows={chart.planetTable} />
          <PlanetInsightsSection planetTable={chart.planetTable} />
        </>
      )}
    </motion.div>
  )
}
