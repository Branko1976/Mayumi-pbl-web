// =============================================================================
// SUPPORTED LANGUAGES — for simulated-character dialogue only.
//
// This does NOT affect the app's own UI text or the exported .docx, which
// stay in English regardless of this setting (the tutor reads the export,
// and the rubric/learning objectives are authored in English).
// =============================================================================

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ja", label: "Japanese (日本語)" },
  { code: "zh", label: "Chinese (中文)" },
  { code: "ko", label: "Korean (한국어)" },
  { code: "es", label: "Spanish (Español)" },
  { code: "fr", label: "French (Français)" },
  { code: "de", label: "German (Deutsch)" },
  { code: "pt", label: "Portuguese (Português)" },
  { code: "vi", label: "Vietnamese (Tiếng Việt)" },
  { code: "id", label: "Indonesian (Bahasa Indonesia)" },
  { code: "th", label: "Thai (ภาษาไทย)" },
  { code: "ar", label: "Arabic (العربية)" },
];

export function getLanguageLabel(code) {
  const found = LANGUAGES.find((l) => l.code === code);
  return found ? found.label : "English";
}

export function isValidLanguageCode(code) {
  return LANGUAGES.some((l) => l.code === code);
}
