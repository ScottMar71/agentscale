import { ImageResponse } from "next/og";
import { LogoMarkImage } from "@/components/brand/logo-mark-image";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(<LogoMarkImage size={180} />, { ...size });
}
