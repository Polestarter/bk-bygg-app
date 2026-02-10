import { supabase } from "./supabaseClient";
import { FlipProject, FlipParticipant, FlipExpense, FlipLoan, FlipLaborEntry, FlipSale } from "./flip-types";

// Helper
const clean = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

// Projects
export async function getFlipProjects(): Promise<FlipProject[]> {
    const { data, error } = await supabase.from("flip_projects").select("*").order("created_at", { ascending: false });
    if (error) console.error("Error fetching flip projects:", error);

    return (data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        address: p.address,
        startDate: p.start_date,
        status: p.status,
        currency: p.currency,
        enableLaborPayout: p.enable_labor_payout,
        laborDefaultRate: p.labor_default_rate,
        treatCompanyPaymentsAsLoan: p.treat_company_payments_as_loan,
        allowNegativeProfitSettlement: p.allow_negative_profit_settlement,
        roundingMode: p.rounding_mode
    }));
}

export async function getFlipProject(id: string): Promise<FlipProject | undefined> {
    const { data, error } = await supabase.from("flip_projects").select("*").eq("id", id).single();
    if (error || !data) return undefined;

    const p = data;
    return {
        id: p.id,
        name: p.name,
        address: p.address,
        startDate: p.start_date,
        status: p.status,
        currency: p.currency,
        enableLaborPayout: p.enable_labor_payout,
        laborDefaultRate: p.labor_default_rate,
        treatCompanyPaymentsAsLoan: p.treat_company_payments_as_loan,
        allowNegativeProfitSettlement: p.allow_negative_profit_settlement,
        roundingMode: p.rounding_mode
    };
}

export async function addFlipProject(project: Partial<FlipProject>): Promise<FlipProject | null> {
    const dbObj = {
        name: project.name,
        address: project.address,
        start_date: project.startDate,
        status: project.status || 'Planlagt',
        currency: project.currency || 'NOK',
        enable_labor_payout: project.enableLaborPayout,
        labor_default_rate: project.laborDefaultRate,
        treat_company_payments_as_loan: project.treatCompanyPaymentsAsLoan,
        allow_negative_profit_settlement: project.allowNegativeProfitSettlement,
        rounding_mode: project.roundingMode
    };

    const { data, error } = await supabase.from("flip_projects").insert([dbObj]).select().single();
    if (error) {
        console.error("Error adding flip project:", error);
        return null;
    }

    // Return with ID
    return {
        ...project,
        id: data.id,
        status: data.status,
        // ... fill other defaults if needed, but 'project' usually has them from form
    } as FlipProject;
}

export async function updateFlipProject(id: string, updates: Partial<FlipProject>): Promise<void> {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.address !== undefined) dbUpdates.address = updates.address;
    if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.enableLaborPayout !== undefined) dbUpdates.enable_labor_payout = updates.enableLaborPayout;
    if (updates.laborDefaultRate !== undefined) dbUpdates.labor_default_rate = updates.laborDefaultRate;
    if (updates.treatCompanyPaymentsAsLoan !== undefined) dbUpdates.treat_company_payments_as_loan = updates.treatCompanyPaymentsAsLoan;

    const { error } = await supabase.from("flip_projects").update(dbUpdates).eq("id", id);
    if (error) console.error("Error updating project:", error);
}

// Participants
export async function getFlipParticipants(projectId: string): Promise<FlipParticipant[]> {
    const { data, error } = await supabase.from("flip_participants").select("*").eq("project_id", projectId);
    if (error) console.error("Error fetching participants:", error);

    return (data || []).map((p: any) => ({
        id: p.id,
        projectId: p.project_id,
        name: p.name,
        role: p.role,
        standardRate: p.standard_rate,
        bankAccount: p.bank_account,
        ownershipShare: p.ownership_share
    }));
}

export async function addFlipParticipant(participant: Omit<FlipParticipant, "id">): Promise<void> {
    const { error } = await supabase.from("flip_participants").insert({
        project_id: participant.projectId,
        name: participant.name,
        role: participant.role,
        standard_rate: participant.standardRate,
        bank_account: participant.bankAccount,
        ownership_share: participant.ownershipShare
    });
    if (error) console.error("Error adding participant:", error);
}

export async function deleteFlipParticipant(id: string): Promise<void> {
    const { error } = await supabase.from("flip_participants").delete().eq("id", id);
    if (error) console.error("Error deleting participant:", error);
}

export async function updateFlipParticipant(id: string, updates: Partial<FlipParticipant>): Promise<void> {
    const dbUpdates: any = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.role) dbUpdates.role = updates.role;
    if (updates.standardRate) dbUpdates.standard_rate = updates.standardRate;
    if (updates.ownershipShare !== undefined) dbUpdates.ownership_share = updates.ownershipShare;

    const { error } = await supabase.from("flip_participants").update(dbUpdates).eq("id", id);
    if (error) console.error("Error updating participant:", error);
}

