"use client";

import { useEffect, useRef, useState, type ReactNode, type PointerEvent as RPointerEvent, type CSSProperties } from "react";
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";

const EASE = [0.2, 0.8, 0.2, 1] as const;

/* ---------- Texto que entra letra a letra en 3D ---------- */
export function SplitText({ text, className, delay = 0, as = "span", inView = true }: { text: string; className?: string; delay?: number; as?: "span" | "h1" | "h2" | "p"; inView?: boolean }) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  const words = text.split(" ");
  let i = 0;
  return (
    <Tag
      className={className}
      aria-label={text}
      initial="hidden"
      {...(inView ? { whileInView: "show", viewport: { once: true, margin: "-10% 0px" } } : { animate: "show" })}
      style={{ perspective: 800 }}
    >
      {words.map((w, wi) => (
        <span key={wi} aria-hidden className="inline-block whitespace-nowrap">
          {w.split("").map((ch) => {
            const d = delay + i++ * 0.028;
            return (
              <motion.span
                key={i}
                className="inline-block origin-bottom will-change-transform"
                variants={{
                  hidden: reduce ? { opacity: 0 } : { opacity: 0, y: "0.6em", rotateX: -90, filter: "blur(6px)" },
                  show: { opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)", transition: { delay: d, duration: 0.7, ease: EASE } },
                }}
              >
                {ch}
              </motion.span>
            );
          })}
          {wi < words.length - 1 && " "}
        </span>
      ))}
    </Tag>
  );
}

/* ---------- Aparición al hacer scroll ---------- */
export function Reveal({ children, className, delay = 0, y = 40, style }: { children: ReactNode; className?: string; delay?: number; y?: number; style?: CSSProperties }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      style={style}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y, rotateX: 12, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* ---------- Tarjeta con inclinación 3D y brillo ---------- */
export function Tilt({ children, className, max = 10, glare = true }: { children: ReactNode; className?: string; max?: number; glare?: boolean }) {
  const reduce = useReducedMotion();
  const rx = useSpring(0, { stiffness: 200, damping: 18 });
  const ry = useSpring(0, { stiffness: 200, damping: 18 });
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const bg = useTransform([gx, gy] as MotionValue<number>[], ([x, y]) => `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.28), transparent 55%)`);

  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * max * 2);
    rx.set(-(py - 0.5) * max * 2);
    gx.set(px * 100);
    gy.set(py * 100);
  };
  const reset = () => {
    rx.set(0);
    ry.set(0);
  };
  return (
    <div style={{ perspective: 1000 }} className="h-full">
      <motion.div onPointerMove={onMove} onPointerLeave={reset} style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }} className={`relative h-full ${className ?? ""}`}>
        {children}
        {glare && <motion.div className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 mix-blend-overlay transition-opacity duration-300 group-hover:opacity-100" style={{ background: bg }} aria-hidden />}
      </motion.div>
    </div>
  );
}

/* ---------- Botón magnético ---------- */
export function Magnetic({ children, strength = 0.35, className }: { children: ReactNode; strength?: number; className?: string }) {
  const x = useSpring(0, { stiffness: 250, damping: 15 });
  const y = useSpring(0, { stiffness: 250, damping: 15 });
  return (
    <motion.div
      className={`inline-block ${className ?? ""}`}
      style={{ x, y }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * strength);
        y.set((e.clientY - r.top - r.height / 2) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/* ---------- Barra de progreso de scroll ---------- */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  return <motion.div className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-accent via-[#f5b041] to-glow" style={{ scaleX }} aria-hidden />;
}

/* ---------- Cursor personalizado ---------- */
export function Cursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40 });
  const sy = useSpring(y, { stiffness: 500, damping: 40 });
  const [hover, setHover] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine) return;
    const t = setTimeout(() => setEnabled(true), 0);
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const el = e.target as HTMLElement | null;
      setHover(!!el?.closest("a, button, [data-cursor]"));
    };
    window.addEventListener("pointermove", move);
    return () => {
      clearTimeout(t);
      window.removeEventListener("pointermove", move);
    };
  }, [x, y]);

  if (!enabled) return null;
  return (
    <>
      <motion.div className="pointer-events-none fixed left-0 top-0 z-[200] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent" style={{ x, y }} aria-hidden />
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[200] -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/70 mix-blend-difference"
        style={{ x: sx, y: sy }}
        animate={{ width: hover ? 56 : 30, height: hover ? 56 : 30, backgroundColor: hover ? "rgba(232,112,42,0.15)" : "rgba(0,0,0,0)" }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        aria-hidden
      />
    </>
  );
}

/* ---------- Marquesina infinita ---------- */
export function Marquee({ items, reverse = false, className }: { items: string[]; reverse?: boolean; className?: string }) {
  const row = [...items, ...items];
  return (
    <div className={`group relative flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)] ${className ?? ""}`}>
      <div className={`flex shrink-0 gap-4 pr-4 ${reverse ? "animate-marquee-reverse" : "animate-marquee"} group-hover:[animation-play-state:paused]`}>
        {row.map((t, i) => (
          <span key={i} className="whitespace-nowrap rounded-full border border-line bg-card px-5 py-2.5 font-display text-lg font-medium">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- Parallax sencillo ---------- */
export function Parallax({ children, speed = 0.2, className }: { children: ReactNode; speed?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`${speed * 100}px`, `${-speed * 100}px`]);
  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

/* ---------- Línea que se dibuja con el scroll ---------- */
export function ScrollLine({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 60%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 90, damping: 22 });
  return (
    <div ref={ref} className={`absolute bottom-0 left-0 top-0 w-[2px] bg-line ${className ?? ""}`} aria-hidden>
      <motion.div className="h-full w-full origin-top bg-gradient-to-b from-accent to-glow" style={{ scaleY }} />
    </div>
  );
}
