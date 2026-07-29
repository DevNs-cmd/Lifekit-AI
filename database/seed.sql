--
-- PostgreSQL database dump
--

\restrict xI2t6Bicfl4CdITajcBjHNGwrFbVtxHwCjL3RYAepAP6wMKjSz0mQlHd0QMOIML

-- Dumped from database version 18.4 (Homebrew)
-- Dumped by pg_dump version 18.4

-- Started on 2026-07-24 13:47:52 IST

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 3976 (class 0 OID 16390)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: anushkasuri
--

COPY public.users (user_id, full_name, email, password_hash, phone, date_of_birth, profession, profile_photo, preferences, created_at, updated_at) FROM stdin;
1	Anushka Suri	anushka@example.com	password123	9876543210	\N	Student	\N	\N	2026-07-23 12:59:42.418979	2026-07-23 12:59:42.418979
\.


--
-- TOC entry 3988 (class 0 OID 16512)
-- Dependencies: 232
-- Data for Name: ai_memory; Type: TABLE DATA; Schema: public; Owner: anushkasuri
--

COPY public.ai_memory (memory_id, user_id, memory_type, title, content, importance_score, embedding_id, created_at, updated_at) FROM stdin;
1	1	Preference	Career Goal	User wants to build LifeKit and improve backend development skills.	0.95	vec_001	2026-07-23 13:09:48.949939	2026-07-23 13:09:48.949939
\.


--
-- TOC entry 4008 (class 0 OID 16675)
-- Dependencies: 252
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: anushkasuri
--

COPY public.audit_logs (log_id, user_id, action, table_name, record_id, ip_address, created_at) FROM stdin;
2	1	USER_LOGIN	users	1	192.168.1.45	2026-07-23 13:30:00
\.


--
-- TOC entry 3982 (class 0 OID 16447)
-- Dependencies: 226
-- Data for Name: goals; Type: TABLE DATA; Schema: public; Owner: anushkasuri
--

COPY public.goals (goal_id, user_id, title, description, category, target_date, status, progress, created_at) FROM stdin;
1	1	Learn PostgreSQL	Complete the PostgreSQL database for LifeKit	Learning	2026-08-15	In Progress	25	2026-07-23 13:05:28.783374
\.


--
-- TOC entry 4004 (class 0 OID 16642)
-- Dependencies: 248
-- Data for Name: interests; Type: TABLE DATA; Schema: public; Owner: anushkasuri
--

COPY public.interests (interest_id, user_id, interest_name, created_at) FROM stdin;
2	1	Artificial Intelligence	2026-07-23 13:35:00
\.


--
-- TOC entry 3978 (class 0 OID 16411)
-- Dependencies: 222
-- Data for Name: journals; Type: TABLE DATA; Schema: public; Owner: anushkasuri
--

COPY public.journals (journal_id, user_id, title, content, mood, created_at) FROM stdin;
1	1	My First Journal	Today I successfully connected PostgreSQL with my LifeKit project!	Happy	2026-07-23 13:02:26.61747
\.


--
-- TOC entry 3980 (class 0 OID 16429)
-- Dependencies: 224
-- Data for Name: journal_images; Type: TABLE DATA; Schema: public; Owner: anushkasuri
--

COPY public.journal_images (image_id, journal_id, image_url, uploaded_at) FROM stdin;
1	1	https://example.com/images/journal1.jpg	2026-07-23 13:04:21.133623
\.


--
-- TOC entry 3990 (class 0 OID 16533)
-- Dependencies: 234
-- Data for Name: marketplace; Type: TABLE DATA; Schema: public; Owner: anushkasuri
--

COPY public.marketplace (service_id, service_name, provider_name, category, description, price, rating, image_url, created_at) FROM stdin;
1	Career Mentorship	LifeKit Experts	Career	One-to-one mentorship session	499.00	4.8	\N	2026-07-23 13:16:19.83076
\.


--
-- TOC entry 3984 (class 0 OID 16468)
-- Dependencies: 228
-- Data for Name: missions; Type: TABLE DATA; Schema: public; Owner: anushkasuri
--

COPY public.missions (mission_id, user_id, title, description, category, priority, status, progress, start_date, target_date, created_at, updated_at) FROM stdin;
1	1	Build LifeKit	Develop and launch the LifeKit platform	Career	High	Active	0	2026-07-23	2026-12-31	2026-07-23 13:07:29.81452	2026-07-23 13:07:29.81452
\.


