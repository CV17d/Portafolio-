"use client";

import { useState } from "react";
import { Download, Menu, X, Library } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { LangSwitch } from "./LanguagePicker";
import ThemeSwitch from "./ThemeSwitch";
import { openLibrary } from "./library/events";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { t, c } = useLang();
  const { navLinks, profile } = c;

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-paper/85 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6" aria-label={t.navMain}>
        <a href="#inicio" className="flex items-center gap-2" aria-label={t.goHome}>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent font-display text-lg font-bold text-accent-ink">
            {profile.logo}
          </span>
          <span className="hidden whitespace-nowrap font-display text-lg font-semibold sm:inline lg:hidden xl:inline">Cristian Velasco</span>
        </a>

        <ul className="hidden items-center gap-1 lg:flex">
          {navLinks.map((l) => (
            <li key={l.id}>
              <a href={`#${l.id}`} className="whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-medium text-ink-soft transition hover:bg-paper-2 hover:text-ink">
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <ThemeSwitch className="border border-line hover:border-accent" />
          <LangSwitch className="border border-line hover:border-accent" />
          <button
            type="button"
            onClick={openLibrary}
            className="hidden items-center gap-2 rounded-xl border border-line px-3 py-2 text-sm font-semibold hover:border-accent sm:inline-flex"
          >
            <Library size={16} aria-hidden /> {t.library}
          </button>
          <a href={profile.cv} download className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-paper transition hover:bg-accent hover:text-accent-ink">
            CV <Download size={15} aria-hidden />
          </a>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-xl border border-line lg:hidden"
            aria-expanded={open}
            aria-controls="menu-movil"
            aria-label={open ? t.closeMenu : t.openMenu}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
          </button>
        </div>
      </nav>

      {open && (
        <ul id="menu-movil" className="border-t border-line bg-paper px-4 pb-4 lg:hidden">
          {navLinks.map((l) => (
            <li key={l.id}>
              <a href={`#${l.id}`} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 font-medium hover:bg-paper-2">
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <button type="button" onClick={() => { setOpen(false); openLibrary(); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-3 font-semibold text-accent hover:bg-paper-2">
              <Library size={18} aria-hidden /> {t.nigiLibrary}
            </button>
          </li>
        </ul>
      )}
    </header>
  );
}
