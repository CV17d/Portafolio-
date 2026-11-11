import { Briefcase, GraduationCap } from "lucide-react";
import Section from "./Section";
import { Reveal, ScrollLine } from "./fx";
import { experience, type ExperienceItem } from "@/data/portfolio";

function Timeline({ items }: { items: ExperienceItem[] }) {
  return (
    <ol className="relative ml-2">
      <ScrollLine />
      {items.map((it, i) => (
        <li key={it.title} className="relative mb-12 ml-8 last:mb-0">
          <span className="absolute -left-[41px] top-1.5 grid h-5 w-5 place-items-center rounded-full border-4 border-paper bg-accent shadow-[0_0_0_4px_rgba(232,112,42,0.15)]" aria-hidden />
          <Reveal delay={i * 0.1} y={30}>
            <span className="text-sm font-semibold text-accent">{it.date}</span>
            <h4 className="mt-1 font-display text-2xl font-semibold">{it.title}</h4>
            <p className="text-sm text-ink-soft">{it.place}</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-ink-soft">
              {it.details.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}

export default function Experience() {
  return (
    <Section id="experiencia" kicker="Capítulo 4" title="Experiencia">
      <div className="grid gap-16 lg:grid-cols-2">
        <div>
          <h3 className="mb-8 flex items-center gap-2 text-lg font-semibold">
            <Briefcase size={20} className="text-accent" aria-hidden /> Laboral
          </h3>
          <Timeline items={experience.filter((e) => e.type === "laboral")} />
        </div>
        <div>
          <h3 className="mb-8 flex items-center gap-2 text-lg font-semibold">
            <GraduationCap size={20} className="text-accent" aria-hidden /> Académica
          </h3>
          <Timeline items={experience.filter((e) => e.type === "academica")} />
        </div>
      </div>
    </Section>
  );
}
