begin;

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create function public.is_admin() returns boolean language sql stable security definer
set search_path = '' as $$
  select exists(select 1 from public.admin_users where user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;
alter table public.admin_users enable row level security;
create policy admin_self_read on public.admin_users for select to authenticated using (user_id = auth.uid());
revoke all on public.admin_users from anon, authenticated;
grant select on public.admin_users to authenticated;

create table public.media (
  id uuid primary key default gen_random_uuid(),
  path text not null unique check (path !~ '(^/|\.\.)'),
  alt text not null default '',
  mime_type text not null check (mime_type in ('image/jpeg','image/png','image/webp')),
  size_bytes integer not null check (size_bytes > 0 and size_bytes <= 5242880),
  state text not null default 'ready' check (state in ('ready','deleting')),
  created_at timestamptz not null default now()
);
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 100),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 200),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text not null default '',
  content jsonb not null default '{"type":"doc","content":[]}'::jsonb check (jsonb_typeof(content) = 'object' and coalesce(content->>'type','') = 'doc'),
  type text not null default '',
  location text not null default '',
  owner text not null default '',
  area numeric check (area > 0),
  year integer check (year between 1900 and 2200),
  construction_status text not null default 'unspecified' check (construction_status in ('unspecified','planned','in_progress','completed')),
  featured boolean not null default false,
  cover_id uuid references public.media(id) on delete restrict,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  seo_title text not null default '',
  seo_description text not null default '',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) between 1 and 200),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text not null default '',
  content jsonb not null default '{"type":"doc","content":[]}'::jsonb check (jsonb_typeof(content) = 'object' and coalesce(content->>'type','') = 'doc'),
  cover_id uuid references public.media(id) on delete restrict,
  category_id uuid references public.categories(id) on delete restrict,
  author text not null default '',
  status text not null default 'draft' check (status in ('draft','published','archived')),
  seo_title text not null default '',
  seo_description text not null default '',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.project_images (
  project_id uuid not null references public.projects(id) on delete cascade,
  media_id uuid not null references public.media(id) on delete restrict,
  position integer not null check (position >= 0),
  primary key (project_id, media_id),
  unique(project_id, position)
);
create index projects_public_list on public.projects(status, featured desc, published_at desc);
create index posts_public_list on public.posts(status, published_at desc);
create index project_images_media on public.project_images(media_id);

create function public.content_timestamps() returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  if new.status = 'published' and new.published_at is null then new.published_at := now(); end if;
  return new;
end;
$$;
create trigger project_timestamps before insert or update on public.projects for each row execute function public.content_timestamps();
create trigger post_timestamps before insert or update on public.posts for each row execute function public.content_timestamps();

-- Shared locks prevent a referenced image from entering deletion during a save.
create function public.check_ready_media() returns trigger language plpgsql security definer set search_path = '' as $$
declare target uuid;
begin
  if tg_table_name = 'project_images' then target := new.media_id; else target := new.cover_id; end if;
  if target is not null then
    perform 1 from public.media where id = target and state = 'ready' for share;
    if not found then raise exception 'Ảnh không tồn tại hoặc đang được xóa.' using errcode = '23514'; end if;
  end if;
  return new;
end;
$$;
create trigger ready_project_cover before insert or update of cover_id on public.projects for each row execute function public.check_ready_media();
create trigger ready_post_cover before insert or update of cover_id on public.posts for each row execute function public.check_ready_media();
create trigger ready_gallery before insert or update of media_id on public.project_images for each row execute function public.check_ready_media();

