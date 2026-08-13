-- Provision application records only after Supabase Auth confirms the email.
-- Doing this in the database makes the confirmation flow independent of a browser
-- redirect, tab state, or a failed client-side Edge Function call.
create or replace function public.provision_confirmed_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_role public.user_role;
  display_name text;
begin
  if new.email_confirmed_at is null then
    return new;
  end if;

  selected_role := case coalesce(new.raw_user_meta_data ->> 'app_role', 'learner')
    when 'provider' then 'provider'::public.user_role
    when 'sponsor' then 'sponsor'::public.user_role
    else 'learner'::public.user_role
  end;
  display_name := coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(new.email, '@', 1), 'User');

  insert into public.users (id, role, full_name, email)
  values (new.id, selected_role, display_name, new.email)
  on conflict (id) do nothing;

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

drop trigger if exists on_auth_user_confirmed on auth.users;
create trigger on_auth_user_confirmed
  after insert or update of email_confirmed_at on auth.users
  for each row
  when (new.email_confirmed_at is not null)
  execute procedure public.provision_confirmed_user();
