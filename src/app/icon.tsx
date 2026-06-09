import { ImageResponse } from "next/og";
import { LogoMarkImage } from "@/components/brand/logo-mark-image";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(<LogoMarkImage size={32} />, { ...size });
}
