import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { COUPON, CURRENT_LOT, brl, speakers, withCoupon } from "@/lib/event";

export const alt = "Select Experience 2026 · 14 de novembro, São Paulo · 20% off com o cupom PALESTRANTE20";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Faces shown in the collage, picked for recognizability
const FACE_IDS = [
  "sseraphini",
  "mario-souto",
  "erick-wendel",
  "elemar-junior",
  "waldemar-neto",
  "rafael-dohms",
  "felipe-ribeiro",
  "alex-rios",
  "rodrigo-branas",
  "marcela-godoy",
  "henrique-souza",
  "juliano-martins",
];

const root = process.cwd();
const font = (f: string) => readFile(join(root, "assets/fonts", f));

export default async function Image() {
  const [monoBold, monoRegular, sansBold] = await Promise.all([
    font("SpaceMono-Bold.woff"),
    font("SpaceMono-Regular.woff"),
    font("DMSans-Bold.woff"),
  ]);
  const faces = await Promise.all(
    FACE_IDS.map(async (id) => {
      const buf = await readFile(join(root, "public/speakers", `${id}.jpg`));
      return `data:image/jpeg;base64,${buf.toString("base64")}`;
    }),
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#050707",
          color: "#f0efee",
          fontFamily: "DM Sans",
          position: "relative",
        }}
      >
        {/* pink glow */}
        <div
          style={{
            position: "absolute",
            right: -160,
            top: -160,
            width: 620,
            height: 620,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(231,50,136,0.45), rgba(231,50,136,0) 70%)",
          }}
        />

        {/* left column */}
        <div style={{ display: "flex", flexDirection: "column", padding: "56px 0 0 64px", width: 640 }}>
          <div style={{ display: "flex", alignItems: "baseline", fontSize: 44, fontWeight: 700 }}>
            select<span style={{ color: "#e73288", marginLeft: 4 }}>{"//"}</span>
            <span
              style={{
                fontFamily: "Space Mono",
                fontSize: 16,
                letterSpacing: 6,
                color: "rgba(240,239,238,0.55)",
                marginLeft: 16,
              }}
            >
              EXPERIENCE 26
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 104,
              lineHeight: 0.92,
              fontWeight: 700,
              letterSpacing: -4,
              marginTop: 36,
            }}
          >
            <span>Keep</span>
            <span>Getting</span>
            <span style={{ color: "#e73288" }}>Better_</span>
          </div>

          <div
            style={{
              display: "flex",
              fontFamily: "Space Mono",
              fontSize: 20,
              letterSpacing: 2,
              marginTop: 34,
              color: "rgba(240,239,238,0.8)",
            }}
          >
            14 NOV · SÃO PAULO · 300 VAGAS
          </div>
        </div>

        {/* right column: faces */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            width: 480,
            gap: 12,
            padding: "64px 0 0 20px",
            alignContent: "flex-start",
          }}
        >
          {faces.map((src, i) => (
            // eslint-disable-next-line jsx-a11y/alt-text
            <img
              key={i}
              src={src}
              width={102}
              height={102}
              style={{
                borderRadius: 20,
                objectFit: "cover",
                filter: i === 0 ? "none" : "grayscale(100%)",
                border: i === 0 ? "4px solid #e73288" : "4px solid rgba(240,239,238,0.08)",
              }}
            />
          ))}
          <div
            style={{
              display: "flex",
              fontFamily: "Space Mono",
              fontSize: 17,
              color: "rgba(240,239,238,0.6)",
              marginTop: 6,
            }}
          >
            +{speakers.length - faces.length} palestrantes · 30 sessões · 5 salas
          </div>
        </div>

        {/* coupon strip */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 104,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#e73288",
            padding: "0 64px",
            color: "#fff",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontFamily: "Space Mono", fontSize: 16, letterSpacing: 4, opacity: 0.85 }}>
              CUPOM DE PALESTRANTE
            </span>
            <span style={{ fontFamily: "Space Mono", fontWeight: 700, fontSize: 42, letterSpacing: 3 }}>
              {COUPON}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
            <span
              style={{
                fontFamily: "Space Mono",
                fontSize: 24,
                textDecoration: "line-through",
                opacity: 0.7,
              }}
            >
              {brl(CURRENT_LOT.price)}
            </span>
            <span style={{ fontFamily: "Space Mono", fontWeight: 700, fontSize: 48 }}>
              {brl(withCoupon(CURRENT_LOT.price))}
            </span>
            <span
              style={{
                display: "flex",
                background: "#050707",
                borderRadius: 999,
                padding: "8px 18px",
                fontFamily: "Space Mono",
                fontWeight: 700,
                fontSize: 24,
                marginLeft: 8,
              }}
            >
              -20%
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Space Mono", data: monoBold, weight: 700, style: "normal" },
        { name: "Space Mono", data: monoRegular, weight: 400, style: "normal" },
        { name: "DM Sans", data: sansBold, weight: 700, style: "normal" },
      ],
    },
  );
}
