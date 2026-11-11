import { Dumbbell, Film, GraduationCap, MapPin, Music, PawPrint } from "lucide-react";
import Section from "./Section";
import { Marquee, Reveal, Tilt } from "./fx";
import { profile, skills } from "@/data/portfolio";

const interestIcons = { music: Music, gym: Dumbbell, film: Film, paw: PawPrint };

export default function About() {
  const all = skills.flatMap((g) => g.items);
  return (
    <>
      <Section id="sobre-mi" kicker="Capítulo 1" title="Sobre mí">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <Reveal>
              <p className="font-display text-2xl leading-snug md:text-3xl">{profile.about}</p>
            </Reveal>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {[
                { Icon: MapPin, k: "Ubicación", v: profile.location },
                { Icon: GraduationCap, k: "Estudios", v: `${profile.career} · ${profile.university}` },
              ].map(({ Icon, k, v }, i) => (
                <Reveal key={k} delay={i * 0.1}>
                  <Tilt max={8} className="group rounded-2xl">
                    <div className="h-full rounded-2xl border border-line bg-card p-5">
                      <p className="flex items-center gap-1.5 text-sm text-ink-soft">
                        <Icon size={15} aria-hidden /> {k}
                      </p>
                      <p className="mt-1 font-semibold">{v}</p>
                    </div>
                  </Tilt>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.1}>
              <h3 className="mt-10 font-semibold">Fuera del código</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {profile.interests.map((it) => {
                  const Icon = interestIcons[it.icon];
                  return (
                    <li key={it.label} className="inline-flex items-center gap-2 rounded-full bg-paper-2 px-4 py-2 text-sm font-medium transition hover:-translate-y-0.5 hover:bg-accent hover:text-accent-ink">
                      <Icon size={16} aria-hidden /> {it.label}
                    </li>
                  );
                })}
              </ul>
            </Reveal>
          </div>

          <div className="space-y-6">
            {skills.map((g, i) => (
              <Reveal key={g.group} delay={i * 0.08}>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">{g.group}</h3>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {g.items.map((s) => (
                    <li key={s} className="rounded-lg border border-line bg-card px-3 py-1.5 text-sm font-medium transition hover:-translate-y-0.5 hover:border-accent">
                      {s}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>
      <div className="space-y-4 py-4" aria-label="Tecnologías">
        <Marquee items={all.slice(0, Math.ceil(all.length / 2))} />
        <Marquee items={all.slice(Math.ceil(all.length / 2))} reverse />
      </div>
    </>
  );
}
