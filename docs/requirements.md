# System Requirements

## 1. Project Overview

The system is a technology-driven learning and opportunity platform designed to connect university students with school students and youth in the surrounding community.

The platform aims to address two connected problems:

1. University students possess valuable academic, technical, and professional skills that are underutilized and could be converted into income and practical experience.
2. Students and youth in the surrounding community have limited access to affordable tuition, skills development, career preparation, and information about educational and career opportunities.

The system will provide a single platform where learners can discover learning opportunities and university students can provide those opportunities.

---

## 2. Project Goals

The system should:

- Create flexible income opportunities for university students through tutoring, courses, mentoring, workshops, and mock interviews.
- Improve access to affordable educational and career-development opportunities for students and youth in the surrounding community.
- Connect learners with suitable tutors, courses, mentors, and other opportunities.
- Use AI to improve opportunity discovery and matching.
- Provide access to scholarships, internships, courses, workshops, competitions, and related opportunities through a RAG-based assistant.
- Allow sponsors/donors to support learning opportunities for financially constrained learners.
- Provide measurable economic and social impact metrics.

---

## 3. Target Users

### 3.1 Learner

A school student, A/L student, youth, or other community member seeking educational or career-development opportunities.

A learner can:

- Create an account.
- Manage a profile.
- Specify educational level and interests.
- Search for opportunities.
- Use AI-powered matching.
- View tutor/course/provider profiles.
- Book or enroll in opportunities.
- Ask the RAG opportunity assistant questions.
- View sponsorship opportunities.
- Request sponsorship when applicable.
- Track bookings and enrollments.

---

### 3.2 Provider

A university student or other approved person who provides learning or career-development services.

A provider can:

- Create an account.
- Create and manage a provider profile.
- Add skills, subjects, and areas of expertise.
- Create learning opportunities.
- Set price, availability, location, and other details.
- Receive learner booking/enrollment requests.
- Accept or reject requests.
- Track their opportunities and bookings.
- View basic earnings/impact information.

Supported opportunity types:

- Tuition
- Course
- Workshop
- Mentorship
- Mock Interview

---

### 3.3 Sponsor

A person or organization willing to financially support learning opportunities for eligible learners.

A sponsor can:

- View sponsorship requests/opportunities.
- Select a learner or learning opportunity.
- Specify or select a sponsorship amount.
- Submit a sponsorship record.
- View basic sponsorship history.

The MVP does not require a real payment gateway.

---

### 3.4 Admin

An administrator manages platform integrity and trusted information.

An admin can:

- View users.
- Review provider profiles.
- Verify or reject providers.
- Manage opportunities.
- Manage sponsorship requests.
- Add/update/remove opportunity information used by the RAG system.
- Mark opportunity information as verified, active, or expired.
- View platform-level impact metrics.

---

## 4. Core Functional Requirements

### 4.1 Authentication and User Management

The system must support:

- User registration.
- User login.
- User logout.
- Role-based user profiles.
- Learner, Provider, Sponsor, and Admin roles.
- Secure authentication using Supabase Authentication.

Users should only access features appropriate to their role.

---

### 4.2 Learner Profile

A learner profile should support:

- Name.
- Educational level.
- Subjects/interests.
- Skills/interests.
- Location.
- Learning goals.
- Budget preference.
- Availability.

The profile information should be usable by the AI matching system.

---

### 4.3 Provider Profile

A provider profile should support:

- Name.
- University/faculty information where applicable.
- Skills.
- Subjects.
- Areas of expertise.
- Experience.
- Description/bio.
- Location.
- Availability.
- Verification status.

Verified providers should be clearly identified in the interface.

---

### 4.4 Opportunity Management

Providers must be able to create, update, and manage opportunities.

Each opportunity should support:

- Title.
- Type.
- Description.
- Subject/category.
- Target level.
- Price.
- Location or delivery mode.
- Availability.
- Duration where applicable.
- Provider.
- Status.
- Created date.

Supported opportunity types:

```text
TUITION
COURSE
WORKSHOP
MENTORSHIP
MOCK_INTERVIEW