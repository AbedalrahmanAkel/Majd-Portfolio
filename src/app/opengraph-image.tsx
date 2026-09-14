import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";
import { stripAccentMarkers } from "@/lib/utils";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          backgroundColor: "#120709",
          backgroundImage:
            "radial-gradient(circle at 15% 15%, #4e262c 0%, transparent 48%), radial-gradient(circle at 85% 85%, #6b1524 0%, transparent 52%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              width: 60,
              height: 60,
              borderRadius: 18,
              backgroundColor: "#87202f",
              alignItems: "center",
              justifyContent: "center",
              color: "#f3e5d6",
              fontSize: 26,
              fontWeight: 600,
            }}
          >
            {siteConfig.initials}
          </div>
          <div
            style={{
              display: "flex",
              color: "#dd8e8b",
              fontSize: 24,
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            {siteConfig.role}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              display: "flex",
              color: "#f3e5d6",
              fontSize: 58,
              fontWeight: 600,
              lineHeight: 1.15,
              maxWidth: 980,
            }}
          >
            {stripAccentMarkers(siteConfig.headline)}
          </div>
          <div style={{ display: "flex", color: "#c9a79e", fontSize: 28 }}>
            {siteConfig.name}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
