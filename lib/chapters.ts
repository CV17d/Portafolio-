import { content, type Lang } from "@/data/content";

export type BookId = "sobre-mi" | "proyectos" | "testimonios" | "experiencia" | "visitas" | "certificados" | "contacto";

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

// Textos fijos de los libros por idioma (lo demás viene de data/).
const T = {
  es: {
    chapter: (n: number) => `Capítulo ${n}`,
    finalChapter: "Capítulo final",
    aboutNarration:
      "Este es Cristian Velasco, desarrollador full-stack y estudiante de Ingeniería de Software. Le encanta construir productos de principio a fin, uniendo web, móvil, IoT e inteligencia artificial para resolver problemas reales: desde la movilidad urbana hasta la salud y la domótica.",
    whereTitle: "De dónde es y qué le gusta",
    whereNarration:
      "Cristian es de Cuaspud-Carlosama, en Nariño, Colombia, y estudia Ingeniería de Software en la Universidad Cooperativa de Colombia. Fuera del código le gusta escuchar música, entrenar en el gimnasio, ver películas y pasar tiempo con sus cuatro perros.",
    toolsTitle: "Su caja de herramientas",
    toolsNarration:
      "Su caja de herramientas: en frontend y móvil usa Next.js, React, React Native y Tailwind. En backend trabaja con NestJS, Spring Boot y Supabase, y tiene experiencia en la nube de AWS con servicios como Lambda, EC2, S3, CloudFront e IAM, que despliega con SST Ion. Maneja PostgreSQL y PostGIS, crea apps de escritorio con Electron, videojuegos con Unity y apps nativas con Kotlin y SwiftUI. Y se apoya en herramientas de inteligencia artificial como Cursor y Claude.",
    projectIndex: "Índice de proyectos",
    projectIndexNarration: (n: number) => `En este libro hay ${n} proyectos de Cristian. Te los leo uno por uno.`,
    testimonialKicker: (i: number, n: number) => `Testimonio ${i} de ${n}`,
    says: (name: string, role: string, text: string) => `${name}, ${role}, dice: ${text}`,
    work: "Experiencia laboral",
    academic: "Experiencia académica",
    experienceNarration: [
      "Desde enero de 2024 Cristian trabaja como desarrollador full-stack freelance. Lideró de principio a fin Nutriweb, un sistema web de agendamiento clínico con gestión de pacientes y suscripciones en línea. Y creó GridMind, que optimiza el consumo de energía del hogar con hardware IoT propio e inteligencia artificial.",
      "Actualmente estudia Ingeniería de Software en la Universidad Cooperativa de Colombia, en Pasto. Ha participado en tres hackatones de inteligencia artificial y tecnología, asistió a cuatro seminarios de ingeniería de software, y aprobó los cuatro niveles de inglés de la carrera.",
      "Además se ha formado en Coderhouse, donde completó la carrera de Product Marketing y quedó en el top diez del curso de Product Manager, y en el SENA, en electrónica y robótica aplicada, innovación y emprendimiento.",
    ],
    visitKicker: "Visita empresarial",
    visitNarration: {
      ciandt:
        "Cristian visitó CI&T, una de las grandes casas de software de Latinoamérica. Allí vio cómo equipos ágiles construyen productos para marcas globales, entendió la importancia del inglés y la comunicación con clientes, y descubrió qué buscan las empresas en un desarrollador junior.",
      ceiba:
        "En Ceiba Software conoció el ciclo completo de un proyecto, desde la idea del cliente hasta producción. Habló con sus desarrolladores sobre revisiones de código, pruebas automatizadas y el valor de la mentoría en un equipo.",
      sofka:
        "En Casa Sofka, en Medellín, aprendió cómo una empresa colombiana acompaña a grandes compañías en su transformación digital, el papel de la calidad y la automatización de pruebas, y cómo es trabajar en el mundo laboral real.",
    } as Record<string, string>,
    certNarration: {
      Coderhouse:
        "En Coderhouse completó la carrera de Product Marketing, y se certificó como Product Manager, donde quedó en el top diez de su grupo. También estudió Customer Experience, Inbound Marketing, y Community Manager y Publicidad.",
      SENA: "En el SENA aprobó, con nota de cuatro punto cinco, un curso de ciento cuarenta y cuatro horas en electrónica y robótica aplicada a proyectos de ciencia, tecnología e innovación. Además participó en la Tecnoacademia de Nariño con formación en innovación y emprendimiento, y tomó el curso de inglés English Dot Works.",
    } as Record<string, string>,
    languagesTitle: "Idiomas",
    languagesNarration: "Cristian habla español como lengua nativa. En inglés tiene nivel B1, certificado por su universidad tras aprobar los cuatro niveles de la carrera.",
    contactTitle: "Hablemos",
    contactText: "¿Tienes un proyecto, una vacante o una idea? Cristian estará feliz de leerte.",
    contactForm: "Ir al formulario de contacto",
    contactNarration:
      "Si quieres hablar con Cristian, puedes escribirle a su correo o encontrarlo en LinkedIn y GitHub. Aquí tienes los enlaces, y también un formulario de contacto. ¡Seguro te responde pronto!",
    bookTitles: { "sobre-mi": "Sobre mí", proyectos: "Proyectos", testimonios: "Testimonios", experiencia: "Experiencia", visitas: "Visitas", certificados: "Certificados", contacto: "Contacto" } as Record<BookId, string>,
  },
  en: {
    chapter: (n: number) => `Chapter ${n}`,
    finalChapter: "Final chapter",
    aboutNarration:
      "This is Cristian Velasco, a full-stack developer and Software Engineering student. He loves building products from start to finish, combining web, mobile, IoT and artificial intelligence to solve real problems: from urban mobility to health and home automation.",
    whereTitle: "Where he's from and what he enjoys",
    whereNarration:
      "Cristian is from Cuaspud-Carlosama, in Nariño, Colombia, and he studies Software Engineering at the Universidad Cooperativa de Colombia. Away from code, he enjoys listening to music, training at the gym, watching movies and spending time with his four dogs.",
    toolsTitle: "His toolbox",
    toolsNarration:
      "His toolbox: for frontend and mobile he uses Next.js, React, React Native and Tailwind. On the backend he works with NestJS, Spring Boot and Supabase, and he has cloud experience on AWS with services like Lambda, EC2, S3, CloudFront and IAM, which he deploys with SST Ion. He handles PostgreSQL and PostGIS, builds desktop apps with Electron, video games with Unity and native apps with Kotlin and SwiftUI. And he relies on AI tools like Cursor and Claude.",
    projectIndex: "Project index",
    projectIndexNarration: (n: number) => `This book holds ${n} of Cristian's projects. I'll read them to you one by one.`,
    testimonialKicker: (i: number, n: number) => `Testimonial ${i} of ${n}`,
    says: (name: string, role: string, text: string) => `${name}, ${role}, says: ${text}`,
    work: "Work experience",
    academic: "Education",
    experienceNarration: [
      "Since January 2024, Cristian has worked as a freelance full-stack developer. He led NutriWeb from start to finish, a web system for clinical scheduling with patient management and online subscriptions. He also built GridMind, which optimizes home energy use with custom IoT hardware and artificial intelligence.",
      "He's currently studying Software Engineering at the Universidad Cooperativa de Colombia, in Pasto. He has taken part in three AI and technology hackathons, attended four software engineering seminars, and passed all four English levels of his degree.",
      "He has also trained at Coderhouse, where he completed the Product Marketing career and finished in the top ten of the Product Manager course, and at SENA, in applied electronics and robotics, innovation and entrepreneurship.",
    ],
    visitKicker: "Company visit",
    visitNarration: {
      ciandt:
        "Cristian visited CI&T, one of the largest software companies in Latin America. There he saw how agile teams build products for global brands, understood the importance of English and client communication, and learned what companies look for in a junior developer.",
      ceiba:
        "At Ceiba Software he learned the full lifecycle of a project, from the client's idea to production. He talked with their developers about code reviews, automated testing and the value of mentorship within a team.",
      sofka:
        "At Casa Sofka, in Medellín, he learned how a Colombian company supports large companies in their digital transformation, the role of quality and test automation, and what working in the real professional world is like.",
    } as Record<string, string>,
    certNarration: {
      Coderhouse:
        "At Coderhouse he completed the Product Marketing career and earned his Product Manager certification, finishing in the top ten of his group. He also studied Customer Experience, Inbound Marketing, and Community Management and Advertising.",
      SENA: "At SENA he passed, with a grade of four point five, a one hundred and forty four hour course on electronics and robotics applied to science, technology and innovation projects. He also took part in the Nariño Tecnoacademia with training in innovation and entrepreneurship, and took the English Dot Works course.",
    } as Record<string, string>,
    languagesTitle: "Languages",
    languagesNarration: "Cristian's native language is Spanish. His English level is B1, certified by his university after passing all four levels of his degree.",
    contactTitle: "Let's talk",
    contactText: "Have a project, a job opening or an idea? Cristian will be happy to hear from you.",
    contactForm: "Go to the contact form",
    contactNarration:
      "If you'd like to talk with Cristian, you can email him or find him on LinkedIn and GitHub. Here are the links, plus a contact form. He'll surely get back to you soon!",
    bookTitles: { "sobre-mi": "About me", proyectos: "Projects", testimonios: "Testimonials", experiencia: "Experience", visitas: "Company visits", certificados: "Certificates", contacto: "Contact" } as Record<BookId, string>,
  },
};

