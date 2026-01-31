
import { supabase } from "./supabaseClient";
import { Project, Customer, Checklist, ChecklistTemplate, Offer, SJA, SJATemplate, SafetyRound, Deviation, DeviationAction, HMSHandbookSection, ProjectDocument } from "./types";

// Helper to strip "undefined" fields because Supabase/JSON doesn't like them?
// Actually Supabase JS handles it, but undefined is not valid JSON.
// JSON.stringify removes undefined.
const clean = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

export const getSJATemplates = async (): Promise<SJATemplate[]> => {
    return [
        {
            id: "1",
            name: "Arbeid i høyden (Stillas/Lift/Tak)",
            risks: [
                { activity: "Montering/bruk av stillas", description: "Fall fra høyde ved manglende sikring", probability: "Middels", severity: "Høy", measures: [{ id: "m1", description: "Bruk fallsikring/sele ved arbeid utenfor rekkverk", responsible: "Alle", completed: false }, { id: "m1b", description: "Kontroll av grønt kort på stillas", responsible: "Leder", completed: false }] },
                { activity: "Arbeid på tak/kant", description: "Fallende gjenstander", probability: "Middels", severity: "Middels", measures: [{ id: "m2", description: "Sikre verktøy mot fall", responsible: "Alle", completed: false }, { id: "m2b", description: "Absperring av området under arbeid", responsible: "Leder", completed: false }] }
            ]
        },
        {
            id: "2",
            name: "Riving og Sanering",
            risks: [
                { activity: "Riving av konstruksjoner", description: "Eksponering for støv (kvarts, asbest)", probability: "Høy", severity: "Middels", measures: [{ id: "m3", description: "Benytte støvmaske (P3) og vernebriller", responsible: "Alle", completed: false }, { id: "m3b", description: "Vanne ned støv ved riving", responsible: "Alle", completed: false }] },
                { activity: "Skjulte installasjoner", description: "Fare for elektrisk støt eller vannlekkasje", probability: "Middels", severity: "Høy", measures: [{ id: "m4", description: "Sjekke tegninger og kursfortegnelse", responsible: "Leder", completed: false }, { id: "m4b", description: "Koble ut strøm i arbeidsområdet", responsible: "Leder", completed: false }] },
                { activity: "Håndtering av avfall", description: "Kutt/stikkskader fra skarpe kanter/spiker", probability: "Høy", severity: "Lav", measures: [{ id: "m5", description: "Bruk vernehansker (Kuttklasse C/D)", responsible: "Alle", completed: false }] }
            ]
        },
        {
            id: "3",
            name: "Tunge Løft og Montering",
            risks: [
                { activity: "Løft av gips/bjelker", description: "Belastningsskader ved tunge løft", probability: "Høy", severity: "Middels", measures: [{ id: "m6", description: "Være to personer på tunge løft", responsible: "Alle", completed: false }, { id: "m6b", description: "Bruke løftehjelpemidler (gipsheis, kran)", responsible: "Leder", completed: false }] },
                { activity: "Bruk av kranbil", description: "Klemskader ved landing av last", probability: "Middels", severity: "Høy", measures: [{ id: "m7", description: "Ingen personer under hengende last", responsible: "Alle", completed: false }, { id: "m7b", description: "Bruke styrepinner/tau på last", responsible: "UE", completed: false }] }
            ]
        },
        {
            id: "4",
            name: "Bruk av El-verktøy (Sag/Drill)",
            risks: [
                { activity: "Kapping av materialer", description: "Kuttfare og sprut av flis", probability: "Middels", severity: "Middels", measures: [{ id: "m8", description: "Sjekke at vernedeksel er på plass", responsible: "Alle", completed: false }, { id: "m8b", description: "Bruk vernebriller og hørselvern", responsible: "Alle", completed: false }] },
                { activity: "Skjøteledninger", description: "Snublefare og strømgjennomgang", probability: "Middels", severity: "Lav", measures: [{ id: "m9", description: "Henge opp kabler", responsible: "Alle", completed: false }, { id: "m9b", description: "Visuell sjekk av kabler for skade", responsible: "Alle", completed: false }] }
            ]
        }
    ];
};

export async function getOffers(): Promise<Offer[]> {
    const { data } = await supabase.from('offers').select('*');
    return (data as Offer[]) || [];
}

export async function addOffer(offer: Offer): Promise<void> {
    const { error } = await supabase.from('offers').insert(clean(offer));
    if (error) console.error("Error adding offer:", error);
}

export async function updateOfferInDb(offer: Offer): Promise<void> {
    const { error } = await supabase.from('offers').update(clean(offer)).eq('id', offer.id);
    if (error) console.error("Error updating offer:", error);
}

export async function getProjects(): Promise<Project[]> {
    const { data } = await supabase.from('projects').select('*');
    return (data as Project[]) || [];
}

export async function getCustomers(): Promise<Customer[]> {
    const { data } = await supabase.from('customers').select('*');
    return (data as Customer[]) || [];
}

