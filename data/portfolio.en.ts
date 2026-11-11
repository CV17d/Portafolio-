// English version of the portfolio content. Same shape as data/portfolio.ts.
import type { Certificate, Contact, ExperienceItem, Profile, Project, SkillGroup, Testimonial, Visit } from "./portfolio";
import { contact as contactEs, profile as profileEs, projects as projectsEs, testimonials as testimonialsEs, visits as visitsEs, certificates as certificatesEs } from "./portfolio";

export const profile: Profile = {
  ...profileEs,
  role: "Full-Stack Developer",
  tagline: "Builder of end-to-end software solutions: from mobile and desktop apps to web platforms and smartwatch systems.",
  about:
    "I'm Cristian Velasco, a full-stack developer and Software Engineering student focused on building end-to-end tech products. I stand out for my quick technical understanding and leadership, combining web, mobile, IoT and AI tools to design scalable architectures. My focus is turning complex challenges —from urban telemetry to home automation and health interfaces— into innovative, efficient, high-impact software.",
  career: "Software Engineering",
  interests: [
    { icon: "music", label: "Music" },
    { icon: "gym", label: "Gym" },
    { icon: "film", label: "Movies" },
    { icon: "paw", label: "My 4 dogs" },
  ],
};

export const skills: SkillGroup[] = [
  { group: "Frontend & Mobile", items: ["Next.js 16+", "React 19", "React Native (Expo)", "Tailwind CSS", "NativeWind", "SwiftUI"] },
  { group: "Backend & Cloud", items: ["NestJS", "Spring Boot", "Supabase", "AWS (Lambda, EC2, S3, CloudFront, IAM)", "SST Ion"] },
  { group: "Databases & GIS", items: ["PostgreSQL", "PostGIS", "Room (SQLite)"] },
  { group: "Development & Engines", items: ["Electron", "Unity 3D", "Kotlin (Compose)", "C#"] },
  { group: "Productivity & AI", items: ["Cursor", "Claude", "Antigravity"] },
];

const projectText: Record<string, { subtitle: string; description: string; links?: string[] }> = {
  nutriweb: {
    subtitle: "Clinical platform for a nutritionist, live on AWS",
    description:
      "A complete web system for a nutrition practice: a landing page managed from its own CMS, free appointments synced with Google Calendar, plan sales with online payments (Payphone, single or installment), a private schedule where each patient books their sessions, and a dashboard for revenue, patients and appointments. It includes automated emails, reminders and security with JWT sessions, rate limiting and audit logs.",
    links: ["View live site"],
  },
  rutea: {
    subtitle: "Collaborative public transport telemetry",
    description: "A collaborative mobile tracking system that projects estimated arrival times (ETA) and bus positions in real time using citizen telemetry and geolocation.",
  },
  optiflow: {
    subtitle: "Ergonomic health software",
    description:
      "A cross-platform, local-first desktop app that uses artificial intelligence and computer vision to monitor eye health, measure fatigue and correct posture through active breaks.",
    links: ["GitHub", "Download (Win/Mac/Linux)"],
  },
  demencia: {
    subtitle: "Roguelike FPS video game",
    description: "A 3D psychological horror game with procedural generation of 30 levels, bosses with adaptive difficulty (AI Director) and progressive mental-degradation mechanics.",
    links: ["GitHub", "Play demo"],
  },
  gridmind: {
    subtitle: "IoT and energy monitoring",
    description: "A home automation system built on custom hardware that measures appliance consumption in real time, gives AI-powered recommendations and allows remote shutdown from your phone.",
  },
  omniroute: {
    subtitle: "Logistics assistant for smartwatch",
    description:
      "A standalone Wear OS app that helps delivery drivers check their route, see the current stop, log arrivals or incidents and confirm deliveries in seconds, even offline thanks to a local queue that syncs with the backend.",
  },
};

export const projects: Project[] = projectsEs.map((p) => {
  const t = projectText[p.slug];
  return {
    ...p,
    subtitle: t.subtitle,
    description: t.description,
    tags: p.tags.map((tag) => (tag === "Microcontroladores" ? "Microcontrollers" : tag === "IA" ? "AI" : tag)),
    links: p.links.map((l, i) => ({ ...l, label: t.links?.[i] ?? l.label })),
  };
});

const testimonialText = [
  {
    role: "Nutritionist and trainer · NutriWeb client",
    text: "Cristian understood my practice better than I did. He delivered NutriWeb ahead of schedule and everything has worked perfectly since day one: my patients book on their own, pay online, and I manage everything from a dashboard. He's a serious, fast and very detail-oriented developer.",
  },
  {
    role: "Dentist · Client",
    text: "He adapted his platform to my dental practice in very little time. Now my patients book their appointments online and I no longer waste hours on the phone. He was always attentive to every adjustment I asked for.",
  },
  {
    role: "Collaborator on several projects",
    text: "I've worked with Cristian on several projects and he's always the one who gets things done. He proposes clear solutions, writes clean code and meets deadlines. Working with him makes the whole team move faster.",
  },
  {
    role: "Frontend and Mobile Development professor",
    text: "Cristian was one of those students who was always a step ahead. He learns fast, researches on his own and takes every project beyond what's asked in class, with polished, well-built interfaces.",
  },
];

export const testimonials: Testimonial[] = testimonialsEs.map((t, i) => ({ ...t, ...testimonialText[i] }));

