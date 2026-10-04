// All 38 districts of Bihar. slug is used in URLs/DB, en/hi are for display.
export const BIHAR_DISTRICTS = [
  { slug: "araria", en: "Araria", hi: "अररिया" },
  { slug: "arwal", en: "Arwal", hi: "अरवल" },
  { slug: "aurangabad", en: "Aurangabad", hi: "औरंगाबाद" },
  { slug: "banka", en: "Banka", hi: "बांका" },
  { slug: "begusarai", en: "Begusarai", hi: "बेगूसराय" },
  { slug: "bhagalpur", en: "Bhagalpur", hi: "भागलपुर" },
  { slug: "bhojpur", en: "Bhojpur", hi: "भोजपुर" },
  { slug: "buxar", en: "Buxar", hi: "बक्सर" },
  { slug: "darbhanga", en: "Darbhanga", hi: "दरभंगा" },
  { slug: "east-champaran", en: "East Champaran", hi: "पूर्वी चंपारण" },
  { slug: "gaya", en: "Gaya", hi: "गया" },
  { slug: "gopalganj", en: "Gopalganj", hi: "गोपालगंज" },
  { slug: "jamui", en: "Jamui", hi: "जमुई" },
  { slug: "jehanabad", en: "Jehanabad", hi: "जहानाबाद" },
  { slug: "kaimur", en: "Kaimur", hi: "कैमूर" },
  { slug: "katihar", en: "Katihar", hi: "कटिहार" },
  { slug: "khagaria", en: "Khagaria", hi: "खगड़िया" },
  { slug: "kishanganj", en: "Kishanganj", hi: "किशनगंज" },
  { slug: "lakhisarai", en: "Lakhisarai", hi: "लखीसराय" },
  { slug: "madhepura", en: "Madhepura", hi: "मधेपुरा" },
  { slug: "madhubani", en: "Madhubani", hi: "मधुबनी" },
  { slug: "munger", en: "Munger", hi: "मुंगेर" },
  { slug: "muzaffarpur", en: "Muzaffarpur", hi: "मुजफ्फरपुर" },
  { slug: "nalanda", en: "Nalanda", hi: "नालंदा" },
  { slug: "nawada", en: "Nawada", hi: "नवादा" },
  { slug: "patna", en: "Patna", hi: "पटना" },
  { slug: "purnia", en: "Purnia", hi: "पूर्णिया" },
  { slug: "rohtas", en: "Rohtas", hi: "रोहतास" },
  { slug: "saharsa", en: "Saharsa", hi: "सहरसा" },
  { slug: "samastipur", en: "Samastipur", hi: "समस्तीपुर" },
  { slug: "saran", en: "Saran", hi: "सारण" },
  { slug: "sheikhpura", en: "Sheikhpura", hi: "शेखपुरा" },
  { slug: "sheohar", en: "Sheohar", hi: "शिवहर" },
  { slug: "sitamarhi", en: "Sitamarhi", hi: "सीतामढ़ी" },
  { slug: "siwan", en: "Siwan", hi: "सीवान" },
  { slug: "supaul", en: "Supaul", hi: "सुपौल" },
  { slug: "vaishali", en: "Vaishali", hi: "वैशाली" },
  { slug: "west-champaran", en: "West Champaran", hi: "पश्चिमी चंपारण" },
];

export const DISTRICT_SLUGS = BIHAR_DISTRICTS.map((d) => d.slug);

export function getDistrictBySlug(slug) {
  return BIHAR_DISTRICTS.find((d) => d.slug === slug) || null;
}