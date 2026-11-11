"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLang } from "@/lib/i18n";
import type { Lang } from "@/data/content";

const OPTIONS: { lang: Lang; label: string; sub: string; hello: string }[] = [
  { lang: "es", label: "Español", sub: "Ver el portafolio en español", hello: "¡Hola!" },
  { lang: "en", label: "English", sub: "View the portfolio in English", hello: "Hi!" },
];

// Primera visita: elegir idioma antes de entrar. Queda guardado para la próxima vez.
export default function LanguagePicker() {
  const { chosen, setLang } = useLang();
  const [suggested, setSuggested] = useState<Lang>("es");

  useEffect(() => {
    const t = setTimeout(() => setSuggested(navigator.language?.toLowerCase().startsWith("es") ? "es" : "en"), 0);
    return () => clearTimeout(t);
  }, []);

  const order = suggested === "es" ? OPTIONS : [...OPTIONS].reverse();

  return (
    <AnimatePresence>
      {chosen === false && (
        <motion.div
          key="lang-picker"
          role="dialog"
          aria-modal="true"
          aria-labelledby="lang-title"
          className="fixed inset-0 z-[100] flex overflow-y-auto overflow-x-hidden bg-[#140e0a] px-5 text-[#f3e9dc]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)", transition: { duration: 0.6 } }}
        >
          {/* luces de fondo */}
          <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 animate-blob bg-[#f08a3c]/25 blur-[100px]" aria-hidden />
          <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 animate-blob-slow bg-[#7cebf5]/15 blur-[110px]" aria-hidden />

          <div className="relative m-auto w-full max-w-xl py-10 text-center">
            {/* Nigi saludando */}
            <motion.div
              className="mx-auto grid h-24 w-24 place-items-center rounded-[2rem] bg-gradient-to-br from-[#ffb47a] via-[#f08a3c] to-[#d4691f] shadow-[0_20px_50px_rgba(240,138,60,0.35)]"
              initial={{ y: 30, opacity: 0, rotate: -10 }}
              animate={{ y: 0, opacity: 1, rotate: [0, -6, 6, -4, 0] }}
              transition={{ y: { type: "spring", stiffness: 160, damping: 14 }, opacity: { duration: 0.4 }, rotate: { delay: 0.6, duration: 1.2 } }}
              aria-hidden
            >
              <div className="flex h-12 w-16 items-center justify-center gap-3 rounded-2xl bg-[#fbf1ee]">
                <motion.span className="h-5 w-3.5 rounded-full bg-[#151213]" animate={{ scaleY: [1, 1, 0.1, 1] }} transition={{ repeat: Infinity, duration: 3.2, times: [0, 0.9, 0.95, 1] }} />
                <motion.span className="h-5 w-3.5 rounded-full bg-[#151213]" animate={{ scaleY: [1, 1, 0.1, 1] }} transition={{ repeat: Infinity, duration: 3.2, times: [0, 0.9, 0.95, 1] }} />
              </div>
            </motion.div>

            <motion.h1
              id="lang-title"
              className="mt-8 font-display text-4xl font-semibold leading-tight sm:text-5xl"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.6 }}
            >
              ¡Hola! <span className="text-[#f08a3c]">·</span> Hi!
            </motion.h1>
            <motion.p className="mt-3 text-[#f3e9dc]/70" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
              ¿En qué idioma quieres ver el portafolio?
              <br />
              Which language would you like to use?
            </motion.p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {order.map((o, i) => (
                <motion.button
                  key={o.lang}
                  type="button"
                  lang={o.lang}
                  onClick={() => setLang(o.lang)}
                  initial={{ y: 24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 + i * 0.12, type: "spring", stiffness: 200, damping: 20 }}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  autoFocus={i === 0}
                  className={`group rounded-3xl border p-6 text-left transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#7cebf5]/40 ${
                    i === 0 ? "border-[#f08a3c] bg-[#f08a3c] text-[#1c140f]" : "border-white/15 bg-white/5 hover:border-[#f08a3c]"
                  }`}
                >
                  <span className="block text-sm font-semibold uppercase tracking-[0.2em] opacity-70">{o.hello}</span>
                  <span className="mt-1 block font-display text-3xl font-semibold">{o.label}</span>
                  <span className="mt-1 block text-sm opacity-75">{o.sub}</span>
                </motion.button>
              ))}
            </div>

            <motion.p className="mt-8 text-xs text-[#f3e9dc]/45" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
              Puedes cambiarlo cuando quieras con el botón ES / EN · You can switch anytime with the ES / EN button
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Botón pequeño para cambiar de idioma en cualquier momento.
export function LangSwitch({ className = "" }: { className?: string }) {
  const { lang, setLang, t } = useLang();
  return (
    <button
      type="button"
      onClick={() => setLang(lang === "es" ? "en" : "es")}
      aria-label={t.switchLang}
      title={t.switchLang}
      className={`inline-flex h-10 items-center gap-1 rounded-xl px-2.5 text-xs font-bold tracking-wider transition ${className}`}
    >
      <span className={lang === "es" ? "opacity-100" : "opacity-40"}>ES</span>
      <span className="opacity-30">/</span>
      <span className={lang === "en" ? "opacity-100" : "opacity-40"}>EN</span>
    </button>
  );
}
