"use client";

import Image from "next/image";
import { Building2, Check } from "lucide-react";
import Section from "./Section";
import { Reveal, Tilt } from "./fx";
import { useLang } from "@/lib/i18n";

// Visitas empresariales: una fila por empresa, fotos como collage de polaroids.
export default function Visits() {
  const { t, c } = useLang();
  const { visits } = c;
  return (
    <Section id="visitas" kicker={t.chapter(5)} title={t.visitsTitle}>
      <p className="-mt-4 mb-12 max-w-2xl text-lg text-ink-soft">
        {t.visitsIntro}
      </p>
      <div className="space-y-20">
        {visits.map((v, i) => (
          <article key={v.slug} className={`grid items-center gap-10 lg:grid-cols-2 ${i % 2 ? "lg:[&>*:first-child]:order-2" : ""}`}>
            <Reveal>
              <div className="relative mx-auto h-[300px] w-full max-w-md sm:h-[360px]">
                {v.photos.map((ph, k) => {
                  const n = v.photos.length;
                  const pos = n === 1 ? "inset-0 m-auto h-[85%] w-[92%]" : n === 2 ? (k === 0 ? "left-0 top-0 h-[62%] w-[72%]" : "bottom-0 right-0 h-[62%] w-[72%]") : ["left-0 top-0 h-[55%] w-[62%]", "right-0 top-[8%] h-[50%] w-[48%]", "bottom-0 left-[14%] h-[52%] w-[66%]"][k];
                  const rot = [-4, 3, -2][k] ?? 0;
                  return (
                    <div key={ph.src} className={`absolute ${pos} transition-transform duration-500 hover:z-20 hover:scale-105`}>
                    <Tilt max={8} className="rounded-2xl">
                      <figure className="h-full w-full rounded-2xl bg-card p-2 pb-2 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.45)]" style={{ transform: `rotate(${rot}deg)` }}>
                        <Image src={ph.src} alt={ph.alt} width={1024} height={768} sizes="(max-width: 1024px) 80vw, 420px" className="h-full w-full rounded-xl object-cover" />
                      </figure>
                    </Tilt>
                    </div>
                  );
                })}
              </div>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl text-white" style={{ background: v.color }} aria-hidden>
                  <Building2 size={20} />
                </span>
                <div>
                  <h3 className="font-display text-3xl font-semibold leading-tight">{v.company}</h3>
                  <p className="text-sm text-ink-soft">{v.place}</p>
                </div>
              </div>
              <p className="mt-5 text-lg leading-relaxed">{v.summary}</p>
              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-accent">{t.learned}</p>
              <ul className="mt-3 space-y-2.5">
                {v.learned.map((l) => (
                  <li key={l} className="flex gap-3 text-ink-soft">
                    <Check size={18} className="mt-1 shrink-0 text-accent" aria-hidden />
                    <span>{l}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </article>
        ))}
      </div>
    </Section>
  );
}
