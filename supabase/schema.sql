-- Tabella contenuti generati
create table posts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users,
  description text not null,
  content_type text not null,
  post_type text not null,
  caption text not null,
  hashtags text not null,
  cta text not null,
  file_url text,
  saved boolean default false
);

create index posts_user_id_idx on posts(user_id);
create index posts_created_at_idx on posts(created_at desc);

alter table posts enable row level security;

create policy "Users can view own posts"
  on posts for select
  using (auth.uid() = user_id);

create policy "Users can insert own posts"
  on posts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own posts"
  on posts for update
  using (auth.uid() = user_id);