const COLORS: Record<BookId, string> = {
  "sobre-mi": "#C4561E",
  proyectos: "#2F6F5E",
  testimonios: "#7A2E3A",
  experiencia: "#3B5BA9",
  visitas: "#B0322F",
  certificados: "#B8862B",
  contacto: "#5B4A8A",
};

function buildBooks(lang: Lang): Book[] {
  const { profile, skills, projects, testimonials, experience, visits, certificates, languages, contact } = content[lang];
  const t = T[lang];

  const aboutPages: Page[] = [
    { kicker: t.chapter(1), title: profile.fullName, image: profile.photo, paragraphs: [profile.about], narration: t.aboutNarration },
    {
      kicker: t.chapter(1),
      title: t.whereTitle,
      list: [profile.location, `${profile.career} · ${profile.university}`, ...profile.interests.map((i) => i.label)],
      narration: t.whereNarration,
    },
    { kicker: t.chapter(1), title: t.toolsTitle, list: skills.map((g) => `${g.group}: ${g.items.join(", ")}`), narration: t.toolsNarration },
  ];

  const projectPages: Page[] = [
    {
      kicker: t.chapter(2),
      title: t.projectIndex,
      list: projects.map((p, i) => `Vol. ${String(i + 1).padStart(2, "0")} — ${p.title}: ${p.subtitle}`),
      narration: t.projectIndexNarration(projects.length),
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

  const testimonialPages: Page[] = testimonials.map((x, i) => ({
    kicker: t.testimonialKicker(i + 1, testimonials.length),
    title: x.name,
    paragraphs: [`“${x.text}”`],
    list: [x.role],
    image: x.photo,
    narration: t.says(x.name, x.role, x.text),
  }));

  const experiencePages: Page[] = experience.map((e, i) => ({
    kicker: e.type === "laboral" ? t.work : t.academic,
    title: e.title,
    paragraphs: [`${e.place} · ${e.date}`],
    list: e.details,
    narration: t.experienceNarration[i] ?? `${e.title}, ${e.place}. ${e.details.join(" ")}`,
  }));

  const visitPages: Page[] = visits.map((v) => ({
    kicker: t.visitKicker,
    title: v.company,
    paragraphs: [v.place, v.summary],
    list: v.learned,
    image: v.photos[0].src,
    accent: v.color,
    narration: t.visitNarration[v.slug] ?? `${v.company}. ${v.summary}`,
  }));

  const certificatePages: Page[] = [
    ...certificates.map<Page>((c) => ({
      kicker: c.area,
      title: c.issuer,
      list: c.items.map((it) => `${it.badge ? `[${it.badge}] ` : ""}${it.name} — ${it.detail}`),
      narration: t.certNarration[c.issuer] ?? `${c.issuer}: ${c.items.map((it) => it.name).join(", ")}.`,
    })),
    { kicker: t.languagesTitle, title: t.languagesTitle, list: languages.map((l) => `${l.name} — ${l.level}`), narration: t.languagesNarration },
  ];

  const contactPages: Page[] = [
    {
      kicker: t.finalChapter,
      title: t.contactTitle,
      paragraphs: [t.contactText],
      links: [
        { label: contact.email, href: `mailto:${contact.email}` },
        { label: "LinkedIn", href: contact.linkedin },
        { label: "GitHub", href: contact.github },
        { label: t.contactForm, href: "#contacto" },
      ],
      narration: t.contactNarration,
    },
  ];

  const pages: Record<BookId, Page[]> = {
    "sobre-mi": aboutPages,
    proyectos: projectPages,
    testimonios: testimonialPages,
    experiencia: experiencePages,
    visitas: visitPages,
    certificados: certificatePages,
    contacto: contactPages,
  };
  return (Object.keys(COLORS) as BookId[]).map((id) => ({ id, title: t.bookTitles[id], color: COLORS[id], pages: pages[id] }));
}

const cache: Partial<Record<Lang, Book[]>> = {};
export const getBooks = (lang: Lang) => (cache[lang] ??= buildBooks(lang));
export const bookById = (id: BookId, lang: Lang = "es") => getBooks(lang).find((b) => b.id === id)!;

// Compatibilidad: libros en español.
export const books = getBooks("es");
