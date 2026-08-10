-- ============================================================================
-- SyntaxHub — Schéma initial
-- À exécuter dans le SQL Editor de Supabase (ou via supabase db push)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Extensions
-- ----------------------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- ----------------------------------------------------------------------------
-- Trigger : créer automatiquement un profil lors de l'inscription
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, username, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', 'Développeur'),
    coalesce(
      new.raw_user_meta_data ->> 'user_name',
      new.raw_user_meta_data ->> 'preferred_username',
      'dev_' || substr(new.id::text, 1, 8)
    ),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Profiles
-- ----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique not null,
  full_name text,
  avatar_url text,
  banner_url text,
  bio text,
  title text,
  location text,
  website text,
  github_username text,
  github_url text,
  tech_stack text[] default '{}',
  is_verified boolean default false,
  followers_count int default 0,
  following_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- Posts (fil d'actualité)
-- ----------------------------------------------------------------------------
create table public.posts (
  id uuid primary key default uuid_generate_v4(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  image_url text,
  source text not null default 'manual', -- manual | github | devto | reddit
  source_url text,
  likes_count int default 0,
  comments_count int default 0,
  shares_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index posts_created_at_idx on public.posts (created_at desc);
create index posts_author_id_idx on public.posts (author_id);

alter table public.posts enable row level security;

create policy "Posts are viewable by everyone"
  on public.posts for select
  using (true);

create policy "Users can insert their own posts"
  on public.posts for insert
  with check (auth.uid() = author_id);

create policy "Users can update their own posts"
  on public.posts for update
  using (auth.uid() = author_id);

create policy "Users can delete their own posts"
  on public.posts for delete
  using (auth.uid() = author_id);

-- ----------------------------------------------------------------------------
-- Likes
-- ----------------------------------------------------------------------------
create table public.likes (
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz default now(),
  primary key (post_id, user_id)
);

alter table public.likes enable row level security;

create policy "Likes are viewable by everyone"
  on public.likes for select
  using (true);

create policy "Users can like/unlike"
  on public.likes for all
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- Comments
-- ----------------------------------------------------------------------------
create table public.comments (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  likes_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index comments_post_id_idx on public.comments (post_id, created_at);

alter table public.comments enable row level security;

create policy "Comments are viewable by everyone"
  on public.comments for select
  using (true);

create policy "Users can insert comments"
  on public.comments for insert
  with check (auth.uid() = author_id);

create policy "Users can delete their own comments"
  on public.comments for delete
  using (auth.uid() = author_id);

-- ----------------------------------------------------------------------------
-- Follows
-- ----------------------------------------------------------------------------
create table public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, following_id)
);

alter table public.follows enable row level security;

create policy "Follows are viewable by everyone"
  on public.follows for select
  using (true);

create policy "Users can follow/unfollow"
  on public.follows for all
  using (auth.uid() = follower_id);

-- ----------------------------------------------------------------------------
-- Conversations & messages (messagerie temps réel)
-- ----------------------------------------------------------------------------
create table public.conversations (
  id uuid primary key default uuid_generate_v4(),
  is_group boolean default false,
  title text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.conversation_members (
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  last_read_at timestamptz default now(),
  primary key (conversation_id, user_id)
);

create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  message_type text default 'text',
  created_at timestamptz default now()
);

create index messages_conversation_idx on public.messages (conversation_id, created_at);

alter table public.messages enable row level security;

create policy "Messages are viewable by conversation members"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversation_members cm
      where cm.conversation_id = messages.conversation_id
        and cm.user_id = auth.uid()
    )
  );

create policy "Users can send messages in their conversations"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversation_members cm
      where cm.conversation_id = messages.conversation_id
        and cm.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- Notifications (temps réel)
-- ----------------------------------------------------------------------------
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,
  type text not null, -- like | comment | follow | message | community | challenge
  entity_id uuid,
  content text,
  is_read boolean default false,
  created_at timestamptz default now()
);

create index notifications_recipient_idx on public.notifications (recipient_id, created_at desc);

alter table public.notifications enable row level security;

create policy "Users can view their own notifications"
  on public.notifications for select
  using (auth.uid() = recipient_id);

create policy "Users can update their own notifications"
  on public.notifications for update
  using (auth.uid() = recipient_id);

create policy "System can insert notifications"
  on public.notifications for insert
  with check (true);

-- ----------------------------------------------------------------------------
-- Communities
-- ----------------------------------------------------------------------------
create table public.communities (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  image text,
  cover text,
  category text,
  is_public boolean default true,
  created_by uuid references public.profiles (id) on delete set null,
  members_count int default 0,
  created_at timestamptz default now()
);

alter table public.communities enable row level security;

create policy "Communities are viewable by everyone"
  on public.communities for select
  using (true);

create policy "Authenticated users can create communities"
  on public.communities for insert
  with check (auth.uid() is not null);

