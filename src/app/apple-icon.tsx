import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#09090b",
        }}
      >
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #1d4ed8, #f97316)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 72,
          }}
        >
          🌍
        </div>
      </div>
    ),
    { ...size },
  );
}
