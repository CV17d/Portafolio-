"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Download } from "lucide-react";
import { useLang } from "@/lib/i18n";

export const CV_FILES = {
  es: { href: "/cv.pdf", file: "CV-Cristian-Velasco-Espanol.pdf", label: "Español", flag: "ES" },
  en: { href: "/cv-en.pdf", file: "CV-Cristian-Velasco-English.pdf", label: "English", flag: "EN" },
} as const;

type Props = {
  children: ReactNode; // contenido del botón
  className?: string;
  align?: "left" | "right";
  dark?: boolean; // estilo para la biblioteca (fondo oscuro)
};

// Botón "Descargar CV" que despliega dos opciones: español e inglés.
export default function CvMenu({ children, className = "", align = "left", dark = false }: Props) {
  const { lang, t } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const order = lang === "es" ? (["es", "en"] as const) : (["en", "es"] as const);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault(); // que Esc cierre solo este menú, no la biblioteca
      setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <button type="button" aria-haspopup="menu" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)} className={className}>
        {children}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id={id}
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.16 }}
            className={`absolute top-full z-[80] mt-2 w-56 origin-top overflow-hidden rounded-2xl border p-1.5 shadow-2xl ${align === "right" ? "right-0" : "left-0"} ${
              dark ? "border-white/15 bg-[#1c140f]/95 text-[#f3e9dc] backdrop-blur" : "border-line bg-card text-ink"
            }`}
          >
            <p className={`px-3 pb-1.5 pt-1 text-xs font-semibold uppercase tracking-wider ${dark ? "text-[#f3e9dc]/55" : "text-ink-soft"}`}>{t.cvChoose}</p>
            {order.map((l) => {
              const f = CV_FILES[l];
              return (
                <a
                  key={l}
                  role="menuitem"
                  href={f.href}
                  download={f.file}
                  lang={l}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${dark ? "hover:bg-white/10" : "hover:bg-paper-2"}`}
                >
                  <span className="grid h-7 w-9 place-items-center rounded-md bg-accent text-[11px] font-bold text-accent-ink">{f.flag}</span>
                  <span className="flex-1">{f.label}</span>
                  <Download size={15} className="opacity-60" aria-hidden />
                </a>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