alter table public.projects enable row level security;
alter table public.posts enable row level security;
alter table public.categories enable row level security;
alter table public.media enable row level security;
alter table public.project_images enable row level security;
create policy projects_read on public.projects for select to anon, authenticated using (status = 'published' or public.is_admin());
create policy projects_admin_write on public.projects for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy posts_read on public.posts for select to anon, authenticated using (status = 'published' or public.is_admin());
create policy posts_admin_write on public.posts for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy categories_read on public.categories for select to anon, authenticated using (true);
create policy categories_admin_write on public.categories for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy gallery_read on public.project_images for select to anon, authenticated using (exists(select 1 from public.projects p where p.id = project_id and (p.status = 'published' or public.is_admin())));
create policy gallery_admin_write on public.project_images for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy media_read on public.media for select to anon, authenticated using (
  public.is_admin() or
  exists(select 1 from public.projects p where p.cover_id = media.id and p.status = 'published') or
  exists(select 1 from public.posts p where p.cover_id = media.id and p.status = 'published') or
  exists(select 1 from public.project_images i join public.projects p on p.id = i.project_id where i.media_id = media.id and p.status = 'published')
);
create policy media_insert on public.media for insert to authenticated with check (public.is_admin() and state = 'ready');
create policy media_update on public.media for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy media_delete on public.media for delete to authenticated using (public.is_admin() and state = 'deleting');
revoke all on public.projects, public.posts, public.categories, public.project_images, public.media from anon, authenticated;
grant select on public.projects, public.posts, public.categories, public.project_images, public.media to anon, authenticated;
grant insert, update, delete on public.projects, public.posts, public.categories, public.project_images to authenticated;
grant insert(id, path, alt, mime_type, size_bytes) on public.media to authenticated;
grant update(alt), delete on public.media to authenticated;

-- Update the project and its ordered gallery in one transaction.
create function public.save_project(payload jsonb, gallery uuid[]) returns uuid language plpgsql security invoker set search_path = '' as $$
declare p public.projects; saved_id uuid;
begin
  if not public.is_admin() then raise exception 'Forbidden' using errcode = '42501'; end if;
  p := jsonb_populate_record(null::public.projects, payload);
  saved_id := coalesce(p.id, gen_random_uuid());
  insert into public.projects(id,name,slug,description,content,type,location,owner,area,year,construction_status,featured,cover_id,status,seo_title,seo_description)
  values(saved_id,p.name,p.slug,p.description,p.content,p.type,p.location,p.owner,p.area,p.year,p.construction_status,p.featured,p.cover_id,p.status,p.seo_title,p.seo_description)
  on conflict(id) do update set name=excluded.name,slug=excluded.slug,description=excluded.description,content=excluded.content,type=excluded.type,location=excluded.location,owner=excluded.owner,area=excluded.area,year=excluded.year,construction_status=excluded.construction_status,featured=excluded.featured,cover_id=excluded.cover_id,status=excluded.status,seo_title=excluded.seo_title,seo_description=excluded.seo_description;
  delete from public.project_images where project_id = saved_id;
  insert into public.project_images(project_id,media_id,position) select saved_id, value, ordinality-1 from unnest(gallery) with ordinality as x(value,ordinality);
  return saved_id;
end;
$$;
revoke all on function public.save_project(jsonb,uuid[]) from public;
grant execute on function public.save_project(jsonb,uuid[]) to authenticated;

create function public.begin_media_delete(target_id uuid) returns text language plpgsql security definer set search_path = '' as $$
declare target_path text;
begin
  if not public.is_admin() then raise exception 'Forbidden' using errcode = '42501'; end if;
  select path into target_path from public.media where id = target_id for update;
  if not found then raise exception 'Ảnh không tồn tại.'; end if;
  if exists(select 1 from public.projects where cover_id=target_id) or exists(select 1 from public.posts where cover_id=target_id) or exists(select 1 from public.project_images where media_id=target_id) then
    raise exception 'Ảnh đang được sử dụng. Hãy gỡ ảnh khỏi nội dung trước.' using errcode = '23503';
  end if;
  update public.media set state = 'deleting' where id = target_id;
  return target_path;
end;
$$;
revoke all on function public.begin_media_delete(uuid) from public;
grant execute on function public.begin_media_delete(uuid) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values ('content-images','content-images',true,5242880,array['image/jpeg','image/png','image/webp']);
create policy content_upload on storage.objects for insert to authenticated with check (bucket_id = 'content-images' and public.is_admin());
create policy content_storage_read on storage.objects for select to authenticated using (bucket_id = 'content-images' and public.is_admin());
-- No UPDATE policy: existing files cannot be overwritten.
-- Registered media can only be removed after the deletion transaction checks references.
create policy content_storage_delete on storage.objects for delete to authenticated using (
  bucket_id = 'content-images' and public.is_admin() and not exists(select 1 from public.media m where m.path = name and m.state = 'ready')
);
grant all on public.admin_users, public.projects, public.posts, public.categories, public.project_images, public.media to service_role;
commit;
