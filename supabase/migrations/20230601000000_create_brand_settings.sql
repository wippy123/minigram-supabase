-- Supabase AI is experimental and may produce incorrect answers
-- Always verify the output before executing

-- Create the brand_settings table
create table
  brand_settings (
    id uuid primary key default uuid_generate_v4 (),
    user_id uuid not null,
    logo_url text,
    palette text not null,
    font text not null,
    header text,
    footer text,
    created_at timestamp with time zone default current_timestamp,
    updated_at timestamp with time zone default current_timestamp
  );

-- Add a foreign key constraint to link brand_settings to users
alter table brand_settings
add constraint fk_brand_settings_user foreign key (user_id) references auth.users (id) on delete cascade;

-- Create a unique index on user_id to ensure one brand setting per user
create unique index idx_brand_settings_user_id on brand_settings (user_id);

-- Create a function to automatically update the updated_at column
create
or replace function update_modified_column () returns trigger as $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to call the update_modified_column function
create trigger update_brand_settings_modtime before
update on brand_settings for each row
execute function update_modified_column ();

-- Add RLS (Row Level Security) policies
alter table brand_settings enable row level security;

-- Policy to allow users to select only their own brand settings
create policy select_own_brand_settings on brand_settings for
select
  using (auth.uid () = user_id);

-- Policy to allow users to insert their own brand settings
create policy insert_own_brand_settings on brand_settings for insert
with
  check (auth.uid () = user_id);

-- Policy to allow users to update only their own brand settings
create policy update_own_brand_settings on brand_settings
for update
  using (auth.uid () = user_id);

-- Policy to allow users to delete only their own brand settings
create policy delete_own_brand_settings on brand_settings for delete using (auth.uid () = user_id);