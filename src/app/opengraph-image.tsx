import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ScholarPilot AI — AI Copilot for Studying Abroad";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #fbf3ee 0%, #ffddc9 45%, #ecd6ff 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "22px", marginBottom: "44px" }}>
          <div
            style={{
              width: "76px",
              height: "76px",
              borderRadius: "20px",
              background: "linear-gradient(135deg, #f2694f, #a06bf0)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "46px",
              fontWeight: 700,
            }}
          >
            S
          </div>
          <div style={{ fontSize: "36px", fontWeight: 700, color: "#3c2e39" }}>ScholarPilot AI</div>
        </div>

        <div style={{ display: "flex", fontSize: "70px", fontWeight: 800, color: "#3c2e39", lineHeight: 1.1, maxWidth: "980px" }}>
          Your dream university, matched by AI.
        </div>

        <div style={{ display: "flex", fontSize: "30px", color: "#7a6070", marginTop: "34px", maxWidth: "960px" }}>
          Universities · Scholarships · Professors · Admission and funding predictions · SOPs and emails
        </div>
      </div>
    ),
    { ...size },
  );
}
