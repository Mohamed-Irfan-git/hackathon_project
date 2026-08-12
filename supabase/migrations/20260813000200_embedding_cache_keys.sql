-- Avoid regenerating an embedding when its source data is unchanged.
alter table learner_profiles add column if not exists embedding_input_hash text;
alter table provider_profiles add column if not exists embedding_input_hash text;
alter table opportunities add column if not exists embedding_input_hash text;
alter table knowledge_base add column if not exists embedding_input_hash text;
