import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || siteConfig.name;
  const subtitle = searchParams.get("subtitle") || siteConfig.description;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #eaf4ff 0%, #f8fafc 48%, #e8fff8 100%)",
          color: "#07111f",
          padding: 72,
          fontFamily: "Arial",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: -120,
            top: 120,
            width: 440,
            height: 440,
            borderRadius: 80,
            background: "rgba(37,99,235,0.16)",
            transform: "rotate(18deg)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -90,
            bottom: -80,
            width: 520,
            height: 520,
            borderRadius: 100,
            background: "rgba(20,184,166,0.18)",
            transform: "rotate(-12deg)",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "#111827",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            W
          </div>
          <div style={{ fontSize: 30, fontWeight: 700 }}>{siteConfig.name}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 820 }}>
          <div style={{ fontSize: 78, fontWeight: 800, lineHeight: 1.02, letterSpacing: -2 }}>
            {title}
          </div>
          <div style={{ fontSize: 28, lineHeight: 1.4, color: "#475569" }}>{subtitle}</div>
        </div>
        <div style={{ display: "flex", gap: 16, color: "#475569", fontSize: 24 }}>
          <span>Articles</span>
          <span>•</span>
          <span>Tags</span>
          <span>•</span>
          <span>Knowledge Graph</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
