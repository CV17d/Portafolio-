// Fuente única de datos: la usan tanto los libros de la biblioteca como el modo lectura.

export type Profile = {
  fullName: string;
  shortName: string;
  logo: string;
  role: string;
  tagline: string;
  photo: string;
  cv: string;
  about: string;
  location: string;
  university: string;
  career: string;
  interests: { icon: "music" | "gym" | "film" | "paw"; label: string }[];
};

export type SkillGroup = { group: string; items: string[] };

export type Project = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  links: { label: string; href: string; kind: "github" | "demo" }[];
  color: string; // color del lomo / portada
  image?: string;
  device?: "phone" | "watch"; // captura de celular o reloj: se muestra como dispositivo
};

export type Testimonial = {
  name: string;
  role: string;
  text: string;
  photo?: string;
  linkedin?: string;
  placeholder?: boolean;
};

export type ExperienceItem = {
  type: "academica" | "laboral";
  title: string;
  place: string;
  date: string;
  details: string[];
};

export type Certificate = {
  issuer: string;
  area: string;
  items: { name: string; detail: string; badge?: string; image?: string }[];
};

export type Contact = {
  email: string;
  linkedin: string;
  github: string;
};

export const profile: Profile = {
  fullName: "Cristian Javier Velasco Burbano",
  shortName: "Cristian",
  logo: "CV",
  role: "Desarrollador Full-Stack",
  tagline:
    "Creador de soluciones de software end-to-end: de aplicaciones móviles y de escritorio a plataformas web y sistemas para relojes inteligentes.",
  photo: "/images/cristian.webp",
  cv: "/cv.pdf",
  about:
    "Soy Cristian Velasco, desarrollador full-stack y estudiante de Ingeniería de Software especializado en construir productos tecnológicos end-to-end. Destaco por mi rápida comprensión técnica y liderazgo, integrando desarrollo web, móvil, IoT y herramientas de inteligencia artificial para diseñar arquitecturas escalables. Mi enfoque está en transformar desafíos complejos —desde telemetría urbana hasta domótica e interfaces de salud— en soluciones de software innovadoras, eficientes y de alto impacto.",
  location: "Cuaspud-Carlosama, Nariño, Colombia",
  university: "Universidad Cooperativa de Colombia",
  career: "Ingeniería de Software",
  interests: [
    { icon: "music", label: "Música" },
    { icon: "gym", label: "Gimnasio" },
    { icon: "film", label: "Películas" },
    { icon: "paw", label: "Mis 4 perros" },
  ],
};

export const skills: SkillGroup[] = [
  { group: "Frontend & Mobile", items: ["Next.js 16+", "React 19", "React Native (Expo)", "Tailwind CSS", "NativeWind", "SwiftUI"] },
  { group: "Backend & Cloud", items: ["NestJS", "Spring Boot", "Supabase", "AWS (Lambda, EC2, S3, CloudFront, IAM)", "SST Ion"] },
  { group: "Bases de datos & GIS", items: ["PostgreSQL", "PostGIS", "Room (SQLite)"] },
  { group: "Desarrollo & Motores", items: ["Electron", "Unity 3D", "Kotlin (Compose)", "C#"] },
  { group: "Productividad & IA", items: ["Cursor", "Claude", "Antigravity"] },
];

