import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { extractTextFromImage } from "@/lib/ocr";

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "file required" }, { status: 400 });
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Only image uploads are allowed" }, { status: 400 });
  const bytes = Buffer.from(await file.arrayBuffer());
  const uploadDir = path.join(process.cwd(), "uploads");
  await mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}`);
  await writeFile(filePath, bytes);
  const text = await extractTextFromImage(filePath);
  return NextResponse.json({ text, filePath });
}
