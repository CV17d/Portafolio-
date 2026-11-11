// Todo lo que Nigi puede decir en voz alta. Con esta lista se pregeneran los
// audios con su voz clonada (scripts/voice-lines.ts → public/voice/).
import { books } from "./chapters";
import { ACK, AGAIN, lines } from "./intents";

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

export function allVoiceLines(): string[] {
  const out = new Set<string>([
    lines.greeting,
    lines.cv,
    lines.greet,
    lines.thanks,
    lines.unknown,
    "¡Lo tengo!",
    ...ACK,
    ...AGAIN,
  ]);
  for (const b of books) {
    out.add(lines.found(b.title));
    for (const p of b.pages) out.add(p.narration);
  }
  return [...out];
}
