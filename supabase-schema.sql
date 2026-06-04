-- ============================================
-- NATURE EXPLORER - SUPABASE DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- Profiles table (extends Supabase auth.users)
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique,
  bio text,
  profile_photo text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Posts table
create table if not exists posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  user_email text,
  image_url text,
  image_urls text[] default '{}',
  title text not null,
  location text,
  latitude numeric,
  longitude numeric,
  category text,
  description text,
  review text,
  recommendations text,
  dos_and_donts text,
  pros_and_cons text,
  rating integer check (rating >= 1 and rating <= 5),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Likes table
create table if not exists likes (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references posts(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  is_like boolean not null,
  created_at timestamptz default now(),
  unique(post_id, user_id)
);

-- Bookmarks table
create table if not exists bookmarks (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references posts(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(post_id, user_id)
);

-- Comments table
create table if not exists comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references posts(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  comment text not null,
  created_at timestamptz default now()
);

-- Videos table
create table if not exists videos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  video_url text not null,
  title text not null,
  description text,
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Row Level Security
alter table profiles enable row level security;
alter table posts enable row level security;
alter table likes enable row level security;
alter table bookmarks enable row level security;
alter table comments enable row level security;
alter table videos enable row level security;

-- Profiles policies
create policy "Profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- Posts policies
create policy "Posts are viewable by everyone" on posts for select using (true);
create policy "Users can insert own posts" on posts for insert with check (auth.uid() = user_id);
create policy "Users can update own posts" on posts for update using (auth.uid() = user_id);
create policy "Users can delete own posts" on posts for delete using (auth.uid() = user_id);

-- Likes policies
create policy "Likes are viewable by everyone" on likes for select using (true);
create policy "Users can manage own likes" on likes for all using (auth.uid() = user_id);

-- Bookmarks policies
create policy "Users can view own bookmarks" on bookmarks for select using (auth.uid() = user_id);
create policy "Users can manage own bookmarks" on bookmarks for all using (auth.uid() = user_id);

-- Comments policies
create policy "Comments are viewable by everyone" on comments for select using (true);
create policy "Users can insert own comments" on comments for insert with check (auth.uid() = user_id);
create policy "Users can delete own comments" on comments for delete using (auth.uid() = user_id);

-- Videos policies
create policy "Videos are viewable by everyone" on videos for select using (true);
create policy "Users can insert own videos" on videos for insert with check (auth.uid() = user_id);

-- Storage bucket (run separately if needed)
-- insert into storage.buckets (id, name, public) values ('nature-images', 'nature-images', true);
-- create policy "Anyone can view images" on storage.objects for select using (bucket_id = 'nature-images');
-- create policy "Auth users can upload images" on storage.objects for insert with check (bucket_id = 'nature-images' and auth.role() = 'authenticated');
-- create policy "Users can update own images" on storage.objects for update using (bucket_id = 'nature-images' and auth.uid()::text = (storage.foldername(name))[2]);
