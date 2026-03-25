-- SQL-скрипт для создания таблицы адресов в Supabase

create table public.addresses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  text text not null,
  is_selected boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Настройка политик безопасности RLS (Только владелец может читать, менять и удалять свои адреса)
alter table public.addresses enable row level security;

create policy "Users can modify their own addresses" 
on public.addresses for all 
using (auth.uid() = user_id);
