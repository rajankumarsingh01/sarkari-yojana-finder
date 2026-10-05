// Search vocabulary for Hinglish / Hindi / English. This is NOT scheme data:
// it only helps a search word find the words that official texts really use.
// Matching is OR-based, so adding a synonym can only add results, never hide them.
// Rules for entries: single plain words only (no quotes, no hyphens).

// Words that carry no meaning for search (or appear in almost every scheme)
export const STOPWORDS = [
  // Hinglish / English filler
  "ke", "ka", "ki", "ko", "me", "mein", "mai", "main", "se", "par", "pe", "liye", "lie",
  "hai", "hain", "ho", "hota", "hoti", "kya", "kab", "kaise", "kaun", "kitna", "kahan",
  "mujhe", "mera", "meri", "hum", "humko", "ye", "yeh", "wo", "woh", "aur", "ya",
  "milega", "milegi", "milta", "milti", "milenge", "chahiye", "batao", "bataiye",
  "for", "the", "in", "of", "and", "to", "a", "an", "is", "are", "what", "how", "when",
  "who", "my", "i", "can", "get", "give", "want", "need", "me",
  // Words present in almost every record
  "scheme", "schemes", "yojana", "yojna", "yojanayen", "sarkari", "government", "govt",
  "sarkar", "bihar",
  // Hindi
  "के", "का", "की", "को", "में", "से", "पर", "लिए", "है", "हैं", "क्या", "कब", "कैसे",
  "मुझे", "और", "या", "योजना", "योजनाएँ", "योजनाएं", "सरकारी", "बिहार", "मिलेगा", "मिलेगी",
];

// Each group: any word in `words` also searches for everything in `expand`.
export const SYNONYM_GROUPS = [
  {
    words: ["paisa", "paise", "rupaye", "rupya", "rupay", "dhan", "rashi", "raashi", "पैसा", "पैसे", "रुपये", "राशि", "धन"],
    expand: ["money", "financial", "assistance", "amount", "आर्थिक", "सहायता", "राशि"],
  },
  {
    words: ["kisan", "kisaan", "kisano", "किसान", "किसानों"],
    expand: ["farmer", "farmers", "agriculture", "किसान", "कृषि"],
  },
  {
    words: ["kheti", "krishi", "khet", "खेती", "कृषि", "खेत"],
    expand: ["agriculture", "farming", "farmer", "कृषि", "किसान"],
  },
  {
    words: ["chhatravriti", "chatravritti", "chhatravritti", "chhatrvriti", "vritti", "छात्रवृत्ति"],
    expand: ["scholarship", "student", "छात्रवृत्ति", "छात्र"],
  },
  {
    words: ["chhatra", "chatra", "vidyarthi", "vidyarthiyo", "छात्र", "छात्रों", "विद्यार्थी"],
    expand: ["student", "students", "education", "scholarship", "छात्र", "विद्यार्थी", "शिक्षा"],
  },
  {
    words: ["shiksha", "padhai", "padhaai", "पढ़ाई", "शिक्षा"],
    expand: ["education", "student", "शिक्षा", "छात्र"],
  },
  {
    words: ["mahila", "mahilayen", "mahilaon", "aurat", "mahilao", "महिला", "महिलाएं", "महिलाओं"],
    expand: ["women", "woman", "female", "महिला"],
  },
  {
    words: ["ladki", "ladkiyan", "beti", "betiyan", "kanya", "लड़की", "लड़कियों", "बेटी", "बेटियों", "कन्या"],
    expand: ["girl", "girls", "daughter", "women", "बेटी", "कन्या", "लड़की"],
  },
  {
    words: ["bachche", "bacche", "bachhe", "bachcha", "baccha", "बच्चे", "बच्चों"],
    expand: ["child", "children", "बच्चे"],
  },
  {
    words: ["vriddh", "vridh", "buzurg", "bujurg", "budhapa", "vridhavastha", "वृद्ध", "बुजुर्ग", "बुज़ुर्ग"],
    expand: ["senior", "elderly", "old", "pension", "वृद्ध", "वरिष्ठ", "पेंशन"],
  },
  {
    words: ["pension", "pention", "पेंशन"],
    expand: ["pension", "पेंशन"],
  },
  {
    words: ["rozgar", "rojgar", "naukri", "job", "jobs", "रोजगार", "रोज़गार", "नौकरी"],
    expand: ["employment", "job", "jobs", "रोजगार"],
  },
  {
    words: ["vyapar", "vyavsay", "vyavasaay", "dukan", "udyog", "udyam", "व्यवसाय", "व्यापार", "दुकान", "उद्योग"],
    expand: ["business", "enterprise", "entrepreneur", "व्यवसाय", "उद्योग"],
  },
  {
    words: ["ghar", "awas", "aawas", "makan", "आवास", "मकान", "घर"],
    expand: ["housing", "house", "home", "आवास"],
  },
  {
    words: ["swasthya", "ilaaj", "ilaj", "dawai", "dawa", "bimari", "इलाज", "स्वास्थ्य", "दवाई", "बीमारी"],
    expand: ["health", "treatment", "medical", "स्वास्थ्य", "इलाज"],
  },
  {
    words: ["bima", "insurance", "बीमा"],
    expand: ["insurance", "बीमा"],
  },
  {
    words: ["baadh", "badh", "baarh", "aapda", "aapada", "flood", "floods", "बाढ़", "बाढ", "आपदा"],
    expand: ["flood", "floods", "disaster", "relief", "बाढ़", "बाढ", "आपदा", "राहत"],
  },
  {
    words: ["rahat", "राहत"],
    expand: ["relief", "राहत", "disaster", "आपदा"],
  },
  {
    words: ["divyang", "divyangjan", "viklang", "apang", "handicap", "handicapped", "disabled", "disability", "दिव्यांग", "दिव्यांगजन", "विकलांग"],
    expand: ["disability", "disabled", "divyang", "दिव्यांग"],
  },
  {
    words: ["mazdoor", "majdoor", "mazdur", "shramik", "labour", "labor", "मजदूर", "श्रमिक", "मज़दूर"],
    expand: ["labour", "labor", "worker", "workers", "श्रमिक", "मजदूर"],
  },
  {
    words: ["kaushal", "skill", "skills", "training", "prashikshan", "कौशल", "प्रशिक्षण"],
    expand: ["skill", "training", "कौशल", "प्रशिक्षण"],
  },
  {
    words: ["subsidy", "subsidies", "sabsidi", "anudan", "अनुदान", "सब्सिडी"],
    expand: ["subsidy", "subsidies", "grant", "अनुदान", "सब्सिडी"],
  },
  {
    words: ["loan", "karj", "karz", "rin", "कर्ज", "ऋण"],
    expand: ["loan", "credit", "ऋण", "कर्ज"],
  },
  {
    words: ["gaon", "gram", "grameen", "village", "गांव", "गाँव", "ग्रामीण"],
    expand: ["rural", "village", "ग्रामीण"],
  },
  {
    words: ["yuva", "naujawan", "youth", "युवा", "नौजवान"],
    expand: ["youth", "young", "युवा"],
  },
  {
    words: ["shaadi", "shadi", "vivah", "विवाह", "शादी"],
    expand: ["marriage", "विवाह"],
  },
  {
    words: ["vidhwa", "vidhva", "विधवा"],
    expand: ["widow", "विधवा"],
  },
];