
import { supabase } from "./supabaseClient";
import { Project, Customer, Checklist, ChecklistTemplate, Offer, SJA, SJATemplate, SafetyRound } from "./types";

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
    const { data } = await supabase.from('safety_rounds').select('*').eq('id', id).single();
    if (!data) return undefined;
    return data as SafetyRound;
}

export async function addSafetyRound(round: SafetyRound): Promise<void> {
    const { error } = await supabase.from('safety_rounds').insert(clean(round));
    if (error) console.error("Error adding Safety Round:", error);
}

export async function updateSafetyRound(round: SafetyRound): Promise<void> {
    const { error } = await supabase.from('safety_rounds').update(clean(round)).eq('id', round.id);
    if (error) console.error("Error updating Safety Round:", error);
}
