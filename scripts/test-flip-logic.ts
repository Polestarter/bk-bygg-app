import { calculateFlipSettlement } from '../lib/flip-calculations';
import { FlipProject, FlipParticipant, FlipExpense, FlipLoan, FlipLaborEntry, FlipSale } from '../lib/flip-types';

console.log("Running Flip Logic Test...");

// 1. Setup Mock Data
const project: FlipProject = {
    id: 'p1',
    name: 'Test Flip',
    startDate: '2023-01-01',
    status: 'Aktiv',
    currency: 'NOK',
    enableLaborPayout: true,
    laborDefaultRate: 500,
    treatCompanyPaymentsAsLoan: true,
    allowNegativeProfitSettlement: true,
    roundingMode: 'nearest'
};

const alice: FlipParticipant = {
    id: 'alice',
    projectId: 'p1',
    name: 'Alice',
    standardRate: 500,
    ownershipShare: 60
};

const bob: FlipParticipant = {
    id: 'bob',
    projectId: 'p1',
    name: 'Bob',
    standardRate: 500,
    ownershipShare: 40
};

const expenses: FlipExpense[] = [
    {
        id: 'e1', projectId: 'p1', date: '2023-01-05', description: 'Materials', amount: 10000,
        paidByParticipantId: 'alice', distributionRule: 'ownership'
    },
    {
        id: 'e2', projectId: 'p1', date: '2023-01-06', description: 'Paint', amount: 5000,
        paidByParticipantId: 'bob', distributionRule: 'ownership'
    }
];

const loans: FlipLoan[] = [
    {
        id: 'l1', projectId: 'p1', type: 'PrivateLoan',
        lenderParticipantId: 'alice', principalAmount: 50000
    },
    {
        id: 'l2', projectId: 'p1', type: 'OtherLoan',
        lenderExternal: 'Bank', principalAmount: 1000000
    }
];

const labor: FlipLaborEntry[] = [
    {
        id: 'w1', projectId: 'p1', participantId: 'bob', date: '2023-02-01',
        description: 'Painting', hours: 100, rate: 500, isBillable: true
    }
];

const sale: FlipSale = {
    projectId: 'p1',
    saleDate: '2023-06-01',
    grossSalePrice: 1500000,
    saleCosts: 50000
};

// 2. Run Calculation
const result = calculateFlipSettlement(
    project,
    [alice, bob],
    expenses,
    loans,
    labor,
    sale
);

// 3. Output Results
console.log("Net Proceeds:", result.netProceeds);
console.log("\nWaterfall:");
console.log(JSON.stringify(result.waterfall, null, 2));

console.log("\nParticipants:");
result.participants.forEach(p => {
    console.log(`\nName: ${p.name}`);
    console.log(`  Expenses Paid (Out): ${p.totalExpensesPaid}`);
    console.log(`  Loans Provided (Out): ${p.totalLoansProvided}`);
    console.log(`  -----------------------`);
    console.log(`  Reimb. Expenses (In): ${p.reimbursementExpenses}`);
    console.log(`  Reimb. Loans (In):    ${p.reimbursementLoans}`);
    console.log(`  Labor Payout (In):    ${p.payoutLabor}`);
    console.log(`  Equity Payout (In):   ${p.payoutEquity}`);
    console.log(`  -----------------------`);
    console.log(`  Total Payout (In):    ${p.totalPayout}`);
    console.log(`  BALANCE (Net):        ${p.balance}`);
});

console.log("\nExpected Balance Alice: ~201,000");
console.log("Expected Balance Bob:   ~189,000 (Total Payout) or 184,000 (Net)");

