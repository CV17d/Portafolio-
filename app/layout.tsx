import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import { themeInitScript } from "@/lib/theme";

const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"] });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cristian Velasco · Desarrollador Full-Stack",
  description:
    "Portafolio de Cristian Velasco: desarrollador full-stack. Web, móvil, escritorio, IoT y smartwatch.",
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
