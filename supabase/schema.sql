-- Создание таблицы профилей (расширяет Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  first_name text,
  last_name text,
  avatar_url text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Включение RLS (Row Level Security)
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Создание таблицы категорий
create table public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.categories enable row level security;
create policy "Categories are viewable by everyone." on categories for select using (true);

-- Создание таблицы продуктов
create table public.products (
  id uuid default gen_random_uuid() primary key,
  category_id uuid references public.categories on delete cascade not null,
  name text not null,
  description text,
  price numeric(10, 2) not null,
  unit text not null, -- например, '1 кг', '500 г', '1 л'
  image_url text,
  stock integer default 0 not null,
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.products enable row level security;
create policy "Products are viewable by everyone." on products for select using (true);

-- Создание таблицы заказов
create type order_status as enum ('Preparing', 'On the way', 'Delivered', 'Cancelled');

create table public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  status order_status default 'Preparing' not null,
  total_amount numeric(10, 2) not null,
  delivery_address text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.orders enable row level security;
create policy "Users can view their own orders." on orders for select using (auth.uid() = user_id);
create policy "Users can insert their own orders." on orders for insert with check (auth.uid() = user_id);

-- Создание таблицы элементов заказа
create table public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders on delete cascade not null,
  product_id uuid references public.products on delete restrict not null,
  quantity integer not null check (quantity > 0),
  price_at_time numeric(10, 2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.order_items enable row level security;
-- Гарантируем, что пользователи могут видеть только элементы своих собственных заказов
create policy "Users can view their own order items." on order_items 
  for select using (
    exists (
      select 1 from public.orders 
      where orders.id = order_items.order_id and orders.user_id = auth.uid()
    )
  );
-- Гарантируем, что пользователи могут добавлять элементы только в свои собственные заказы
create policy "Users can insert their own order items." on order_items 
  for insert with check (
    exists (
      select 1 from public.orders 
      where orders.id = order_items.order_id and orders.user_id = auth.uid()
    )
  );

-- Функция для обработки регистрации нового пользователя (автоматическое создание профиля)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, first_name, last_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Триггер для вызова handle_new_user после регистрации пользователя
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
