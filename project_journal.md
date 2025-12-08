# project_journal.md
Project Development Log (5 Days)

---

## Day 1 — Requirements Analysis & Project Setup
- Reviewed the assignment brief and clarified the core scope: authentication, dashboard onboarding flow, resume upload, and server-side parsing for PDF/DOCX/TXT.
- Discussed architecture with ChatGPT and selected the tech stack: Next.js 16 App Router, Clerk for authentication, and pdf-parse/mammoth for server-side extraction.
- Initialized the project using `create-next-app`, configured the basic folder structure under `src/app`, and set up ClerkProvider with `/sign-in` and `/sign-up` pages.
- Created the initial `/dashboard` route and added a placeholder layout.

---

## Day 2 — Dashboard UI & Onboarding Flow
- Designed the full Dashboard layout with ChatGPT: greeting section, profile completion bar, onboarding steps, and subscription card.
- Implemented the three-step onboarding flow (Complete profile → Upload resume → Review insights).
- Added a functional SubscriptionCard component to simulate upgrading from Free → Pro (demo).
- Integrated Clerk’s `currentUser` into the Dashboard to display the user’s name dynamically.

---

## Day 3 — Resume Upload Component (Frontend)
- Implemented the `ResumeSection` component with ChatGPT: file input, loading states, error handling, and summary UI blocks.
- Added logic to upload resume files using FormData and trigger onboarding state changes via a callback (`onResumeUploaded`).
- Defined basic UI for name, email, phone, and skills extracted from the resume.
- Ensured the component integrates smoothly with the Dashboard layout.

---

## Day 4 — Server-Side Resume Parsing API
- Created `src/app/api/parse-resume/route.ts` and implemented file handling for multipart/form-data.
- Attempted initial integration of pdf-parse and mammoth; encountered common errors (“pdfParse is not a function”, incompatible module formats).
- Used ChatGPT to debug ESM/CJS interop and fixed pdf-parse by switching to dynamic import + fallback (`module.default || module`).
- Implemented extraction logic for email, name, phone, and skills with initial regex patterns.
- Added structured JSON responses and error handling.

---

## Day 5 — Deployment, Testing & Documentation
- Deployed the project to Vercel; added required Clerk environment variables and fixed API execution issues.
- Tested the system with multiple PDF and DOCX resumes; refined regex patterns to better support Australian phone numbers, uppercase “SKILLS”, and names without labels.
- Wrote all required documentation with AI assistance: README.md, SPEC.md, PROMPTS.md, and Reflection.md.
- Performed a final review of code structure, parsing accuracy, and the onboarding flow before submission.

---

**Project completed successfully within 5 days.**