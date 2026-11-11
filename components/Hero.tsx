"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowDown, Download, Library, Sparkles } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { Magnetic, SplitText, Tilt } from "./fx";
import { openLibrary } from "./library/events";

const badges = [
  { label: "Next.js · React", x: "-12%", y: "12%", d: 0 },
  { label: "IoT + IA", x: "78%", y: "6%", d: 0.8 },
  { label: "Wear OS", x: "84%", y: "62%", d: 1.6 },
  { label: "Unity 3D", x: "-16%", y: "70%", d: 2.4 },
];

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { t, c } = useLang();
  const { profile } = c;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yText = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const yPhoto = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} id="inicio" className="relative overflow-hidden">
      {/* manchas de luz animadas */}
      <div className="pointer-events-none absolute -left-40 top-10 h-[480px] w-[480px] animate-blob bg-accent/25 blur-[90px]" aria-hidden />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-[420px] w-[420px] animate-blob-slow bg-glow/15 blur-[100px]" aria-hidden />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 pb-24 pt-14 sm:px-6 md:min-h-[calc(100svh-4rem)] md:grid-cols-[1.25fr_1fr] md:pt-0">
        <motion.div style={{ y: yText, opacity: fade }}>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 rounded-full border border-line bg-card/70 px-3 py-1.5 text-sm font-medium text-ink-soft backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            {t.available}
          </motion.p>
          <h1 className="mt-6 font-display text-[clamp(3.4rem,10vw,7.5rem)] font-semibold leading-[0.88] tracking-tight">
            <SplitText text="Cristian" inView={false} delay={0.3} className="block" />
            <SplitText text="Velasco" inView={false} delay={0.55} className="block text-accent" />
          </h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.8 }} className="mt-6 text-xl font-semibold md:text-2xl">
            {profile.role}
          </motion.p>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.15, duration: 0.8 }} className="mt-3 max-w-xl text-lg leading-relaxed text-ink-soft">
            {profile.tagline}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3, duration: 0.8 }} className="mt-9 flex flex-wrap items-center gap-3">
            <Magnetic>
              <a href={profile.cv} download className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl bg-accent px-6 py-4 font-semibold text-accent-ink shadow-[0_10px_30px_-8px_var(--accent)] transition hover:shadow-[0_16px_40px_-8px_var(--accent)]">
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" aria-hidden />
                <Download size={18} aria-hidden /> {t.downloadCv}
              </a>
            </Magnetic>
            <Magnetic>
              <a href="#proyectos" className="inline-flex items-center gap-2 rounded-2xl border-2 border-ink px-6 py-3.5 font-semibold transition hover:bg-ink hover:text-paper">
                {t.seeProjects}
              </a>
            </Magnetic>
            <Magnetic>
              <button type="button" onClick={openLibrary} className="inline-flex items-center gap-2 rounded-2xl px-4 py-3.5 font-semibold text-accent">
                <Library size={18} aria-hidden /> {t.enterLibrary}
              </button>
            </Magnetic>
          </motion.div>
        </motion.div>

        <motion.div style={{ y: yPhoto }} className="relative mx-auto w-full max-w-sm">
          <motion.div initial={{ opacity: 0, scale: 0.85, rotateY: -25 }} animate={{ opacity: 1, scale: 1, rotateY: 0 }} transition={{ delay: 0.4, duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }} style={{ perspective: 1000 }}>
            <Tilt max={12} className="group rounded-[2.2rem]">
              <div className="absolute -inset-4 rotate-3 rounded-[2.6rem] bg-gradient-to-br from-accent/40 to-glow/30 blur-[2px]" style={{ transform: "translateZ(-40px) rotate(3deg)" }} aria-hidden />
              <div className="relative overflow-hidden rounded-[2.2rem] border-4 border-card shadow-2xl" style={{ transform: "translateZ(20px)" }}>
                <Image src={profile.photo} alt={t.photoAlt} width={589} height={1000} priority className="aspect-[4/5] w-full scale-105 object-cover object-[50%_42%] transition duration-700 group-hover:scale-110" />
              </div>
              {badges.map((b) => (
                // fuera: lo adelanta en 3D (delante de la foto); dentro: la animación de flotar
                <span key={b.label} className="absolute z-20 hidden sm:block" style={{ left: b.x, top: b.y, transform: "translateZ(60px)" }}>
                  <span
                    className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-line bg-card/90 px-3 py-1.5 text-xs font-semibold shadow-lg backdrop-blur"
                    style={{ animation: "var(--animate-float)", animationDelay: `${b.d}s` }}
                  >
                    <Sparkles size={12} className="text-accent" aria-hidden /> {b.label}
                  </span>
                </span>
              ))}
            </Tilt>
          </motion.div>
        </motion.div>
      </div>

      <motion.a href="#sobre-mi" style={{ opacity: fade }} className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs font-medium uppercase tracking-[0.25em] text-ink-soft md:flex" aria-label={t.scrollDown}>
        {t.scroll}
        <motion.span animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.6 }}>
          <ArrowDown size={16} aria-hidden />
        </motion.span>
      </motion.a>
    </section>
  );
}
