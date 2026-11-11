# Portafolio · Cristian Velasco

Portafolio de **Cristian Javier Velasco Burbano**, desarrollador full-stack.

**🌐 En vivo: https://portafolio-cristian-lime.vercel.app**

Tiene dos formas de recorrerlo:

- **La biblioteca de Nigi** (3D): un robot bibliotecario que, cuando le pides algo, sube por la escalera, trae el libro y te lo lee en voz alta.
- **Modo lectura**: el portafolio clásico con todas las secciones.

## Secciones

Inicio · Sobre mí · Proyectos · Testimonios · Experiencia · Visitas empresariales · Contacto · Certificados e idiomas

## Tecnologías

- **Next.js 16** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS v4** · **motion** (animaciones)
- **three.js** · **React Three Fiber** · **drei** · postprocesado (la biblioteca 3D)
- **Web Audio**: voz de Nigi pregenerada con VoiceStudio (`public/voice/`), con la voz del navegador como respaldo
- **Formspree**: formulario de contacto
- Despliegue en **Vercel**

## Desarrollo

```bash
npm install
npm run dev
```

Abre http://localhost:3000.

## Regenerar la voz de Nigi

Si cambias textos en `lib/chapters.ts` o `lib/intents.ts`, con VoiceStudio abierto en `http://127.0.0.1:3900`:

```bash
npx tsx scripts/voice-lines.ts > scripts/voice/lines.json
python scripts/voice/generate.py
```

Solo se generan los audios que falten.

## Estructura

| Carpeta | Contenido |
|---|---|
| `data/portfolio.ts` | Todos los datos: perfil, proyectos, testimonios, experiencia, visitas, certificados |
| `components/` | Secciones del portafolio clásico y efectos (`fx/`) |
| `components/library3d/` | Escena 3D, robot Nigi y su coreografía |
| `components/library/` | Interfaz de la biblioteca y lector de libros |
| `lib/` | Capítulos de los libros, intención de las preguntas, voz |
| `scripts/voice/` | Generación de los audios de Nigi |
