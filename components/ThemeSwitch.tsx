"use client";

import { AnimatePresence, motion } from "motion/react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useLang } from "@/lib/i18n";

// Botón de modo claro / oscuro: el ícono gira y cambia entre sol y luna.
export default function ThemeSwitch({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const { t } = useLang();
  const dark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? t.lightMode : t.darkMode}
      title={dark ? t.lightMode : t.darkMode}
      className={`relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl transition ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ y: 14, rotate: -90, opacity: 0 }}
          animate={{ y: 0, rotate: 0, opacity: 1 }}
          exit={{ y: -14, rotate: 90, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="grid place-items-center"
        >
          {dark ? <Moon size={18} aria-hidden /> : <Sun size={18} aria-hidden />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
