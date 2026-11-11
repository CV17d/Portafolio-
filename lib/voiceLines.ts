// Todo lo que Nigi puede decir en voz alta, en ambos idiomas. Con esta lista se
// pregeneran los audios con su voz (scripts/voice-lines.ts → public/voice/).
import { LANGS, type Lang } from "@/data/content";
import { getBooks } from "./chapters";
import { dialogs } from "./intents";

// Clave estable de un texto (FNV-1a de 32 bits sobre el texto normalizado).
export function voiceKey(text: string) {
  const s = text.normalize("NFC").replace(/\s+/g, " ").trim();
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

export function allVoiceLines(): { text: string; lang: Lang }[] {
  const out = new Map<string, Lang>();
  for (const lang of LANGS) {
    const d = dialogs(lang);
    for (const t of [d.greeting, d.cv, d.greet, d.thanks, d.unknown, d.gotIt, ...d.ack, ...d.again]) out.set(t, lang);
    for (const b of getBooks(lang)) {
      out.set(d.found(b.title), lang);
      for (const p of b.pages) out.set(p.narration, lang);
    }
  }
  return [...out].map(([text, lang]) => ({ text, lang }));
}