export const experience: ExperienceItem[] = [
  {
    type: "laboral",
    title: "Freelance Full-Stack Developer",
    place: "Independent · Remote",
    date: "Jan 2024 – Present",
    details: [
      "Led the end-to-end development of NutriWeb, a web system for clinical lead capture and scheduling with automated patient management and online subscription sales (Next.js 16, React 19, Supabase, SST Ion on AWS).",
      "Optimized residential energy consumption with GridMind (IoT): custom hardware, scalable backend, mobile interface, AI recommendations and billing reports.",
    ],
  },
  {
    type: "academica",
    title: "Software Engineering",
    place: "Universidad Cooperativa de Colombia · San Juan de Pasto",
    date: "Currently",
    details: [
      "Active participation in 3 AI and technology hackathons.",
      "Attended 4 Software Engineering seminars organized by UCC.",
      "Certified B1 English: passed all 4 university levels.",
    ],
  },
  {
    type: "academica",
    title: "Technical and product certifications",
    place: "Coderhouse & SENA · Remote",
    date: "Complementary training",
    details: [
      "Coderhouse: Product Marketing Career, Product Manager (Top 10), Customer Experience, Inbound Marketing, and Community Manager & Advertising.",
      "SENA: Electronics and Robotics applied to science, technology and innovation projects (144 h), innovation and entrepreneurship, and English.",
    ],
  },
];

const visitText: Record<string, { place: string; summary: string; learned: string[]; alts: string[] }> = {
  ciandt: {
    place: "Global technology company · Medellín",
    summary:
      "I got an inside look at one of Latin America's largest software companies. I saw how distributed teams build digital products for global brands and how an agile culture becomes the daily routine of hundreds of developers.",
    learned: [
      "How agile squads are organized and how each sprint is planned, prioritized and delivered.",
      "The importance of English, communication and working with international clients.",
      "What they look for in a junior developer: solid fundamentals, eagerness to learn and teamwork.",
    ],
    alts: ["CI&T logo at the reception of its offices", "Cristian in front of the CI&T logo", "CI&T workspace during the visit"],
  },
  ceiba: {
    place: "Software company · Medellín",
    summary:
      "They welcomed us with a talk about how a software project is born, from the client's idea all the way to production. We toured their spaces and talked with their developers about their routine and professional growth.",
    learned: [
      "The full project lifecycle: requirements gathering, design, development, testing and deployment.",
      "Real-world best practices: code reviews, automated testing and continuous integration.",
      "What a developer's career looks like and the value of mentorship within a team.",
    ],
    alts: ["Welcome talk at Ceiba's offices", "Group photo from the visit to Ceiba"],
  },
  sofka: {
    place: "Casa Sofka · Medellín",
    summary:
      "We visited Casa Sofka and learned how a Colombian tech company supports large companies in their digital transformation, with teams focused on quality, automation and continuous learning.",
    learned: [
      "The role of quality assurance and test automation in large projects.",
      "How a culture of continuous learning helps teams grow.",
      "What working in the real professional world is like: schedules, roles and cross-team collaboration.",
    ],
    alts: ["Group of students in front of Casa Sofka in Medellín"],
  },
};

export const visits: Visit[] = visitsEs.map((v) => {
  const t = visitText[v.slug];
  return { ...v, place: t.place, summary: t.summary, learned: t.learned, photos: v.photos.map((ph, i) => ({ ...ph, alt: t.alts[i] ?? ph.alt })) };
});

const certText: Record<string, { area: string; items: { name: string; detail: string; badge?: string }[] }> = {
  Coderhouse: {
    area: "Product and digital business",
    items: [
      { name: "Product Marketing Career", detail: "33 weeks · Jul 2024", badge: "Career" },
      { name: "Product Manager", detail: "32 h · Feb 2024 · endorsed by Pomelo", badge: "Top 10" },
      { name: "Customer Experience (CX)", detail: "32 h · Jun 2024 · endorsed by Kubo Financiero" },
      { name: "Inbound Marketing", detail: "24 h · Jul 2024" },
      { name: "Digital Marketing: Community Manager & Advertising", detail: "42 h · Dec 2023 · endorsed by Ualá" },
    ],
  },
  SENA: {
    area: "Technology, innovation and languages",
    items: [
      { name: "Applying Electronics and Robotics to Science, Technology and Innovation Projects", detail: "144 h · Dec 2022 · grade 4.5" },
      { name: "Innovation, a Tool for Entrepreneurship", detail: "4 h · Jun 2022 · Tecnoacademia Nariño" },
      { name: "Tecnoacademia Induction: Learning in Science, Technology and Innovation", detail: "8 h · Apr 2022 · Tecnoacademia Nariño" },
      { name: "English Dot Works Beginner", detail: "60 h · Aug 2019 · grade 4.5" },
    ],
  },
};

export const certificates: Certificate[] = certificatesEs.map((c) => {
  const t = certText[c.issuer];
  return { ...c, area: t.area, items: c.items.map((it, i) => ({ ...it, ...t.items[i] })) };
});

export const languages = [
  { name: "Spanish", level: "Native" },
  { name: "English", level: "B1 · university certified (4 levels passed)" },
];

export const contact: Contact = contactEs;

export const navLinks = [
  { id: "inicio", label: "Home" },
  { id: "sobre-mi", label: "About" },
  { id: "proyectos", label: "Projects" },
  { id: "testimonios", label: "Testimonials" },
  { id: "experiencia", label: "Experience" },
  { id: "visitas", label: "Visits" },
  { id: "certificados", label: "Certificates" },
  { id: "contacto", label: "Contact" },
];
