import fs from "node:fs/promises";
import path from "node:path";

const uploadDir = path.join(process.cwd(), "public", "uploads", "post-images");
const maxBytes = 5 * 1024 * 1024;
const allowedTypes = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

export async function savePostImage(file: File) {
  if (!allowedTypes.has(file.type)) {
    throw new Error("Only PNG, JPEG, WEBP, and GIF images are allowed");
  }

  if (file.size > maxBytes) {
    throw new Error("File size must be under 5MB");
  }

  await fs.mkdir(uploadDir, { recursive: true });

  const filename = `${crypto.randomUUID()}.${extensionForType(file.type)}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(uploadDir, filename), bytes, { flag: "wx" });

  return `/uploads/post-images/${filename}`;
}

function extensionForType(type: string) {
  if (type === "image/jpeg") return "jpg";
  if (type === "image/webp") return "webp";
  if (type === "image/gif") return "gif";
  return "png";
}
