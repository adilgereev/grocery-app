SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict 3t53yakuw4Ws8cwBvH8cyaj0YwjhHTHF5zcxAnsSkfLrzJYkF2OKiH2BweJV74v

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

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
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."audit_log_entries" ("instance_id", "id", "payload", "created_at", "ip_address") VALUES
	('00000000-0000-0000-0000-000000000000', '533395d1-d995-4512-8ca1-7243b4398a2a', '{"action":"user_signedup","actor_id":"8b44a63b-f184-4a11-bd46-243004e5c7d2","actor_username":"phone79260373731@example.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2026-04-06 22:26:28.035181+00', ''),
	('00000000-0000-0000-0000-000000000000', '09adcad6-3fa2-49f0-97e7-02ffbcd9a36f', '{"action":"login","actor_id":"8b44a63b-f184-4a11-bd46-243004e5c7d2","actor_username":"phone79260373731@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-04-06 22:26:28.079321+00', ''),
	('00000000-0000-0000-0000-000000000000', '11a91e63-022a-4989-9243-f85c6b8e159d', '{"action":"login","actor_id":"8b44a63b-f184-4a11-bd46-243004e5c7d2","actor_username":"phone79260373731@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-04-06 22:51:49.944387+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b07130df-9ee8-4424-ae6a-5842c17e8565', '{"action":"token_refreshed","actor_id":"8b44a63b-f184-4a11-bd46-243004e5c7d2","actor_username":"phone79260373731@example.com","actor_via_sso":false,"log_type":"token"}', '2026-04-07 00:44:24.844135+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b5de9541-cf0f-47c9-a6d6-c1fbba6f03a1', '{"action":"token_revoked","actor_id":"8b44a63b-f184-4a11-bd46-243004e5c7d2","actor_username":"phone79260373731@example.com","actor_via_sso":false,"log_type":"token"}', '2026-04-07 00:44:24.846466+00', ''),
	('00000000-0000-0000-0000-000000000000', '8b929b53-960b-4fa6-a6e3-720e5ebd4527', '{"action":"token_refreshed","actor_id":"8b44a63b-f184-4a11-bd46-243004e5c7d2","actor_username":"phone79260373731@example.com","actor_via_sso":false,"log_type":"token"}', '2026-04-07 00:51:30.690251+00', ''),
	('00000000-0000-0000-0000-000000000000', '6b2297d2-f064-4bb1-a9bb-07fc744b13c5', '{"action":"token_revoked","actor_id":"8b44a63b-f184-4a11-bd46-243004e5c7d2","actor_username":"phone79260373731@example.com","actor_via_sso":false,"log_type":"token"}', '2026-04-07 00:51:30.691213+00', ''),
	('00000000-0000-0000-0000-000000000000', '737fd10c-d901-4da3-a6f9-03e737de0194', '{"action":"token_refreshed","actor_id":"8b44a63b-f184-4a11-bd46-243004e5c7d2","actor_username":"phone79260373731@example.com","actor_via_sso":false,"log_type":"token"}', '2026-04-07 16:14:42.734627+00', ''),
	('00000000-0000-0000-0000-000000000000', '73c8535b-fa72-4611-97dc-0152df2c9f25', '{"action":"token_revoked","actor_id":"8b44a63b-f184-4a11-bd46-243004e5c7d2","actor_username":"phone79260373731@example.com","actor_via_sso":false,"log_type":"token"}', '2026-04-07 16:14:42.736938+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd5619637-d0b6-46de-a4ed-b7e0c2abceb6', '{"action":"token_refreshed","actor_id":"8b44a63b-f184-4a11-bd46-243004e5c7d2","actor_username":"phone79260373731@example.com","actor_via_sso":false,"log_type":"token"}', '2026-04-07 17:54:56.252232+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f48e0323-8476-48d7-9f69-0fe1a43cf088', '{"action":"token_revoked","actor_id":"8b44a63b-f184-4a11-bd46-243004e5c7d2","actor_username":"phone79260373731@example.com","actor_via_sso":false,"log_type":"token"}', '2026-04-07 17:54:56.25311+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e941b5aa-8c02-4f63-b80b-9badb05fcb1a', '{"action":"token_refreshed","actor_id":"8b44a63b-f184-4a11-bd46-243004e5c7d2","actor_username":"phone79260373731@example.com","actor_via_sso":false,"log_type":"token"}', '2026-04-07 18:25:58.433197+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b3baf476-0379-4c22-b720-6933675801e3', '{"action":"token_revoked","actor_id":"8b44a63b-f184-4a11-bd46-243004e5c7d2","actor_username":"phone79260373731@example.com","actor_via_sso":false,"log_type":"token"}', '2026-04-07 18:25:58.434616+00', '');


