import {
  visits,
  certificates,
  contact,
  experience,
  languages,
  profile,
  projects,
  skills,
  testimonials,
} from "@/data/portfolio";

export type BookId = "sobre-mi" | "proyectos" | "testimonios" | "experiencia" | "certificados" | "contacto";

export type PageLink = { label: string; href: string };

export type Page = {
  kicker?: string;
  title: string;
  paragraphs?: string[];
  list?: string[];
  tags?: string[];
  links?: PageLink[];
  image?: string;
  accent?: string;
  narration: string; // lo que Nigi lee en voz alta
};

export type Book = {
  id: BookId;
  title: string;
  color: string;
  pages: Page[];
};

const aboutPages: Page[] = [
  {
    kicker: "Capítulo 1",
    title: profile.fullName,
    image: profile.photo,
    paragraphs: [profile.about],
    narration:
      "Este es Cristian Velasco, desarrollador full-stack y estudiante de Ingeniería de Software. Le encanta construir productos de principio a fin, uniendo web, móvil, IoT e inteligencia artificial para resolver problemas reales: desde la movilidad urbana hasta la salud y la domótica.",
  },
  {
    kicker: "Capítulo 1",
    title: "De dónde es y qué le gusta",
    list: [
      profile.location,
      `${profile.career} · ${profile.university}`,
      ...profile.interests.map((i) => i.label),
    ],
    narration:
      "Cristian es de Cuaspud-Carlosama, en Nariño, Colombia, y estudia Ingeniería de Software en la Universidad Cooperativa de Colombia. Fuera del código le gusta escuchar música, entrenar en el gimnasio, ver películas y pasar tiempo con sus cuatro perros.",
  },
  {
    kicker: "Capítulo 1",
    title: "Su caja de herramientas",
    list: skills.map((g) => `${g.group}: ${g.items.join(", ")}`),
    narration:
      "Su caja de herramientas: en frontend y móvil usa Next.js, React, React Native y Tailwind. En backend trabaja con NestJS, Spring Boot y Supabase, y tiene experiencia en la nube de AWS con servicios como Lambda, EC2, S3, CloudFront e IAM, que despliega con SST Ion. Maneja PostgreSQL y PostGIS, crea apps de escritorio con Electron, videojuegos con Unity y apps nativas con Kotlin y SwiftUI. Y se apoya en herramientas de inteligencia artificial como Cursor y Claude.",
  },
];

const projectPages: Page[] = [
  {
    kicker: "Capítulo 2",
    title: "Índice de proyectos",
    list: projects.map((p, i) => `Vol. ${String(i + 1).padStart(2, "0")} — ${p.title}: ${p.subtitle}`),
    narration: `En este libro hay ${projects.length} proyectos de Cristian. Te los leo uno por uno.`,
  },
  ...projects.map<Page>((p) => ({
    kicker: p.subtitle,
    title: p.title,
    paragraphs: [p.description],
    tags: p.tags,
    links: p.links.map((l) => ({ label: l.label, href: l.href })),
    image: p.image,
    accent: p.color,
    narration: `${p.title}, ${p.subtitle}. ${p.description}`,
  })),
];

const testimonialPages: Page[] = testimonials.map((t, i) => ({
  kicker: `Testimonio ${i + 1} de ${testimonials.length}`,
  title: t.placeholder ? "Página por escribir" : t.name,
  paragraphs: [`“${t.text}”`],
  list: [t.role],
  image: t.photo,
  narration: t.placeholder
    ? `Esta página todavía está en blanco. Muy pronto aquí estará la opinión de un ${t.role.toLowerCase().replace("/a", "")} sobre Cristian.`
    : `${t.name}, ${t.role}, dice: ${t.text}`,
}));

const experienceNarration: Record<string, string> = {
  "Desarrollador Full-Stack Freelance":
    "Desde enero de 2024 Cristian trabaja como desarrollador full-stack freelance. Lideró de principio a fin Nutriweb, un sistema web de agendamiento clínico con gestión de pacientes y suscripciones en línea. Y creó GridMind, que optimiza el consumo de energía del hogar con hardware IoT propio e inteligencia artificial.",
  "Ingeniería de Software":
    "Actualmente estudia Ingeniería de Software en la Universidad Cooperativa de Colombia, en Pasto. Ha participado en tres hackatones de inteligencia artificial y tecnología, asistió a cuatro seminarios de ingeniería de software, y aprobó los cuatro niveles de inglés de la carrera.",
  "Certificaciones técnicas y de producto":
    "Además se ha formado en Coderhouse, donde completó la carrera de Product Marketing y quedó en el top diez del curso de Product Manager, y en el SENA, en electrónica y robótica aplicada, innovación y emprendimiento.",
};

