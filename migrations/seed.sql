-- Seed Data for Dev

-- 1. Insert Company
INSERT INTO public.companies (id, name, org_nr, address)
VALUES 
('d4e1d176-1f6f-47dc-a84c-3b10c37f3750', 'B&K BYGG AS', '930 818 534', 'Smerudsvingen 12, 2817 Gjøvik')
ON CONFLICT DO NOTHING;

-- 2. Insert Users
-- Admin
INSERT INTO public.users (id, company_id, email, first_name, last_name, role, phone)
VALUES 
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd4e1d176-1f6f-47dc-a84c-3b10c37f3750', 'admin@bkbygg.no', 'Admin', 'User', 'admin', '90011222')
ON CONFLICT DO NOTHING;

-- Project Leader
INSERT INTO public.users (id, company_id, email, first_name, last_name, role, phone)
VALUES 
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'd4e1d176-1f6f-47dc-a84c-3b10c37f3750', 'per@bkbygg.no', 'Per', 'Prosjektleder', 'project_leader', '90022333')
ON CONFLICT DO NOTHING;

-- Worker
INSERT INTO public.users (id, company_id, email, first_name, last_name, role, phone)
VALUES 
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'd4e1d176-1f6f-47dc-a84c-3b10c37f3750', 'ola@bkbygg.no', 'Ola', 'Fagarbeider', 'worker', '90044555')
ON CONFLICT DO NOTHING;

-- 3. Insert Customer
INSERT INTO public.customers (id, company_id, name, email, phone, org_nr, address)
VALUES 
('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'd4e1d176-1f6f-47dc-a84c-3b10c37f3750', 'Eiendom AS', 'post@eiendom.no', '22225555', '888777666', 'Storgata 12, 0202 Oslo')
ON CONFLICT DO NOTHING;
