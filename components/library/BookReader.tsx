"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, ExternalLink, Pause, Play, Volume2, VolumeX, X } from "lucide-react";
import type { Book, Page } from "@/lib/chapters";
import { readingTime, speak, stopSpeaking } from "@/lib/speech";
import { useLang } from "@/lib/i18n";

type Props = {
  book: Book;
  startPage?: number;
  origin: { x: number; y: number };
  muted: boolean;
  onToggleMute: () => void;
  onClose: () => void;
  onNavigate: (hash: string) => void;
};

const PAPER = "#f7efe1";

function LeftPage({ page, book, index }: { page: Page; book: Book; index: number }) {
  const accent = page.accent ?? book.color;
  return (
    <div className="relative flex h-full flex-col justify-between gap-4 p-6 md:p-10">
      <div>
        <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="text-[11px] font-semibold uppercase tracking-[0.25em]" style={{ color: accent }}>
          {page.kicker ?? book.title}
        </motion.p>
        <motion.h2 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32, duration: 0.5 }} className="mt-2 font-display text-3xl font-semibold leading-[1.05] md:text-5xl">
          {page.title}
        </motion.h2>
      </div>
      {page.image ? (
        <motion.div initial={{ opacity: 0, scale: 0.9, rotate: -4 }} animate={{ opacity: 1, scale: 1, rotate: -2 }} transition={{ delay: 0.4, type: "spring", stiffness: 160, damping: 16 }} className="mx-auto w-36 rotate-[-2deg] bg-white p-2 pb-6 shadow-[0_10px_30px_rgba(0,0,0,0.2)] md:w-52">
          <Image src={page.image} alt="" width={589} height={1000} className="aspect-square w-full object-cover object-[50%_42%]" />
        </motion.div>
      ) : (
        <span className="pointer-events-none hidden select-none font-display text-[10rem] leading-none md:block" style={{ color: accent, opacity: 0.13 }} aria-hidden>
          {page.title.charAt(0)}
        </span>
      )}
      <p className="hidden font-mono text-xs opacity-40 md:block">— {index + 1} —</p>
    </div>
  );
}

function RightPage({ page, book, onNavigate }: { page: Page; book: Book; onNavigate: (h: string) => void }) {
  const accent = page.accent ?? book.color;
  const item = (i: number) => ({ initial: { opacity: 0, x: 12 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.35 + i * 0.07 } });
  return (
    <div className="flex h-full flex-col gap-4 p-6 pb-10 pt-0 md:p-10">
      {page.paragraphs?.map((p, i) => (
        <motion.p key={p} {...item(i)} className="text-base leading-relaxed md:text-lg">
          {p}
        </motion.p>
      ))}
      {page.list && (
        <ul className="space-y-2.5">
          {page.list.map((l, i) => (
            <motion.li key={l} {...item(i + 1)} className="flex gap-2.5 leading-snug">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: accent }} />
              {l}
            </motion.li>
          ))}
        </ul>
      )}
      {page.tags && (
        <ul className="flex flex-wrap gap-1.5">
          {page.tags.map((t, i) => (
            <motion.li key={t} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + i * 0.03 }} className="rounded-md bg-[#ebdfca] px-2 py-1 text-xs font-medium">
              {t}
            </motion.li>
          ))}
        </ul>
      )}
      {page.links && (
        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          {page.links.map((l) =>
            l.href.startsWith("#") ? (
              <button key={l.href} type="button" onClick={() => onNavigate(l.href)} className="rounded-xl bg-[#2a1e17] px-4 py-2 text-sm font-semibold text-[#f7efe1] transition hover:-translate-y-0.5">
                {l.label}
              </button>
            ) : (
              <a key={l.href} href={l.href} target={l.href.startsWith("mailto") ? undefined : "_blank"} rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-xl border border-[#2a1e17] px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5 hover:bg-[#2a1e17] hover:text-[#f7efe1]">
                {l.label} <ExternalLink size={13} aria-hidden />
              </a>
            ),
          )}
        </div>
      )}
    </div>
  );
}

