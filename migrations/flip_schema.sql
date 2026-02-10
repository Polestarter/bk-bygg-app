-- Flip Projects
CREATE TABLE IF NOT EXISTS flip_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    name TEXT NOT NULL,
    address TEXT,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'Planlagt', -- Planlagt, Aktiv, Solgt, Avsluttet
    currency TEXT DEFAULT 'NOK',
    
    -- Settings
    enable_labor_payout BOOLEAN DEFAULT TRUE,
    labor_default_rate NUMERIC DEFAULT 500,
    treat_company_payments_as_loan BOOLEAN DEFAULT TRUE,
    allow_negative_profit_settlement BOOLEAN DEFAULT TRUE,
    rounding_mode TEXT DEFAULT 'nearest'
);

-- Participants
CREATE TABLE IF NOT EXISTS flip_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES flip_projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT,
    standard_rate NUMERIC DEFAULT 500,
    bank_account TEXT,
    ownership_share NUMERIC DEFAULT 0, -- 0-100
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Expenses
CREATE TABLE IF NOT EXISTS flip_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES flip_projects(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    category TEXT,
    description TEXT,
    amount NUMERIC NOT NULL,
    paid_by_participant_id UUID REFERENCES flip_participants(id) ON DELETE SET NULL,
    paid_by_external TEXT, -- 'Company', 'BankLoan', or other external name if not a participant
    
    distribution_rule TEXT DEFAULT 'ownership', -- 'ownership', 'equal', 'custom'
    custom_distribution JSONB, -- { participantId: percentage }
    
    receipt_url TEXT,
    tags TEXT[] -- e.g. ['SaleCost']
);

-- Loans
CREATE TABLE IF NOT EXISTS flip_loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES flip_projects(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    
    type TEXT NOT NULL, -- 'PrivateLoan' (prio 1), 'OtherLoan' (prio 2)
    lender_participant_id UUID REFERENCES flip_participants(id) ON DELETE SET NULL,
    lender_external TEXT, -- 'Company', 'Bank', etc.
    
    principal_amount NUMERIC NOT NULL,
    interest_rate NUMERIC DEFAULT 0,
    notes TEXT
);

-- Labor Entries
CREATE TABLE IF NOT EXISTS flip_labor_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES flip_projects(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    
    participant_id UUID REFERENCES flip_participants(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    hours NUMERIC NOT NULL,
    rate NUMERIC, -- Snapshot of rate at time of entry
    is_billable BOOLEAN DEFAULT TRUE
);

-- Sales
CREATE TABLE IF NOT EXISTS flip_sales (
    project_id UUID PRIMARY KEY REFERENCES flip_projects(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    
    sale_date DATE DEFAULT CURRENT_DATE,
    gross_sale_price NUMERIC NOT NULL,
    sale_costs NUMERIC DEFAULT 0, -- Can be manual sum or calculated
    net_proceeds NUMERIC GENERATED ALWAYS AS (gross_sale_price - sale_costs) STORED
);