export async function getChecklists(): Promise<Checklist[]> {
    const { data } = await supabase.from('checklists').select('*');
    return (data as Checklist[]) || [];
}

export async function getChecklist(id: string): Promise<Checklist | undefined> {
    const { data } = await supabase.from('checklists').select('*').eq('id', id).single();
    if (!data) return undefined;
    return data as Checklist;
}

export async function addProject(project: Project): Promise<void> {
    const { error } = await supabase.from('projects').insert(clean(project));
    if (error) console.error("Error adding project:", error);
}

export async function addCustomer(customer: Customer): Promise<void> {
    const { error } = await supabase.from('customers').insert(clean(customer));
    if (error) console.error("Error adding customer:", error);
}

export async function getChecklistTemplates(): Promise<ChecklistTemplate[]> {
    const { data } = await supabase.from('checklistTemplates').select('*');
    return (data as ChecklistTemplate[]) || [];
}

export async function addChecklistTemplate(template: ChecklistTemplate): Promise<void> {
    const { error } = await supabase.from('checklistTemplates').insert(clean(template));
    if (error) console.error("Error adding template:", error);
}

export async function addChecklist(checklist: Checklist): Promise<void> {
    const { error } = await supabase.from('checklists').insert(clean(checklist));
    if (error) console.error("Error adding checklist:", error);
}

export async function updateProject(updatedProject: Project): Promise<void> {
    const { error } = await supabase.from('projects').update(clean(updatedProject)).eq('id', updatedProject.id);
    if (error) console.error("Error updating project:", error);
}

export async function updateCustomer(customer: Customer): Promise<void> {
    const { error } = await supabase.from('customers').update(clean(customer)).eq('id', customer.id);
    if (error) console.error("Error updating customer:", error);
}

export async function deleteCustomer(id: string): Promise<void> {
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) console.error("Error deleting customer:", error);
}

export async function deleteProject(id: string): Promise<void> {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) console.error("Error deleting project:", error);
}

export async function getCustomer(id: string): Promise<Customer | undefined> {
    const { data } = await supabase.from('customers').select('*').eq('id', id).single();
    if (!data) return undefined;
    return data as Customer;
}

export async function getCustomerProjects(customerId: string): Promise<Project[]> {
    const { data } = await supabase.from('projects').select('*').eq('customerId', customerId);
    return (data as Project[]) || [];
}

export async function getSJAs(projectId: string): Promise<SJA[]> {
    const { data } = await supabase.from('sjas').select('*').eq('projectId', projectId);
    return (data as SJA[]) || [];
}

export async function getSJA(id: string): Promise<SJA | undefined> {
    const { data } = await supabase.from('sjas').select('*').eq('id', id).single();
    if (!data) return undefined;
    return data as SJA;
}

export async function addSJA(sja: SJA): Promise<void> {
    const { error } = await supabase.from('sjas').insert(clean(sja));
    if (error) console.error("Error adding SJA:", error);
}

export async function updateSJA(sja: SJA): Promise<void> {
    const { error } = await supabase.from('sjas').update(clean(sja)).eq('id', sja.id);
    if (error) console.error("Error updating SJA:", error);
}

export async function deleteSJA(id: string): Promise<void> {
    const { error } = await supabase.from('sjas').delete().eq('id', id);
    if (error) console.error("Error deleting SJA:", error);
}

export async function getSafetyRounds(projectId: string): Promise<SafetyRound[]> {
    const { data } = await supabase.from('safety_rounds').select('*').eq('projectId', projectId);
    return (data as SafetyRound[]) || [];
}

export async function getSafetyRound(id: string): Promise<SafetyRound | undefined> {
    const { data } = await supabase.from("safety_rounds").select("*").eq("id", id).single();
    return data || undefined;
}

export async function addSafetyRound(round: Omit<SafetyRound, "id">): Promise<SafetyRound> {
    const { data, error } = await supabase.from("safety_rounds").insert([round]).select().single();
    if (error) throw error;
    return data;
}

export async function updateSafetyRound(id: string, updates: Partial<SafetyRound>): Promise<void> {
    const { error } = await supabase.from("safety_rounds").update(updates).eq("id", id);
    if (error) throw error;
}

// Deviations
export async function getDeviations(projectId?: string): Promise<Deviation[]> {
    let query = supabase.from("deviations").select("*, actions:deviation_actions(*)");
    if (projectId) {
        query = query.eq("project_id", projectId);
    }
    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
}

export async function getDeviation(id: string): Promise<Deviation | undefined> {
    const { data, error } = await supabase.from("deviations").select("*, actions:deviation_actions(*)").eq("id", id).single();
    if (error) return undefined;
    return data;
}

export async function addDeviation(deviation: Omit<Deviation, "id" | "createdAt" | "updatedAt" | "actions">): Promise<Deviation> {
    const { data, error } = await supabase.from("deviations").insert([deviation]).select().single();
    if (error) throw error;
    return data;
}

