"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Award, Check, ChevronLeft, ChevronRight, Globe, X, ZoomIn } from "lucide-react";
import Section from "./Section";
import { Reveal, Tilt } from "./fx";
import { certificates, languages } from "@/data/portfolio";

// Todas las imágenes en orden, para la galería y el visor.
const gallery = certificates.flatMap((c) =>
  c.items.filter((it) => it.image).map((it) => ({ src: it.image!, name: it.name, issuer: c.issuer, detail: it.detail, badge: it.badge })),
);

// Sección adicional: Certificados e Idiomas
export default function Certificates() {
  const [open, setOpen] = useState<number | null>(null);
  const show = (src?: string) => {
    const i = gallery.findIndex((g) => g.src === src);
    if (i >= 0) setOpen(i);
  };
  const step = useCallback((d: number) => setOpen((o) => (o === null ? o : (o + d + gallery.length) % gallery.length)), []);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, step]);

  const cur = open === null ? null : gallery[open];

  return (
    <Section id="certificados" kicker="Capítulo extra" title="Certificados e idiomas">
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr_0.8fr]">
        {certificates.map((c, i) => (
          <Reveal key={c.issuer} delay={i * 0.1}>
            <Tilt max={9} className="group rounded-3xl">
              <div className="h-full rounded-3xl border border-line bg-card p-7">
                <h3 className="flex items-center gap-2 font-display text-2xl font-semibold" style={{ transform: "translateZ(24px)" }}>
                  <Award className="text-accent transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" aria-hidden /> {c.issuer}
                </h3>
                <p className="mt-1 text-sm font-semibold uppercase tracking-[0.14em] text-ink-soft">{c.area}</p>
                <ul className="mt-5 space-y-3.5">
                  {c.items.map((it) => (
                    <li key={it.name} className="flex gap-2.5">
                      <Check size={18} className="mt-1 shrink-0 text-accent" aria-hidden />
                      <span>
                        {it.image ? (
                          <button type="button" onClick={() => show(it.image)} className="text-left font-medium underline decoration-accent/40 decoration-2 underline-offset-4 transition hover:decoration-accent">
                            {it.name}
                          </button>
                        ) : (
                          <span className="font-medium">{it.name}</span>
                        )}
                        {it.badge && <span className="ml-2 inline-block rounded-full bg-accent px-2 py-0.5 align-middle text-[0.7rem] font-bold uppercase tracking-wide text-accent-ink">{it.badge}</span>}
                        <span className="block text-sm text-ink-soft">{it.detail}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Tilt>
          </Reveal>
        ))}
        <Reveal delay={0.2}>
          <Tilt max={9} className="group rounded-3xl">
            <div className="relative h-full overflow-hidden rounded-3xl bg-ink p-7 text-paper">
              <Globe className="absolute -bottom-8 -right-8 h-40 w-40 opacity-10 transition-transform duration-[2s] group-hover:rotate-90" aria-hidden />
              <h3 className="flex items-center gap-2 font-display text-2xl font-semibold">
                <Globe aria-hidden /> Idiomas
              </h3>
              <ul className="mt-5 space-y-4">
                {languages.map((l) => (
                  <li key={l.name}>
                    <span className="block text-lg font-semibold">{l.name}</span>
                    <span className="text-sm opacity-75">{l.level}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Tilt>
        </Reveal>
      </div>

      {/* Galería */}
      <h3 className="mt-16 font-display text-2xl font-semibold">Galería de certificados</h3>
      <p className="mt-1 text-ink-soft">Haz clic en cualquiera para verlo en grande.</p>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {gallery.map((g, i) => (
          <Reveal key={g.src} delay={(i % 3) * 0.08}>
            <button type="button" onClick={() => setOpen(i)} className="group relative block w-full overflow-hidden rounded-2xl border border-line bg-card text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
              <Image src={g.src} alt={`Certificado: ${g.name}`} width={700} height={500} sizes="(max-width: 640px) 50vw, 33vw" className="aspect-[4/3] w-full object-cover object-top transition duration-500 group-hover:scale-105" />
              <span className="absolute inset-0 grid place-items-center bg-ink/0 text-paper opacity-0 transition group-hover:bg-ink/40 group-hover:opacity-100" aria-hidden>
                <ZoomIn size={28} />
              </span>
              <span className="block p-3">
                <span className="block text-xs font-semibold uppercase tracking-wide text-accent">{g.issuer}</span>
                <span className="line-clamp-2 text-sm font-medium">{g.name}</span>
              </span>
            </button>
          </Reveal>
        ))}
      </div>

      {/* Visor */}
      <AnimatePresence>
        {cur && (
          <motion.div
            key="visor"
            role="dialog"
            aria-modal="true"
            aria-label={`Certificado: ${cur.name}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
            className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          >
            <motion.div key={cur.src} initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 220, damping: 24 }} onClick={(e) => e.stopPropagation()} className="relative w-full max-w-4xl">
              <Image src={cur.src} alt={`Certificado: ${cur.name}`} width={1400} height={1000} className="max-h-[75svh] w-full rounded-xl object-contain shadow-2xl" priority />
              <p className="mt-4 text-center text-white">
                <span className="font-semibold">{cur.name}</span>
                <span className="block text-sm opacity-70">
                  {cur.issuer} · {cur.detail}
                </span>
              </p>
            </motion.div>
            <button type="button" onClick={() => setOpen(null)} aria-label="Cerrar" className="absolute right-4 top-4 rounded-full bg-white/10 p-2.5 text-white transition hover:bg-white/20">
              <X size={22} />
            </button>
            <button type="button" onClick={(e) => { e.stopPropagation(); step(-1); }} aria-label="Anterior" className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 sm:left-6">
              <ChevronLeft size={24} />
            </button>
            <button type="button" onClick={(e) => { e.stopPropagation(); step(1); }} aria-label="Siguiente" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 sm:right-6">
              <ChevronRight size={24} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  );
}
