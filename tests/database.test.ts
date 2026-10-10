import test from "node:test";
import assert from "node:assert/strict";
import { testDatabase } from "./fixtures/database";
const admin = "00000000-0000-4000-8000-000000000001";
const outsider = "00000000-0000-4000-8000-000000000002";
const image = "00000000-0000-4000-8000-000000000003";
const project = "00000000-0000-4000-8000-000000000004";
const post = "00000000-0000-4000-8000-000000000005";
test("PostgreSQL migration enforces publication, admin access, atomic gallery and safe media deletion", async (t) => {
  const db = await testDatabase();
  await db.query("insert into auth.users values ($1),($2)", [admin, outsider]);
  await db.query("insert into public.admin_users(user_id) values ($1)", [
    admin,
  ]);
  async function as(role: string, id = "") {
    await db.exec("reset role");
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [id]);
    await db.exec("set role " + role);
  }
  const payload = {
    id: project,
    name: "Công trình thử",
    slug: "cong-trinh-thu",
    description: "",
    content: { type: "doc", content: [] },
    type: "Nhà ở",
    location: "Bắc Ninh",
    owner: "",
    area: null,
    year: null,
    construction_status: "unspecified",
    featured: false,
    cover_id: image,
    status: "draft",
    seo_title: "",
    seo_description: "",
  };
  await t.test(
    "admin can upload/register image and save draft project/post",
    async () => {
      await as("authenticated", admin);
      await db.query(
        "insert into storage.objects(bucket_id,name) values ('content-images','test.webp')",
      );
      await db.query(
        "insert into public.media(id,path,alt,mime_type,size_bytes) values ($1,'test.webp','Ảnh thử','image/webp',100)",
        [image],
      );
      await db.query("select public.save_project($1::jsonb,$2::uuid[])", [
        JSON.stringify(payload),
        [image],
      ]);
      await db.query(
        "insert into public.posts(id,title,slug,cover_id) values ($1,'Bài thử','bai-thu',$2)",
        [post, image],
      );
      assert.equal(
        (await db.query("select * from public.projects")).rows.length,
        1,
      );
    },
  );
  await t.test(
    "anonymous cannot read drafts/gallery/media metadata or write",
    async () => {
      await as("anon");
      for (const table of ["projects", "posts", "project_images", "media"])
        assert.equal(
          (await db.query("select * from public." + table)).rows.length,
          0,
        );
      await assert.rejects(
        db.exec("insert into public.projects(name,slug) values ('X','x')"),
      );
      await assert.rejects(
        db.exec(
          "insert into storage.objects(bucket_id,name) values ('content-images','anon.webp')",
        ),
      );
      await assert.rejects(
        db.query("select public.save_project($1::jsonb,$2::uuid[])", [
          JSON.stringify(payload),
          [],
        ]),
      );
    },
  );
  await t.test(
    "authenticated non-admin cannot self-promote or mutate content/storage",
    async () => {
      await as("authenticated", outsider);
      assert.equal(
        (await db.query("select * from public.projects")).rows.length,
        0,
      );
      await assert.rejects(
        db.query("insert into public.admin_users(user_id) values ($1)", [
          outsider,
        ]),
      );
      await assert.rejects(
        db.exec("insert into public.posts(title,slug) values ('X','x')"),
      );
      await assert.rejects(
        db.exec(
          "insert into storage.objects(bucket_id,name) values ('content-images','outsider.webp')",
        ),
      );
      assert.equal(
        (
          await db.query(
            "update public.projects set name='Hacked' returning id",
          )
        ).rows.length,
        0,
      );
      assert.equal(
        (await db.query("delete from storage.objects returning id")).rows
          .length,
        0,
      );
      await assert.rejects(
        db.query("select public.save_project($1::jsonb,$2::uuid[])", [
          JSON.stringify(payload),
          [],
        ]),
      );
    },
  );
  await t.test(
    "publish exposes content and unpublish removes it immediately",
    async () => {
      await as("authenticated", admin);
      await db.query(
        "update public.projects set status='published' where id=$1",
        [project],
      );
      await db.query("update public.posts set status='published' where id=$1", [
        post,
      ]);
      await as("anon");
      for (const table of ["projects", "posts", "project_images", "media"])
        assert.equal(
          (await db.query("select * from public." + table)).rows.length,
          1,
        );
      assert.ok(
        (
          await db.query<{ published_at: string }>(
            "select published_at from public.posts",
          )
        ).rows[0].published_at,
      );
      await as("authenticated", admin);
      await db.exec(
        "update public.projects set status='draft';update public.posts set status='archived'",
      );
      await as("anon");
      for (const table of ["projects", "posts", "project_images", "media"])
        assert.equal(
          (await db.query("select * from public." + table)).rows.length,
          0,
        );
    },
  );
  await t.test(
    "duplicate slugs fail and invalid galleries roll back the whole save",
    async () => {
      await as("authenticated", admin);
      await assert.rejects(
        db.exec(
          "insert into public.projects(name,slug) values ('Trùng','cong-trinh-thu')",
        ),
      );
      await assert.rejects(
        db.query("select public.save_project($1::jsonb,$2::uuid[])", [
          JSON.stringify({ ...payload, name: "Should roll back" }),
          ["00000000-0000-4000-8000-000000000099"],
        ]),
      );
      assert.equal(
        (await db.query<{ name: string }>("select name from public.projects"))
          .rows[0].name,
        payload.name,
      );
      assert.equal(
        (await db.query("select * from public.project_images")).rows.length,
        1,
      );
    },
  );
  await t.test(
    "referenced media cannot be deleted through DB or Storage",
    async () => {
      await as("authenticated", admin);
      await assert.rejects(
        db.query("select public.begin_media_delete($1)", [image]),
      );
      assert.equal(
        (await db.query("delete from public.media returning id")).rows.length,
        0,
      );
      assert.equal(
        (await db.query("delete from storage.objects returning id")).rows
          .length,
        0,
      );
      await assert.rejects(db.exec("update public.media set state='deleting'"));
      assert.equal(
        (
          await db.query(
            "update storage.objects set name='replacement.webp' returning id",
          )
        ).rows.length,
        0,
      );
    },
  );
  await t.test(
    "unused media enters deletion and cannot be attached again",
    async () => {
      await as("authenticated", admin);
      await db.exec(
        "update public.projects set cover_id=null;update public.posts set cover_id=null;delete from public.project_images",
      );
      await db.query("select public.begin_media_delete($1)", [image]);
      await assert.rejects(
        db.query("update public.projects set cover_id=$1", [image]),
      );
      assert.equal(
        (await db.query("delete from storage.objects returning id")).rows
          .length,
        1,
      );
      assert.equal(
        (await db.query("delete from public.media returning id")).rows.length,
        1,
      );
    },
  );
  await t.test(
    "content and media restore preserves gallery order and publication",
    async () => {
      await as("postgres");
      await db.exec(
        "truncate public.project_images,public.projects,public.posts,public.media,public.categories",
      );
      const second = "00000000-0000-4000-8000-000000000006";
      await db.query(
        "insert into public.media(id,path,mime_type,size_bytes) values ($1,'restore-a.webp','image/webp',100),($2,'restore-b.webp','image/webp',120)",
        [image, second],
      );
      await as("authenticated", admin);
      await db.query("select public.save_project($1::jsonb,$2::uuid[])", [
        JSON.stringify({ ...payload, status: "published" }),
        [second, image],
      ]);
      await db.query(
        "insert into public.posts(id,title,slug,cover_id,status) values ($1,'Bài thử','bai-thu',$2,'published')",
        [post, image],
      );
      await as("postgres");
      const snapshot: Record<string, Record<string, unknown>[]> = {};
      for (const table of ["media", "projects", "posts", "project_images"])
        snapshot[table] = (
          await db.query<Record<string, unknown>>(
            "select * from public." + table,
          )
        ).rows;
      await db.exec(
        "truncate public.project_images,public.projects,public.posts,public.media",
      );
      for (const table of ["media", "projects", "posts", "project_images"])
        for (const row of snapshot[table]) {
          const keys = Object.keys(row);
          await db.query(
            "insert into public." +
              table +
              " (" +
              keys.join(",") +
              ") values (" +
              keys.map((_, i) => "$" + (i + 1)).join(",") +
              ")",
            keys.map((k) =>
              typeof row[k] === "object" && row[k] !== null
                ? JSON.stringify(row[k])
                : row[k],
            ),
          );
        }
      await as("anon");
      assert.equal(
        (await db.query("select * from public.projects")).rows.length,
        1,
      );
      assert.equal(
        (await db.query("select * from public.posts")).rows.length,
        1,
      );
      assert.deepEqual(
        (
          await db.query<{ media_id: string }>(
            "select media_id from public.project_images order by position",
          )
        ).rows.map((r) => r.media_id),
        [second, image],
      );
    },
  );
  await db.close();
});
