import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import { themeInitScript } from "@/lib/theme";

const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"] });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });

const SITE = "https://portafolio-cristian-lime.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "Cristian Velasco · Desarrollador Full-Stack",
  description:
    "Portafolio de Cristian Velasco: desarrollador full-stack. Web, móvil, escritorio, IoT y smartwatch. Pregúntale a Nigi, el robot bibliotecario.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE,
    siteName: "Cristian Velasco",
    title: "Cristian Velasco · Desarrollador Full-Stack",
    description: "Web, móvil, IoT y smartwatch de punta a punta. Recorre mi portafolio con Nigi, el robot bibliotecario en 3D.",
    locale: "es_CO",
    alternateLocale: ["en_US"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cristian Velasco · Desarrollador Full-Stack",
    description: "Web, móvil, IoT y smartwatch de punta a punta. Recorre mi portafolio con Nigi, el robot bibliotecario en 3D.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${fraunces.variable} ${manrope.variable} scroll-smooth antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="grain min-h-screen overflow-x-clip font-sans">{children}</body>
    </html>
  );
}
