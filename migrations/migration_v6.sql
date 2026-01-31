-- Migration v6: Project Structure, Roles, Customers, and Audit Logs
-- Updated to be Idempotent (Safe to re-run)

-- Ensure pgcrypto is available for UUID generation (if needed, though gen_random_uuid is native in PG13+)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Companies (Tenant)
CREATE TABLE IF NOT EXISTS public.companies (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   name TEXT NOT NULL,
   org_nr TEXT,
   address TEXT,
   created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Users (Role Based)
CREATE TABLE IF NOT EXISTS public.users (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Can be same as auth.users.id
   company_id UUID REFERENCES public.companies(id),
   email TEXT NOT NULL UNIQUE,
   first_name TEXT,
   last_name TEXT,
   role TEXT NOT NULL DEFAULT 'worker' CHECK (role IN ('admin', 'project_leader', 'worker')),
   phone TEXT,
   created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure columns exist if table already existed
ALTER TABLE public.users 
   ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id),
   ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'worker' CHECK (role IN ('admin', 'project_leader', 'worker')),
   ADD COLUMN IF NOT EXISTS phone TEXT;

-- 3. Customers
CREATE TABLE IF NOT EXISTS public.customers (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   company_id UUID REFERENCES public.companies(id),
   name TEXT NOT NULL,
   email TEXT,
   phone TEXT,
   org_nr TEXT,
   invoice_address TEXT,
   delivery_address TEXT,
   created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure columns exist if table already existed
ALTER TABLE public.customers 
   ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id),
   ADD COLUMN IF NOT EXISTS org_nr TEXT,
   ADD COLUMN IF NOT EXISTS invoice_address TEXT,
   ADD COLUMN IF NOT EXISTS delivery_address TEXT;

-- 4. Update Projects Table
ALTER TABLE public.projects 
   ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id),
   ADD COLUMN IF NOT EXISTS project_type TEXT CHECK (project_type IN ('rehab', 'nybygg', 'service')),
   ADD COLUMN IF NOT EXISTS contract_type TEXT CHECK (contract_type IN ('fastpris', 'regning', 'delt')),
   ADD COLUMN IF NOT EXISTS start_date DATE,
   ADD COLUMN IF NOT EXISTS end_date_estimated DATE,
   ADD COLUMN IF NOT EXISTS project_leader_id UUID REFERENCES public.users(id),
   ADD COLUMN IF NOT EXISTS status_new TEXT DEFAULT 'Aktiv' CHECK (status_new IN ('Aktiv', 'Ferdig', 'På vent'));

-- 5. Project Members
CREATE TABLE IF NOT EXISTS public.project_members (
   project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
   user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
   role TEXT,
   joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
   PRIMARY KEY (project_id, user_id)
);

-- 6. Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   entity_type TEXT NOT NULL,
   entity_id TEXT NOT NULL,
   action TEXT NOT NULL,
   changed_by UUID REFERENCES public.users(id),
   timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
   details JSONB
);

-- RLS Policies
-- Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper to safely drop policies before creating them to avoid "policy already exists" errors
DO $$
BEGIN
   DROP POLICY IF EXISTS "Allow read access for authenticated users" ON public.companies;
   DROP POLICY IF EXISTS "Allow read access for authenticated users" ON public.users;
   DROP POLICY IF EXISTS "Allow read access for authenticated users" ON public.customers;
   DROP POLICY IF EXISTS "Allow read access for authenticated users" ON public.project_members;
   DROP POLICY IF EXISTS "Allow read access for authenticated users" ON public.audit_logs;
   
   DROP POLICY IF EXISTS "Allow write access for authenticated users" ON public.companies;
   DROP POLICY IF EXISTS "Allow write access for authenticated users" ON public.users;
   DROP POLICY IF EXISTS "Allow write access for authenticated users" ON public.customers;
   DROP POLICY IF EXISTS "Allow write access for authenticated users" ON public.project_members;
   DROP POLICY IF EXISTS "Allow write access for authenticated users" ON public.audit_logs;
END
$$;

-- Re-create Policies
CREATE POLICY "Allow read access for authenticated users" ON public.companies FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access for authenticated users" ON public.users FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access for authenticated users" ON public.customers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access for authenticated users" ON public.project_members FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access for authenticated users" ON public.audit_logs FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow write access for authenticated users" ON public.companies FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow write access for authenticated users" ON public.users FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow write access for authenticated users" ON public.customers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow write access for authenticated users" ON public.project_members FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow write access for authenticated users" ON public.audit_logs FOR ALL USING (auth.role() = 'authenticated');