const experiencePages: Page[] = experience.map((e) => ({
  kicker: e.type === "laboral" ? "Experiencia laboral" : "Experiencia académica",
  title: e.title,
  paragraphs: [`${e.place} · ${e.date}`],
  list: e.details,
  narration: experienceNarration[e.title] ?? `${e.title}, ${e.place}. ${e.details.join(" ")}`,
}));

// Visitas empresariales: van al final del libro de Experiencia.
const visitNarration: Record<string, string> = {
  ciandt:
    "Cristian visitó CI&T, una de las grandes casas de software de Latinoamérica. Allí vio cómo equipos ágiles construyen productos para marcas globales, entendió la importancia del inglés y la comunicación con clientes, y descubrió qué buscan las empresas en un desarrollador junior.",
  ceiba:
    "En Ceiba Software conoció el ciclo completo de un proyecto, desde la idea del cliente hasta producción. Habló con sus desarrolladores sobre revisiones de código, pruebas automatizadas y el valor de la mentoría en un equipo.",
  sofka:
    "En Casa Sofka, en Medellín, aprendió cómo una empresa colombiana acompaña a grandes compañías en su transformación digital, el papel de la calidad y la automatización de pruebas, y cómo es trabajar en el mundo laboral real.",
};

const visitPages: Page[] = visits.map((v) => ({
  kicker: "Visita empresarial",
  title: v.company,
  paragraphs: [v.place, v.summary],
  list: v.learned,
  image: v.photos[0].src,
  accent: v.color,
  narration: visitNarration[v.slug] ?? `${v.company}. ${v.summary}`,
}));

const certificateNarration: Record<string, string> = {
  Coderhouse:
    "En Coderhouse completó la carrera de Product Marketing, y se certificó como Product Manager, donde quedó en el top diez de su grupo. También estudió Customer Experience, Inbound Marketing, y Community Manager y Publicidad.",
  SENA:
    "En el SENA aprobó, con nota de cuatro punto cinco, un curso de ciento cuarenta y cuatro horas en electrónica y robótica aplicada a proyectos de ciencia, tecnología e innovación. Además participó en la Tecnoacademia de Nariño con formación en innovación y emprendimiento, y tomó el curso de inglés English Dot Works.",
};

const certificatePages: Page[] = [
  ...certificates.map<Page>((c) => ({
    kicker: c.area,
    title: c.issuer,
    list: c.items.map((it) => `${it.badge ? `[${it.badge}] ` : ""}${it.name} — ${it.detail}`),
    narration: certificateNarration[c.issuer] ?? `En ${c.issuer} se certificó en: ${c.items.map((it) => it.name).join(", ")}.`,
  })),
  {
    kicker: "Idiomas",
    title: "Idiomas",
    list: languages.map((l) => `${l.name} — ${l.level}`),
    narration: "Cristian habla español como lengua nativa. En inglés tiene nivel B1, certificado por su universidad tras aprobar los cuatro niveles de la carrera.",
  },
];

const contactPages: Page[] = [
  {
    kicker: "Capítulo final",
    title: "Hablemos",
    paragraphs: ["¿Tienes un proyecto, una vacante o una idea? Cristian estará feliz de leerte."],
    links: [
      { label: contact.email, href: `mailto:${contact.email}` },
      { label: "LinkedIn", href: contact.linkedin },
      { label: "GitHub", href: contact.github },
      { label: "Ir al formulario de contacto", href: "#contacto" },
    ],
    narration:
      "Si quieres hablar con Cristian, puedes escribirle a su correo o encontrarlo en LinkedIn y GitHub. Aquí tienes los enlaces, y también un formulario de contacto. ¡Seguro te responde pronto!",
  },
];

export const books: Book[] = [
  { id: "sobre-mi", title: "Sobre mí", color: "#C4561E", pages: aboutPages },
  { id: "proyectos", title: "Proyectos", color: "#2F6F5E", pages: projectPages },
  { id: "testimonios", title: "Testimonios", color: "#7A2E3A", pages: testimonialPages },
  { id: "experiencia", title: "Experiencia", color: "#3B5BA9", pages: [...experiencePages, ...visitPages] },
  { id: "certificados", title: "Certificados", color: "#B8862B", pages: certificatePages },
  { id: "contacto", title: "Contacto", color: "#5B4A8A", pages: contactPages },
];

export const bookById = (id: BookId) => books.find((b) => b.id === id)!;
