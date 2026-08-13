-- Create the application user and role profile at the same time as the auth user.
-- This runs inside Postgres, so email confirmation cannot interrupt profile creation.
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_role public.user_role;
  display_name text;
begin
  selected_role := case coalesce(new.raw_user_meta_data ->> 'app_role', 'learner')
    when 'provider' then 'provider'::public.user_role
    when 'sponsor' then 'sponsor'::public.user_role
    else 'learner'::public.user_role
  end;
  display_name := coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(new.email, '@', 1), 'User');

  insert into public.users (id, role, full_name, email)
  values (new.id, selected_role, display_name, new.email)
  on conflict (id) do update set
    full_name = excluded.full_name,
    email = excluded.email,
    updated_at = now();

  if selected_role = 'learner' then
    insert into public.learner_profiles (user_id) values (new.id)
    on conflict (user_id) do nothing;
  elsif selected_role = 'provider' then
    insert into public.provider_profiles (user_id) values (new.id)
    on conflict (user_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user_profile();
