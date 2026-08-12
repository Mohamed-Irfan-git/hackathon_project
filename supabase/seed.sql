-- Seed documents intentionally have NULL embeddings; deploy the embedding functions to populate them.
-- These authenticated seed identities make the profile foreign keys valid in local Supabase.
insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
values
('00000000-0000-0000-0000-000000000000','10000000-0000-0000-0000-000000000001','authenticated','authenticated','nimal.tutor@example.test','$2a$10$7EqJtq98hPqEX7fNZaFWoO9A1MiSypVY16zNL5Zo0dHfZYtP0.CmC',now(),'{"provider":"email","providers":["email"]}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','10000000-0000-0000-0000-000000000002','authenticated','authenticated','sahan.academy@example.test','$2a$10$7EqJtq98hPqEX7fNZaFWoO9A1MiSypVY16zNL5Zo0dHfZYtP0.CmC',now(),'{"provider":"email","providers":["email"]}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','10000000-0000-0000-0000-000000000003','authenticated','authenticated','amal.careers@example.test','$2a$10$7EqJtq98hPqEX7fNZaFWoO9A1MiSypVY16zNL5Zo0dHfZYtP0.CmC',now(),'{"provider":"email","providers":["email"]}','{}',now(),now()),
('00000000-0000-0000-0000-000000000000','10000000-0000-0000-0000-000000000004','authenticated','authenticated','tharushi.design@example.test','$2a$10$7EqJtq98hPqEX7fNZaFWoO9A1MiSypVY16zNL5Zo0dHfZYtP0.CmC',now(),'{"provider":"email","providers":["email"]}','{}',now(),now());
insert into users (id,role,full_name,email) values
('10000000-0000-0000-0000-000000000001','provider','Nimal Perera','nimal.tutor@example.test'),
('10000000-0000-0000-0000-000000000002','provider','Sahan Academy','sahan.academy@example.test'),
('10000000-0000-0000-0000-000000000003','provider','Amal Careers','amal.careers@example.test'),
('10000000-0000-0000-0000-000000000004','provider','Tharushi Design Lab','tharushi.design@example.test');
insert into provider_profiles (user_id,university,skills,subjects,expertise_areas,experience_years,bio,location,status) values
('10000000-0000-0000-0000-000000000001','University of Colombo',array['Python','ICT'],array['ICT','Mathematics'],array['A/L tuition'],4,'A/L ICT tutor','Colombo','verified'),
('10000000-0000-0000-0000-000000000002','Sahan Academy',array['Web development'],array['ICT'],array['beginner coding'],5,'Online course provider','Online','verified'),
('10000000-0000-0000-0000-000000000003','Career Centre',array['Interviewing','CV'],array['Career'],array['career readiness'],6,'Career mentor','Kandy','verified'),
('10000000-0000-0000-0000-000000000004','Design Lab',array['UI design'],array['ICT'],array['workshops'],3,'Practical design workshops','Galle','verified');
insert into opportunities (provider_id,title,type,description,subject,target_level,price,delivery_mode,location,duration,status) values
('10000000-0000-0000-0000-000000000001','A/L ICT Tuition','TUITION','Small-group A/L ICT tuition covering programming and databases.','ICT','A/L',2500,'online','Online','Monthly','active'),
('10000000-0000-0000-0000-000000000002','Web Development Foundations','COURSE','Beginner HTML, CSS and JavaScript course.','ICT','Beginner',0,'online','Online','6 weeks','active'),
('10000000-0000-0000-0000-000000000004','Student UI Design Workshop','WORKSHOP','Hands-on introduction to user interface design.','ICT','A/L',1500,'in-person','Galle','One day','active'),
('10000000-0000-0000-0000-000000000003','ICT Career Mentoring','MENTORSHIP','Individual guidance on ICT study and career paths.','ICT','A/L',1000,'online','Online','45 minutes','active'),
('10000000-0000-0000-0000-000000000003','Mock ICT Internship Interview','MOCK_INTERVIEW','Practice interviews and constructive feedback.','ICT','Undergraduate',2000,'online','Online','60 minutes','active'),
('10000000-0000-0000-0000-000000000001','Mathematics Revision Class','TUITION','A/L revision support for mathematics.','Mathematics','A/L',2000,'in-person','Colombo','Monthly','active');
insert into knowledge_base (category,title,content,source_url,status) values
('scholarship','ICT Learner Support Fund','A verified support fund for Sri Lankan A/L students pursuing ICT. Learners with limited budgets can request sponsorship for approved learning opportunities through the platform.',null,'verified'),
('course','Free Introduction to Web Development','A beginner-friendly online ICT course with no course fee. It covers HTML, CSS and JavaScript fundamentals for A/L learners.',null,'verified'),
('workshop','Student Coding Workshop','A low-cost weekend workshop for school students exploring programming and practical ICT skills.',null,'verified'),
('internship','ICT Career Readiness Internship Guide','Verified guidance on preparing a portfolio, CV and applications for entry-level ICT internships. Check each provider for current eligibility.',null,'verified'),
('scholarship','Scholarship Application Checklist','Prepare academic records, a budget statement and application materials. This entry does not state any deadline or guarantee eligibility.',null,'verified'),
('course','Open Learning ICT Resources','A curated list of self-paced learning resources for students beginning ICT on a limited budget.',null,'verified');
