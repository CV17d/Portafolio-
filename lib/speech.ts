// Voz de Nigi con la Web Speech API (gratis, viene en el navegador).
// Preferimos voces neuronales/naturales en español (Edge: "Online (Natural)", Chrome: "Google español").

import { voiceKey } from "./voiceLines";

let cachedVoice: SpeechSynthesisVoice | null | undefined;
let token = 0;
let speechLang: "es" | "en" = "es";

// Idioma de la voz del navegador (respaldo cuando no hay audio pregenerado).
export function setSpeechLang(l: "es" | "en") {
  if (l !== speechLang) cachedVoice = undefined;
  speechLang = l;
}
let audio: HTMLAudioElement | null = null;

// Audios pregenerados con la voz clonada de Nigi (public/voice/manifest.json → { clave: archivo }).
let clips: Record<string, string> = {};
if (typeof window !== "undefined") {
  fetch("/voice/manifest.json")
    .then((r) => (r.ok ? r.json() : {}))
    .then((m) => (clips = m))
    .catch(() => {});
}

export const speechSupported = () => typeof window !== "undefined" && "speechSynthesis" in window;

function score(v: SpeechSynthesisVoice) {
  const n = v.name.toLowerCase();
  const l = v.lang.toLowerCase();
  if (!l.startsWith(speechLang)) return -1;
  let s = 0;
  if (speechLang === "en") {
    if (/natural|neural|online/.test(n)) s += 50;
    if (/aria|jenny|ava|emma|michelle|ana|samantha|zira/.test(n)) s += 12; // voces suaves y jóvenes
    if (/guy|davis|eric|christopher|roger|david|mark/.test(n)) s -= 8;
    if (l === "en-us") s += 8;
    if (/google/.test(n)) s += 20;
    if (v.localService === false) s += 4;
    return s;
  }
  if (/natural|neural|online/.test(n)) s += 50; // voces neuronales, mucho más cálidas
  if (/salome|dalia|ximena|camila|elvira|paloma|sabina|helena|paulina|lupe|monica|elena/.test(n)) s += 12; // voces suaves y jóvenes
  if (/gonzalo|jorge|pablo|alvaro|raul|diego|enrique|carlos|tomas/.test(n)) s -= 8; // evitamos voces graves
  if (l === "es-co") s += 10; // acento colombiano, como Cristian
  if (/es-(mx|us|419)/.test(l)) s += 6;
  if (/google/.test(n)) s += 20;
  if (v.localService === false) s += 4;
  return s;
}

function pickVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice) return cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  const best = voices.map((v) => ({ v, s: score(v) })).filter((x) => x.s >= 0).sort((a, b) => b.s - a.s)[0];
  cachedVoice = best?.v ?? null;
  return cachedVoice;
}

if (speechSupported()) {
  window.speechSynthesis.addEventListener?.("voiceschanged", () => {
    cachedVoice = undefined;
  });
}

type SpeakOpts = {
  onEnd?: () => void;
  onBoundary?: (charIndex: number) => void;
};

// Partimos el texto en frases: evita que Chrome corte las lecturas largas y suena más natural.
function chunks(text: string) {
  const parts = text.match(/[^.!?¿¡]+[.!?]+|[^.!?]+$/g) ?? [text];
  const out: { text: string; offset: number }[] = [];
  let offset = 0;
  for (const p of parts) {
    const i = text.indexOf(p, offset);
    out.push({ text: p, offset: i < 0 ? offset : i });
    offset = (i < 0 ? offset : i) + p.length;
  }
  return out.filter((c) => c.text.trim());
}

export function speak(text: string, opts: SpeakOpts = {}) {
  stopAudio();
  const file = clips[voiceKey(text)];
  if (file) {
    const my = ++token;
    if (speechSupported()) window.speechSynthesis.cancel();
    const a = new Audio(`/voice/${file}`);
    audio = a;
    // Subtítulos: avanzamos el resaltado en proporción al tiempo reproducido.
    a.ontimeupdate = () => my === token && a.duration && opts.onBoundary?.(Math.floor((text.length * a.currentTime) / a.duration));
    a.onended = () => my === token && opts.onEnd?.();
    a.play().catch(() => my === token && speakTTS(text, opts));
    return;
  }
  speakTTS(text, opts);
}

function stopAudio() {
  if (audio) {
    audio.onended = audio.ontimeupdate = null;
    audio.pause();
    audio = null;
  }
}

function speakTTS(text: string, opts: SpeakOpts) {
  if (!speechSupported()) {
    opts.onEnd?.();
    return;
  }
  const synth = window.speechSynthesis;
  const my = ++token;
  synth.cancel();
  const voice = pickVoice();
  const natural = voice ? /natural|neural|online|google/i.test(voice.name) : false;
  const list = chunks(text);
  list.forEach((c, i) => {
    const u = new SpeechSynthesisUtterance(c.text.trim());
    if (voice) u.voice = voice;
    u.lang = voice?.lang ?? (speechLang === "en" ? "en-US" : "es-ES");
    u.rate = natural ? 1.22 : 1.18; // ritmo ágil, sin arrastrar
    u.pitch = natural ? 1.35 : 1.45; // voz juvenil y alegre
    u.volume = 1;
    u.onboundary = (e) => my === token && opts.onBoundary?.(c.offset + e.charIndex);
    if (i === list.length - 1) {
      u.onend = () => my === token && opts.onEnd?.();
      u.onerror = () => my === token && opts.onEnd?.();
    } else {
      u.onend = () => my === token && opts.onBoundary?.(c.offset + c.text.length);
    }
    synth.speak(u);
  });
}

export function stopSpeaking() {
  token++;
  stopAudio();
  if (speechSupported()) window.speechSynthesis.cancel();
}

// Tiempo estimado de lectura cuando la voz está apagada.
export const readingTime = (text: string) => Math.max(3500, text.split(/\s+/).length * 260);