export async function updateDeviation(id: string, updates: Partial<Deviation>): Promise<void> {
    const { error } = await supabase.from("deviations").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) throw error;
}

export async function addDeviationAction(deviationId: string, description: string): Promise<DeviationAction> {
    const { data, error } = await supabase.from("deviation_actions").insert([{ deviation_id: deviationId, description }]).select().single();
    if (error) throw error;
    return data;
}

export async function toggleDeviationAction(actionId: string, completed: boolean, user: string): Promise<void> {
    const updates = {
        completed,
        completed_by: completed ? user : null,
        completed_at: completed ? new Date().toISOString() : null
    };
    const { error } = await supabase.from("deviation_actions").update(updates).eq("id", actionId);
    if (error) throw error;
}

// HMS Handbook
export async function getHMSHandbookSections(): Promise<HMSHandbookSection[]> {
    const { data, error } = await supabase.from("hms_handbook_sections").select("*").order("order_index", { ascending: true });
    if (error) throw error;
    // Map snake_case to camelCase if needed, but assuming Supabase types match or we are loose
    // The previous code uses direct casting so I'll trust it matches or update types if needed.
    // Ideally we should map fields but let's see if we can get away with consistent naming or mapping.
    // Actually, SQL uses snake_case, types use camelCase. We must map.
    return (data || []).map((s: any) => ({
        id: s.id,
        title: s.title,
        content: s.content,
        orderIndex: s.order_index,
        lastUpdatedAt: s.last_updated_at
    }));
}

export async function updateHMSHandbookSection(id: string, content: string): Promise<void> {
    const { error } = await supabase.from("hms_handbook_sections").update({
        content,
        last_updated_at: new Date().toISOString()
    }).eq("id", id);
    if (error) throw error;
}

// Project Documents
export async function getProjectDocuments(projectId: string): Promise<ProjectDocument[]> {
    // Exclude file_url to improve performance (it contains base64 data)
    const { data, error } = await supabase.from("project_documents")
        .select("id, project_id, title, category, description, uploaded_at, uploaded_by") // Explicitly exclude file_url
        .eq("project_id", projectId)
        .order("uploaded_at", { ascending: false });

    if (error) throw error;
    return (data || []).map((d: any) => ({
        id: d.id,
        projectId: d.project_id,
        title: d.title,
        category: d.category,
        description: d.description,
        fileUrl: "", // Empty for list view, fetch on demand
        uploadedAt: d.uploaded_at,
        uploadedBy: d.uploaded_by
    }));
}

export async function getProjectDocumentContent(id: string): Promise<string | null> {
    const { data, error } = await supabase.from("project_documents")
        .select("file_url")
        .eq("id", id)
        .single();

    if (error) return null;
    return data?.file_url || null;
}

export async function addProjectDocument(doc: Omit<ProjectDocument, "id" | "uploadedAt">): Promise<ProjectDocument> {
    const { data, error } = await supabase.from("project_documents").insert([{
        project_id: doc.projectId,
        title: doc.title,
        category: doc.category,
        description: doc.description,
        file_url: doc.fileUrl,
        uploaded_by: doc.uploadedBy
    }]).select().single();

    if (error) throw error;
    return {
        id: data.id,
        projectId: data.project_id,
        title: data.title,
        category: data.category,
        description: data.description,
        fileUrl: data.file_url,
        uploadedAt: data.uploaded_at,
        uploadedBy: data.uploaded_by
    };
}

// Share Tokens (QR)
export async function createShareToken(projectId: string): Promise<string> {
    // Check if valid token exists
    const { data: existing } = await supabase.from("share_tokens")
        .select("token")
        .eq("project_id", projectId)
        .eq("is_active", true)
        .limit(1)
        .single();

    if (existing) return existing.token;

    // Create new
    const token = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    const { error } = await supabase.from("share_tokens").insert({
        project_id: projectId,
        token,
        is_active: true
    });

    if (error) throw error;
    return token;
}

export async function getProjectByShareToken(token: string): Promise<Project | undefined> {
    const { data: tokenData, error } = await supabase.from("share_tokens")
        .select("project_id, projects(*)")
        .eq("token", token)
        .eq("is_active", true)
        .single();

    if (error || !tokenData) return undefined;

    // Update view count
    await supabase.from("share_tokens").update({ view_count: (tokenData as any).view_count + 1 }).eq("token", token); // increment not simple in JS client without rpc, but good enough

    const p = tokenData.projects as any;
    if (!p) return undefined;

    // Convert to Project type (similar to getProjects)
    // Note: projects(*) might return array or object depending on relationship. assuming simple join returns object
    return {
        id: p.id,
        name: p.name,
        address: p.address,
        customerId: p.customerId,
        startDate: p.startDate,
        endDate: p.endDate,
        status: p.status,
        budgetExVAT: p.budgetExVAT,
        spentExVAT: p.spentExVAT,
        pricingType: p.pricingType,
        extras: p.extras || [],
        timeEntries: p.timeEntries || [],
        files: p.files || [],
        expenses: p.expenses || []
    };
}
