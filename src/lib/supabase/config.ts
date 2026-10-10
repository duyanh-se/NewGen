export function supabaseConfig() {
  // Server-only usage: read the runtime environment instead of freezing keys at build time.
  const environment = process.env;
  const url = environment.NEXT_PUBLIC_SUPABASE_URL;
  const key = environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key)
    throw new Error("Chưa cấu hình Supabase. Xem hướng dẫn trong README.");
  return { url, key };
}
export function hasSupabaseConfig() {
  const environment = process.env;
  return !!(
    environment.NEXT_PUBLIC_SUPABASE_URL &&
    environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}
