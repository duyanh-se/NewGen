import test from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { prepareImage } from "../src/lib/content/image";
test("image upload decodes allowed formats and stores a real WebP", async () => {
  for (const format of ["jpeg", "png", "webp"] as const) {
    const bytes = await sharp({
      create: { width: 16, height: 12, channels: 3, background: "#21598a" },
    })
      .toFormat(format)
      .toBuffer();
    const out = await prepareImage(
      new File([new Uint8Array(bytes)], "image", { type: "image/" + format }),
    );
    const metadata = await sharp(out).metadata();
    assert.equal(metadata.format, "webp");
    assert.equal(metadata.width, 16);
  }
});
test("image upload rejects fake, empty, oversized, unsupported and huge pixel files", async () => {
  await assert.rejects(
    prepareImage(new File(["not an image"], "fake.png", { type: "image/png" })),
  );
  await assert.rejects(
    prepareImage(new File([], "empty.png", { type: "image/png" })),
  );
  await assert.rejects(
    prepareImage(
      new File([new Uint8Array(5242881)], "large.png", { type: "image/png" }),
    ),
  );
  await assert.rejects(
    prepareImage(new File(["<svg/>"], "x.svg", { type: "image/svg+xml" })),
  );
  const large = await sharp({
    create: { width: 6500, height: 6500, channels: 3, background: "white" },
  })
    .png()
    .toBuffer();
  await assert.rejects(
    prepareImage(
      new File([new Uint8Array(large)], "pixels.png", { type: "image/png" }),
    ),
  );
});
