
import { supabase } from "./supabaseClient";
import { Project, Customer, Checklist, ChecklistTemplate, Offer, SJA, SJATemplate } from "./types";

// Helper to strip "undefined" fields because Supabase/JSON doesn't like them?
// Actually Supabase JS handles it, but undefined is not valid JSON.
// JSON.stringify removes undefined.
const clean = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

export const getSJATemplates = async (): Promise<SJATemplate[]> => {
    // Mock templates for now
    return [
        {
            id: "1",
            name: "Arbeid i høyden (Stillas/Lift)",
            risks: [
                { activity: "Montering av stillas", description: "Fall fra høyde", probability: "Middels", severity: "Høy", measures: [{ id: "m1", description: "Bruk fallsikring", responsible: "Alle", completed: false }] },
                { activity: "Arbeid på stillas", description: "Gjenstander som faller ned", probability: "Middels", severity: "Middels", measures: [{ id: "m2", description: "Sikre verktøy", responsible: "Alle", completed: false }] }
            ]
        },
        {
            id: "2",
            name: "Riving",
            risks: [
                { activity: "Riving av vegg", description: "Støv og partikler", probability: "Høy", severity: "Lav", measures: [{ id: "m3", description: "Bruk støvmaske", responsible: "Alle", completed: false }] },
                { activity: "Riving av vegg", description: "Elektrisk støt", probability: "Lav", severity: "Høy", measures: [{ id: "m4", description: "Koble ut strøm", responsible: "Leder", completed: false }] }
            ]
        },
        {
            id: "3",
            name: "Taktekking",
            risks: [
                { activity: "Ferdsel på tak", description: "Fall fra kant", probability: "Middels", severity: "Høy", measures: [{ id: "m5", description: "Montere rekkverk", responsible: "Leder", completed: false }] }
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
