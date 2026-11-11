"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { content, type Content, type Lang } from "@/data/content";
import { setSpeechLang } from "./speech";

// Textos de la interfaz (lo que no es contenido) en ambos idiomas.
const UI = {
  es: {
    chapter: (n: number) => `Capítulo ${n}`,
    extraChapter: "Capítulo extra",
    // navbar
    navMain: "Principal",
    goHome: "Ir al inicio",
    library: "Biblioteca",
    nigiLibrary: "Biblioteca de Nigi",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
    switchLang: "Cambiar idioma",
    lightMode: "Cambiar a modo claro",
    darkMode: "Cambiar a modo oscuro",
    // hero
    available: "Disponible para proyectos",
    downloadCv: "Descargar CV",
    seeProjects: "Ver proyectos",
    enterLibrary: "Entrar a la biblioteca",
    photoAlt: "Foto de Cristian Velasco",
    scroll: "Scroll",
    scrollDown: "Bajar a Sobre mí",
    // about
    aboutTitle: "Sobre mí",
    location: "Ubicación",
    studies: "Estudios",
    offCode: "Fuera del código",
    technologies: "Tecnologías",
    // projects
    projectsTitle: "Mis proyectos",
    screenshotOf: (t: string) => `Captura de ${t}`,
    // testimonials
    testimonialsTitle: "Lo que dicen de mí",
    photoOf: (n: string) => `Foto de ${n}`,
    linkedinOf: (n: string) => `LinkedIn de ${n}`,
    // experience
    experienceTitle: "Experiencia",
    work: "Laboral",
    academic: "Académica",
    // visits
    visitsTitle: "Visitas empresariales",
    visitsIntro:
      "Conocer por dentro grandes casas de software me mostró cómo funciona el mundo laboral real: cómo se organizan los equipos, qué se espera de un desarrollador y cómo se construye software para millones de personas.",
    learned: "Lo que aprendí",
    // contact
    contactTitle: "Hablemos",
    contactIntro: "¿Tienes un proyecto, una vacante o una idea? Escríbeme y te respondo pronto.",
    name: "Nombre",
    namePh: "Tu nombre",
    email: "Correo",
    emailPh: "tu@correo.com",
    message: "Mensaje",
    messagePh: "Cuéntame en qué puedo ayudarte",
    send: "Enviar mensaje",
    sending: "Enviando…",
    sent: "¡Mensaje enviado! Te responderé pronto.",
    sendError: (email: string) => `No se pudo enviar. Escríbeme directo a ${email}`,
    mailSubject: "Nuevo mensaje desde tu portafolio",
    // certificates
    certificatesTitle: "Certificados e idiomas",
    languages: "Idiomas",
    gallery: "Galería de certificados",
    galleryHint: "Haz clic en cualquiera para verlo en grande.",
    certificateOf: (n: string) => `Certificado: ${n}`,
    close: "Cerrar",
    previous: "Anterior",
    next: "Siguiente",
    // footer
    quickLinks: "Enlaces rápidos",
    links: "Enlaces",
    follow: "Sígueme",
    mail: "Correo",
    backToTop: "Volver arriba",
    madeWith: "Hecho con Next.js + Tailwind CSS",
    // biblioteca
    libraryRegion: "Biblioteca 3D interactiva de Cristian",
    loaderTitle: "La biblioteca",
    loaderSub: "de Cristian Velasco",
    libraryTitle: "La biblioteca de Cristian",
    librarySub: "Desarrollador Full-Stack · Pídele a Nigi lo que quieras saber",
    muteOn: "Activar voz de Nigi",
    muteOff: "Silenciar a Nigi",
    readingMode: "Modo lectura",
    readingShort: "Lectura",
    hint: "Pasa el cursor por los libros, haz clic en uno o pregúntale a Nigi",
    askNigi: "Pregúntale a Nigi",
    askPh: "Pregúntale a Nigi, ej. ¿qué proyectos tiene?",
    busyPh: "Nigi está trabajando…",
    sendQuestion: "Enviar pregunta",
    climbing: "¡Arriba voy! Bip, bip…",
    cvFile: "CV-Cristian-Velasco.pdf",
    chips: [
      { label: "Sobre Cristian", query: "¿Quién es Cristian?" },
      { label: "Proyectos", query: "Muéstrame sus proyectos" },
      { label: "Experiencia", query: "¿Qué experiencia tiene?" },
      { label: "Testimonios", query: "¿Qué dicen de él?" },
      { label: "Certificados", query: "¿Qué certificados tiene?" },
      { label: "Contacto", query: "¿Cómo lo contacto?" },
    ],
    // lector
    readingBook: (t: string) => `Leyendo el libro ${t}`,
    hudMode: "NIGI · MODO LECTURA",
    hudPage: "PÁG",
    prevPage: "Página anterior",
    nextPage: "Página siguiente",
    pause: "Pausar lectura",
    resume: "Continuar lectura",
    voiceOn: "Activar voz",
    voiceOff: "Silenciar voz",
    backToLibrary: "Volver a la biblioteca",
    exit: "Salir",
  },
  en: {
    chapter: (n: number) => `Chapter ${n}`,
    extraChapter: "Bonus chapter",
    navMain: "Main",
    goHome: "Go to home",
    library: "Library",
    nigiLibrary: "Nigi's library",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    switchLang: "Change language",
    lightMode: "Switch to light mode",
    darkMode: "Switch to dark mode",
    available: "Available for projects",
    downloadCv: "Download CV",
    seeProjects: "See projects",
    enterLibrary: "Enter the library",
    photoAlt: "Photo of Cristian Velasco",
    scroll: "Scroll",
    scrollDown: "Scroll down to About me",
    aboutTitle: "About me",
    location: "Location",
    studies: "Education",
    offCode: "Away from code",
    technologies: "Technologies",
    projectsTitle: "My projects",
    screenshotOf: (t: string) => `Screenshot of ${t}`,
    testimonialsTitle: "What people say",
    photoOf: (n: string) => `Photo of ${n}`,
    linkedinOf: (n: string) => `${n}'s LinkedIn`,
    experienceTitle: "Experience",
    work: "Work",
    academic: "Education",
    visitsTitle: "Company visits",
    visitsIntro:
      "Getting an inside look at large software companies showed me how the real professional world works: how teams are organized, what's expected from a developer and how software is built for millions of people.",
    learned: "What I learned",
    contactTitle: "Let's talk",
    contactIntro: "Have a project, a job opening or an idea? Write to me and I'll get back to you soon.",
    name: "Name",
    namePh: "Your name",
    email: "Email",
    emailPh: "you@email.com",
    message: "Message",
    messagePh: "Tell me how I can help you",
    send: "Send message",
    sending: "Sending…",
    sent: "Message sent! I'll get back to you soon.",
    sendError: (email: string) => `Couldn't send it. Email me directly at ${email}`,
    mailSubject: "New message from your portfolio (English)",
    certificatesTitle: "Certificates and languages",
    languages: "Languages",
    gallery: "Certificate gallery",
    galleryHint: "Click any of them to see it full size.",
    certificateOf: (n: string) => `Certificate: ${n}`,
    close: "Close",
    previous: "Previous",
    next: "Next",
    quickLinks: "Quick links",
    links: "Links",
    follow: "Follow me",
    mail: "Email",
    backToTop: "Back to top",
    madeWith: "Built with Next.js + Tailwind CSS",
    libraryRegion: "Cristian's interactive 3D library",
    loaderTitle: "The library",
    loaderSub: "of Cristian Velasco",
    libraryTitle: "Cristian's library",
    librarySub: "Full-Stack Developer · Ask Nigi anything you want to know",
    muteOn: "Turn on Nigi's voice",
    muteOff: "Mute Nigi",
    readingMode: "Reading mode",
    readingShort: "Read",
    hint: "Hover over the books, click one or ask Nigi",
    askNigi: "Ask Nigi",
    askPh: "Ask Nigi, e.g. what projects does he have?",
    busyPh: "Nigi is working…",
    sendQuestion: "Send question",
    climbing: "Going up! Beep, beep…",
    cvFile: "CV-Cristian-Velasco.pdf",
    chips: [
      { label: "About Cristian", query: "Who is Cristian?" },
      { label: "Projects", query: "Show me his projects" },
      { label: "Experience", query: "What experience does he have?" },
      { label: "Testimonials", query: "What do people say about him?" },
      { label: "Certificates", query: "What certificates does he have?" },
      { label: "Contact", query: "How can I contact him?" },
    ],
    readingBook: (t: string) => `Reading the book ${t}`,
    hudMode: "NIGI · READING MODE",
    hudPage: "PG",
    prevPage: "Previous page",
    nextPage: "Next page",
    pause: "Pause reading",
    resume: "Resume reading",
    voiceOn: "Turn on voice",
    voiceOff: "Mute voice",
    backToLibrary: "Back to the library",
    exit: "Exit",
  },
};

export type UIText = (typeof UI)["es"];

// chosen: null mientras se lee la preferencia guardada; false = primera visita (mostrar selector).
type Ctx = { lang: Lang; setLang: (l: Lang) => void; chosen: boolean | null; t: UIText; c: Content };

const LangContext = createContext<Ctx | null>(null);
const KEY = "lang";

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("es");
  // null = todavía no sabemos (evita mostrar el selector un instante a quien ya eligió)
  const [chosen, setChosen] = useState<boolean | null>(null);

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(KEY);
    } catch {}
    const t = setTimeout(() => {
      if (saved === "es" || saved === "en") setLangState(saved);
      setChosen(saved === "es" || saved === "en");
    }, 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = lang === "en" ? "Cristian Velasco · Full-Stack Developer" : "Cristian Velasco · Desarrollador Full-Stack";
    setSpeechLang(lang);
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    setChosen(true);
    try {
      localStorage.setItem(KEY, l);
    } catch {}
  }, []);

  const value = useMemo<Ctx>(() => ({ lang, setLang, chosen, t: UI[lang], c: content[lang] }), [lang, setLang, chosen]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang debe usarse dentro de <LangProvider>");
  return ctx;
}