// Expenses
export async function getFlipExpenses(projectId: string): Promise<FlipExpense[]> {
    const { data, error } = await supabase.from("flip_expenses").select("*").eq("project_id", projectId).order("date", { ascending: false });
    if (error) console.error("Error fetching expenses:", error);

    return (data || []).map((e: any) => ({
        id: e.id,
        projectId: e.project_id,
        date: e.date,
        category: e.category,
        description: e.description,
        amount: e.amount,
        paidByParticipantId: e.paid_by_participant_id,
        paidByExternal: e.paid_by_external,
        distributionRule: e.distribution_rule,
        customDistribution: e.custom_distribution,
        receiptUrl: e.receipt_url,
        tags: e.tags
    }));
}

export async function addFlipExpense(expense: Omit<FlipExpense, "id">): Promise<void> {
    const { error } = await supabase.from("flip_expenses").insert({
        project_id: expense.projectId,
        date: expense.date,
        category: expense.category,
        description: expense.description,
        amount: expense.amount,
        paid_by_participant_id: expense.paidByParticipantId,
        paid_by_external: expense.paidByExternal,
        distribution_rule: expense.distributionRule,
        custom_distribution: expense.customDistribution,
        receipt_url: expense.receiptUrl,
        tags: expense.tags
    });
    if (error) console.error("Error adding expense:", error);
}

export async function deleteFlipExpense(id: string): Promise<void> {
    const { error } = await supabase.from("flip_expenses").delete().eq("id", id);
    if (error) console.error("Error deleting expense:", error);
}

// Loans
export async function getFlipLoans(projectId: string): Promise<FlipLoan[]> {
    const { data, error } = await supabase.from("flip_loans").select("*").eq("project_id", projectId);

    return (data || []).map((l: any) => ({
        id: l.id,
        projectId: l.project_id,
        type: l.type,
        lenderParticipantId: l.lender_participant_id,
        lenderExternal: l.lender_external,
        principalAmount: l.principal_amount,
        interestRate: l.interest_rate,
        notes: l.notes
    }));
}

export async function addFlipLoan(loan: Omit<FlipLoan, "id">): Promise<void> {
    const { error } = await supabase.from("flip_loans").insert({
        project_id: loan.projectId,
        type: loan.type,
        lender_participant_id: loan.lenderParticipantId,
        lender_external: loan.lenderExternal,
        principal_amount: loan.principalAmount,
        interest_rate: loan.interestRate,
        notes: loan.notes
    });
    if (error) console.error("Error adding loan:", error);
}

export async function deleteFlipLoan(id: string): Promise<void> {
    const { error } = await supabase.from("flip_loans").delete().eq("id", id);
    if (error) console.error("Error deleting loan:", error);
}

// Labor
export async function getFlipLabor(projectId: string): Promise<FlipLaborEntry[]> {
    const { data, error } = await supabase.from("flip_labor_entries").select("*").eq("project_id", projectId).order("date", { ascending: false });

    return (data || []).map((l: any) => ({
        id: l.id,
        projectId: l.project_id,
        participantId: l.participant_id,
        date: l.date,
        description: l.description,
        hours: l.hours,
        rate: l.rate,
        isBillable: l.is_billable
    }));
}

export async function addFlipLabor(entry: Omit<FlipLaborEntry, "id">): Promise<void> {
    const { error } = await supabase.from("flip_labor_entries").insert({
        project_id: entry.projectId,
        participant_id: entry.participantId,
        date: entry.date,
        description: entry.description,
        hours: entry.hours,
        rate: entry.rate,
        is_billable: entry.isBillable
    });
    if (error) console.error("Error adding labor:", error);
}

export async function deleteFlipLabor(id: string): Promise<void> {
    const { error } = await supabase.from("flip_labor_entries").delete().eq("id", id);
    if (error) console.error("Error deleting labor:", error);
}

// Sales
export async function getFlipSale(projectId: string): Promise<FlipSale | undefined> {
    const { data, error } = await supabase.from("flip_sales").select("*").eq("project_id", projectId).single();
    if (error || !data) return undefined;

    return {
        projectId: data.project_id,
        saleDate: data.sale_date,
        grossSalePrice: data.gross_sale_price,
        saleCosts: data.sale_costs
    };
}

export async function upsertFlipSale(sale: FlipSale): Promise<void> {
    const { error } = await supabase.from("flip_sales").upsert({
        project_id: sale.projectId,
        sale_date: sale.saleDate,
        gross_sale_price: sale.grossSalePrice,
        sale_costs: sale.saleCosts
    }).select();

    if (error) console.error("Error upserting sale:", error);
}
