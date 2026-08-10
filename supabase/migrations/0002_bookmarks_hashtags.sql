-- SyntaxHub — Migration 0002 : Bookmarks (posts enregistrés) + Hashtags tendance.

-- ---------------------------------------------------------------------------
-- Bookmarks : un utilisateur peut enregistrer des posts.
-- ---------------------------------------------------------------------------
create table public.saved_posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  post_id uuid not null references public.posts (id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, post_id)
);

create index saved_posts_user_id_idx on public.saved_posts (user_id, created_at desc);

alter table public.saved_posts enable row level security;

create policy "Saved posts are viewable by everyone"
  on public.saved_posts for select
  using (true);

create policy "Users can save/un-save posts"
  on public.saved_posts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Hashtags : suivi des tendances pour la section "Tendances".
-- ---------------------------------------------------------------------------
create table public.trending_hashtags (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  count int not null default 0,
  last_seen_at timestamptz default now()
);

alter table public.trending_hashtags enable row level security;

create policy "Trending hashtags are viewable by everyone"
  on public.trending_hashtags for select
  using (true);

-- incrémente le compteur d'un hashtag (fonction sécurisée)
create or replace function public.upsert_hashtag(p_name text)
returns void
language sql
security definer
as $$
  insert into public.trending_hashtags (name, count, last_seen_at)
  values (lower(p_name), 1, now())
  on conflict (name)
  do update set count = public.trending_hashtags.count + 1,
                last_seen_at = now();
$$;