export const projects: Project[] = [
  {
    slug: "nutriweb",
    image: "/images/proyectos/nutriweb.webp",
    title: "NutriWeb",
    subtitle: "Plataforma clínica para nutricionista, en producción sobre AWS",
    description:
      "Sistema web completo para un consultorio de nutrición: landing administrable desde un CMS propio, citas gratuitas sincronizadas con Google Calendar, venta de planes con pago en línea (Payphone, contado o diferido), agenda privada para que cada paciente programe sus sesiones y un panel de gestión de ingresos, pacientes y citas. Incluye correos automáticos, recordatorios y seguridad con sesiones JWT, rate limiting y auditoría.",
    tags: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS", "PostgreSQL (Supabase)", "AWS (SST Ion)", "Payphone", "Google Calendar API", "Resend", "Zod"],
    links: [{ label: "Ver sitio en vivo", href: "https://andresburbanonutricionista.com/", kind: "demo" }],
    color: "#4F7A3A",
  },
  {
    slug: "rutea",
    image: "/images/proyectos/rutea.webp",
    device: "phone",
    title: "Rutea Pasto",
    subtitle: "Telemetría colaborativa de transporte público",
    description:
      "Sistema móvil de rastreo colaborativo que proyecta tiempos estimados de llegada (ETA) y posiciones de los buses en tiempo real mediante telemetría ciudadana y geolocalización.",
    tags: ["React Native (Expo)", "NativeWind", "NestJS", "WebSockets", "PostgreSQL", "PostGIS", "Supabase", "Turf.js"],
    links: [
      { label: "GitHub", href: "https://github.com/CV17d/Rutea", kind: "github" },
      { label: "Demo (v1.0.3)", href: "https://github.com/CV17d/Rutea/releases/tag/v1.0.3", kind: "demo" },
    ],
    color: "#2F6F5E",
  },
  {
    slug: "optiflow",
    image: "/images/proyectos/optiflow.webp",
    title: "OptiFlow",
    subtitle: "Software de salud ergonómica",
    description:
      "Aplicación de escritorio multiplataforma y local-first que usa inteligencia artificial y visión por computadora para monitorear la salud visual, medir la fatiga y corregir la postura mediante pausas activas.",
    tags: ["Electron", "React 19", "TypeScript", "Tailwind CSS", "Python", "MediaPipe", "OpenCV", "SQLite"],
    links: [
      { label: "GitHub", href: "https://github.com/CV17d/optiflow", kind: "github" },
      { label: "Descargar (Win/Mac/Linux)", href: "https://github.com/CV17d/optiflow/releases", kind: "demo" },
    ],
    color: "#3B5BA9",
  },
  {
    slug: "demencia",
    image: "/images/proyectos/demencia.webp",
    title: "Demencia No Límite",
    subtitle: "Videojuego FPS roguelike",
    description:
      "Videojuego de terror psicológico en 3D con generación procedural de 30 niveles, jefes con dificultad adaptativa (AI Director) y mecánicas de degradación mental progresiva.",
    tags: ["Unity 3D", "C#"],
    links: [
      { label: "GitHub", href: "https://github.com/CV17d/demencia_ae_limite", kind: "github" },
      { label: "Jugar demo", href: "https://github.com/CV17d/demencia_ae_limite/releases", kind: "demo" },
    ],
    color: "#7A2E3A",
  },
  {
    slug: "gridmind",
    title: "GridMind",
    subtitle: "IoT y monitoreo energético",
    description:
      "Sistema domótico integrado a hardware propio que mide el consumo de electrodomésticos en tiempo real, brinda recomendaciones con IA y permite el apagado remoto desde el celular.",
    tags: ["Java", "Spring Boot", "IoT", "Microcontroladores", "IA"],
    links: [
      { label: "GitHub · Backend", href: "https://github.com/CV17d/gridmind-backend", kind: "github" },
      { label: "GitHub · Frontend", href: "https://github.com/CV17d/gridmind-frontend", kind: "github" },
    ],
    color: "#B8862B",
  },
  {
    slug: "omniroute",
    image: "/images/proyectos/omniroute.webp",
    device: "watch",
    title: "OmniRoute",
    subtitle: "Asistente logístico para smartwatch",
    description:
      "App standalone para Wear OS que ayuda a repartidores a consultar su ruta, ver la parada actual, registrar llegadas o incidencias y confirmar entregas en segundos, incluso sin conexión gracias a una cola local que se sincroniza con el backend.",
    tags: ["Kotlin", "Jetpack Compose (Wear OS)", "MVVM", "Coroutines", "Retrofit", "STOMP WebSockets", "Room", "WorkManager"],
    links: [
      { label: "GitHub", href: "https://github.com/CV17d/omniroute_smartwatch", kind: "github" },
      { label: "Demo (v1.0.0)", href: "https://github.com/CV17d/omniroute_smartwatch/releases/tag/v1.0.0", kind: "demo" },
    ],
    color: "#C4561E",
  },
];

