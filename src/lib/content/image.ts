import sharp from "sharp";
export async function prepareImage(file: File): Promise<Buffer> {
  if (
    !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
    file.size <= 0 ||
    file.size > 5 * 1024 * 1024
  )
    throw new Error("Chọn ảnh JPEG, PNG hoặc WebP, tối đa 5 MB.");
  try {
    const processor = sharp(Buffer.from(await file.arrayBuffer()), {
      limitInputPixels: 40000000,
      failOn: "warning",
    });
    const metadata = await processor.metadata();
    if (
      !["jpeg", "png", "webp"].includes(metadata.format ?? "") ||
      (metadata.pages && metadata.pages > 1)
    )
      throw new Error("Ảnh không hợp lệ.");
    const buffer = await processor.rotate().webp({ quality: 85 }).toBuffer();
    if (buffer.length > 5 * 1024 * 1024) throw new Error("Ảnh quá lớn.");
    return buffer;
  } catch {
    throw new Error(
      "File không phải ảnh tĩnh hợp lệ hoặc có kích thước quá lớn.",
    );
  }
}
