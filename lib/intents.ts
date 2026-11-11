import { content, type Lang } from "@/data/content";
import type { BookId } from "./chapters";

export type Intent =
  | { kind: "book"; book: BookId; page?: number }
  | { kind: "cv" }
  | { kind: "greet" }
  | { kind: "thanks" }
  | { kind: "classic" }
  | { kind: "unknown" };

const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9ñ\s]/g, " ");

// Palabras clave en ambos idiomas: así Nigi entiende aunque escriban en el otro.
const keywords: Record<BookId, string[]> = {
  "sobre-mi": [
    "sobre", "quien", "presenta", "acerca", "vida", "hobbie", "gusta", "habilidad", "tecnolog", "stack", "skill", "herramienta", "perro", "mascota", "musica", "gimnasio", "pelicula", "donde vive", "de donde", "edad", "personal",
    "about", "who is", "who are", "yourself", "himself", "hobby", "like", "tool", "dog", "pet", "music", "gym", "movie", "where", "background",
  ],
  proyectos: [
    "proyect", "trabajos", "portafolio", "app", "aplicacion", "juego", "videojuego", "smartwatch", "reloj", "que ha hecho", "que has hecho", "creado", "desarroll",
    "project", "portfolio", "game", "watch", "built", "made", "develop",
  ],
  visitas: ["visita", "empresa", "visit", "company"],
  testimonios: ["testimon", "opinion", "dicen", "recomend", "referencia", "resena", "review", "say about", "reference"],
  experiencia: [
    "experien", "estudi", "universidad", "trabajo", "laboral", "freelance", "academ", "carrera", "empleo", "practica", "hackaton", "formacion",
    "work", "job", "studies", "study", "university", "college", "degree", "education", "career", "hackathon",
  ],
  certificados: ["certific", "curso", "idioma", "ingles", "coderhouse", "sena", "diploma", "logro", "course", "language", "english", "spanish", "achievement"],
  contacto: [
    "contact", "correo", "email", "mail", "linkedin", "github", "escrib", "telefono", "hablar", "comunic", "red social", "redes",
    "reach", "hire", "talk", "phone", "social", "write",
  ],
};

export function parseIntent(raw: string, lang: Lang = "es"): Intent {
  const { projects, visits } = content[lang];
  const text = ` ${normalize(raw)} `;
  if (!text.trim()) return { kind: "unknown" };

  if (/\b(cv|hoja de vida|curriculum|resume)\b/.test(text)) return { kind: "cv" };
  if (/\b(modo lectura|modo clasico|salir|cerrar biblioteca|reading mode|classic mode|exit|close library)\b/.test(text)) return { kind: "classic" };

  // Visita empresarial: van al final del libro de Experiencia
  const visitAliases: Record<string, string[]> = { ciandt: ["ci t", "ciandt", "ci and t", "ci&t"], ceiba: ["ceiba"], sofka: ["sofka"] };
  const vIdx = visits.findIndex((v) => (visitAliases[v.slug] ?? [normalize(v.company)]).some((a) => text.includes(` ${a} `) || text.includes(a.replace(" ", ""))));
  if (vIdx >= 0) return { kind: "book", book: "visitas", page: vIdx };
  if (/visita|empresa|casa(s)? de software|visit|compan|software house/.test(text)) return { kind: "book", book: "visitas" };

  // Proyecto concreto: abrir el libro en su página
  const idx = projects.findIndex((p) => text.includes(normalize(p.title).split(" ")[0]));
  if (idx >= 0) return { kind: "book", book: "proyectos", page: idx + 1 };

  let best: { id: BookId; score: number } | null = null;
  for (const [id, words] of Object.entries(keywords) as [BookId, string[]][]) {
    const score = words.reduce((n, w) => n + (text.includes(w) ? 1 : 0), 0);
    if (score > 0 && (!best || score > best.score)) best = { id, score };
  }
  if (best) return { kind: "book", book: best.id };

  if (/\b(hola|buenas|hey|saludos|que tal|hello|hi|good morning|good afternoon)\b/.test(text)) return { kind: "greet" };
  if (/\b(gracias|genial|excelente|chevere|bacano|thanks|thank you|great|awesome|cool)\b/.test(text)) return { kind: "thanks" };
  return { kind: "unknown" };
}

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

const DIALOGS = {
  es: {
    ack: ["¡Claro! En un momento te la paso.", "¡Enseguida! Voy por ese libro.", "Perfecto, dame un segundo y te lo leo.", "¡Bip! Ya sé dónde está. Voy por él."],
    again: ["¿Quieres que te lea otro libro?", "¿Qué más te gustaría saber de Cristian?", "¡Listo! Pídeme otro cuando quieras."],
    greeting:
      "¡Bip bup! Soy Nigi, el bibliotecario de Cristian. Cada libro de esta biblioteca guarda una parte de su historia. ¿Qué te gustaría que te leyera hoy?",
    found: (title: string) => `¡Aquí está! «${title}». Ven, mira por mis ojos.`,
    gotIt: "¡Lo tengo!",
    cv: "¡Claro! Aquí tienes la hoja de vida de Cristian. Se está descargando.",
    greet: "¡Hola! Pregúntame por sus proyectos, su experiencia, sus certificados o cómo contactarlo.",
    thanks: "¡Con gusto! Bip bup. ¿Te leo algo más?",
    unknown: "Mmm, ese libro no lo encuentro. Prueba con: proyectos, sobre mí, experiencia, testimonios, certificados o contacto.",
  },
  en: {
    ack: ["Sure! I'll bring it to you in a moment.", "Right away! Going for that book.", "Perfect, give me a second and I'll read it to you.", "Beep! I know exactly where it is. On my way."],
    again: ["Would you like me to read you another book?", "What else would you like to know about Cristian?", "All done! Ask me for another one anytime."],
    greeting:
      "Beep boop! I'm Nigi, Cristian's librarian. Every book in this library holds a part of his story. What would you like me to read to you today?",
    found: (title: string) => `Here it is! "${title}". Come, look through my eyes.`,
    gotIt: "Got it!",
    cv: "Sure! Here's Cristian's resume. It's downloading now.",
    greet: "Hi there! Ask me about his projects, his experience, his certificates or how to contact him.",
    thanks: "My pleasure! Beep boop. Shall I read you something else?",
    unknown: "Hmm, I can't find that book. Try: projects, about me, experience, testimonials, certificates or contact.",
  },
};

export const dialogs = (lang: Lang) => DIALOGS[lang];

export const getLines = (lang: Lang) => {
  const d = DIALOGS[lang];
  return {
    greeting: d.greeting,
    ack: () => pick(d.ack),
    found: d.found,
    gotIt: d.gotIt,
    again: () => pick(d.again),
    cv: d.cv,
    greet: d.greet,
    thanks: d.thanks,
    unknown: d.unknown,
  };
};

// Compatibilidad
export const ACK = DIALOGS.es.ack;
export const AGAIN = DIALOGS.es.again;
export const lines = getLines("es");