export const testimonials: Testimonial[] = [
  {
    name: "Andrés Burbano",
    role: "Nutricionista y entrenador · Cliente de NutriWeb",
    text: "Cristian entendió mi consultorio mejor que yo mismo. Entregó NutriWeb antes de lo acordado y desde el primer día todo funciona perfecto: mis pacientes agendan solos, pagan en línea y yo administro todo desde un panel. Es un programador serio, rápido y muy detallista.",
    photo: "/images/testimonios/andres-burbano.webp",
    linkedin: "https://www.linkedin.com/in/andres-burbano-fitnesscoach",
  },
  {
    name: "Diego Morillo",
    role: "Odontólogo · Cliente",
    text: "Adaptó su plataforma a mi consultorio odontológico en muy poco tiempo. Ahora mis pacientes reservan sus citas en línea y yo dejé de perder horas en el teléfono. Siempre estuvo atento a cada ajuste que le pedí.",
    photo: "/images/testimonios/diego-morillo.webp",
  },
  {
    name: "Martín Morales",
    role: "Colaborador en varios proyectos",
    text: "He trabajado con Cristian en varios proyectos y siempre es el que resuelve. Propone soluciones claras, escribe código ordenado y cumple los tiempos. Trabajar con él hace que todo el equipo avance más rápido.",
    photo: "/images/testimonios/martin-morales.webp",
  },
  {
    name: "Luis Miguel López",
    role: "Profesor de Frontend y Mobile Development",
    text: "Cristian fue de los estudiantes que siempre iban un paso adelante. Aprende rápido, investiga por su cuenta y lleva cada proyecto más allá de lo que se pide en clase, con interfaces cuidadas y bien construidas.",
    photo: "/images/testimonios/luis-miguel-lopez.webp",
    linkedin: "https://www.linkedin.com/in/luis-miguel-lopez-lopez",
  },
];

export const experience: ExperienceItem[] = [
  {
    type: "laboral",
    title: "Desarrollador Full-Stack Freelance",
    place: "Independiente · Remoto",
    date: "Ene 2024 – Presente",
    details: [
      "Lideré el desarrollo end-to-end de Nutriweb, un sistema web de captación y agendamiento clínico con gestión automatizada de pacientes y venta de suscripciones online (Next.js 16, React 19, Supabase, SST Ion en AWS).",
      "Optimicé el consumo de energía residencial con GridMind (IoT): hardware personalizado, backend escalable, interfaz móvil, recomendaciones con IA y reportes de facturación.",
    ],
  },
  {
    type: "academica",
    title: "Ingeniería de Software",
    place: "Universidad Cooperativa de Colombia · San Juan de Pasto",
    date: "Actualmente",
    details: [
      "Participación activa en 3 hackatones de IA y tecnología.",
      "Asistencia a 4 seminarios de Ingeniería de Software organizados por la UCC.",
      "Inglés B1 certificado: 4 niveles universitarios aprobados.",
    ],
  },
  {
    type: "academica",
    title: "Certificaciones técnicas y de producto",
    place: "Coderhouse & SENA · Remoto",
    date: "Formación complementaria",
    details: [
      "Coderhouse: Carrera de Product Marketing, Product Manager (Top 10), Customer Experience, Inbound Marketing y Community Manager y Publicidad.",
      "SENA: Electrónica y Robótica aplicada a proyectos de ciencia, tecnología e innovación (144 h), innovación y emprendimiento, e inglés.",
    ],
  },
];

export type Visit = {
  slug: string;
  company: string;
  place: string;
  summary: string;
  learned: string[];
  photos: { src: string; alt: string }[];
  color: string;
};

