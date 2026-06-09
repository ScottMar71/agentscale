/**
 * Logo mark markup for `next/og` ImageResponse (favicons, apple-touch-icon).
 * Uses hardcoded brand colours — CSS variables are unavailable in icon routes.
 */
export function LogoMarkImage({ size }: { size: number }) {
  const scale = size / 32;
  const barBottom = 11 * scale;
  const barWidth = 3 * scale;
  const barRadius = 1.5 * scale;

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        background: "linear-gradient(135deg, #0b1426 0%, #2563eb 100%)",
        borderRadius: 8 * scale,
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 7.5 * scale,
          bottom: barBottom,
          width: barWidth,
          height: 4 * scale,
          background: "rgba(255, 255, 255, 0.55)",
          borderRadius: barRadius,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 14.5 * scale,
          bottom: barBottom,
          width: barWidth,
          height: 8 * scale,
          background: "rgba(255, 255, 255, 0.8)",
          borderRadius: barRadius,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 21.5 * scale,
          bottom: barBottom,
          width: barWidth,
          height: 12 * scale,
          background: "#06b6d4",
          borderRadius: barRadius,
        }}
      />
    </div>
  );
}
