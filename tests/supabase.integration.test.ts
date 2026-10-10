import test from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import {
  contentClient,
  checked,
  requiredData,
} from "../scripts/content-client";
const enabled = process.env.RUN_SUPABASE_INTEGRATION === "1";
test(
  "live Supabase: anonymous/non-admin access, publish/unpublish, Storage and reference protection",
  { skip: !enabled },
  async () => {
    const service = contentClient();
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
    const options = {
      auth: { persistSession: false, autoRefreshToken: false },
    };
    const admin = createClient(url, key, options),
      outsider = createClient(url, key, options),
      anon = createClient(url, key, options);
    const tag = crypto.randomUUID();
    const password = crypto.randomUUID() + "!Aa1";
    const userIds: string[] = [];
    const image = crypto.randomUUID(),
      project = crypto.randomUUID(),
      post = crypto.randomUUID();
    const path = "integration/" + tag + ".webp";
    try {
      for (const role of ["admin", "outsider"]) {
        const result = await service.auth.admin.createUser({
          email: role + "-" + tag + "@example.com",
          password,
          email_confirm: true,
        });
        const user = requiredData(result).user;
        if (!user) throw new Error("Không tạo được tài khoản test.");
        userIds.push(user.id);
      }
      checked(
        await service.from("admin_users").insert({ user_id: userIds[0] }),
      );
      checked(
        await admin.auth.signInWithPassword({
          email: "admin-" + tag + "@example.com",
          password,
        }),
      );
      checked(
        await outsider.auth.signInWithPassword({
          email: "outsider-" + tag + "@example.com",
          password,
        }),
      );
      const bytes = await sharp({
        create: { width: 8, height: 8, channels: 3, background: "#21598a" },
      })
        .webp()
        .toBuffer();
      checked(
        await admin.storage
          .from("content-images")
          .upload(path, bytes, { contentType: "image/webp" }),
      );
      checked(
        await admin
          .from("media")
          .insert({
            id: image,
            path,
            alt: "Test",
            mime_type: "image/webp",
            size_bytes: bytes.length,
          }),
      );
      checked(
        await admin
          .from("projects")
          .insert({
            id: project,
            name: "Integration test",
            slug: "test-" + tag,
            cover_id: image,
            status: "draft",
          }),
      );
      checked(
        await admin
          .from("posts")
          .insert({
            id: post,
            title: "Integration test",
            slug: "test-" + tag,
            cover_id: image,
            status: "draft",
          }),
      );
      for (const client of [anon, outsider]) {
        assert.equal(
          requiredData(
            await client.from("projects").select("id").eq("id", project),
          ).length,
          0,
        );
        assert.equal(
          requiredData(await client.from("posts").select("id").eq("id", post))
            .length,
          0,
        );
        assert.ok(
          (
            await client
              .from("posts")
              .insert({ title: "Illegal", slug: "illegal-" + tag })
          ).error,
        );
        assert.ok(
          (
            await client.storage
              .from("content-images")
              .upload("forbidden-" + tag + ".webp", bytes, {
                contentType: "image/webp",
              })
          ).error,
        );
      }
      assert.ok(
        (await outsider.from("admin_users").insert({ user_id: userIds[1] }))
          .error,
      );
      for (const table of ["projects", "posts"]) {
        const id = table === "projects" ? project : post;
        checked(
          await admin.from(table).update({ status: "published" }).eq("id", id),
        );
        assert.equal(
          requiredData(await anon.from(table).select("id").eq("id", id)).length,
          1,
        );
        checked(
          await admin.from(table).update({ status: "draft" }).eq("id", id),
        );
        assert.equal(
          requiredData(await anon.from(table).select("id").eq("id", id)).length,
          0,
        );
      }
      assert.ok(
        (await admin.rpc("begin_media_delete", { target_id: image })).error,
      );
      const directDelete = await admin.storage
        .from("content-images")
        .remove([path]);
      const stillThere = await service.storage
        .from("content-images")
        .download(path);
      assert.equal(stillThere.error, null);
      assert.ok(directDelete.error || directDelete.data?.length === 0);
      const download = requiredData(stillThere);
      assert.deepEqual(Buffer.from(await download.arrayBuffer()), bytes);
      checked(
        await admin
          .from("projects")
          .update({ cover_id: null })
          .eq("id", project),
      );
      checked(
        await admin.from("posts").update({ cover_id: null }).eq("id", post),
      );
      checked(await admin.rpc("begin_media_delete", { target_id: image }));
      checked(await admin.storage.from("content-images").remove([path]));
      checked(await admin.from("media").delete().eq("id", image));
    } finally {
      checked(await service.from("projects").delete().eq("id", project));
      checked(await service.from("posts").delete().eq("id", post));
      checked(await service.from("media").delete().eq("id", image));
      await service.storage.from("content-images").remove([path]);
      for (const id of userIds) await service.auth.admin.deleteUser(id);
    }
  },
);
