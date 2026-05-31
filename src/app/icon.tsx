import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #18181b 0%, #09090b 100%)",
          borderRadius: 96,
        }}
      >
        <div
          style={{
            width: 340,
            height: 340,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #1d4ed8 0%, #059669 55%, #f97316 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 60px rgba(249, 115, 22, 0.45)",
          }}
        >
          <div
            style={{
              fontSize: 160,
              lineHeight: 1,
            }}
          >
            🌍
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
