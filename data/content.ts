// Contenido del portafolio por idioma.
import * as es from "./portfolio";
import * as en from "./portfolio.en";

export type Lang = "es" | "en";

export const LANGS: Lang[] = ["es", "en"];

export type Content = {
  profile: es.Profile;
  skills: es.SkillGroup[];
  projects: es.Project[];
  testimonials: es.Testimonial[];
  experience: es.ExperienceItem[];
  visits: es.Visit[];
  certificates: es.Certificate[];
  languages: { name: string; level: string }[];
  contact: es.Contact;
  navLinks: { id: string; label: string }[];
};

const pick = (m: typeof es | typeof en): Content => ({
  profile: m.profile,
  skills: m.skills,
  projects: m.projects,
  testimonials: m.testimonials,
  experience: m.experience,
  visits: m.visits,
  certificates: m.certificates,
  languages: m.languages,
  contact: m.contact,
  navLinks: m.navLinks,
});

export const content: Record<Lang, Content> = { es: pick(es), en: pick(en) };
