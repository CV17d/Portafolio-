import { ImageResponse } from "next/og";

// Tarjeta que aparece al compartir el enlace en LinkedIn, WhatsApp, X, etc.
export const alt = "Cristian Velasco · Desarrollador Full-Stack";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "radial-gradient(circle at 85% 20%, #3a2214 0%, #17120f 55%)",
          color: "#f3e9dc",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 22,
              background: "#e8702a",
              color: "#1a1412",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 48,
              fontWeight: 700,
            }}
          >
            CV
          </div>
          <div style={{ fontSize: 28, color: "#b9a895", letterSpacing: 4 }}>PORTAFOLIO · PORTFOLIO</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 104, fontWeight: 700, lineHeight: 1 }}>Cristian</div>
          <div style={{ fontSize: 104, fontWeight: 700, lineHeight: 1, color: "#f08a46" }}>Velasco</div>
          <div style={{ marginTop: 28, fontSize: 40 }}>Desarrollador Full-Stack · Full-Stack Developer</div>
          <div style={{ marginTop: 12, fontSize: 28, color: "#b9a895" }}>Web · Móvil · IoT · Wear OS · AWS</div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 28 }}>
          <div style={{ color: "#5fdbe9" }}>Pregúntale a Nigi, el robot bibliotecario</div>
          <div style={{ color: "#b9a895" }}>portafolio-cristian-lime.vercel.app</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
