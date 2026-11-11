"use client";

import { ArrowUp, Mail } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { GithubIcon, LinkedinIcon } from "./Icons";
import { Magnetic, SplitText } from "./fx";
import Year from "./Year";

export default function Footer() {
  const { t, c } = useLang();
  const { contact, navLinks, profile } = c;
  const social = "grid h-12 w-12 place-items-center rounded-xl border border-line bg-card transition hover:-translate-y-1 hover:border-accent hover:text-accent";
  return (
    <footer className="relative overflow-hidden border-t border-line bg-paper-2">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-10 pt-16 sm:px-6 md:grid-cols-3">
        <div>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent font-display font-bold text-accent-ink">{profile.logo}</span>
          <p className="mt-3 font-display text-xl font-semibold">{profile.fullName}</p>
          <p className="text-sm text-ink-soft">{profile.role}</p>
        </div>
        <nav aria-label={t.quickLinks}>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">{t.links}</h3>
          <ul className="mt-3 grid grid-cols-2 gap-2">
            {navLinks.map((l) => (
              <li key={l.id}>
                <a href={`#${l.id}`} className="transition hover:text-accent">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">{t.follow}</h3>
          <ul className="mt-3 flex gap-3">
            <li><Magnetic><a href={contact.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className={social}><GithubIcon /></a></Magnetic></li>
            <li><Magnetic><a href={contact.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className={social}><LinkedinIcon /></a></Magnetic></li>
            <li><Magnetic><a href={`mailto:${contact.email}`} aria-label={t.mail} className={social}><Mail size={20} aria-hidden /></a></Magnetic></li>
          </ul>
          <Magnetic>
            <a href="#inicio" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-paper transition hover:bg-accent hover:text-accent-ink">
              <ArrowUp size={16} aria-hidden /> {t.backToTop}
            </a>
          </Magnetic>
        </div>
      </div>
      <div className="pointer-events-none select-none px-4 text-center" aria-hidden>
        <SplitText text="CRISTIAN VELASCO" className="block whitespace-nowrap font-display text-[clamp(2.5rem,11.5vw,10rem)] font-bold leading-[0.85] tracking-tighter text-ink/[0.07]" />
      </div>
      <p className="border-t border-line py-5 text-center text-sm text-ink-soft">
        © <Year /> {profile.fullName} · {t.madeWith}
      </p>
    </footer>
  );
}