--
-- TOC entry 4006 (class 0 OID 16657)
-- Dependencies: 250
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: anushkasuri
--

COPY public.notifications (notification_id, user_id, title, message, notification_type, is_read, created_at) FROM stdin;
2	1	Welcome to LifeKit!	Your account setup is complete. Start by creating your first goal or task.	System Alert	f	2026-07-23 13:40:00
\.


--
-- TOC entry 3992 (class 0 OID 16545)
-- Dependencies: 236
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: anushkasuri
--

COPY public.transactions (transaction_id, user_id, service_id, amount, payment_status, payment_method, transaction_date) FROM stdin;
1	1	1	499.00	Completed	UPI	2026-07-23 13:16:49.63033
\.


--
-- TOC entry 3996 (class 0 OID 16585)
-- Dependencies: 240
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: anushkasuri
--

COPY public.payments (payment_id, transaction_id, payment_gateway, payment_reference, payment_status, amount, paid_at) FROM stdin;
2	1	Razorpay	PAY_REF_987654321	Success	499.00	2026-07-23 13:16:50
\.


--
-- TOC entry 4000 (class 0 OID 16612)
-- Dependencies: 244
-- Data for Name: preferences; Type: TABLE DATA; Schema: public; Owner: anushkasuri
--

COPY public.preferences (preference_id, user_id, theme, language, notification_enabled, reminder_time, timezone) FROM stdin;
2	1	Dark	English	t	09:00:00	Asia/Kolkata
\.


--
-- TOC entry 3994 (class 0 OID 16566)
-- Dependencies: 238
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: anushkasuri
--

COPY public.profiles (profile_id, user_id, bio, profile_picture, location, occupation, website, created_at) FROM stdin;
2	1	Engineering student passionate about AI, backend development, and building impactful technology solutions.	https://example.com/images/profile1.jpg	New Delhi, India	Student	https://anushkasuri.dev	2025-03-18 10:30:45
\.


--
-- TOC entry 4002 (class 0 OID 16627)
-- Dependencies: 246
-- Data for Name: skills; Type: TABLE DATA; Schema: public; Owner: anushkasuri
--

COPY public.skills (skill_id, user_id, skill_name, proficiency_level, created_at) FROM stdin;
2	1	PostgreSQL Database Design	Advanced	2026-07-23 13:45:00
\.


--
-- TOC entry 3986 (class 0 OID 16492)
-- Dependencies: 230
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: anushkasuri
--

COPY public.tasks (task_id, mission_id, title, description, priority, status, due_date, estimated_time, completed_at, created_at) FROM stdin;
1	1	Design PostgreSQL Database	Create all database tables	High	Pending	2026-07-30	120	\N	2026-07-23 13:08:33.447208
2	1	Connect FastAPI	Integrate PostgreSQL with backend	High	Pending	2026-08-02	180	\N	2026-07-23 13:08:33.447208
3	1	Test APIs	Verify CRUD operations	Medium	Pending	2026-08-05	90	\N	2026-07-23 13:08:33.447208
\.


--
-- TOC entry 3998 (class 0 OID 16600)
-- Dependencies: 242
-- Data for Name: templates; Type: TABLE DATA; Schema: public; Owner: anushkasuri
--

COPY public.templates (template_id, template_name, category, description, template_data, created_at) FROM stdin;
2	Daily Productivity Planner	Productivity	A structured daily template for setting goals, tracking tasks, and reviewing reflections.	{"sections": ["Goals", "Tasks", "Reflections"], "default_view": "list"}	2026-07-23 13:50:00
\.


--
-- TOC entry 4014 (class 0 OID 0)
-- Dependencies: 231
-- Name: ai_memory_memory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: anushkasuri
--

SELECT pg_catalog.setval('public.ai_memory_memory_id_seq', 1, true);


--
-- TOC entry 4015 (class 0 OID 0)
-- Dependencies: 251
-- Name: audit_logs_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: anushkasuri
--

SELECT pg_catalog.setval('public.audit_logs_log_id_seq', 2, true);


