-- Repair accounts confirmed before the confirmation trigger was introduced.
insert into public.users (id, role, full_name, email)
select
  au.id,
  case coalesce(au.raw_user_meta_data ->> 'app_role', 'learner')
    when 'provider' then 'provider'::public.user_role
    when 'sponsor' then 'sponsor'::public.user_role
    else 'learner'::public.user_role
  end,
  coalesce(nullif(trim(au.raw_user_meta_data ->> 'full_name'), ''), split_part(au.email, '@', 1), 'User'),
  au.email
from auth.users au
where au.email_confirmed_at is not null
on conflict (id) do nothing;

insert into public.learner_profiles (user_id)
select u.id from public.users u
where u.role = 'learner'
on conflict (user_id) do nothing;

insert into public.provider_profiles (user_id)
select u.id from public.users u
where u.role = 'provider'
on conflict (user_id) do nothing;