// Visitas empresariales a casas de software.
export const visits: Visit[] = [
  {
    slug: "ciandt",
    company: "CI&T",
    place: "Multinacional de tecnología · Medellín",
    summary:
      "Conocí por dentro una de las grandes casas de software de Latinoamérica. Vi cómo equipos distribuidos construyen productos digitales para marcas globales y cómo una cultura ágil se vuelve el día a día de cientos de desarrolladores.",
    learned: [
      "Cómo se organizan los squads ágiles y cómo se planea, prioriza y entrega cada sprint.",
      "La importancia del inglés, la comunicación y el trabajo con clientes internacionales.",
      "Qué buscan en un desarrollador junior: bases sólidas, ganas de aprender y trabajo en equipo.",
    ],
    photos: [
      { src: "/images/visitas/ciandt-1.webp", alt: "Logo de CI&T en la recepción de sus oficinas" },
      { src: "/images/visitas/ciandt-2.webp", alt: "Cristian frente al logo de CI&T" },
      { src: "/images/visitas/ciandt-3.webp", alt: "Espacio de trabajo de CI&T durante la visita" },
    ],
    color: "#B0322F",
  },
  {
    slug: "ceiba",
    company: "Ceiba Software",
    place: "Casa de software · Medellín",
    summary:
      "Nos recibieron con una charla sobre cómo nace un proyecto de software, desde la idea del cliente hasta que llega a producción. Recorrimos sus espacios y hablamos con sus desarrolladores sobre su rutina y su crecimiento profesional.",
    learned: [
      "El ciclo completo de un proyecto: levantamiento de requisitos, diseño, desarrollo, pruebas y despliegue.",
      "Buenas prácticas reales: revisiones de código, pruebas automatizadas e integración continua.",
      "Cómo es la carrera de un desarrollador y el valor de la mentoría dentro de un equipo.",
    ],
    photos: [
      { src: "/images/visitas/ceiba-1.webp", alt: "Charla de bienvenida en las oficinas de Ceiba" },
      { src: "/images/visitas/ceiba-2.webp", alt: "Foto grupal de la visita a Ceiba" },
    ],
    color: "#3E8E41",
  },
  {
    slug: "sofka",
    company: "Sofka",
    place: "Casa Sofka · Medellín",
    summary:
      "Visitamos Casa Sofka y conocimos cómo una empresa colombiana de tecnología acompaña a grandes compañías en su transformación digital, con equipos enfocados en calidad, automatización y aprendizaje constante.",
    learned: [
      "El papel del aseguramiento de calidad y la automatización de pruebas en proyectos grandes.",
      "Cómo una cultura de aprendizaje continuo hace crecer a los equipos.",
      "Cómo es trabajar en el mundo laboral real: horarios, roles y colaboración entre áreas.",
    ],
    photos: [{ src: "/images/visitas/sofka-1.webp", alt: "Grupo de estudiantes frente a Casa Sofka en Medellín" }],
    color: "#E8702A",
  },
];

// Clasificados por área. Fuente: certificados de Coderhouse y SENA (verificables en certificados.sena.edu.co).
export const certificates: Certificate[] = [
  {
    issuer: "Coderhouse",
    area: "Producto y negocio digital",
    items: [
      { name: "Carrera de Product Marketing", detail: "33 semanas · jul 2024", badge: "Carrera", image: "/images/certificados/coder-product-marketing.webp" },
      { name: "Product Manager", detail: "32 h · feb 2024 · avalado por Pomelo", badge: "Top 10", image: "/images/certificados/coder-product-manager.webp" },
      { name: "Customer Experience (CX)", detail: "32 h · jun 2024 · avalado por Kubo Financiero", image: "/images/certificados/coder-cx.webp" },
      { name: "Inbound Marketing", detail: "24 h · jul 2024", image: "/images/certificados/coder-inbound.webp" },
      { name: "Marketing Digital: Community Manager y Publicidad", detail: "42 h · dic 2023 · avalado por Ualá", image: "/images/certificados/coder-community-manager.webp" },
    ],
  },
  {
    issuer: "SENA",
    area: "Tecnología, innovación e idiomas",
    items: [
      { name: "Aplicación de la Electrónica y Robótica en Proyectos de Ciencia, Tecnología e Innovación", detail: "144 h · dic 2022 · nota 4.5", image: "/images/certificados/sena-robotica.webp" },
      { name: "La Innovación, una Herramienta para el Emprendimiento", detail: "4 h · jun 2022 · Tecnoacademia Nariño", image: "/images/certificados/sena-innovacion.webp" },
      { name: "Inducción Tecnoacademia: Aprendizaje en Ciencia, Tecnología e Innovación", detail: "8 h · abr 2022 · Tecnoacademia Nariño", image: "/images/certificados/sena-induccion.webp" },
      { name: "English Dot Works Beginner — Inglés", detail: "60 h · ago 2019 · nota 4.5", image: "/images/certificados/sena-ingles.webp" },
    ],
  },
];

export const languages = [
  { name: "Español", level: "Nativo" },
  { name: "Inglés", level: "B1 · certificado universitario (4 niveles aprobados)" },
];

export const contact: Contact = {
  email: "velascoburbanocristian@gmail.com",
  linkedin: "https://www.linkedin.com/in/crisstiannnvelasco",
  github: "https://github.com/CV17d",
};

export const navLinks = [
  { id: "inicio", label: "Inicio" },
  { id: "sobre-mi", label: "Sobre mí" },
  { id: "proyectos", label: "Proyectos" },
  { id: "testimonios", label: "Testimonios" },
  { id: "experiencia", label: "Experiencia" },
  { id: "visitas", label: "Visitas" },
  { id: "certificados", label: "Certificados" },
  { id: "contacto", label: "Contacto" },
];
