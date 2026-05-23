import { createWorker } from "tesseract.js";

export async function extractTextFromImage(filePath: string) {
  const worker = await createWorker("eng");
  const result = await worker.recognize(filePath);
  await worker.terminate();
  return result.data.text.trim();
}
