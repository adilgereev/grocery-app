create table public.favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  product_id uuid references public.products on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, product_id) -- Пользователь может лайкнуть один товар только один раз
);

alter table public.favorites enable row level security;

create policy "Users can view their own favorites" 
  on favorites for select using (auth.uid() = user_id);

create policy "Users can insert their own favorites" 
  on favorites for insert with check (auth.uid() = user_id);

create policy "Users can delete their own favorites" 
  on favorites for delete using (auth.uid() = user_id);
