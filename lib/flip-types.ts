export type FlipProjectStatus = 'Planlagt' | 'Aktiv' | 'Solgt' | 'Avsluttet';
export type FlipLoanType = 'PrivateLoan' | 'OtherLoan';
export type FlipDistributionRule = 'ownership' | 'equal' | 'custom';

export interface FlipProject {
    id: string;
    createdAt?: string;
    name: string;
    address?: string;
    startDate: string;
    status: FlipProjectStatus;
    currency: string;

    // Settings
    enableLaborPayout: boolean; // default true
    laborDefaultRate: number; // default 500
    treatCompanyPaymentsAsLoan: boolean; // default true
    allowNegativeProfitSettlement: boolean; // default true
    roundingMode: 'nearest' | 'floor' | 'ceil';
}

export interface FlipParticipant {
    id: string;
    projectId: string;
    name: string;
    role?: string;
    standardRate: number;
    bankAccount?: string;
    ownershipShare: number; // 0-100
    createdAt?: string;
}

export interface FlipExpense {
    id: string;
    projectId: string;
    date: string;
    category?: string;
    description: string;
    amount: number;

    paidByParticipantId?: string;
    paidByExternal?: string; // 'Company', 'BankLoan', etc.

    distributionRule: FlipDistributionRule; // default 'ownership'
    customDistribution?: Record<string, number>; // { participantId: percentage }

    receiptUrl?: string;
    tags?: string[];
}

export interface FlipLoan {
    id: string;
    projectId: string;
    type: FlipLoanType; // PrivateLoan = Prio 1, OtherLoan = Prio 2

    lenderParticipantId?: string;
    lenderExternal?: string;

    principalAmount: number;
    interestRate?: number;
    notes?: string;
}

export interface FlipLaborEntry {
    id: string;
    projectId: string;
    participantId: string;
    date: string;
    description?: string;
    hours: number;
    rate: number;
    isBillable: boolean;
}

export interface FlipSale {
    projectId: string; // One sale per project
    saleDate: string;
    grossSalePrice: number;
    saleCosts: number; // Could be sum of Expenses tagged 'SaleCost' or manual override
    // netProceeds is calculated
}

// --- Calculation Types ---

export interface ParticipantSummary {
    participantId: string;
    name: string;
    ownershipShare: number;

    totalExpensesPaid: number; // Out-of-pocket expenses
    totalLaborValue: number; // Billable hours * rate
    totalLoansProvided: number; // Principal of PrivateLoans

    // Settlement Results
    reimbursementExpenses: number; // Getting paid back for expenses
    reimbursementLoans: number;    // Getting paid back for loans (Prio 1)
    payoutLabor: number;           // Getting paid for labor (Prio 3)
    payoutEquity: number;          // Profit share (Prio 4)

    totalPayout: number;           // Sum of above
    balance: number;               // totalPayout - (totalExpensesPaid + totalLoansProvided) ?? No, simple cash flow: (payout) - (what I spent?) 
    // Actually easier: "Net Transfer". 
    // If positive: Receive money. If negative: Pay money.
}

export interface SettlementResult {
    projectId: string;
    netProceeds: number;

    waterfall: {
        step1_privateLoans: { total: number; paid: number; remaining: number };
        step2_otherLoans: { total: number; paid: number; remaining: number };
        step3_labor: { total: number; paid: number; remaining: number };
        step4_equity: { total: number; pool: number; distributed: boolean };
    };

    participants: ParticipantSummary[];

    externalCreditors: {
        name: string;
        type: 'Company' | 'Bank' | 'Other';
        amountOwed: number;
        amountPaid: number;
    }[];
}