export default function BookReader({ book, startPage = 0, origin, muted, onToggleMute, onClose, onNavigate }: Props) {
  const reduce = useReducedMotion();
  const { t } = useLang();
  const [index, setIndex] = useState(startPage);
  const [flip, setFlip] = useState<{ id: number; dir: 1 | -1 } | null>(null);
  const [playing, setPlaying] = useState(true);
  const [spoken, setSpoken] = useState(0);
  const [eyesOpen, setEyesOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flipId = useRef(0);

  const page = book.pages[index];
  const total = book.pages.length;
  const shown = muted ? page.narration.length : spoken;

  const go = useCallback(
    (to: number) => {
      if (to < 0 || to >= total || to === index) return;
      setFlip({ id: ++flipId.current, dir: to > index ? 1 : -1 });
      setIndex(to);
      setSpoken(0);
    },
    [index, total],
  );

  useEffect(() => {
    const t = setTimeout(() => setEyesOpen(true), reduce ? 0 : 500);
    return () => clearTimeout(t);
  }, [reduce]);

  // Narración + avance automático
  useEffect(() => {
    if (!eyesOpen) return;
    if (timer.current) clearTimeout(timer.current);
    if (!playing) {
      stopSpeaking();
      return;
    }
    const next = () => {
      if (index < total - 1) timer.current = setTimeout(() => go(index + 1), 1000);
      else setPlaying(false);
    };
    if (muted) {
      stopSpeaking();
      timer.current = setTimeout(next, readingTime(page.narration));
    } else {
      speak(page.narration, {
        onEnd: () => {
          setSpoken(page.narration.length);
          next();
        },
        onBoundary: setSpoken,
      });
    }
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [index, playing, muted, eyesOpen, page.narration, total, go]);

  useEffect(() => () => stopSpeaking(), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
      if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index, onClose]);

  const at = `${origin.x}px ${origin.y}px`;
  const progress = ((index + 1) / total) * 100;

  return (
    <motion.div
      className="fixed inset-0 z-[90] overflow-hidden text-[#f3e9dc]"
      role="dialog"
      aria-modal="true"
      aria-label={t.readingBook(book.title)}
      initial={{ clipPath: `circle(0% at ${at})` }}
      animate={{ clipPath: `circle(150% at ${at})` }}
      exit={{ clipPath: `circle(0% at ${at})` }}
      transition={{ duration: reduce ? 0.15 : 0.9, ease: [0.7, 0, 0.3, 1] }}
    >
      {/* La biblioteca desenfocada, vista a través de los ojos de Nigi */}
      <div className="absolute inset-0 bg-[#0d0a08]/55 backdrop-blur-[14px]" aria-hidden />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(255,170,90,0.12),transparent_60%)]" aria-hidden />

      {/* HUD */}
      <div className="pointer-events-none absolute inset-0 z-20" aria-hidden>
        <div className="absolute inset-0 opacity-[0.06] [background:repeating-linear-gradient(0deg,#7cebf5_0_1px,transparent_1px_4px)]" />
        <motion.div className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-[#7cebf5]/10 to-transparent" animate={{ y: ["-10vh", "110vh"] }} transition={{ duration: 5.5, repeat: Infinity, ease: "linear" }} />
        <div className="absolute inset-0 shadow-[inset_0_0_180px_70px_rgba(0,0,0,0.9)]" />
        {["left-4 top-4 border-l-2 border-t-2", "right-4 top-4 border-r-2 border-t-2", "left-4 bottom-4 border-l-2 border-b-2", "right-4 bottom-4 border-r-2 border-b-2"].map((c, i) => (
          <motion.span key={c} className={`absolute h-10 w-10 border-[#7cebf5]/70 ${c}`} initial={{ opacity: 0, scale: 1.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 + i * 0.05 }} />
        ))}
        <p className="absolute left-8 top-6 font-mono text-[11px] tracking-[0.25em] text-[#7cebf5]/80">{t.hudMode}</p>
        <p className="absolute right-8 top-6 font-mono text-[11px] tracking-[0.25em] text-[#7cebf5]/80">
          {t.hudPage} {String(index + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}
        </p>
        <div className="absolute left-1/2 top-7 hidden h-px w-40 -translate-x-1/2 bg-[#7cebf5]/20 sm:block">
          <motion.div className="h-full bg-[#7cebf5]" animate={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Párpados */}
      {!reduce && (
        <>
          <motion.div className="absolute inset-x-0 top-0 z-30 h-1/2 origin-top rounded-b-[50%] bg-black" initial={{ scaleY: 1.05 }} animate={{ scaleY: eyesOpen ? 0 : 1.05 }} transition={{ duration: 0.55, ease: [0.6, 0, 0.2, 1] }} aria-hidden />
          <motion.div className="absolute inset-x-0 bottom-0 z-30 h-1/2 origin-bottom rounded-t-[50%] bg-black" initial={{ scaleY: 1.05 }} animate={{ scaleY: eyesOpen ? 0 : 1.05 }} transition={{ duration: 0.55, ease: [0.6, 0, 0.2, 1] }} aria-hidden />
        </>
      )}

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex min-h-0 flex-1 items-center justify-center px-5 pb-12 pt-14 sm:px-10 md:pb-14" style={{ perspective: 2200 }}>
          {/* Libro 3D sostenido por Nigi */}
          <motion.div
            className="relative flex max-h-full w-full max-w-5xl flex-col"
            style={{ transformStyle: "preserve-3d" }}
            initial={reduce ? false : { rotateX: 35, y: 120, scale: 0.85, opacity: 0 }}
            animate={reduce ? undefined : { rotateX: [9, 7, 9], rotateZ: [-0.5, 0.5, -0.5], y: [0, -5, 0], scale: 1, opacity: 1 }}
            transition={{ rotateX: { duration: 7, repeat: Infinity, ease: "easeInOut" }, rotateZ: { duration: 7, repeat: Infinity, ease: "easeInOut" }, y: { duration: 7, repeat: Infinity, ease: "easeInOut" }, scale: { duration: 1, delay: 0.4, ease: [0.2, 0.8, 0.2, 1] }, opacity: { duration: 0.6, delay: 0.4 } }}
          >
            {/* tapa */}
            <div className="absolute -inset-2.5 rounded-xl shadow-[0_50px_100px_rgba(0,0,0,0.65)] md:-inset-3.5" style={{ background: `linear-gradient(135deg, ${book.color}, color-mix(in srgb, ${book.color} 60%, black))`, transform: "translateZ(-14px)" }} aria-hidden />
            {/* canto de las hojas */}
            <div className="absolute inset-x-1 -bottom-2 h-3 rounded-b-md [background:repeating-linear-gradient(0deg,#e9dcc4_0_1px,#f7efe1_1px_3px)]" style={{ transform: "translateZ(-7px)" }} aria-hidden />

            <div className="relative flex min-h-0 overflow-hidden rounded-lg" style={{ background: PAPER }}>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={index}
                  className="grid min-h-0 w-full overflow-y-auto text-[#2a1e17] md:grid-cols-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { delay: reduce ? 0 : 0.28, duration: 0.25 } }}
                  exit={{ opacity: 0, transition: { duration: 0.2, delay: 0.1 } }}
                >
                  <div className="md:border-r md:border-[#e2d4bd]">
                    <LeftPage page={page} book={book} index={index} />
                  </div>
                  <RightPage page={page} book={book} onNavigate={onNavigate} />
                </motion.div>
              </AnimatePresence>
              {/* sombra del lomo */}
              <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-24 -translate-x-1/2 bg-[linear-gradient(90deg,transparent,rgba(0,0,0,0.13)_45%,rgba(0,0,0,0.22)_50%,rgba(0,0,0,0.13)_55%,transparent)] md:block" aria-hidden />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.35),transparent_30%,transparent_70%,rgba(0,0,0,0.06))]" aria-hidden />

              {/* hoja que pasa en 3D */}
              {!reduce && flip && (
                <motion.div
                  key={flip.id}
                  className={`pointer-events-none absolute inset-y-0 z-10 w-full md:w-1/2 ${flip.dir > 0 ? "right-0 origin-left" : "left-0 origin-right"}`}
                  style={{ transformStyle: "preserve-3d" }}
                  initial={{ rotateY: 0 }}
                  animate={{ rotateY: flip.dir > 0 ? -180 : 180 }}
                  transition={{ duration: 0.75, ease: [0.45, 0.05, 0.25, 1] }}
                  onAnimationComplete={() => setFlip(null)}
                  aria-hidden
                >
                  <div className="absolute inset-0 [backface-visibility:hidden]" style={{ background: `linear-gradient(${flip.dir > 0 ? 90 : 270}deg, #efe4d0, ${PAPER} 30%, #fffaf0)` }} />
                  <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]" style={{ background: `linear-gradient(${flip.dir > 0 ? 270 : 90}deg, #e6d8bf, ${PAPER} 40%)` }} />
                </motion.div>
              )}
            </div>

            {/* Manos de Nigi */}
            {["left", "right"].map((side) => (
              <motion.div
                key={side}
                className={`pointer-events-none absolute -bottom-12 h-16 w-20 rounded-[2rem] bg-gradient-to-br from-[#ffb47a] via-[#f08a3c] to-[#d4691f] shadow-[0_10px_30px_rgba(0,0,0,0.5)] md:-bottom-10 md:h-28 md:w-32 ${side === "left" ? "-left-6 rotate-[18deg] md:-left-10" : "-right-6 -rotate-[18deg] md:-right-10"}`}
                style={{ transform: "translateZ(30px)" }}
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, type: "spring", stiffness: 120, damping: 14 }}
                aria-hidden
              >
                <span className={`absolute top-4 h-3 w-3 rounded-full bg-[#7cebf5] shadow-[0_0_14px_#7cebf5] ${side === "left" ? "right-4" : "left-4"}`} />
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Subtítulos + controles */}
        <motion.div className="relative z-40 shrink-0 px-3 pb-4 sm:px-6" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.9 }}>
          <div className="mx-auto max-w-3xl rounded-2xl border border-[#7cebf5]/30 bg-black/70 p-4 backdrop-blur">
            <p className="max-h-20 overflow-y-auto text-sm leading-relaxed md:max-h-none md:text-base" aria-live="polite">
              <span className="mr-2 font-mono text-xs font-bold tracking-widest text-[#7cebf5]">NIGI</span>
              <span>{page.narration.slice(0, shown)}</span>
              <span className="opacity-40">{page.narration.slice(shown)}</span>
            </p>
            <div className="mt-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => go(index - 1)} disabled={index === 0} className="grid h-10 w-10 place-items-center rounded-xl transition hover:bg-white/10 disabled:opacity-30" aria-label={t.prevPage}>
                  <ChevronLeft size={20} />
                </button>
                <button type="button" onClick={() => setPlaying((p) => !p)} className="grid h-10 w-10 place-items-center rounded-xl bg-[#7cebf5] text-black transition hover:scale-105" aria-label={playing ? t.pause : t.resume}>
                  {playing ? <Pause size={18} /> : <Play size={18} />}
                </button>
                <button type="button" onClick={() => go(index + 1)} disabled={index === total - 1} className="grid h-10 w-10 place-items-center rounded-xl transition hover:bg-white/10 disabled:opacity-30" aria-label={t.nextPage}>
                  <ChevronRight size={20} />
                </button>
                <button type="button" onClick={onToggleMute} className="grid h-10 w-10 place-items-center rounded-xl transition hover:bg-white/10" aria-label={muted ? t.voiceOn : t.voiceOff}>
                  {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
              </div>
              <button type="button" onClick={onClose} className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-3 py-2 text-sm font-semibold transition hover:bg-white/10">
                <X size={16} aria-hidden /> <span className="hidden sm:inline">{t.backToLibrary}</span>
                <span className="sm:hidden">{t.exit}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
