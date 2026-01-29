
export const BASE_STRINGS: Record<string, string> = {
  welcome: "How's your health today, {name}?",
  newScan: "New Scan",
  history: "History",
  profile: "Profile",
  settings: "Settings",
  signOut: "Sign Out",
  startScan: "Start New Scan",
  latestAnalysis: "Latest Analysis",
  viewHistory: "View History",
  madeBy: "Made by Mahak Salam",
  language: "Language",
  analyzing: "Lingua is analyzing...",
  waitAi: "Connecting with AI to look for patterns...",
  home: "Home",
  back: "Back",
  save: "Save",
  changeLang: "Select your preferred language",
  placeholder: "Search languages...",
  error: "Oops! Something went wrong.",
  privacy: "Lingua is an AI health buddy, not a medical professional.",
  urgency: "Urgency",
  captured: "Scan Captured",
  path: "Personalized Recovery Path"
};

// We store dynamic translations in a cache to avoid redundant API calls
const translationCache: Record<string, Record<string, string>> = {
  en: BASE_STRINGS
};

export const getTranslation = (lang: string, key: string, dict: Record<string, string> = BASE_STRINGS) => {
  return dict[key] || BASE_STRINGS[key] || key;
};