--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '8b44a63b-f184-4a11-bd46-243004e5c7d2', 'authenticated', 'authenticated', 'phone79260373731@example.com', '$2a$10$8cFjKLPEx9LwcVuTBrcia.HGkLBBZc0DvkdioXhYus3oaj9Ks1MlO', '2026-04-06 22:26:28.036287+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-04-06 22:51:49.945736+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "8b44a63b-f184-4a11-bd46-243004e5c7d2", "email": "phone79260373731@example.com", "phone": "79260373731", "email_verified": true, "phone_verified": false}', NULL, '2026-04-06 22:26:28.025461+00', '2026-04-07 18:25:58.437603+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('8b44a63b-f184-4a11-bd46-243004e5c7d2', '8b44a63b-f184-4a11-bd46-243004e5c7d2', '{"sub": "8b44a63b-f184-4a11-bd46-243004e5c7d2", "email": "phone79260373731@example.com", "phone": "79260373731", "email_verified": false, "phone_verified": false}', 'email', '2026-04-06 22:26:28.032171+00', '2026-04-06 22:26:28.03221+00', '2026-04-06 22:26:28.03221+00', 'ed81ba15-e65b-41d4-9874-02e2dcd19374');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") VALUES
	('6af1d8f6-a2ce-4a6e-9b6d-bb5597564074', '8b44a63b-f184-4a11-bd46-243004e5c7d2', '2026-04-06 22:26:28.08071+00', '2026-04-07 17:54:56.257104+00', NULL, 'aal1', NULL, '2026-04-07 17:54:56.25704', 'Expo/1017756 CFNetwork/3860.400.51 Darwin/25.3.0', '172.18.0.1', NULL, NULL, NULL, NULL, NULL),
	('13fdecbd-0398-4028-82ae-09e99657dff1', '8b44a63b-f184-4a11-bd46-243004e5c7d2', '2026-04-06 22:51:49.945832+00', '2026-04-07 18:25:58.440176+00', NULL, 'aal1', NULL, '2026-04-07 18:25:58.440064', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '172.18.0.1', NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('6af1d8f6-a2ce-4a6e-9b6d-bb5597564074', '2026-04-06 22:26:28.085527+00', '2026-04-06 22:26:28.085527+00', 'password', '42546eaa-2511-49c9-a3b2-1885fba0b744'),
	('13fdecbd-0398-4028-82ae-09e99657dff1', '2026-04-06 22:51:49.950293+00', '2026-04-06 22:51:49.950293+00', 'password', '6458bb61-2e5d-4c91-8217-6c85a7ab4674');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 2, '7ksssdtoe5u2', '8b44a63b-f184-4a11-bd46-243004e5c7d2', true, '2026-04-06 22:51:49.948237+00', '2026-04-07 00:44:24.847949+00', NULL, '13fdecbd-0398-4028-82ae-09e99657dff1'),
	('00000000-0000-0000-0000-000000000000', 1, 's34vztltxxyb', '8b44a63b-f184-4a11-bd46-243004e5c7d2', true, '2026-04-06 22:26:28.083265+00', '2026-04-07 00:51:30.691801+00', NULL, '6af1d8f6-a2ce-4a6e-9b6d-bb5597564074'),
	('00000000-0000-0000-0000-000000000000', 4, '73fggkjcuhf5', '8b44a63b-f184-4a11-bd46-243004e5c7d2', true, '2026-04-07 00:51:30.692496+00', '2026-04-07 16:14:42.737618+00', 's34vztltxxyb', '6af1d8f6-a2ce-4a6e-9b6d-bb5597564074'),
	('00000000-0000-0000-0000-000000000000', 5, '7dgpvgaxa4nu', '8b44a63b-f184-4a11-bd46-243004e5c7d2', true, '2026-04-07 16:14:42.739701+00', '2026-04-07 17:54:56.25373+00', '73fggkjcuhf5', '6af1d8f6-a2ce-4a6e-9b6d-bb5597564074'),
	('00000000-0000-0000-0000-000000000000', 6, 'hg2sbz6dh44q', '8b44a63b-f184-4a11-bd46-243004e5c7d2', false, '2026-04-07 17:54:56.254453+00', '2026-04-07 17:54:56.254453+00', '7dgpvgaxa4nu', '6af1d8f6-a2ce-4a6e-9b6d-bb5597564074'),
	('00000000-0000-0000-0000-000000000000', 3, 'smd3vjlynpdu', '8b44a63b-f184-4a11-bd46-243004e5c7d2', true, '2026-04-07 00:44:24.849738+00', '2026-04-07 18:25:58.435429+00', '7ksssdtoe5u2', '13fdecbd-0398-4028-82ae-09e99657dff1'),
	('00000000-0000-0000-0000-000000000000', 7, 'k5qb2fhci66h', '8b44a63b-f184-4a11-bd46-243004e5c7d2', false, '2026-04-07 18:25:58.436467+00', '2026-04-07 18:25:58.436467+00', 'smd3vjlynpdu', '13fdecbd-0398-4028-82ae-09e99657dff1');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: addresses; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."categories" ("id", "name", "slug", "image_url", "created_at", "parent_id", "sort_order", "image_transformations") VALUES
	('943956ce-d89c-4720-9407-3854173166e2', 'Мороженое', 'ice-cream', 'https://ik.imagekit.io/deliva/categories/ice-cream.png', '2026-04-06 22:46:21.135121+00', '5caa7106-be9f-4313-9de1-df127603b307', 1, NULL),
	('a464d323-6902-4d62-8d25-9aede0e1a9e6', 'Пельмени и вареники', 'dumplings', 'https://ik.imagekit.io/deliva/categories/dumplings.png', '2026-04-06 22:46:21.135121+00', '5caa7106-be9f-4313-9de1-df127603b307', 2, NULL),
	('71910bc3-34a9-46da-8965-2ec817c454b8', 'Овощи и ягоды', 'frozen-veg-berries', 'https://ik.imagekit.io/deliva/categories/frozen-veg-berries.png', '2026-04-06 22:46:21.135121+00', '5caa7106-be9f-4313-9de1-df127603b307', 3, NULL),
	('1750c7c5-ae7f-4c41-aca1-77625550ae88', 'Полуфабрикаты', 'frozen-ready-meals', 'https://ik.imagekit.io/deliva/categories/frozen-ready-meals.png', '2026-04-06 22:46:21.135121+00', '5caa7106-be9f-4313-9de1-df127603b307', 4, NULL),
	('74eb4dd9-e6dc-4af7-8253-a75ac1c02bbf', 'Из пекарен', 'from-bakery', 'https://ik.imagekit.io/deliva/categories/from-bakery.png', '2026-04-06 22:46:21.135121+00', '91efc287-dc89-4a3a-83e7-bfc8e8f2309f', 1, NULL),
	('c847f710-8bc2-4f2a-a601-4368db4617b9', 'Выпечка', 'bakery-pastries', 'https://ik.imagekit.io/deliva/categories/bakery-pastries.png', '2026-04-06 22:46:21.135121+00', '91efc287-dc89-4a3a-83e7-bfc8e8f2309f', 2, NULL),
	('16081cbb-7ee9-4c80-a5a4-59128b3e7834', 'Макароны, крупы и мука', 'pasta-cereals-flour', 'https://ik.imagekit.io/deliva/categories/pasta-cereals-flour.png', '2026-04-06 22:46:21.135121+00', '4d4d77ee-6036-4d5a-8751-8c6cc4cf5235', 1, NULL),
	('04781eba-03f9-4ebf-8b2a-8f6ab4e70aa6', 'Сухие завтраки и каши', 'breakfast-cereals', 'https://ik.imagekit.io/deliva/categories/breakfast-cereals.png', '2026-04-06 22:46:21.135121+00', '4d4d77ee-6036-4d5a-8751-8c6cc4cf5235', 2, NULL),
	('2b32bcb5-7fae-478f-a6f0-88d6c3876352', 'Масло, соусы и специи', 'oil-sauces-spices', 'https://ik.imagekit.io/deliva/categories/oil-sauces-spices.png', '2026-04-06 22:46:21.135121+00', '4d4d77ee-6036-4d5a-8751-8c6cc4cf5235', 3, NULL),
	('82c7e7ff-a705-4af0-8fe2-406616c6900c', 'Кофе, какао и чай', 'coffee-tea-cocoa', 'https://ik.imagekit.io/deliva/categories/coffee-tea-cocoa.png', '2026-04-06 22:46:21.135121+00', '4d4d77ee-6036-4d5a-8751-8c6cc4cf5235', 4, NULL),
	('eb0ca2f3-d495-4eff-bb5a-d6cd6769554f', 'Рыба и морепродукты', 'frozen-fish', 'https://ik.imagekit.io/deliva/categories/frozen-fish.png', '2026-04-06 22:46:21.135121+00', '5caa7106-be9f-4313-9de1-df127603b307', 5, NULL),
	('1a0968a1-4f0b-4000-88a2-90a654c93497', 'Снеки', 'snacks', 'https://ik.imagekit.io/deliva/categories/snacks.png', '2026-04-06 22:46:21.135121+00', '86301bdc-b7d6-4ccd-8eed-dde3f3d2a506', 1, NULL),
	('1b2d4369-88ba-4a03-8972-b2b748972413', 'Сухофрукты и орехи', 'nuts-dried-fruits', 'https://ik.imagekit.io/deliva/categories/nuts-dried-fruits.png', '2026-04-06 22:46:21.135121+00', '86301bdc-b7d6-4ccd-8eed-dde3f3d2a506', 2, NULL),
	('e07fe138-996a-4a01-8bbb-01ab0dc0ceef', 'Торты, печенье, вафли', 'cakes-pastries', 'https://ik.imagekit.io/deliva/categories/cakes-pastries.png', '2026-04-06 22:46:21.135121+00', '86301bdc-b7d6-4ccd-8eed-dde3f3d2a506', 3, NULL),
	('640a3e20-87ea-42bd-b647-a1c0747dd3f9', 'Шоколад и конфеты', 'chocolate-candy', 'https://ik.imagekit.io/deliva/categories/chocolate-candy.png', '2026-04-06 22:46:21.135121+00', '86301bdc-b7d6-4ccd-8eed-dde3f3d2a506', 4, NULL),
	('2b2d549b-dfc1-4963-bfd9-efc4f955772c', 'Пастила и мармелад', 'marshmallows', 'https://ik.imagekit.io/deliva/categories/marshmallows.png', '2026-04-06 22:46:21.135121+00', '86301bdc-b7d6-4ccd-8eed-dde3f3d2a506', 5, NULL),
	('90c9b4fb-bfb7-4f4c-988a-933190c8bb9b', 'Вода', 'water', 'https://ik.imagekit.io/deliva/categories/water.png', '2026-04-06 22:46:21.135121+00', '97f6bf99-4e96-47d3-9dab-dcca09c6a3ff', 1, NULL),
	('bbc3e793-f6fb-4290-9b12-614a238ce5e1', 'Соки и морсы', 'juices', 'https://ik.imagekit.io/deliva/categories/juices.png', '2026-04-06 22:46:21.135121+00', '97f6bf99-4e96-47d3-9dab-dcca09c6a3ff', 2, NULL),
	('36caf253-e321-4962-8d32-95417eae78fc', 'Хлебцы', 'bread-crisps', 'https://ik.imagekit.io/deliva/categories/bread-crisps.png', '2026-04-06 22:46:21.135121+00', '91efc287-dc89-4a3a-83e7-bfc8e8f2309f', 3, NULL),
	('efc802c9-89d8-48df-89df-3566a05494ce', 'Хлеб', 'bread', 'https://ik.imagekit.io/deliva/categories/bread.png', '2026-04-06 22:46:21.135121+00', '91efc287-dc89-4a3a-83e7-bfc8e8f2309f', 4, NULL),
	('b4608d51-838e-41d4-a85b-c944b5c36ed9', 'Мясо и птица', 'meat-poultry', 'https://ik.imagekit.io/deliva/categories/meat-poultry.png', '2026-04-06 22:46:21.135121+00', 'f3a27a39-410b-431a-bdc4-340fba7e32d0', 1, NULL),
	('4c0410f3-4df8-4e13-b6bc-12057ed2ceff', 'Колбаса и сосиски', 'sausages', 'https://ik.imagekit.io/deliva/categories/sausages.png', '2026-04-06 22:46:21.135121+00', 'f3a27a39-410b-431a-bdc4-340fba7e32d0', 2, NULL),
	('1a7f0a64-4bc2-4555-8f48-d5957ca009b2', 'Закуски и паштеты', 'snacks-pates', 'https://ik.imagekit.io/deliva/categories/snacks-pates.png', '2026-04-06 22:46:21.135121+00', 'f3a27a39-410b-431a-bdc4-340fba7e32d0', 3, NULL),
	('be1ac4d1-869c-49a0-a304-71f750563f0b', 'Рыба и морепродукты', 'fish-seafood', 'https://ik.imagekit.io/deliva/categories/fish-seafood.png', '2026-04-06 22:46:21.135121+00', 'f3a27a39-410b-431a-bdc4-340fba7e32d0', 4, NULL),
	('09bd77da-e99a-4b83-a3ed-09807987b068', 'Молочные продукты', 'molochka', 'https://ik.imagekit.io/deliva/categories/molochka.png', '2026-03-25 11:12:40.645826+00', NULL, 2, NULL),
	('91efc287-dc89-4a3a-83e7-bfc8e8f2309f', 'Булочная', 'bakery', 'https://ik.imagekit.io/deliva/categories/bakery.png', '2026-04-06 22:46:21.135121+00', NULL, 3, NULL),
	('5caa7106-be9f-4313-9de1-df127603b307', 'Заморозка', 'frozen', 'https://ik.imagekit.io/deliva/categories/frozen.png', '2026-04-06 22:46:21.135121+00', NULL, 5, NULL),
	('f3a27a39-410b-431a-bdc4-340fba7e32d0', 'Мясо, птица, рыба', 'meat-fish', 'https://ik.imagekit.io/deliva/categories/meat-fish.png', '2026-04-06 22:46:21.135121+00', NULL, 4, NULL),
	('af086809-28b8-4ba4-8f8f-ab8b58c33609', 'Дом, милый дом', 'household', 'https://ik.imagekit.io/deliva/categories/household.png', '2026-04-06 22:46:21.135121+00', NULL, 9, NULL),
	('4d4d77ee-6036-4d5a-8751-8c6cc4cf5235', 'Бакалея', 'grocery', 'https://ik.imagekit.io/deliva/categories/grocery.png', '2026-04-06 22:46:21.135121+00', NULL, 8, NULL),
	('6b26ff30-9165-4a5d-973c-65948703d644', 'Овощной прилавок', 'vegetables-fruits', 'https://ik.imagekit.io/deliva/categories/vegetables-fruits.png', '2026-04-06 22:46:21.135121+00', NULL, 1, NULL),
	('86301bdc-b7d6-4ccd-8eed-dde3f3d2a506', 'Сладкое и снеки', 'sweets-snacks', 'https://ik.imagekit.io/deliva/categories/sweets-snacks.png', '2026-04-06 22:46:21.135121+00', NULL, 6, NULL),
	('97f6bf99-4e96-47d3-9dab-dcca09c6a3ff', 'Вода и напитки', 'drinks', 'https://ik.imagekit.io/deliva/categories/drinks.png', '2026-04-06 22:46:21.135121+00', NULL, 7, NULL),
	('6e74c69f-b86c-4472-a94a-942174ab74d9', 'Йогурты и десерты', 'yogurty-desserty', 'https://ik.imagekit.io/deliva/categories/yogurty-desserty.png', '2026-03-25 11:12:40.645826+00', '09bd77da-e99a-4b83-a3ed-09807987b068', 3, NULL),
	('c9f3eb1f-ec63-4752-bb01-136b4729da56', 'Кефир, сметана, творог', 'kefir-smetana-tvorog', 'https://ik.imagekit.io/deliva/categories/kefir-smetana-tvorog.png', '2026-03-25 11:12:40.645826+00', '09bd77da-e99a-4b83-a3ed-09807987b068', 4, NULL),
	('cc12ced8-bc9d-4eae-ad2b-1b478e04e66c', 'Сыры', 'siry', 'https://ik.imagekit.io/deliva/categories/siry.png', '2026-03-25 11:12:40.645826+00', '09bd77da-e99a-4b83-a3ed-09807987b068', 2, NULL),
	('631f8808-eb3c-4b30-87b8-ee215cff1999', 'Молоко, масло, яйца', 'moloko-maylo-yaytsa', 'https://ik.imagekit.io/deliva/categories/moloko-maylo-yaytsa.png', '2026-03-25 11:12:40.645826+00', '09bd77da-e99a-4b83-a3ed-09807987b068', 1, NULL),
	('446b9ef1-3467-4885-92fa-9502dc0a4a76', 'Грибы и зелень', 'griby-i-zelen', 'https://ik.imagekit.io/deliva/categories/griby-i-zelen.png', '2026-04-07 18:27:43.415715+00', '6b26ff30-9165-4a5d-973c-65948703d644', 2, NULL),
	('918c3966-05de-4572-bd71-045f79e3319b', 'Овощи', 'ovoshchi', 'https://ik.imagekit.io/deliva/categories/ovoshchi.png', '2026-04-06 22:46:21.135121+00', '6b26ff30-9165-4a5d-973c-65948703d644', 1, NULL),
	('eae00289-2ed3-4ad7-b8f8-d8c9639034af', 'Фрукты и ягоды', 'fruits-berries', 'https://ik.imagekit.io/deliva/categories/fruits-berries.png', '2026-04-06 22:46:21.135121+00', '6b26ff30-9165-4a5d-973c-65948703d644', 3, NULL),
	('01e383b7-5725-4b16-bb8d-fe998060c1ad', 'Газировка и тоники', 'soda', 'https://ik.imagekit.io/deliva/categories/soda.png', '2026-04-06 22:46:21.135121+00', '97f6bf99-4e96-47d3-9dab-dcca09c6a3ff', 3, NULL),
	('f80e0e90-bad3-4776-88e8-4b6ada69a2cf', 'Энергетики, пиво и вино', 'energy-alcohol', 'https://ik.imagekit.io/deliva/categories/energy-alcohol.png', '2026-04-06 22:46:21.135121+00', '97f6bf99-4e96-47d3-9dab-dcca09c6a3ff', 4, NULL),
	('b463d682-3f15-44e7-bf37-3464fba3fff4', 'Стирка', 'laundry', 'https://ik.imagekit.io/deliva/categories/laundry.png', '2026-04-06 22:46:21.135121+00', 'af086809-28b8-4ba4-8f8f-ab8b58c33609', 1, NULL),
	('476f24c5-7935-40e1-a340-f582da01335d', 'Для мытья посуды', 'dishwashing', 'https://ik.imagekit.io/deliva/categories/dishwashing.png', '2026-04-06 22:46:21.135121+00', 'af086809-28b8-4ba4-8f8f-ab8b58c33609', 2, NULL),
	('bb4b28da-feee-479c-ab5f-27d9075285c8', 'Уборка', 'cleaning', 'https://ik.imagekit.io/deliva/categories/cleaning.png', '2026-04-06 22:46:21.135121+00', 'af086809-28b8-4ba4-8f8f-ab8b58c33609', 3, NULL);


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."products" ("id", "category_id", "name", "description", "price", "unit", "image_url", "stock", "is_active", "created_at", "tags", "calories", "proteins", "fats", "carbohydrates") VALUES
	('a9263dfb-b0c8-44b7-9a36-f9d5315941c5', '631f8808-eb3c-4b30-87b8-ee215cff1999', 'Молоко 3.2%', 'Натуральное фермерское молоко', 85.00, '1 л', 'https://ik.imagekit.io/deliva/products/milk-32.jpg', 20, true, '2026-03-18 21:41:59.706701+00', '{Молоко,Напитки}', 59, 3.2, 3.2, 4.8),
	('b4c97f96-c231-4aad-b2ab-a2c5267b1fb5', '631f8808-eb3c-4b30-87b8-ee215cff1999', 'Яйца С0', 'Крупные отборные яйца от деревенских кур', 145.00, '10 шт', 'https://ik.imagekit.io/deliva/products/eggs-c0.jpg', 100, true, '2026-03-22 21:27:46.233727+00', '{Яйца,"На завтрак"}', 155, 12.7, 10.9, 0.7),
	('738c19af-cc9f-487a-9479-fc450dd77e8f', 'cc12ced8-bc9d-4eae-ad2b-1b478e04e66c', 'Сыр Чеддер', 'Полутвердый выдержанный сыр', 450.00, '200 г', 'https://ik.imagekit.io/deliva/products/cheese-cheddar.jpg', 15, true, '2026-03-18 21:41:59.706701+00', '{Сыр,"На завтрак"}', 402, 25.0, 33.0, 1.3),
	('a0a0ae32-a4d3-41fc-8778-f0d6a325bceb', 'c9f3eb1f-ec63-4752-bb01-136b4729da56', 'Творог 9%', 'Рассыпчатый и нежный, без добавок', 95.00, '200 г', 'https://ik.imagekit.io/deliva/products/curd-9.jpg', 25, true, '2026-03-22 21:27:46.233727+00', '{Творог,"На завтрак",Спорт}', 159, 16.7, 9.0, 2.0),
	('baef87a2-a11c-467f-a38b-d51b9a3b8b35', NULL, 'Апельсиновый сок', '100% натуральный сок без сахара', 180.00, '1 л', 'https://ik.imagekit.io/deliva/products/orange-juice.jpg', 30, true, '2026-03-18 21:41:59.706701+00', '{Сок,Сладкое}', 45, 0.7, 0.2, 10.4),
	('e9875f97-3b45-4c54-8e71-a8ba1b99e2a9', NULL, 'Питьевая вода', 'Негазированная минеральная', 40.00, '1.5 л', 'https://ik.imagekit.io/deliva/products/water.jpg', 200, true, '2026-03-18 21:41:59.706701+00', '{Вода,"Без сахара"}', 0, 0.0, 0.0, 0.0),
	('5542e452-2a0f-4586-a438-094f96d16758', NULL, 'Филе лосося', 'Охлажденное филе на коже, богато Омега-3', 750.00, '250 г', 'https://ik.imagekit.io/deliva/products/salmon-fillet.jpg', 15, true, '2026-03-22 21:27:46.233727+00', '{Рыба,Омега-3}', 208, 20.0, 13.0, 0.0),
	('f7c0fcca-b25b-421b-beb5-736b47d550e9', NULL, 'Стейк Рибай', 'Мраморная говядина Prime, зерновой откорм', 890.00, '300 г', 'https://ik.imagekit.io/deliva/products/steak-ribeye.jpg', 15, true, '2026-03-22 21:27:46.233727+00', '{Мясо,Стейки,"На гриль"}', 291, 24.0, 21.0, 0.0),
	('7fa10887-160a-44ce-84d2-9a420ea2bd80', NULL, 'Пельмени мясные', 'Традиционный рецепт, сочная начинка', 390.00, '800 г', 'https://ik.imagekit.io/deliva/products/dumplings.jpg', 30, true, '2026-03-22 21:27:46.233727+00', '{Полуфабрикаты,Сытно}', 275, 11.9, 12.4, 29.0),
	('ef713fd3-3839-453c-a560-8dcac6a33b29', NULL, 'Пицца Пепперони', 'С хрустящим бортиком, готова за 10 минут', 450.00, '400 г', 'https://ik.imagekit.io/deliva/products/pizza-pepperoni.jpg', 20, true, '2026-03-22 21:27:46.233727+00', '{"Готовая еда","На компанию"}', 266, 11.0, 10.0, 33.0),
	('10fe928e-98d0-479b-ab7f-240be7f4b8db', NULL, 'Чипсы', 'Обычные чипсы', 120.00, '1 шт', 'https://ik.imagekit.io/deliva/products/chips.jpg', 100, true, '2026-03-23 15:59:00.283183+00', '{Снеки}', 536, 7.0, 35.0, 53.0),
	('bba27e63-e33e-4e46-890e-409071e9d3b3', NULL, 'Кофе в зернах', '100% Арабика, средняя обжарка', 650.00, '250 г', 'https://ik.imagekit.io/deliva/products/coffee-beans.jpg', 45, true, '2026-03-22 21:27:46.233727+00', '{Кофе,Напитки,"На завтрак"}', 2, 0.3, 0.0, 0.0),
	('dab3de03-48f1-433e-8a42-a549d091507b', NULL, 'Шоколад темный', '75% какао, из бобов элитных сортов', 160.00, '100 г', 'https://ik.imagekit.io/deliva/products/chocolate-dark.jpg', 50, true, '2026-03-22 21:27:46.233727+00', '{Шоколад,"К чаю",Сладкое}', 598, 7.8, 42.0, 45.0),
	('6644f504-c076-43ab-9b76-8bf61574a30e', NULL, 'Помидоры Черри', 'Сладкие помидоры на веточке для салата', 250.00, '250 г', 'https://ik.imagekit.io/deliva/products/tomatoes-cherry.jpg', 20, true, '2026-03-18 21:41:59.706701+00', '{Овощи,"Для салата"}', 18, 0.9, 0.2, 3.9),
	('0771dc4b-3346-42aa-aeb8-3c7e0d4ebaa4', NULL, 'Бананы', 'Сладкие бананы из Эквадора', 140.00, '1 кг', 'https://ik.imagekit.io/deliva/products/bananas.jpg', 100, true, '2026-03-18 21:41:59.706701+00', '{Фрукты,Сладкое}', 96, 1.5, 0.5, 21.0),
	('3f6e0d18-284e-417a-a3b4-e2739685c462', NULL, 'Яблоки Гала', 'Свежие хрустящие яблоки, отлично для перекуса', 120.00, '1 кг', 'https://ik.imagekit.io/deliva/products/apples-gala.jpg', 100, true, '2026-03-18 21:41:59.706701+00', '{Фрукты,Сладкое}', 52, 0.3, 0.2, 14.0),
	('3871474f-774f-4abc-846b-72b6772599a0', NULL, 'Авокадо Хаас', 'Спелое подовое авокадо, идеально для тостов', 199.00, '1 шт', 'https://ik.imagekit.io/deliva/products/avocado-haas.jpg', 40, true, '2026-03-22 21:27:46.233727+00', '{Фрукты,"Для салата"}', 160, 2.0, 14.7, 8.5),
	('14efae2e-f011-4f49-81fd-7c7dc8b0f791', NULL, 'Голубика', 'Крупная сладкая ягода из Перу', 249.00, '125 г', 'https://ik.imagekit.io/deliva/products/blueberries.jpg', 30, true, '2026-03-22 21:27:46.233727+00', '{Ягоды,Сладкое}', 57, 0.7, 0.3, 14.5);


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."profiles" ("id", "first_name", "last_name", "avatar_url", "phone", "created_at", "is_admin") VALUES
	('8b44a63b-f184-4a11-bd46-243004e5c7d2', 'Адиль', NULL, NULL, '79260373731', '2026-04-06 22:26:28.025044+00', true);


--
-- Data for Name: favorites; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: otp_codes; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."otp_codes" ("id", "phone", "code", "expires_at", "used", "created_at") VALUES
	('223a9897-f507-455a-9c54-d29fcd28ff87', '79260373731', '1659', '2026-04-06 22:31:22.724+00', true, '2026-04-06 22:26:24.226264+00'),
	('c64b9077-5c0e-42f6-a53b-7f90de9c23f7', '79260373731', '5536', '2026-04-06 22:56:44.366+00', true, '2026-04-06 22:51:44.397246+00');


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: iceberg_namespaces; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: iceberg_tables; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: hooks; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 7, true);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('"supabase_functions"."hooks_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

-- \unrestrict 3t53yakuw4Ws8cwBvH8cyaj0YwjhHTHF5zcxAnsSkfLrzJYkF2OKiH2BweJV74v

RESET ALL;
