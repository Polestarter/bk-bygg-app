import {
    FlipProject, FlipParticipant, FlipExpense, FlipLoan, FlipLaborEntry, FlipSale,
    SettlementResult, ParticipantSummary
} from './flip-types';

/**
 * Calculates the full financial settlement for a Flip Project.
 */
export function calculateFlipSettlement(
    project: FlipProject,
    participants: FlipParticipant[],
    expenses: FlipExpense[],
    loans: FlipLoan[],
    labor: FlipLaborEntry[],
    sale?: FlipSale
): SettlementResult {

    // 1. Calculate Totals & Net Proceeds
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Sale costs can be explicit in Sale object or tagged expenses
    const saleCosts = sale ? sale.saleCosts : expenses.filter(e => e.tags?.includes('SaleCost')).reduce((s, e) => s + e.amount, 0);
    const grossSale = sale ? sale.grossSalePrice : 0;
    const netProceeds = grossSale - saleCosts; // This is the pot of gold (or lack thereof)

    // 2. Initialize Participants Summary
    const summaryMap = new Map<string, ParticipantSummary>();
    participants.forEach(p => {
        summaryMap.set(p.id, {
            participantId: p.id,
            name: p.name,
            ownershipShare: p.ownershipShare,
            totalExpensesPaid: 0,
            totalLaborValue: 0,
            totalLoansProvided: 0,
            reimbursementExpenses: 0,
            reimbursementLoans: 0,
            payoutLabor: 0,
            payoutEquity: 0, // Profit share
            totalPayout: 0,
            balance: 0
        });
    });

    // --- Step 0: Process Expenses ---
    // Expenses paid by participants are treated as claims on the project (effectively Prio 1 loans).
    expenses.forEach(e => {
        if (e.paidByParticipantId) {
            const p = summaryMap.get(e.paidByParticipantId);
            if (p) {
                p.totalExpensesPaid += e.amount;
            }
        }
    });

    // --- Step 1: Private Loans (and Expenses) ---
    // Gather all Prio 1 claims
    let totalPrio1Requests = 0;
    const prio1Claims: { participantId: string; amount: number; type: 'Loan' | 'Expense' }[] = [];

    // A. Loans
    loans.filter(l => l.type === 'PrivateLoan' && l.lenderParticipantId).forEach(l => {
        prio1Claims.push({
            participantId: l.lenderParticipantId!,
            amount: l.principalAmount,
            type: 'Loan'
        });
        const p = summaryMap.get(l.lenderParticipantId!);
        if (p) p.totalLoansProvided += l.principalAmount;
    });

    // B. Expenses (Treating as Prio 1 Innskudd)
    participants.forEach(p => {
        const s = summaryMap.get(p.id)!;
        if (s.totalExpensesPaid > 0) {
            prio1Claims.push({
                participantId: p.id,
                amount: s.totalExpensesPaid,
                type: 'Expense'
            });
        }
    });

    totalPrio1Requests = prio1Claims.reduce((sum, c) => sum + c.amount, 0);

    let remaining = netProceeds;

    // Execute Step 1
    const step1Paid = Math.min(remaining, totalPrio1Requests);

    if (step1Paid < totalPrio1Requests) {
        // Pro-rata
        const factor = step1Paid / totalPrio1Requests;
        prio1Claims.forEach(c => {
            const pay = c.amount * factor;
            const p = summaryMap.get(c.participantId)!;
            if (c.type === 'Loan') p.reimbursementLoans += pay;
            if (c.type === 'Expense') p.reimbursementExpenses += pay;
        });
        remaining = 0;
    } else {
        // Full pay
        prio1Claims.forEach(c => {
            const p = summaryMap.get(c.participantId)!;
            if (c.type === 'Loan') p.reimbursementLoans += c.amount;
            if (c.type === 'Expense') p.reimbursementExpenses += c.amount;
        });
        remaining -= step1Paid;
    }

    const waterfallResult = {
        step1_privateLoans: { total: totalPrio1Requests, paid: step1Paid, remaining: totalPrio1Requests - step1Paid },
        step2_otherLoans: { total: 0, paid: 0, remaining: 0 },
        step3_labor: { total: 0, paid: 0, remaining: 0 },
        step4_equity: { total: 0, pool: 0, distributed: false }
    };

    // --- Step 2: Other Loans ---
    const otherLoans = loans.filter(l => l.type === 'OtherLoan');
    const otherLoanClaims = otherLoans.map(l => ({
        id: l.id,
        amount: l.principalAmount,
        lender: l.lenderExternal || 'Unknown',
        type: l.lenderExternal === 'Company' ? 'Company' : 'Other' as any
    }));

    const totalPrio2Requests = otherLoanClaims.reduce((sum, c) => sum + c.amount, 0);
    const step2Paid = Math.min(remaining, totalPrio2Requests);

    const externalCreditors = otherLoanClaims.map(c => ({
        name: c.lender,
        type: c.type,
        amountOwed: c.amount,
        amountPaid: 0
    }));

    if (step2Paid < totalPrio2Requests) {
        const factor = step2Paid / totalPrio2Requests;
        externalCreditors.forEach(c => { c.amountPaid = c.amountOwed * factor; });
        remaining = 0;
    } else {
        externalCreditors.forEach(c => { c.amountPaid = c.amountOwed; });
        remaining -= step2Paid;
    }

    waterfallResult.step2_otherLoans = { total: totalPrio2Requests, paid: step2Paid, remaining: totalPrio2Requests - step2Paid };

    // --- Step 3: Labor ---
    let step3Paid = 0;
    let totalBillable = 0;

    if (project.enableLaborPayout) {
        // Calculate billable labor per participant
        labor.forEach(l => {
            if (l.isBillable) {
                const val = l.hours * l.rate;
                const p = summaryMap.get(l.participantId);
                if (p) {
                    p.totalLaborValue += val;
                    totalBillable += val;
                }
            }
        });

        step3Paid = Math.min(remaining, totalBillable);

        if (step3Paid < totalBillable) {
            const factor = step3Paid / totalBillable;
            participants.forEach(p => {
                const s = summaryMap.get(p.id)!;
                s.payoutLabor = s.totalLaborValue * factor;
            });
            remaining = 0;
        } else {
            participants.forEach(p => {
                const s = summaryMap.get(p.id)!;
                s.payoutLabor = s.totalLaborValue;
            });
            remaining -= step3Paid;
        }
    }
    waterfallResult.step3_labor = { total: totalBillable, paid: step3Paid, remaining: totalBillable - step3Paid };

    // --- Step 4: Equity / Profit ---
    // This is the remaining cash distributed by ownership

    waterfallResult.step4_equity = { total: 0, pool: remaining, distributed: true };

    if (remaining > 0) {
        participants.forEach(p => {
            const s = summaryMap.get(p.id)!;
            const share = p.ownershipShare / 100;
            s.payoutEquity = remaining * share;
        });
    }

    // --- Final Calculation of Balance ---
    // Balance = (Received from waterfall) - (Paid into project)

    participants.forEach(p => {
        const s = summaryMap.get(p.id)!;
        s.totalPayout = s.reimbursementExpenses + s.reimbursementLoans + s.payoutLabor + s.payoutEquity;
        s.balance = s.totalPayout - (s.totalExpensesPaid + s.totalLoansProvided);
    });

    // Check for Shortfalls (if Other Loans are unpaid, owners must cover)
    // waterfallResult.step2_otherLoans.remaining > 0
    if (project.allowNegativeProfitSettlement && (waterfallResult.step2_otherLoans.remaining > 0)) {
        const deficit = waterfallResult.step2_otherLoans.remaining;

        participants.forEach(p => {
            const s = summaryMap.get(p.id)!;
            // You must pay your share of the external debt
            const share = p.ownershipShare / 100;
            const debtShare = deficit * share;

            // Adjust balance (you actally have to PAY this)
            s.balance -= debtShare;
        });
    }

    return {
        projectId: project.id,
        netProceeds,
        waterfall: waterfallResult,
        participants: Array.from(summaryMap.values()),
        externalCreditors
    };
}
