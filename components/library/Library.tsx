"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BookOpenText, Download, MousePointerClick, SendHorizontal, Volume2, VolumeX } from "lucide-react";
import BookReader from "./BookReader";
import { OPEN_LIBRARY } from "./events";
import { bookById, getBooks, type BookId } from "@/lib/chapters";
import { getLines, parseIntent, type Intent } from "@/lib/intents";
import { useLang } from "@/lib/i18n";
import { LangSwitch } from "../LanguagePicker";
import { readingTime, speak, stopSpeaking } from "@/lib/speech";
import type { SceneCommand, ScenePhase } from "../library3d/Scene3D";

const Scene3D = dynamic(() => import("../library3d/Scene3D"), { ssr: false });

export default function Library() {
  const reduce = useReducedMotion() ?? false;
  const { lang, t, c } = useLang();
  const { profile } = c;
  const lines = getLines(lang);
  // Refs para los callbacks de la escena 3D (que no se recrean al cambiar de idioma)
  const linesRef = useRef(lines);
  const tRef = useRef(t);
  const langRef = useRef(lang);
  useEffect(() => {
    linesRef.current = lines;
    tRef.current = t;
    langRef.current = lang;
  });
  const bookTitles = useMemo(() => Object.fromEntries(getBooks(lang).map((b) => [b.id, b.title])) as Record<BookId, string>, [lang]);
  const [open, setOpen] = useState(true);
  const [ready, setReady] = useState(false);
  const [muted, setMuted] = useState(false);
  const [bubble, setBubble] = useState(() => getLines("es").greeting);
  const [talking, setTalking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [command, setCommand] = useState<SceneCommand>(null);
  const [reading, setReading] = useState<{ book: BookId; page: number } | null>(null);
  const [readerOpen, setReaderOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hint, setHint] = useState(true);
  const mutedRef = useRef(false);
  const pending = useRef<{ book: BookId; page: number } | null>(null);
  const nonce = useRef(0);
  const bubbleRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLDivElement | null>(null);
  const labelTextRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    let m = false;
    try {
      m = localStorage.getItem("nigi-muted") === "1";
    } catch {}
    mutedRef.current = m;
    const t = setTimeout(() => setMuted(m), 0);
    return () => clearTimeout(t);
  }, []);

  // Respaldo: nunca dejar al visitante en la pantalla de carga más de 7 s
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => setReady(true), 7000);
    return () => clearTimeout(t);
  }, [open]);

  // Al cambiar de idioma, Nigi vuelve a saludar en ese idioma
  useEffect(() => {
    stopSpeaking();
    const tm = setTimeout(() => setBubble(getLines(lang).greeting), 0);
    return () => clearTimeout(tm);
  }, [lang]);

  useEffect(() => {
    const onOpen = () => {
      setOpen(true);
      setBubble(linesRef.current.again());
    };
    window.addEventListener(OPEN_LIBRARY, onOpen);
    return () => window.removeEventListener(OPEN_LIBRARY, onOpen);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const say = useCallback((text: string, silent = false) => {
    setBubble(text);
    setTalking(true);
    if (mutedRef.current || silent) {
      setTimeout(() => setTalking(false), Math.min(2200, readingTime(text) / 2));
    } else {
      speak(text, { onEnd: () => setTalking(false) });
    }
  }, []);

  const request = useCallback((book: BookId, page = 0) => {
    if (busy) return;
    setBusy(true);
    setHint(false);
    pending.current = { book, page };
    setCommand({ book, nonce: ++nonce.current });
  }, [busy]);

  const onPhase = useCallback(
    (p: ScenePhase) => {
      const req = pending.current;
      switch (p) {
        case "ack":
          say(linesRef.current.ack());
          break;
        case "climbing":
          setBubble(tRef.current.climbing);
          break;
        case "grabbing":
          say(linesRef.current.gotIt, true);
          break;
        case "presenting":
          if (req) say(linesRef.current.found(bookById(req.book, langRef.current).title));
          break;
        case "diving":
          setBubble("");
          break;
        case "idle":
          setBusy(false);
          setCommand(null);
          say(linesRef.current.again());
          break;
      }
    },
    [say],
  );

  const onRead = useCallback(() => {
    if (!pending.current) return;
    setReading(pending.current);
    setReaderOpen(true);
  }, []);

  const closeReader = useCallback(() => {
    stopSpeaking();
    setReaderOpen(false);
  }, []);

  const closeLibrary = useCallback(() => {
    stopSpeaking();
    setReaderOpen(false);
    setReading(null);
    setCommand(null);
    setBusy(false);
    setTalking(false);
    setOpen(false);
  }, []);

  const handleIntent = useCallback(
    (intent: Intent) => {
      switch (intent.kind) {
        case "book":
          request(intent.book, intent.page);
          break;
        case "cv": {
          say(lines.cv);
          const a = document.createElement("a");
          a.href = profile.cv;
          a.download = t.cvFile;
          a.click();
          break;
        }
        case "classic":
          closeLibrary();
          break;
        default:
          say(lines[intent.kind]);
      }
    },
    [closeLibrary, request, say, lines, profile.cv, t.cvFile],
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim() || busy) return;
    handleIntent(parseIntent(query, lang));
    setQuery("");
  };

  const toggleMute = () => {
    const m = !muted;
    setMuted(m);
    mutedRef.current = m;
    if (m) stopSpeaking();
    try {
      localStorage.setItem("nigi-muted", m ? "1" : "0");
    } catch {}
  };

  useEffect(() => {
    if (!open || readerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeLibrary();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, readerOpen, closeLibrary]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="library"
          className="fixed inset-0 z-[70] bg-[#140e0a] text-[#f3e9dc]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04, filter: "blur(8px)" }}
          transition={{ duration: 0.6, ease: [0.7, 0, 0.3, 1] }}
          role="region"
          aria-label={t.libraryRegion}
        >
          {/* Escena 3D */}
          <div className="absolute inset-0">
            <Scene3D
              command={command}
              readerOpen={readerOpen}
              talking={talking}
              overlay={{ bubble: bubbleRef, label: labelRef, labelText: labelTextRef }}
              reduced={reduce}
              busy={busy}
              onPhase={onPhase}
              onRead={onRead}
              onBookClick={(id) => request(id)}
              onRobotClick={() => say(lines.greet)}
              bookTitles={bookTitles}
              onReady={() => setTimeout(() => setReady(true), 400)}
            />
          </div>

          {/* Globo de diálogo y etiqueta (posicionados por la escena 3D) */}
          <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
            <div ref={bubbleRef} className="absolute left-0 top-0 will-change-transform">
              <AnimatePresence mode="wait">
                {bubble && !readerOpen && (
                  <motion.div
                    key={bubble}
                    role="status"
                    aria-live="polite"
                    initial={{ opacity: 0, y: 10, scale: 0.9, rotateX: -30 }}
                    animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                    exit={{ opacity: 0, y: -6, scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 380, damping: 26 }}
                    className="relative mb-3 w-[min(70vw,300px)] origin-bottom rounded-2xl bg-[#f7efe1] px-4 py-3 text-[13px] font-medium leading-snug text-[#2a1e17] shadow-[0_14px_40px_rgba(0,0,0,0.5)] sm:text-sm"
                  >
                    {bubble}
                    <span className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-[#f7efe1]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div ref={labelRef} className="absolute left-0 top-0 opacity-0 transition-opacity duration-200 will-change-transform">
              <span ref={labelTextRef} className="mb-2 block whitespace-nowrap rounded-full border border-[#e8c27a]/60 bg-[#1c140f]/90 px-4 py-1.5 font-display text-sm font-semibold text-[#f7efe1] shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur" />
            </div>
          </div>

          {/* Carga */}
          <AnimatePresence>
            {!ready && (
              <motion.div
                className="absolute inset-0 z-50 grid place-items-center bg-[#140e0a]"
                exit={{ opacity: 0, transition: { duration: 0.8 } }}
              >
                <div className="text-center">
                  <p className="font-display text-3xl font-semibold sm:text-5xl">
                    {t.loaderTitle.split("").map((ch, i) => (
                      <motion.span key={i} className="inline-block" initial={{ y: 30, opacity: 0, rotateX: -90 }} animate={{ y: 0, opacity: 1, rotateX: 0 }} transition={{ delay: i * 0.04, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}>
                        {ch === " " ? " " : ch}
                      </motion.span>
                    ))}
                  </p>
                  <p className="mt-3 text-sm tracking-[0.3em] text-[#f3e9dc]/50 uppercase">{t.loaderSub}</p>
                  <div className="mx-auto mt-8 h-[2px] w-48 overflow-hidden rounded bg-white/10">
                    <motion.div className="h-full bg-gradient-to-r from-[#f08a3c] to-[#7cebf5]" initial={{ x: "-100%" }} animate={{ x: "100%" }} transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Barra superior */}
          <motion.div
            className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-2 bg-gradient-to-b from-black/50 to-transparent px-4 py-3 sm:px-6"
            initial={{ y: -40, opacity: 0 }}
            animate={ready ? { y: 0, opacity: readerOpen ? 0 : 1 } : {}}
            transition={{ delay: 0.6, duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <div className="pointer-events-auto flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#f08a3c] font-display font-bold text-[#1c140f]">{profile.logo}</span>
              <div className="leading-tight">
                <p className="font-display text-base font-semibold sm:text-lg">{t.libraryTitle}</p>
                <p className="hidden text-xs text-[#f3e9dc]/60 sm:block">{t.librarySub}</p>
              </div>
            </div>
            <div className="pointer-events-auto flex items-center gap-2">
              <LangSwitch className="border border-white/15 bg-black/30 backdrop-blur hover:bg-white/10" />
              <button type="button" onClick={toggleMute} className="grid h-10 w-10 place-items-center rounded-xl border border-white/15 bg-black/30 backdrop-blur hover:bg-white/10" aria-label={muted ? t.muteOn : t.muteOff}>
                {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <a href={profile.cv} download className="hidden h-10 items-center gap-1.5 rounded-xl border border-white/15 bg-black/30 px-3 text-sm font-semibold backdrop-blur hover:bg-white/10 sm:inline-flex">
                <Download size={16} aria-hidden /> CV
              </a>
              <button type="button" onClick={closeLibrary} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#f3e9dc] px-3 text-sm font-semibold text-[#1c140f] transition hover:bg-white">
                <BookOpenText size={16} aria-hidden /> <span className="hidden sm:inline">{t.readingMode}</span>
                <span className="sm:hidden">{t.readingShort}</span>
              </button>
            </div>
          </motion.div>

          {/* Pista */}
          <AnimatePresence>
            {ready && hint && (
              <motion.p
                className="pointer-events-none absolute bottom-36 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs text-[#f3e9dc]/80 backdrop-blur md:flex"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 2.4 } }}
                exit={{ opacity: 0 }}
              >
                <MousePointerClick size={14} aria-hidden /> {t.hint}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Chat */}
          <motion.div
            className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/70 via-black/40 to-transparent px-3 pb-[max(0.9rem,env(safe-area-inset-bottom))] pt-10 sm:px-6"
            initial={{ y: 60, opacity: 0 }}
            animate={ready ? { y: 0, opacity: readerOpen ? 0 : 1 } : {}}
            transition={{ delay: 0.9, duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <div className="mx-auto max-w-3xl">
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2.5 [scrollbar-width:none]">
                {t.chips.map((chip, i) => (
                  <motion.button
                    key={chip.label}
                    type="button"
                    disabled={busy}
                    onClick={() => handleIntent(parseIntent(chip.query, lang))}
                    initial={{ opacity: 0, y: 12 }}
                    animate={ready ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 1.1 + i * 0.06 }}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="shrink-0 rounded-full border border-white/15 bg-black/30 px-3.5 py-1.5 text-sm backdrop-blur transition-colors hover:border-[#7cebf5] hover:text-[#7cebf5] disabled:opacity-40"
                  >
                    {chip.label}
                  </motion.button>
                ))}
              </div>
              <form onSubmit={onSubmit} className="flex gap-2">
                <label htmlFor="nigi-input" className="sr-only">{t.askNigi}</label>
                <input
                  id="nigi-input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={busy ? t.busyPh : t.askPh}
                  disabled={busy}
                  autoComplete="off"
                  className="min-w-0 flex-1 rounded-2xl border border-white/15 bg-black/40 px-4 py-3.5 text-base text-[#f3e9dc] outline-none backdrop-blur transition placeholder:text-[#f3e9dc]/40 focus:border-[#7cebf5] focus:shadow-[0_0_0_4px_rgba(124,235,245,0.15)] disabled:opacity-50"
                />
                <motion.button whileTap={{ scale: 0.92 }} type="submit" disabled={busy || !query.trim()} className="grid w-14 place-items-center rounded-2xl bg-[#f08a3c] text-[#1c140f] transition disabled:opacity-40" aria-label={t.sendQuestion}>
                  <SendHorizontal size={20} />
                </motion.button>
              </form>
            </div>
          </motion.div>

          <AnimatePresence>
            {readerOpen && reading && (
              <BookReader
                key={reading.book}
                book={bookById(reading.book, lang)}
                startPage={reading.page}
                origin={{ x: typeof window !== "undefined" ? window.innerWidth / 2 : 0, y: typeof window !== "undefined" ? window.innerHeight / 2 : 0 }}
                muted={muted}
                onToggleMute={toggleMute}
                onClose={closeReader}
                onNavigate={(hash) => {
                  closeLibrary();
                  setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" }), 500);
                }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