--
-- TOC entry 4016 (class 0 OID 0)
-- Dependencies: 225
-- Name: goals_goal_id_seq; Type: SEQUENCE SET; Schema: public; Owner: anushkasuri
--

SELECT pg_catalog.setval('public.goals_goal_id_seq', 1, true);


--
-- TOC entry 4017 (class 0 OID 0)
-- Dependencies: 247
-- Name: interests_interest_id_seq; Type: SEQUENCE SET; Schema: public; Owner: anushkasuri
--

SELECT pg_catalog.setval('public.interests_interest_id_seq', 2, true);


--
-- TOC entry 4018 (class 0 OID 0)
-- Dependencies: 223
-- Name: journal_images_image_id_seq; Type: SEQUENCE SET; Schema: public; Owner: anushkasuri
--

SELECT pg_catalog.setval('public.journal_images_image_id_seq', 1, true);


--
-- TOC entry 4019 (class 0 OID 0)
-- Dependencies: 221
-- Name: journals_journal_id_seq; Type: SEQUENCE SET; Schema: public; Owner: anushkasuri
--

SELECT pg_catalog.setval('public.journals_journal_id_seq', 1, true);


--
-- TOC entry 4020 (class 0 OID 0)
-- Dependencies: 233
-- Name: marketplace_service_id_seq; Type: SEQUENCE SET; Schema: public; Owner: anushkasuri
--

SELECT pg_catalog.setval('public.marketplace_service_id_seq', 1, true);


--
-- TOC entry 4021 (class 0 OID 0)
-- Dependencies: 227
-- Name: missions_mission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: anushkasuri
--

SELECT pg_catalog.setval('public.missions_mission_id_seq', 1, true);


--
-- TOC entry 4022 (class 0 OID 0)
-- Dependencies: 249
-- Name: notifications_notification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: anushkasuri
--

SELECT pg_catalog.setval('public.notifications_notification_id_seq', 2, true);


--
-- TOC entry 4023 (class 0 OID 0)
-- Dependencies: 239
-- Name: payments_payment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: anushkasuri
--

SELECT pg_catalog.setval('public.payments_payment_id_seq', 2, true);


--
-- TOC entry 4024 (class 0 OID 0)
-- Dependencies: 243
-- Name: preferences_preference_id_seq; Type: SEQUENCE SET; Schema: public; Owner: anushkasuri
--

SELECT pg_catalog.setval('public.preferences_preference_id_seq', 2, true);


--
-- TOC entry 4025 (class 0 OID 0)
-- Dependencies: 237
-- Name: profiles_profile_id_seq; Type: SEQUENCE SET; Schema: public; Owner: anushkasuri
--

SELECT pg_catalog.setval('public.profiles_profile_id_seq', 2, true);


--
-- TOC entry 4026 (class 0 OID 0)
-- Dependencies: 245
-- Name: skills_skill_id_seq; Type: SEQUENCE SET; Schema: public; Owner: anushkasuri
--

SELECT pg_catalog.setval('public.skills_skill_id_seq', 2, true);


--
-- TOC entry 4027 (class 0 OID 0)
-- Dependencies: 229
-- Name: tasks_task_id_seq; Type: SEQUENCE SET; Schema: public; Owner: anushkasuri
--

SELECT pg_catalog.setval('public.tasks_task_id_seq', 3, true);


--
-- TOC entry 4028 (class 0 OID 0)
-- Dependencies: 241
-- Name: templates_template_id_seq; Type: SEQUENCE SET; Schema: public; Owner: anushkasuri
--

SELECT pg_catalog.setval('public.templates_template_id_seq', 2, true);


--
-- TOC entry 4029 (class 0 OID 0)
-- Dependencies: 235
-- Name: transactions_transaction_id_seq; Type: SEQUENCE SET; Schema: public; Owner: anushkasuri
--

SELECT pg_catalog.setval('public.transactions_transaction_id_seq', 1, true);


--
-- TOC entry 4030 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: anushkasuri
--

SELECT pg_catalog.setval('public.users_user_id_seq', 1, true);


-- Completed on 2026-07-24 13:47:52 IST

--
-- PostgreSQL database dump complete
--

\unrestrict xI2t6Bicfl4CdITajcBjHNGwrFbVtxHwCjL3RYAepAP6wMKjSz0mQlHd0QMOIML

