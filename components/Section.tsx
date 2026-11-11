"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { SplitText } from "./fx";

export default function Section({ id, kicker, title, children }: { id: string; kicker: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 md:py-36">
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
      <SplitText as="h2" text={title} className="mt-3 font-display text-5xl font-semibold leading-[0.95] tracking-tight md:text-7xl" />
      <div className="mt-14">{children}</div>
    </section>
  );
}
