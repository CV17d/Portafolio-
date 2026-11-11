"use client";

import Image from "next/image";
import { Quote } from "lucide-react";
import { LinkedinIcon } from "./Icons";
import Section from "./Section";
import { Reveal, Tilt } from "./fx";
import { useLang } from "@/lib/i18n";

const tilts = ["md:-rotate-1", "md:rotate-1 md:translate-y-6", "md:rotate-1", "md:-rotate-1 md:translate-y-6"];

export default function Testimonials() {
  const { t: ui, c } = useLang();
  const { testimonials } = c;
  return (
    <Section id="testimonios" kicker={ui.chapter(3)} title={ui.testimonialsTitle}>
      <div className="grid gap-6 gap-y-8 md:grid-cols-2">
        {testimonials.map((t, i) => (
          <Reveal key={i} delay={i * 0.12} className={`transition-transform duration-500 hover:rotate-0 ${tilts[i % 4]}`}>
            <Tilt max={9} className="group rounded-3xl">
              <figure className="flex h-full flex-col rounded-3xl border border-line bg-card p-7 shadow-sm">
                <Quote className="text-accent" size={34} aria-hidden style={{ transform: "translateZ(30px)" }} />
                <blockquote className="mt-4 flex-1 text-[1.05rem] leading-relaxed">{t.text}</blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  {t.photo ? (
                    <Image src={t.photo} alt={ui.photoOf(t.name)} width={56} height={56} className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-accent/60" />
                  ) : (
                    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent to-[#f5b041] font-semibold text-accent-ink" aria-hidden>
                      {t.name.charAt(0)}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{t.name}</span>
                    <span className="block text-sm text-ink-soft">{t.role}</span>
                  </span>
                  {t.linkedin && (
                    <a href={t.linkedin} target="_blank" rel="noopener noreferrer" aria-label={ui.linkedinOf(t.name)} className="shrink-0 rounded-full p-2 text-[#0a66c2] transition hover:bg-[#0a66c2]/10">
                      <LinkedinIcon />
                    </a>
                  )}
                </figcaption>
              </figure>
            </Tilt>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
