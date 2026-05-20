// Static sample chart — matches the /chart API response shape exactly.
// Used as default so the dashboard is always populated on first load.
const SAMPLE_CHART = {
  native: { name: "Arjun Sharma", dob: "1990-08-15", tob: "06:30", pob: "New Delhi, India" },
  lagna: { sign: "Scorpio", signEn: "Scorpio", lord: "Mars", degree: "14°20'43\"" },
  moonSign: { sign: "Taurus", signEn: "Taurus" },
  sunSign: { sign: "Leo", signEn: "Leo" },
  nakshatra: {
    name: "Rohini", pada: 2, lord: "Moon",
    deity: "Brahma", symbol: "Ox-cart",
    theme: "Growth, beauty, and the act of creating something lasting in the material world."
  },
  houses: [
    { id:1,  sign:"Scorpio",     short:"Sco", planets:["Ju"] },
    { id:2,  sign:"Sagittarius", short:"Sag", planets:["Ke"] },
    { id:3,  sign:"Capricorn",   short:"Cap", planets:[] },
    { id:4,  sign:"Aquarius",    short:"Aqu", planets:["Sa"] },
    { id:5,  sign:"Pisces",      short:"Pis", planets:[] },
    { id:6,  sign:"Aries",       short:"Ari", planets:[] },
    { id:7,  sign:"Taurus",      short:"Tau", planets:["Mo","Ve"] },
    { id:8,  sign:"Gemini",      short:"Gem", planets:["Me"] },
    { id:9,  sign:"Cancer",      short:"Can", planets:[] },
    { id:10, sign:"Leo",         short:"Leo", planets:["Su","Ma"] },
    { id:11, sign:"Virgo",       short:"Vir", planets:[] },
    { id:12, sign:"Libra",       short:"Lib", planets:["Ra"] },
  ],
  karakas: {
    atmakaraka:   { planet:"Ju", planet_name:"Jupiter", sign:"Pisces",  house:5, degree:"28°14'" },
    amatyakaraka: { planet:"Su", planet_name:"Sun",     sign:"Leo",     house:10, degree:"24°52'" },
  },
  dasha: {
    current:    { planet:"Saturn",  skt:"Shani",   start:"2019-03-15", end:"2038-03-15" },
    antardasha: { planet:"Jupiter", skt:"Guru",    start:"2025-01-10", end:"2027-07-22" },
    sequence: [
      { planet:"Saturn",  years:19, start:"2019-03-15", end:"2038-03-15" },
      { planet:"Mercury", years:17, start:"2038-03-15", end:"2055-03-15" },
      { planet:"Ketu",    years:7,  start:"2055-03-15", end:"2062-03-15" },
      { planet:"Venus",   years:20, start:"2062-03-15", end:"2082-03-15" },
      { planet:"Sun",     years:6,  start:"2082-03-15", end:"2088-03-15" },
    ],
  },
  yoga:  ["Gaja Kesari", "Budhaditya", "Dhana Yoga"],
  yogas: [
    { name:"Gaja Kesari", formation:"Jupiter in kendra from Moon", effect:"A pattern associated with intellectual prominence, generosity, and a life of growing impact." },
    { name:"Budhaditya",  formation:"Sun and Mercury conjunct in 10th house", effect:"A pattern associated with intelligence, communication skill, and a sharp analytical mind." },
    { name:"Dhana Yoga",  formation:"2nd & 11th lords in favourable exchange", effect:"A pattern associated with steady wealth accumulation through sustained effort." },
  ],
  planetTable: [
    { planet:"Sun",     skt:"Surya",   glyph:"☉", sign:"Leo",          house:10, dignity:"Own Sign",         color:"#F59E0B", notes:"10th lord in own sign" },
    { planet:"Moon",    skt:"Chandra", glyph:"☽", sign:"Taurus",       house:7,  dignity:"Exalted",          color:"#94A3B8", notes:"Exalted Moon — strong mind" },
    { planet:"Mars",    skt:"Mangal",  glyph:"♂", sign:"Leo",          house:10, dignity:"Neutral/Friendly", color:"#EF4444", notes:"Lagna lord in 10th" },
    { planet:"Mercury", skt:"Budha",   glyph:"☿", sign:"Gemini",       house:8,  dignity:"Own Sign",         color:"#10B981", notes:"Own sign — intellect" },
    { planet:"Jupiter", skt:"Guru",    glyph:"♃", sign:"Scorpio",      house:1,  dignity:"Neutral/Friendly", color:"#F97316", notes:"Lagna placement" },
    { planet:"Venus",   skt:"Shukra",  glyph:"♀", sign:"Taurus",       house:7,  dignity:"Own Sign",         color:"#EC4899", notes:"7th house, own sign" },
    { planet:"Saturn",  skt:"Shani",   glyph:"♄", sign:"Aquarius",     house:4,  dignity:"Own Sign",         color:"#6366F1", notes:"Disciplined foundation" },
    { planet:"Rahu",    skt:"Rahu",    glyph:"☊", sign:"Libra",        house:12, dignity:"—",                color:"#8B5CF6", notes:"Foreign connections" },
    { planet:"Ketu",    skt:"Ketu",    glyph:"☋", sign:"Sagittarius",  house:2,  dignity:"—",                color:"#78716C", notes:"Past-life wisdom" },
  ],
  wealthScore: { total:74, parashari:59, bnn:15 },
  chartStrength: 60,
  ak:  "Jupiter",
  amk: "Sun",
  leadershipType: "Commander",
  bnnTransits: [],
};

export default SAMPLE_CHART;
