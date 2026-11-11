// Imprime { clave: { text, lang } } de todo lo que dice Nigi (para generar su voz).
import { allVoiceLines, voiceKey } from "../lib/voiceLines";
const out: Record<string, { text: string; lang: string }> = {};
for (const l of allVoiceLines()) out[voiceKey(l.text)] = l;
process.stdout.write(JSON.stringify(out, null, 1));
