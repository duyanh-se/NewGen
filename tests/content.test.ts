import test from "node:test";
import assert from "node:assert/strict";
import {
  projectSchema,
  postSchema,
  emptyDocument,
  validDocument,
  slugify,
  pageNumber,
} from "../src/lib/content/model";
const common = {
  id: "",
  slug: "du-an-thu",
  description: "Mô tả",
  content: emptyDocument,
  cover_id: "",
  status: "draft",
  seo_title: "",
  seo_description: "",
};
test("content accepts optional facts and preserves Vietnamese slug conversion", () => {
  const value = projectSchema.parse({
    ...common,
    name: "Dự án thử",
    type: "",
    location: "",
    owner: "",
    area: "",
    year: "",
    construction_status: "unspecified",
    featured: false,
    gallery: [],
  });
  assert.equal(value.area, null);
  assert.equal(value.year, null);
  assert.equal(value.id, null);
  assert.equal(slugify("Điện nước Bắc Ninh"), "dien-nuoc-bac-ninh");
});
test("rejects missing names, duplicate images, invalid slug and invalid facts", () => {
  const base = {
    ...common,
    name: "A",
    type: "",
    location: "",
    owner: "",
    area: "",
    year: "",
    construction_status: "unspecified",
    featured: false,
    gallery: [],
  };
  for (const change of [
    { name: " " },
    { slug: "../admin" },
    { area: 0 },
    { year: 1800 },
    { status: "scheduled" },
    {
      gallery: [
        "00000000-0000-4000-8000-000000000001",
        "00000000-0000-4000-8000-000000000001",
      ],
    },
  ])
    assert.equal(
      projectSchema.safeParse({ ...base, ...change }).success,
      false,
    );
  assert.equal(
    postSchema.safeParse({ ...common, title: "", author: "", category_id: "" })
      .success,
    false,
  );
});
test("rich text allows supported Tiptap output and rejects executable/unknown nodes", () => {
  assert.equal(
    validDocument({
      type: "doc",
      content: [
        {
          type: "orderedList",
          attrs: { start: 1, type: null },
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "<script>alert(1)</script>",
                      marks: [{ type: "bold" }],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: "codeBlock",
          attrs: { language: null },
          content: [{ type: "text", text: "example" }],
        },
      ],
    }),
    true,
  );
  for (const node of [
    { type: "image", attrs: { src: "javascript:alert(1)" } },
    { type: "script" },
    {
      type: "text",
      text: "Click",
      marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }],
    },
  ])
    assert.equal(validDocument({ type: "doc", content: [node] }), false);
  assert.equal(
    validDocument({
      type: "doc",
      content: [{ type: "heading", attrs: { level: 1 }, content: [] }],
    }),
    false,
  );
});
test("pagination clamps malformed and unbounded values", () => {
  assert.equal(pageNumber("0"), 1);
  assert.equal(pageNumber("foo"), 1);
  assert.equal(pageNumber("3"), 3);
  assert.equal(pageNumber("99999999"), 100000);
});
