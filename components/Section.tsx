"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { SplitText } from "./fx";

// Cada sección entra al hacer scroll: una línea de acento cruza de lado a lado,
// el contenido sube, se enfoca y crece un poco; el título se inclina según el scroll.
export default function Section({ id, kicker, title, children }: { id: string; kicker: string; title: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 0.35"] });
  const titleX = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-60, 0]);
  const skew = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-6, 0]);

  return (
    <section ref={ref} id={id} className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 md:py-36">
      {/* línea que cruza al entrar */}
      <motion.span
        aria-hidden
        className="absolute left-4 right-4 top-0 h-px origin-left bg-gradient-to-r from-transparent via-accent to-transparent sm:left-6 sm:right-6"
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
      />
      <motion.p
        className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.25em] text-accent"
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <motion.span className="h-px bg-accent" initial={{ width: 0 }} whileInView={{ width: 40 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} />
        {kicker}
      </motion.p>
      <motion.div style={{ x: titleX, skewX: skew }}>
        <SplitText as="h2" text={title} className="mt-3 font-display text-5xl font-semibold leading-[0.95] tracking-tight md:text-7xl" />
      </motion.div>
      <motion.div
        className="mt-14"
        initial={reduce ? false : { opacity: 0, y: 70, scale: 0.97, filter: "blur(8px)" }}
        whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transitionEnd: { filter: "none", transform: "none" } }}
        viewport={{ once: true, margin: "-12% 0px" }}
        transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
      >
        {children}
      </motion.div>
    </section>
  );
}
