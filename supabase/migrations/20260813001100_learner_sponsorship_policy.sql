-- Add RLS policy allowing learners to view sponsorships where they are the recipient
create policy "Learners view own sponsorships" on sponsorships
  for select using (learner_id = auth.uid());
