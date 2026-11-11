import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Testimonials from "@/components/Testimonials";
import Experience from "@/components/Experience";
import Visits from "@/components/Visits";
import Contact from "@/components/Contact";
import Certificates from "@/components/Certificates";
import Footer from "@/components/Footer";

import Library from "@/components/library/Library";
import LanguagePicker from "@/components/LanguagePicker";
import { LangProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";
import { Cursor, ScrollProgress } from "@/components/fx";

// La biblioteca de Nigi se abre encima; debajo vive el portafolio clásico ("modo lectura").
export default function Home() {
  return (
    <ThemeProvider>
    <LangProvider>
      <LanguagePicker />
      <Library />
      <ScrollProgress />
      <Cursor />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Projects />
        <Testimonials />
        <Experience />
        <Visits />
        <Contact />
        <Certificates />
      </main>
      <Footer />
    </LangProvider>
    </ThemeProvider>
  );
}
