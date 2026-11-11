import Image from "next/image";
import { ArrowUpRight, Play } from "lucide-react";
import Section from "./Section";
import { GithubIcon } from "./Icons";
import { Reveal, Tilt } from "./fx";
import { projects } from "@/data/portfolio";

export default function Projects() {
  return (
    <Section id="proyectos" kicker="Capítulo 2" title="Mis proyectos">
      <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((p, i) => (
          <Reveal key={p.slug} delay={(i % 3) * 0.12} className={i === 0 ? "md:col-span-2 lg:col-span-2" : i === projects.length - 1 && projects.length % 3 === 0 ? "md:col-span-2 lg:col-span-3" : ""}>
            <Tilt max={7} className="group rounded-3xl">
              <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-card shadow-[0_1px_0_rgba(0,0,0,0.04)] transition-shadow duration-500 group-hover:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.35)]">
                {/* Portada: captura del proyecto (o patrón de color si no hay) */}
                <div className={`relative overflow-hidden p-6 text-white ${i === 0 ? "aspect-[16/7]" : i === projects.length - 1 && projects.length % 3 === 0 ? "aspect-[16/10] md:aspect-[16/6] lg:aspect-[16/4.5]" : "aspect-[16/10]"}`} style={{ background: p.color, transform: "translateZ(30px)" }}>
                  {p.image && !p.device && (
                    <>
                      <Image src={p.image} alt={`Captura de ${p.title}`} fill sizes="(max-width: 768px) 100vw, 66vw" className="object-cover object-top transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10" aria-hidden />
                    </>
                  )}
                  {p.image && p.device && (
                    <div
                      className={`absolute right-6 overflow-hidden shadow-2xl ring-4 ring-black/70 transition-transform duration-700 group-hover:-translate-y-2 group-hover:rotate-0 ${p.device === "phone" ? "right-12 top-10 aspect-[594/1281] h-[140%] rotate-6 rounded-[1.4rem]" : "right-12 top-[10%] aspect-square h-[80%] rotate-3 rounded-full"}`}
                      aria-hidden
                    >
                      <Image src={p.image} alt="" width={600} height={1280} className="h-full w-full object-cover object-top" />
                    </div>
                  )}
                  <div className="absolute inset-0 opacity-25 transition-transform duration-700 [background:repeating-linear-gradient(135deg,transparent_0_14px,rgba(255,255,255,.35)_14px_15px)] group-hover:scale-125" aria-hidden />
                  <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl transition-transform duration-700 group-hover:translate-x-[-30px] group-hover:translate-y-[30px]" aria-hidden />
                  <span className="relative font-mono text-sm opacity-90" style={{ textShadow: "0 1px 6px rgba(0,0,0,.5)" }}>Vol. {String(i + 1).padStart(2, "0")}</span>
                  <span
                    className={`absolute bottom-5 left-6 font-display text-3xl font-semibold leading-tight transition-transform duration-500 group-hover:-translate-y-1 md:text-4xl ${p.device ? "right-[42%]" : "right-6"}`}
                    style={{ textShadow: "0 2px 12px rgba(0,0,0,.45)" }}
                  >
                    {p.title}
                  </span>
                  <ArrowUpRight className="absolute right-5 top-5 z-10 transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:rotate-12" aria-hidden />
                </div>
                <div className="flex flex-1 flex-col p-6" style={{ transform: "translateZ(16px)" }}>
                  <p className="text-sm font-semibold text-accent">{p.subtitle}</p>
                  <p className="mt-3 text-ink-soft">{p.description}</p>
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {p.tags.map((t) => (
                      <li key={t} className="rounded-md bg-paper-2 px-2 py-1 text-xs font-medium">{t}</li>
                    ))}
                  </ul>
                  <div className="mt-auto flex flex-wrap gap-2 pt-6">
                    {p.links.map((l) => (
                      <a
                        key={l.href}
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={
                          l.kind === "demo"
                            ? "inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-ink transition hover:-translate-y-0.5"
                            : "inline-flex items-center gap-1.5 rounded-xl border border-ink px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5 hover:bg-ink hover:text-paper"
                        }
                      >
                        {l.kind === "demo" ? <Play size={14} aria-hidden /> : <GithubIcon width={15} height={15} />}
                        {l.label}
                      </a>
                    ))}
                  </div>
                </div>
              </article>
            </Tilt>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
