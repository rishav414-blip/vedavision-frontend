// Shared translation helper — replaces per-file t() duplicates.
// Usage: t('English text', 'हिंदी पाठ', lang)
export function t(en: string, hi: string, lang: string): string {
  return lang === 'hi' ? hi : en
}
