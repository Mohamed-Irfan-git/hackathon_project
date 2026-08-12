-- Application profiles must only exist for confirmed accounts. Signup metadata is
-- retained by Supabase Auth; complete-profile creates rows after the first login.
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user_profile();