create table public.community_members (
  community_id uuid not null references public.communities (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text default 'member', -- member | admin | moderator
  joined_at timestamptz default now(),
  primary key (community_id, user_id)
);

alter table public.community_members enable row level security;

create policy "Members are viewable by everyone"
  on public.community_members for select
  using (true);

create policy "Users can join communities"
  on public.community_members for insert
  with check (auth.uid() = user_id);

create table public.community_posts (
  id uuid primary key default uuid_generate_v4(),
  community_id uuid not null references public.communities (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  likes_count int default 0,
  comments_count int default 0,
  shares_count int default 0,
  created_at timestamptz default now()
);

alter table public.community_posts enable row level security;

create policy "Community posts are viewable by everyone"
  on public.community_posts for select
  using (true);

create policy "Members can post in communities"
  on public.community_posts for insert
  with check (
    exists (
      select 1 from public.community_members cm
      where cm.community_id = community_posts.community_id
        and cm.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- Jobs & projets
-- ----------------------------------------------------------------------------
create table public.jobs (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  company text not null,
  company_logo text,
  location text,
  category text,
  contract_type text,
  salary_min int,
  salary_max int,
  salary_currency text default 'EUR',
  is_free boolean default false,
  description text,
  requirements text[],
  is_remote boolean default true,
  posted_by uuid references public.profiles (id) on delete set null,
  listed_ago text,
  created_at timestamptz default now()
);

alter table public.jobs enable row level security;

create policy "Jobs are viewable by everyone"
  on public.jobs for select
  using (true);

create policy "Users can post jobs"
  on public.jobs for insert
  with check (auth.uid() is not null);

-- ----------------------------------------------------------------------------
-- Shorts / tutoriels vidéo
-- ----------------------------------------------------------------------------
create table public.shorts (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  video_url text,
  poster text,
  audio text,
  source text default 'manual',
  source_url text,
  created_by uuid references public.profiles (id) on delete set null,
  likes_count int default 0,
  comments_count int default 0,
  shares_count int default 0,
  created_at timestamptz default now()
);

alter table public.shorts enable row level security;

create policy "Shorts are viewable by everyone"
  on public.shorts for select
  using (true);

create policy "Users can add shorts"
  on public.shorts for insert
  with check (auth.uid() is not null);

-- ----------------------------------------------------------------------------
-- Défis & compétitions
-- ----------------------------------------------------------------------------
create table public.challenges (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  category text,
  difficulty text, -- débutant | intermédiaire | avancé
  image text,
  participants_count int default 0,
  ends_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz default now()
);

alter table public.challenges enable row level security;

create policy "Challenges are viewable by everyone"
  on public.challenges for select
  using (true);

create policy "Users can create challenges"
  on public.challenges for insert
  with check (auth.uid() is not null);

create table public.challenge_participants (
  challenge_id uuid not null references public.challenges (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  score int default 0,
  created_at timestamptz default now(),
  primary key (challenge_id, user_id)
);

alter table public.challenge_participants enable row level security;

create policy "Participants are viewable by everyone"
  on public.challenge_participants for select
  using (true);

create policy "Users can join challenges"
  on public.challenge_participants for insert
  with check (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- Actualités tech (articles)
-- ----------------------------------------------------------------------------
create table public.news (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  summary text,
  body text,
  image text,
  source text not null default 'manual', -- manual | devto | reddit | github
  source_url text,
  author text,
  created_at timestamptz default now()
);

alter table public.news enable row level security;

create policy "News are viewable by everyone"
  on public.news for select
  using (true);

create policy "Users can add news"
  on public.news for insert
  with check (auth.uid() is not null);

-- ----------------------------------------------------------------------------
-- Fonctions utilitaires : compteurs
-- ----------------------------------------------------------------------------
create or replace function public.increment_post_likes(post_id uuid, delta int)
returns void
language sql
security definer set search_path = public
as $$
  update public.posts
  set likes_count = greatest(0, likes_count + delta)
  where id = post_id;
$$;

create or replace function public.increment_post_comments(post_id uuid, delta int)
returns void
language sql
security definer set search_path = public
as $$
  update public.posts
  set comments_count = greatest(0, comments_count + delta)
  where id = post_id;
$$;

create or replace function public.update_follows_counts()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.profiles set followers_count = followers_count + 1 where id = new.following_id;
    update public.profiles set following_count = following_count + 1 where id = new.follower_id;
  elsif tg_op = 'DELETE' then
    update public.profiles set followers_count = greatest(0, followers_count - 1) where id = old.following_id;
    update public.profiles set following_count = greatest(0, following_count - 1) where id = old.follower_id;
  end if;
  return null;
end;
$$;

create trigger on_follow_change
  after insert or delete on public.follows
  for each row execute procedure public.update_follows_counts();
