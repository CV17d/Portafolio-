"use client";

import { useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, Loader2, Mail, Send } from "lucide-react";
import Section from "./Section";
import { GithubIcon, LinkedinIcon } from "./Icons";
import { Reveal } from "./fx";
import { contact } from "@/data/portfolio";

// Los mensajes llegan al correo de Cristian a través de Formspree.
const FORMSPREE = "https://formspree.io/f/xqpqzbnq";

export default function Contact() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("sending");
    try {
      const res = await fetch(FORMSPREE, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  const field = "w-full rounded-xl border border-line bg-card px-4 py-3 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30";
  const card = "flex items-center gap-3 rounded-2xl border border-line bg-card p-4 font-medium transition hover:-translate-y-0.5 hover:border-accent hover:shadow-lg";

  return (
    <Section id="contacto" kicker="Capítulo 6" title="Hablemos">
      <div className="grid gap-10 lg:grid-cols-2">
        <Reveal>
          <p className="text-lg text-ink-soft">¿Tienes un proyecto, una vacante o una idea? Escríbeme y te respondo pronto.</p>
          <ul className="mt-8 space-y-3">
            <li>
              <a href={`mailto:${contact.email}`} className={card}>
                <Mail size={20} className="shrink-0 text-accent" aria-hidden /><span className="break-all">{contact.email}</span>
              </a>
            </li>
            <li>
              <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className={card}>
                <LinkedinIcon className="text-[#0a66c2]" /> LinkedIn
              </a>
            </li>
            <li>
              <a href={contact.github} target="_blank" rel="noopener noreferrer" className={card}>
                <GithubIcon /> GitHub · CV17d
              </a>
            </li>
          </ul>
        </Reveal>

        <Reveal delay={0.15}>
        <form onSubmit={onSubmit} className="grid gap-4 rounded-3xl border border-line bg-paper-2 p-6">
          <label className="grid gap-1.5 text-sm font-medium">
            Nombre
            <input name="nombre" required minLength={2} placeholder="Tu nombre" className={field} />
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            Correo
            <input name="email" type="email" required placeholder="tu@correo.com" className={field} />
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            Mensaje
            <textarea name="mensaje" required minLength={10} rows={5} placeholder="Cuéntame en qué puedo ayudarte" className={field} />
          </label>
          <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
          <input type="hidden" name="_subject" value="Nuevo mensaje desde tu portafolio" />
          <button disabled={status === "sending"} className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent py-3.5 font-semibold text-accent-ink transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70">
            {status === "sending" ? <Loader2 size={17} className="animate-spin" aria-hidden /> : <Send size={17} aria-hidden />}
            {status === "sending" ? "Enviando…" : "Enviar mensaje"}
          </button>
          <p role="status" aria-live="polite" className={`flex min-h-6 items-center justify-center gap-2 text-center font-medium ${status === "error" ? "text-red-500" : "text-accent"}`}>
            {status === "sent" && (<><CheckCircle2 size={18} aria-hidden /> ¡Mensaje enviado! Te responderé pronto.</>)}
            {status === "error" && (<><AlertCircle size={18} className="shrink-0" aria-hidden /> No se pudo enviar. Escríbeme directo a {contact.email}</>)}
          </p>
        </form>
        </Reveal>
      </div>
    </Section>
  );
}
