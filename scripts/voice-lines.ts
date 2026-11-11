// Imprime { clave: texto } de todo lo que dice Nigi (para generar su voz).
import { allVoiceLines, voiceKey } from "../lib/voiceLines";
const out: Record<string, string> = {};
for (const t of allVoiceLines()) out[voiceKey(t)] = t;
process.stdout.write(JSON.stringify(out, null, 1));
