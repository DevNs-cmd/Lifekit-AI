--
-- PostgreSQL database dump
--

\restrict BYAvuhIh2BNHv0Wc5AcLW57rdQiSwFbkXw2vyLKbasE14qkjk0CwjiymuGSVict

-- Dumped from database version 18.4 (Homebrew)
-- Dumped by pg_dump version 18.4

-- Started on 2026-07-24 13:42:51 IST

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 232 (class 1259 OID 16512)
-- Name: ai_memory; Type: TABLE; Schema: public; Owner: anushkasuri
--

CREATE TABLE public.ai_memory (
    memory_id integer NOT NULL,
    user_id integer NOT NULL,
    memory_type character varying(50) NOT NULL,
    title character varying(255),
    content text NOT NULL,
    importance_score numeric(3,2),
    embedding_id character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ai_memory_importance_score_check CHECK (((importance_score >= (0)::numeric) AND (importance_score <= (1)::numeric)))
);


ALTER TABLE public.ai_memory OWNER TO anushkasuri;

--
-- TOC entry 231 (class 1259 OID 16511)
-- Name: ai_memory_memory_id_seq; Type: SEQUENCE; Schema: public; Owner: anushkasuri
--

CREATE SEQUENCE public.ai_memory_memory_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ai_memory_memory_id_seq OWNER TO anushkasuri;

--
-- TOC entry 4063 (class 0 OID 0)
-- Dependencies: 231
-- Name: ai_memory_memory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: anushkasuri
--

ALTER SEQUENCE public.ai_memory_memory_id_seq OWNED BY public.ai_memory.memory_id;


--
-- TOC entry 252 (class 1259 OID 16675)
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: anushkasuri
--

