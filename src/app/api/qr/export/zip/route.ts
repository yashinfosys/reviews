import QRCode from "qrcode";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

function crc32(buffer: Buffer) {
  let crc = -1;
  for (const byte of buffer) {
    crc ^= byte;
    for (let index = 0; index < 8; index += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ -1) >>> 0;
}

function u16(value: number) {
  const buffer = Buffer.alloc(2);
  buffer.writeUInt16LE(value);
  return buffer;
}

function u32(value: number) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32LE(value);
  return buffer;
}

function safeName(name: string) {
  return name.replace(/[^a-z0-9._-]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "qr-code";
}

export async function GET() {
  const user = await getCurrentUser();
  const qrCodes = await prisma.qRCode.findMany({
    where: user?.businessId ? { businessId: user.businessId, isActive: true } : { isActive: true },
    orderBy: { createdAt: "desc" }
  });
  const files = await Promise.all(qrCodes.map(async (qr) => ({
    name: `${safeName(qr.label)}-${qr.id}.svg`,
    data: Buffer.from(await QRCode.toString(qr.destinationUrl, { type: "svg", margin: 2, width: 512 }), "utf8")
  })));

  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let offset = 0;
  for (const file of files) {
    const name = Buffer.from(file.name, "utf8");
    const crc = crc32(file.data);
    const local = Buffer.concat([
      u32(0x04034b50), u16(20), u16(0), u16(0), u16(0), u16(0), u32(crc), u32(file.data.length), u32(file.data.length), u16(name.length), u16(0), name, file.data
    ]);
    localParts.push(local);
    centralParts.push(Buffer.concat([
      u32(0x02014b50), u16(20), u16(20), u16(0), u16(0), u16(0), u16(0), u32(crc), u32(file.data.length), u32(file.data.length), u16(name.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset), name
    ]));
    offset += local.length;
  }
  const central = Buffer.concat(centralParts);
  const end = Buffer.concat([u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length), u32(central.length), u32(offset), u16(0)]);
  const zip = Buffer.concat([...localParts, central, end]);

  return new NextResponse(zip, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": "attachment; filename=reviewboost-qr-codes.zip"
    }
  });
}
