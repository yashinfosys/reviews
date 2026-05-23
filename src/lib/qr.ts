import QRCode from "qrcode";
import { absoluteUrl } from "@/lib/utils";

export async function createQrDataUrl(pathOrUrl: string) {
  const url = pathOrUrl.startsWith("http") ? pathOrUrl : absoluteUrl(pathOrUrl);
  return QRCode.toDataURL(url, { margin: 2, width: 512, color: { dark: "#0f766e", light: "#ffffff" } });
}