CREATE TABLE public.audit_logs (
    log_id integer NOT NULL,
    user_id integer,
    action character varying(255),
    table_name character varying(100),
    record_id integer,
    ip_address character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.audit_logs OWNER TO anushkasuri;

--
-- TOC entry 251 (class 1259 OID 16674)
-- Name: audit_logs_log_id_seq; Type: SEQUENCE; Schema: public; Owner: anushkasuri
--

CREATE SEQUENCE public.audit_logs_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_logs_log_id_seq OWNER TO anushkasuri;

--
-- TOC entry 4064 (class 0 OID 0)
-- Dependencies: 251
-- Name: audit_logs_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: anushkasuri
--

ALTER SEQUENCE public.audit_logs_log_id_seq OWNED BY public.audit_logs.log_id;


--
-- TOC entry 226 (class 1259 OID 16447)
-- Name: goals; Type: TABLE; Schema: public; Owner: anushkasuri
--

CREATE TABLE public.goals (
    goal_id integer NOT NULL,
    user_id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    category character varying(100),
    target_date date,
    status character varying(20) DEFAULT 'In Progress'::character varying,
    progress integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT goals_progress_check CHECK (((progress >= 0) AND (progress <= 100)))
);


ALTER TABLE public.goals OWNER TO anushkasuri;

--
-- TOC entry 225 (class 1259 OID 16446)
-- Name: goals_goal_id_seq; Type: SEQUENCE; Schema: public; Owner: anushkasuri
--

CREATE SEQUENCE public.goals_goal_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.goals_goal_id_seq OWNER TO anushkasuri;

--
-- TOC entry 4065 (class 0 OID 0)
-- Dependencies: 225
-- Name: goals_goal_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: anushkasuri
--

ALTER SEQUENCE public.goals_goal_id_seq OWNED BY public.goals.goal_id;


--
-- TOC entry 248 (class 1259 OID 16642)
-- Name: interests; Type: TABLE; Schema: public; Owner: anushkasuri
--

CREATE TABLE public.interests (
    interest_id integer NOT NULL,
    user_id integer NOT NULL,
    interest_name character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.interests OWNER TO anushkasuri;

--
-- TOC entry 247 (class 1259 OID 16641)
-- Name: interests_interest_id_seq; Type: SEQUENCE; Schema: public; Owner: anushkasuri
--

CREATE SEQUENCE public.interests_interest_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.interests_interest_id_seq OWNER TO anushkasuri;

--
-- TOC entry 4066 (class 0 OID 0)
-- Dependencies: 247
-- Name: interests_interest_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: anushkasuri
--

ALTER SEQUENCE public.interests_interest_id_seq OWNED BY public.interests.interest_id;


--
-- TOC entry 224 (class 1259 OID 16429)
-- Name: journal_images; Type: TABLE; Schema: public; Owner: anushkasuri
--

CREATE TABLE public.journal_images (
    image_id integer NOT NULL,
    journal_id integer NOT NULL,
    image_url text NOT NULL,
    uploaded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.journal_images OWNER TO anushkasuri;

--
-- TOC entry 223 (class 1259 OID 16428)
-- Name: journal_images_image_id_seq; Type: SEQUENCE; Schema: public; Owner: anushkasuri
--

CREATE SEQUENCE public.journal_images_image_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.journal_images_image_id_seq OWNER TO anushkasuri;

--
-- TOC entry 4067 (class 0 OID 0)
-- Dependencies: 223
-- Name: journal_images_image_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: anushkasuri
--

ALTER SEQUENCE public.journal_images_image_id_seq OWNED BY public.journal_images.image_id;


--
-- TOC entry 222 (class 1259 OID 16411)
-- Name: journals; Type: TABLE; Schema: public; Owner: anushkasuri
--

CREATE TABLE public.journals (
    journal_id integer NOT NULL,
    user_id integer NOT NULL,
    title character varying(255),
    content text NOT NULL,
    mood character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.journals OWNER TO anushkasuri;

--
-- TOC entry 221 (class 1259 OID 16410)
-- Name: journals_journal_id_seq; Type: SEQUENCE; Schema: public; Owner: anushkasuri
--

CREATE SEQUENCE public.journals_journal_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.journals_journal_id_seq OWNER TO anushkasuri;

--
-- TOC entry 4068 (class 0 OID 0)
-- Dependencies: 221
-- Name: journals_journal_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: anushkasuri
--

ALTER SEQUENCE public.journals_journal_id_seq OWNED BY public.journals.journal_id;


--
-- TOC entry 234 (class 1259 OID 16533)
-- Name: marketplace; Type: TABLE; Schema: public; Owner: anushkasuri
--

CREATE TABLE public.marketplace (
    service_id integer NOT NULL,
    service_name character varying(255) NOT NULL,
    provider_name character varying(255),
    category character varying(100),
    description text,
    price numeric(10,2),
    rating numeric(2,1),
    image_url text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.marketplace OWNER TO anushkasuri;

--
-- TOC entry 233 (class 1259 OID 16532)
-- Name: marketplace_service_id_seq; Type: SEQUENCE; Schema: public; Owner: anushkasuri
--

CREATE SEQUENCE public.marketplace_service_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.marketplace_service_id_seq OWNER TO anushkasuri;

--
-- TOC entry 4069 (class 0 OID 0)
-- Dependencies: 233
-- Name: marketplace_service_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: anushkasuri
--

ALTER SEQUENCE public.marketplace_service_id_seq OWNED BY public.marketplace.service_id;


--
-- TOC entry 228 (class 1259 OID 16468)
-- Name: missions; Type: TABLE; Schema: public; Owner: anushkasuri
--

CREATE TABLE public.missions (
    mission_id integer NOT NULL,
    user_id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    category character varying(100),
    priority character varying(20) DEFAULT 'Medium'::character varying,
    status character varying(30) DEFAULT 'Active'::character varying,
    progress integer DEFAULT 0,
    start_date date DEFAULT CURRENT_DATE,
    target_date date,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT missions_progress_check CHECK (((progress >= 0) AND (progress <= 100)))
);


ALTER TABLE public.missions OWNER TO anushkasuri;

--
-- TOC entry 227 (class 1259 OID 16467)
-- Name: missions_mission_id_seq; Type: SEQUENCE; Schema: public; Owner: anushkasuri
--

CREATE SEQUENCE public.missions_mission_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.missions_mission_id_seq OWNER TO anushkasuri;

--
-- TOC entry 4070 (class 0 OID 0)
-- Dependencies: 227
-- Name: missions_mission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: anushkasuri
--

ALTER SEQUENCE public.missions_mission_id_seq OWNED BY public.missions.mission_id;


--
-- TOC entry 250 (class 1259 OID 16657)
-- Name: notifications; Type: TABLE; Schema: public; Owner: anushkasuri
--

CREATE TABLE public.notifications (
    notification_id integer NOT NULL,
    user_id integer NOT NULL,
    title character varying(255),
    message text,
    notification_type character varying(100),
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.notifications OWNER TO anushkasuri;

--
-- TOC entry 249 (class 1259 OID 16656)
-- Name: notifications_notification_id_seq; Type: SEQUENCE; Schema: public; Owner: anushkasuri
--

CREATE SEQUENCE public.notifications_notification_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_notification_id_seq OWNER TO anushkasuri;

--
-- TOC entry 4071 (class 0 OID 0)
-- Dependencies: 249
-- Name: notifications_notification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: anushkasuri
--

ALTER SEQUENCE public.notifications_notification_id_seq OWNED BY public.notifications.notification_id;


--
-- TOC entry 240 (class 1259 OID 16585)
-- Name: payments; Type: TABLE; Schema: public; Owner: anushkasuri
--

CREATE TABLE public.payments (
    payment_id integer NOT NULL,
    transaction_id integer NOT NULL,
    payment_gateway character varying(100),
    payment_reference character varying(255),
    payment_status character varying(30),
    amount numeric(10,2),
    paid_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.payments OWNER TO anushkasuri;

--
-- TOC entry 239 (class 1259 OID 16584)
-- Name: payments_payment_id_seq; Type: SEQUENCE; Schema: public; Owner: anushkasuri
--

CREATE SEQUENCE public.payments_payment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payments_payment_id_seq OWNER TO anushkasuri;

--
-- TOC entry 4072 (class 0 OID 0)
-- Dependencies: 239
-- Name: payments_payment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: anushkasuri
--

ALTER SEQUENCE public.payments_payment_id_seq OWNED BY public.payments.payment_id;


--
-- TOC entry 244 (class 1259 OID 16612)
-- Name: preferences; Type: TABLE; Schema: public; Owner: anushkasuri
--

CREATE TABLE public.preferences (
    preference_id integer NOT NULL,
    user_id integer NOT NULL,
    theme character varying(20),
    language character varying(50),
    notification_enabled boolean DEFAULT true,
    reminder_time time without time zone,
    timezone character varying(100)
);


ALTER TABLE public.preferences OWNER TO anushkasuri;

--
-- TOC entry 243 (class 1259 OID 16611)
-- Name: preferences_preference_id_seq; Type: SEQUENCE; Schema: public; Owner: anushkasuri
--

CREATE SEQUENCE public.preferences_preference_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.preferences_preference_id_seq OWNER TO anushkasuri;

--
-- TOC entry 4073 (class 0 OID 0)
-- Dependencies: 243
-- Name: preferences_preference_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: anushkasuri
--

ALTER SEQUENCE public.preferences_preference_id_seq OWNED BY public.preferences.preference_id;


--
-- TOC entry 238 (class 1259 OID 16566)
-- Name: profiles; Type: TABLE; Schema: public; Owner: anushkasuri
--

CREATE TABLE public.profiles (
    profile_id integer NOT NULL,
    user_id integer NOT NULL,
    bio text,
    profile_picture text,
    location character varying(100),
    occupation character varying(100),
    website text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.profiles OWNER TO anushkasuri;

--
-- TOC entry 237 (class 1259 OID 16565)
-- Name: profiles_profile_id_seq; Type: SEQUENCE; Schema: public; Owner: anushkasuri
--

CREATE SEQUENCE public.profiles_profile_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.profiles_profile_id_seq OWNER TO anushkasuri;

--
-- TOC entry 4074 (class 0 OID 0)
-- Dependencies: 237
-- Name: profiles_profile_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: anushkasuri
--

ALTER SEQUENCE public.profiles_profile_id_seq OWNED BY public.profiles.profile_id;


--
-- TOC entry 246 (class 1259 OID 16627)
-- Name: skills; Type: TABLE; Schema: public; Owner: anushkasuri
--

CREATE TABLE public.skills (
    skill_id integer NOT NULL,
    user_id integer NOT NULL,
    skill_name character varying(100),
    proficiency_level character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.skills OWNER TO anushkasuri;

--
-- TOC entry 245 (class 1259 OID 16626)
-- Name: skills_skill_id_seq; Type: SEQUENCE; Schema: public; Owner: anushkasuri
--

CREATE SEQUENCE public.skills_skill_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.skills_skill_id_seq OWNER TO anushkasuri;

--
-- TOC entry 4075 (class 0 OID 0)
-- Dependencies: 245
-- Name: skills_skill_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: anushkasuri
--

ALTER SEQUENCE public.skills_skill_id_seq OWNED BY public.skills.skill_id;


--
-- TOC entry 230 (class 1259 OID 16492)
-- Name: tasks; Type: TABLE; Schema: public; Owner: anushkasuri
--

CREATE TABLE public.tasks (
    task_id integer NOT NULL,
    mission_id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    priority character varying(20) DEFAULT 'Medium'::character varying,
    status character varying(20) DEFAULT 'Pending'::character varying,
    due_date date,
    estimated_time integer,
    completed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.tasks OWNER TO anushkasuri;

--
-- TOC entry 229 (class 1259 OID 16491)
-- Name: tasks_task_id_seq; Type: SEQUENCE; Schema: public; Owner: anushkasuri
--

CREATE SEQUENCE public.tasks_task_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tasks_task_id_seq OWNER TO anushkasuri;

--
-- TOC entry 4076 (class 0 OID 0)
-- Dependencies: 229
-- Name: tasks_task_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: anushkasuri
--

ALTER SEQUENCE public.tasks_task_id_seq OWNED BY public.tasks.task_id;


--
-- TOC entry 242 (class 1259 OID 16600)
-- Name: templates; Type: TABLE; Schema: public; Owner: anushkasuri
--

CREATE TABLE public.templates (
    template_id integer NOT NULL,
    template_name character varying(200),
    category character varying(100),
    description text,
    template_data jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.templates OWNER TO anushkasuri;

--
-- TOC entry 241 (class 1259 OID 16599)
-- Name: templates_template_id_seq; Type: SEQUENCE; Schema: public; Owner: anushkasuri
--

CREATE SEQUENCE public.templates_template_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.templates_template_id_seq OWNER TO anushkasuri;

--
-- TOC entry 4077 (class 0 OID 0)
-- Dependencies: 241
-- Name: templates_template_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: anushkasuri
--

ALTER SEQUENCE public.templates_template_id_seq OWNED BY public.templates.template_id;


--
-- TOC entry 236 (class 1259 OID 16545)
-- Name: transactions; Type: TABLE; Schema: public; Owner: anushkasuri
--

CREATE TABLE public.transactions (
    transaction_id integer NOT NULL,
    user_id integer NOT NULL,
    service_id integer NOT NULL,
    amount numeric(10,2),
    payment_status character varying(30),
    payment_method character varying(50),
    transaction_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.transactions OWNER TO anushkasuri;

--
-- TOC entry 235 (class 1259 OID 16544)
-- Name: transactions_transaction_id_seq; Type: SEQUENCE; Schema: public; Owner: anushkasuri
--

CREATE SEQUENCE public.transactions_transaction_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transactions_transaction_id_seq OWNER TO anushkasuri;

--
-- TOC entry 4078 (class 0 OID 0)
-- Dependencies: 235
-- Name: transactions_transaction_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: anushkasuri
--

ALTER SEQUENCE public.transactions_transaction_id_seq OWNED BY public.transactions.transaction_id;


--
-- TOC entry 220 (class 1259 OID 16390)
-- Name: users; Type: TABLE; Schema: public; Owner: anushkasuri
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    full_name character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash text NOT NULL,
    phone character varying(15),
    date_of_birth date,
    profession character varying(100),
    profile_photo text,
    preferences jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO anushkasuri;

--
-- TOC entry 219 (class 1259 OID 16389)
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: anushkasuri
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO anushkasuri;

--
-- TOC entry 4079 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: anushkasuri
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- TOC entry 3797 (class 2604 OID 16515)
-- Name: ai_memory memory_id; Type: DEFAULT; Schema: public; Owner: anushkasuri
--

ALTER TABLE ONLY public.ai_memory ALTER COLUMN memory_id SET DEFAULT nextval('public.ai_memory_memory_id_seq'::regclass);


--
-- TOC entry 3819 (class 2604 OID 16678)
-- Name: audit_logs log_id; Type: DEFAULT; Schema: public; Owner: anushkasuri
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN log_id SET DEFAULT nextval('public.audit_logs_log_id_seq'::regclass);


--
-- TOC entry 3782 (class 2604 OID 16450)
-- Name: goals goal_id; Type: DEFAULT; Schema: public; Owner: anushkasuri
--

ALTER TABLE ONLY public.goals ALTER COLUMN goal_id SET DEFAULT nextval('public.goals_goal_id_seq'::regclass);


--
-- TOC entry 3814 (class 2604 OID 16645)
-- Name: interests interest_id; Type: DEFAULT; Schema: public; Owner: anushkasuri
--

ALTER TABLE ONLY public.interests ALTER COLUMN interest_id SET DEFAULT nextval('public.interests_interest_id_seq'::regclass);


--
-- TOC entry 3780 (class 2604 OID 16432)
-- Name: journal_images image_id; Type: DEFAULT; Schema: public; Owner: anushkasuri
--

ALTER TABLE ONLY public.journal_images ALTER COLUMN image_id SET DEFAULT nextval('public.journal_images_image_id_seq'::regclass);


--
-- TOC entry 3778 (class 2604 OID 16414)
-- Name: journals journal_id; Type: DEFAULT; Schema: public; Owner: anushkasuri
--

ALTER TABLE ONLY public.journals ALTER COLUMN journal_id SET DEFAULT nextval('public.journals_journal_id_seq'::regclass);


--
-- TOC entry 3800 (class 2604 OID 16536)
-- Name: marketplace service_id; Type: DEFAULT; Schema: public; Owner: anushkasuri
--

ALTER TABLE ONLY public.marketplace ALTER COLUMN service_id SET DEFAULT nextval('public.marketplace_service_id_seq'::regclass);


--
-- TOC entry 3786 (class 2604 OID 16471)
-- Name: missions mission_id; Type: DEFAULT; Schema: public; Owner: anushkasuri
--

ALTER TABLE ONLY public.missions ALTER COLUMN mission_id SET DEFAULT nextval('public.missions_mission_id_seq'::regclass);


--
-- TOC entry 3816 (class 2604 OID 16660)
-- Name: notifications notification_id; Type: DEFAULT; Schema: public; Owner: anushkasuri
--

ALTER TABLE ONLY public.notifications ALTER COLUMN notification_id SET DEFAULT nextval('public.notifications_notification_id_seq'::regclass);


--
-- TOC entry 3806 (class 2604 OID 16588)
-- Name: payments payment_id; Type: DEFAULT; Schema: public; Owner: anushkasuri
--

ALTER TABLE ONLY public.payments ALTER COLUMN payment_id SET DEFAULT nextval('public.payments_payment_id_seq'::regclass);


--
-- TOC entry 3810 (class 2604 OID 16615)
-- Name: preferences preference_id; Type: DEFAULT; Schema: public; Owner: anushkasuri
--

ALTER TABLE ONLY public.preferences ALTER COLUMN preference_id SET DEFAULT nextval('public.preferences_preference_id_seq'::regclass);


--
-- TOC entry 3804 (class 2604 OID 16569)
-- Name: profiles profile_id; Type: DEFAULT; Schema: public; Owner: anushkasuri
--

ALTER TABLE ONLY public.profiles ALTER COLUMN profile_id SET DEFAULT nextval('public.profiles_profile_id_seq'::regclass);


--
-- TOC entry 3812 (class 2604 OID 16630)
-- Name: skills skill_id; Type: DEFAULT; Schema: public; Owner: anushkasuri
--

ALTER TABLE ONLY public.skills ALTER COLUMN skill_id SET DEFAULT nextval('public.skills_skill_id_seq'::regclass);


--
-- TOC entry 3793 (class 2604 OID 16495)
-- Name: tasks task_id; Type: DEFAULT; Schema: public; Owner: anushkasuri
--

ALTER TABLE ONLY public.tasks ALTER COLUMN task_id SET DEFAULT nextval('public.tasks_task_id_seq'::regclass);


--
-- TOC entry 3808 (class 2604 OID 16603)
-- Name: templates template_id; Type: DEFAULT; Schema: public; Owner: anushkasuri
--

ALTER TABLE ONLY public.templates ALTER COLUMN template_id SET DEFAULT nextval('public.templates_template_id_seq'::regclass);


--
-- TOC entry 3802 (class 2604 OID 16548)
-- Name: transactions transaction_id; Type: DEFAULT; Schema: public; Owner: anushkasuri
--

ALTER TABLE ONLY public.transactions ALTER COLUMN transaction_id SET DEFAULT nextval('public.transactions_transaction_id_seq'::regclass);


--
-- TOC entry 3775 (class 2604 OID 16393)
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: anushkasuri
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- TOC entry 4037 (class 0 OID 16512)
-- Dependencies: 232
-- Data for Name: ai_memory; Type: TABLE DATA; Schema: public; Owner: anushkasuri
--

COPY public.ai_memory (memory_id, user_id, memory_type, title, content, importance_score, embedding_id, created_at, updated_at) FROM stdin;
1	1	Preference	Career Goal	User wants to build LifeKit and improve backend development skills.	0.95	vec_001	2026-07-23 13:09:48.949939	2026-07-23 13:09:48.949939
\.


--
-- TOC entry 4057 (class 0 OID 16675)
-- Dependencies: 252
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: anushkasuri
--

COPY public.audit_logs (log_id, user_id, action, table_name, record_id, ip_address, created_at) FROM stdin;
2	1	USER_LOGIN	users	1	192.168.1.45	2026-07-23 13:30:00
\.


--
-- TOC entry 4031 (class 0 OID 16447)
-- Dependencies: 226
-- Data for Name: goals; Type: TABLE DATA; Schema: public; Owner: anushkasuri
--

COPY public.goals (goal_id, user_id, title, description, category, target_date, status, progress, created_at) FROM stdin;
1	1	Learn PostgreSQL	Complete the PostgreSQL database for LifeKit	Learning	2026-08-15	In Progress	25	2026-07-23 13:05:28.783374
\.


--
-- TOC entry 4053 (class 0 OID 16642)
-- Dependencies: 248
-- Data for Name: interests; Type: TABLE DATA; Schema: public; Owner: anushkasuri
--

COPY public.interests (interest_id, user_id, interest_name, created_at) FROM stdin;
2	1	Artificial Intelligence	2026-07-23 13:35:00
\.


--
-- TOC entry 4029 (class 0 OID 16429)
-- Dependencies: 224
-- Data for Name: journal_images; Type: TABLE DATA; Schema: public; Owner: anushkasuri
--

COPY public.journal_images (image_id, journal_id, image_url, uploaded_at) FROM stdin;
1	1	https://example.com/images/journal1.jpg	2026-07-23 13:04:21.133623
\.


--
-- TOC entry 4027 (class 0 OID 16411)
-- Dependencies: 222
-- Data for Name: journals; Type: TABLE DATA; Schema: public; Owner: anushkasuri
--

COPY public.journals (journal_id, user_id, title, content, mood, created_at) FROM stdin;
1	1	My First Journal	Today I successfully connected PostgreSQL with my LifeKit project!	Happy	2026-07-23 13:02:26.61747
\.


--
-- TOC entry 4039 (class 0 OID 16533)
-- Dependencies: 234
-- Data for Name: marketplace; Type: TABLE DATA; Schema: public; Owner: anushkasuri
--

COPY public.marketplace (service_id, service_name, provider_name, category, description, price, rating, image_url, created_at) FROM stdin;
1	Career Mentorship	LifeKit Experts	Career	One-to-one mentorship session	499.00	4.8	\N	2026-07-23 13:16:19.83076
\.


--
-- TOC entry 4033 (class 0 OID 16468)
-- Dependencies: 228
-- Data for Name: missions; Type: TABLE DATA; Schema: public; Owner: anushkasuri
--

COPY public.missions (mission_id, user_id, title, description, category, priority, status, progress, start_date, target_date, created_at, updated_at) FROM stdin;
1	1	Build LifeKit	Develop and launch the LifeKit platform	Career	High	Active	0	2026-07-23	2026-12-31	2026-07-23 13:07:29.81452	2026-07-23 13:07:29.81452
\.


--
-- TOC entry 4055 (class 0 OID 16657)
-- Dependencies: 250
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: anushkasuri
--

COPY public.notifications (notification_id, user_id, title, message, notification_type, is_read, created_at) FROM stdin;
2	1	Welcome to LifeKit!	Your account setup is complete. Start by creating your first goal or task.	System Alert	f	2026-07-23 13:40:00
\.


--
-- TOC entry 4045 (class 0 OID 16585)
-- Dependencies: 240
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: anushkasuri
--

COPY public.payments (payment_id, transaction_id, payment_gateway, payment_reference, payment_status, amount, paid_at) FROM stdin;
2	1	Razorpay	PAY_REF_987654321	Success	499.00	2026-07-23 13:16:50
\.


--
-- TOC entry 4049 (class 0 OID 16612)
-- Dependencies: 244
-- Data for Name: preferences; Type: TABLE DATA; Schema: public; Owner: anushkasuri
--

COPY public.preferences (preference_id, user_id, theme, language, notification_enabled, reminder_time, timezone) FROM stdin;
2	1	Dark	English	t	09:00:00	Asia/Kolkata
\.


--
-- TOC entry 4043 (class 0 OID 16566)
-- Dependencies: 238
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: anushkasuri
--

COPY public.profiles (profile_id, user_id, bio, profile_picture, location, occupation, website, created_at) FROM stdin;
2	1	Engineering student passionate about AI, backend development, and building impactful technology solutions.	https://example.com/images/profile1.jpg	New Delhi, India	Student	https://anushkasuri.dev	2025-03-18 10:30:45
\.


--
-- TOC entry 4051 (class 0 OID 16627)
-- Dependencies: 246
-- Data for Name: skills; Type: TABLE DATA; Schema: public; Owner: anushkasuri
--

COPY public.skills (skill_id, user_id, skill_name, proficiency_level, created_at) FROM stdin;
2	1	PostgreSQL Database Design	Advanced	2026-07-23 13:45:00
\.


--
-- TOC entry 4035 (class 0 OID 16492)
-- Dependencies: 230
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: anushkasuri
--

COPY public.tasks (task_id, mission_id, title, description, priority, status, due_date, estimated_time, completed_at, created_at) FROM stdin;
1	1	Design PostgreSQL Database	Create all database tables	High	Pending	2026-07-30	120	\N	2026-07-23 13:08:33.447208
2	1	Connect FastAPI	Integrate PostgreSQL with backend	High	Pending	2026-08-02	180	\N	2026-07-23 13:08:33.447208
3	1	Test APIs	Verify CRUD operations	Medium	Pending	2026-08-05	90	\N	2026-07-23 13:08:33.447208
\.


--
-- TOC entry 4047 (class 0 OID 16600)
-- Dependencies: 242
-- Data for Name: templates; Type: TABLE DATA; Schema: public; Owner: anushkasuri
--

COPY public.templates (template_id, template_name, category, description, template_data, created_at) FROM stdin;
2	Daily Productivity Planner	Productivity	A structured daily template for setting goals, tracking tasks, and reviewing reflections.	{"sections": ["Goals", "Tasks", "Reflections"], "default_view": "list"}	2026-07-23 13:50:00
\.


--
-- TOC entry 4041 (class 0 OID 16545)
-- Dependencies: 236
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: anushkasuri
--

COPY public.transactions (transaction_id, user_id, service_id, amount, payment_status, payment_method, transaction_date) FROM stdin;
1	1	1	499.00	Completed	UPI	2026-07-23 13:16:49.63033
\.


--
-- TOC entry 4025 (class 0 OID 16390)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: anushkasuri
--

COPY public.users (user_id, full_name, email, password_hash, phone, date_of_birth, profession, profile_photo, preferences, created_at, updated_at) FROM stdin;
1	Anushka Suri	anushka@example.com	password123	9876543210	\N	Student	\N	\N	2026-07-23 12:59:42.418979	2026-07-23 12:59:42.418979
\.


--
-- TOC entry 4080 (class 0 OID 0)
-- Dependencies: 231
-- Name: ai_memory_memory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: anushkasuri
--

SELECT pg_catalog.setval('public.ai_memory_memory_id_seq', 1, true);


--
-- TOC entry 4081 (class 0 OID 0)
-- Dependencies: 251
-- Name: audit_logs_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: anushkasuri
--

SELECT pg_catalog.setval('public.audit_logs_log_id_seq', 2, true);


--
-- TOC entry 4082 (class 0 OID 0)
-- Dependencies: 225
-- Name: goals_goal_id_seq; Type: SEQUENCE SET; Schema: public; Owner: anushkasuri
--

SELECT pg_catalog.setval('public.goals_goal_id_seq', 1, true);


--
-- TOC entry 4083 (class 0 OID 0)
-- Dependencies: 247
-- Name: interests_interest_id_seq; Type: SEQUENCE SET; Schema: public; Owner: anushkasuri
--

SELECT pg_catalog.setval('public.interests_interest_id_seq', 2, true);


--
-- TOC entry 4084 (class 0 OID 0)
-- Dependencies: 223
-- Name: journal_images_image_id_seq; Type: SEQUENCE SET; Schema: public; Owner: anushkasuri
--

SELECT pg_catalog.setval('public.journal_images_image_id_seq', 1, true);


--
-- TOC entry 4085 (class 0 OID 0)
-- Dependencies: 221
-- Name: journals_journal_id_seq; Type: SEQUENCE SET; Schema: public; Owner: anushkasuri
--

SELECT pg_catalog.setval('public.journals_journal_id_seq', 1, true);


--
-- TOC entry 4086 (class 0 OID 0)
-- Dependencies: 233
-- Name: marketplace_service_id_seq; Type: SEQUENCE SET; Schema: public; Owner: anushkasuri
--

SELECT pg_catalog.setval('public.marketplace_service_id_seq', 1, true);


--
-- TOC entry 4087 (class 0 OID 0)
-- Dependencies: 227
-- Name: missions_mission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: anushkasuri
--

SELECT pg_catalog.setval('public.missions_mission_id_seq', 1, true);


--
-- TOC entry 4088 (class 0 OID 0)
-- Dependencies: 249
-- Name: notifications_notification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: anushkasuri
--

SELECT pg_catalog.setval('public.notifications_notification_id_seq', 2, true);


--
-- TOC entry 4089 (class 0 OID 0)
-- Dependencies: 239
-- Name: payments_payment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: anushkasuri
--

SELECT pg_catalog.setval('public.payments_payment_id_seq', 2, true);


--
-- TOC entry 4090 (class 0 OID 0)
-- Dependencies: 243
-- Name: preferences_preference_id_seq; Type: SEQUENCE SET; Schema: public; Owner: anushkasuri
--

SELECT pg_catalog.setval('public.preferences_preference_id_seq', 2, true);


--
-- TOC entry 4091 (class 0 OID 0)
-- Dependencies: 237
-- Name: profiles_profile_id_seq; Type: SEQUENCE SET; Schema: public; Owner: anushkasuri
--

SELECT pg_catalog.setval('public.profiles_profile_id_seq', 2, true);


--
-- TOC entry 4092 (class 0 OID 0)
-- Dependencies: 245
-- Name: skills_skill_id_seq; Type: SEQUENCE SET; Schema: public; Owner: anushkasuri
--

SELECT pg_catalog.setval('public.skills_skill_id_seq', 2, true);


--
-- TOC entry 4093 (class 0 OID 0)
-- Dependencies: 229
-- Name: tasks_task_id_seq; Type: SEQUENCE SET; Schema: public; Owner: anushkasuri
--

SELECT pg_catalog.setval('public.tasks_task_id_seq', 3, true);


--
-- TOC entry 4094 (class 0 OID 0)
-- Dependencies: 241
-- Name: templates_template_id_seq; Type: SEQUENCE SET; Schema: public; Owner: anushkasuri
--

SELECT pg_catalog.setval('public.templates_template_id_seq', 2, true);


--
-- TOC entry 4095 (class 0 OID 0)
-- Dependencies: 235
-- Name: transactions_transaction_id_seq; Type: SEQUENCE SET; Schema: public; Owner: anushkasuri
--

SELECT pg_catalog.setval('public.transactions_transaction_id_seq', 1, true);


--
-- TOC entry 4096 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: anushkasuri
--

SELECT pg_catalog.setval('public.users_user_id_seq', 1, true);


--
-- TOC entry 3839 (class 2606 OID 16526)
-- Name: ai_memory ai_memory_pkey; Type: CONSTRAINT; Schema: public; Owner: anushkasuri
--

ALTER TABLE ONLY public.ai_memory
    ADD CONSTRAINT ai_memory_pkey PRIMARY KEY (memory_id);


--
-- TOC entry 3861 (class 2606 OID 16682)
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: anushkasuri
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (log_id);


--
-- TOC entry 3833 (class 2606 OID 16461)
-- Name: goals goals_pkey; Type: CONSTRAINT; Schema: public; Owner: anushkasuri
--

ALTER TABLE ONLY public.goals
    ADD CONSTRAINT goals_pkey PRIMARY KEY (goal_id);


--
-- TOC entry 3857 (class 2606 OID 16650)
-- Name: interests interests_pkey; Type: CONSTRAINT; Schema: public; Owner: anushkasuri
--

ALTER TABLE ONLY public.interests
    ADD CONSTRAINT interests_pkey PRIMARY KEY (interest_id);


--
-- TOC entry 3831 (class 2606 OID 16440)
-- Name: journal_images journal_images_pkey; Type: CONSTRAINT; Schema: public; Owner: anushkasuri
--

ALTER TABLE ONLY public.journal_images
    ADD CONSTRAINT journal_images_pkey PRIMARY KEY (image_id);


--
-- TOC entry 3829 (class 2606 OID 16422)
-- Name: journals journals_pkey; Type: CONSTRAINT; Schema: public; Owner: anushkasuri
--

ALTER TABLE ONLY public.journals
    ADD CONSTRAINT journals_pkey PRIMARY KEY (journal_id);


--
-- TOC entry 3841 (class 2606 OID 16543)
-- Name: marketplace marketplace_pkey; Type: CONSTRAINT; Schema: public; Owner: anushkasuri
--

ALTER TABLE ONLY public.marketplace
    ADD CONSTRAINT marketplace_pkey PRIMARY KEY (service_id);


--
-- TOC entry 3835 (class 2606 OID 16485)
-- Name: missions missions_pkey; Type: CONSTRAINT; Schema: public; Owner: anushkasuri
--

ALTER TABLE ONLY public.missions
    ADD CONSTRAINT missions_pkey PRIMARY KEY (mission_id);


--
-- TOC entry 3859 (class 2606 OID 16668)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: anushkasuri
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (notification_id);


--
-- TOC entry 3849 (class 2606 OID 16593)
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: anushkasuri
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (payment_id);


--
-- TOC entry 3853 (class 2606 OID 16620)
-- Name: preferences preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: anushkasuri
--

ALTER TABLE ONLY public.preferences
    ADD CONSTRAINT preferences_pkey PRIMARY KEY (preference_id);


--
-- TOC entry 3845 (class 2606 OID 16576)
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: anushkasuri
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (profile_id);


--
-- TOC entry 3847 (class 2606 OID 16578)
-- Name: profiles profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: anushkasuri
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);


--
-- TOC entry 3855 (class 2606 OID 16635)
-- Name: skills skills_pkey; Type: CONSTRAINT; Schema: public; Owner: anushkasuri
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_pkey PRIMARY KEY (skill_id);


--
-- TOC entry 3837 (class 2606 OID 16505)
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: anushkasuri
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (task_id);


--
-- TOC entry 3851 (class 2606 OID 16609)
-- Name: templates templates_pkey; Type: CONSTRAINT; Schema: public; Owner: anushkasuri
--

ALTER TABLE ONLY public.templates
    ADD CONSTRAINT templates_pkey PRIMARY KEY (template_id);


--
-- TOC entry 3843 (class 2606 OID 16554)
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: anushkasuri
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (transaction_id);


--
-- TOC entry 3825 (class 2606 OID 16405)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: anushkasuri
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 3827 (class 2606 OID 16403)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: anushkasuri
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- TOC entry 3876 (class 2606 OID 16683)
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: anushkasuri
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- TOC entry 3864 (class 2606 OID 16462)
-- Name: goals fk_goal_user; Type: FK CONSTRAINT; Schema: public; Owner: anushkasuri
--

ALTER TABLE ONLY public.goals
    ADD CONSTRAINT fk_goal_user FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3863 (class 2606 OID 16441)
-- Name: journal_images fk_journal; Type: FK CONSTRAINT; Schema: public; Owner: anushkasuri
--

ALTER TABLE ONLY public.journal_images
    ADD CONSTRAINT fk_journal FOREIGN KEY (journal_id) REFERENCES public.journals(journal_id) ON DELETE CASCADE;


--
-- TOC entry 3867 (class 2606 OID 16527)
-- Name: ai_memory fk_memory_user; Type: FK CONSTRAINT; Schema: public; Owner: anushkasuri
--

ALTER TABLE ONLY public.ai_memory
    ADD CONSTRAINT fk_memory_user FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3865 (class 2606 OID 16486)
-- Name: missions fk_mission_user; Type: FK CONSTRAINT; Schema: public; Owner: anushkasuri
--

ALTER TABLE ONLY public.missions
    ADD CONSTRAINT fk_mission_user FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3866 (class 2606 OID 16506)
-- Name: tasks fk_task_mission; Type: FK CONSTRAINT; Schema: public; Owner: anushkasuri
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT fk_task_mission FOREIGN KEY (mission_id) REFERENCES public.missions(mission_id) ON DELETE CASCADE;


--
-- TOC entry 3868 (class 2606 OID 16560)
-- Name: transactions fk_transaction_service; Type: FK CONSTRAINT; Schema: public; Owner: anushkasuri
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT fk_transaction_service FOREIGN KEY (service_id) REFERENCES public.marketplace(service_id) ON DELETE CASCADE;


--
-- TOC entry 3869 (class 2606 OID 16555)
-- Name: transactions fk_transaction_user; Type: FK CONSTRAINT; Schema: public; Owner: anushkasuri
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT fk_transaction_user FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3862 (class 2606 OID 16423)
-- Name: journals fk_user; Type: FK CONSTRAINT; Schema: public; Owner: anushkasuri
--

ALTER TABLE ONLY public.journals
    ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3874 (class 2606 OID 16651)
-- Name: interests interests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: anushkasuri
--

ALTER TABLE ONLY public.interests
    ADD CONSTRAINT interests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3875 (class 2606 OID 16669)
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: anushkasuri
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3871 (class 2606 OID 16594)
-- Name: payments payments_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: anushkasuri
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(transaction_id) ON DELETE CASCADE;


--
-- TOC entry 3872 (class 2606 OID 16621)
-- Name: preferences preferences_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: anushkasuri
--

ALTER TABLE ONLY public.preferences
    ADD CONSTRAINT preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3870 (class 2606 OID 16579)
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: anushkasuri
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3873 (class 2606 OID 16636)
-- Name: skills skills_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: anushkasuri
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


-- Completed on 2026-07-24 13:42:51 IST

--
-- PostgreSQL database dump complete
--

\unrestrict BYAvuhIh2BNHv0Wc5AcLW57rdQiSwFbkXw2vyLKbasE14qkjk0CwjiymuGSVict

