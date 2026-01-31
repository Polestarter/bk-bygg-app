import { getProjects as dbGetProjects, getCustomers as dbGetCustomers, getChecklists as dbGetChecklists, getChecklistTemplates as dbGetChecklistTemplates, getSJAs as dbGetSJAs, getSJATemplates as dbGetSJATemplates, addSJA as dbAddSJA, getSJA as dbGetSJA, updateSJA as dbUpdateSJA, getSafetyRounds as dbGetSafetyRounds, getSafetyRound as dbGetSafetyRound, addSafetyRound as dbAddSafetyRound, updateSafetyRound as dbUpdateSafetyRound, getDeviations as dbGetDeviations, getDeviation as dbGetDeviation, addDeviation as dbAddDeviation, updateDeviation as dbUpdateDeviation, addDeviationAction as dbAddDeviationAction, toggleDeviationAction as dbToggleDeviationAction, getHMSHandbookSections as dbGetHMSHandbookSections, updateHMSHandbookSection as dbUpdateHMSHandbookSection, getProjectDocuments as dbGetProjectDocuments, addProjectDocument as dbAddProjectDocument, deleteProjectDocument as dbDeleteProjectDocument, createShareToken as dbCreateShareToken, getProjectByShareToken as dbGetProjectByShareToken } from "./db";
import { Project, Customer, Checklist, SJA, Deviation } from "./types";

// Re-export types for convenience
export * from "./types";

// These functions are now async and return promises
export async function getProjects(): Promise<Project[]> {
    return await dbGetProjects();
}

export async function getCustomers(): Promise<Customer[]> {
    return await dbGetCustomers();
}

export async function getChecklists(): Promise<Checklist[]> {
    return await dbGetChecklists();
}

export async function getChecklist(id: string): Promise<Checklist | undefined> {
    const checklists = await dbGetChecklists();
    return checklists.find(c => c.id === id);
}

export async function getChecklistTemplates() {
    return await dbGetChecklistTemplates();
}

export async function getCustomer(id: string): Promise<Customer | undefined> {
    const customers = await dbGetCustomers();
    return customers.find(c => c.id === id);
}

export async function getCustomerProjects(customerId: string): Promise<Project[]> {
    const projects = await dbGetProjects();
    return projects.filter(p => p.customerId === customerId);
}

export async function getStats() {
    const projects = await dbGetProjects();
    const active = projects.filter(p => p.status === "Aktiv").length;
    const completed = projects.filter(p => p.status === "Fullført").length;
    const totalBudgetExVAT = projects.reduce((acc, p) => acc + p.budgetExVAT, 0);
    const totalSpentExVAT = projects.reduce((acc, p) => acc + p.spentExVAT, 0);

    return { active, completed, totalBudgetExVAT, totalSpentExVAT };
}

export async function getSJAs(projectId: string): Promise<SJA[]> {
    return await dbGetSJAs(projectId);
}

export async function getSJATemplates() {
    return await dbGetSJATemplates();
}

export async function getSJA(id: string): Promise<SJA | undefined> {
    return await dbGetSJA(id);
}

export async function addSJA(sja: SJA) {
    return await dbAddSJA(sja);
}

export async function updateSJA(sja: SJA) {
    return await dbUpdateSJA(sja);
}

export async function getSafetyRounds(projectId: string) {
    return await dbGetSafetyRounds(projectId);
}

export async function getSafetyRound(id: string) {
    return await dbGetSafetyRound(id);
}

export async function addSafetyRound(round: any) {
    return await dbAddSafetyRound(round);
}

export async function updateSafetyRound(round: any) {
    return await dbUpdateSafetyRound(round.id, round);
}

// Deviations
export async function getDeviations(projectId?: string) {
    return await dbGetDeviations(projectId);
}

export async function getDeviation(id: string) {
    return await dbGetDeviation(id);
}

export async function addDeviation(deviation: any) {
    return await dbAddDeviation(deviation);
}

export async function updateDeviation(id: string, updates: any) {
    return await dbUpdateDeviation(id, updates);
}

export async function addDeviationAction(deviationId: string, description: string) {
    return await dbAddDeviationAction(deviationId, description);
}

export async function toggleDeviationAction(actionId: string, completed: boolean, user: string) {
    return await dbToggleDeviationAction(actionId, completed, user);
}

// HMS
export async function getHMSHandbookSections() {
    return await dbGetHMSHandbookSections();
}

export async function updateHMSHandbookSection(id: string, content: string) {
    return await dbUpdateHMSHandbookSection(id, content);
}

export async function getProjectDocuments(projectId: string) {
    return await dbGetProjectDocuments(projectId);
}

export async function addProjectDocument(doc: any) {
    return await dbAddProjectDocument(doc);
}

export async function deleteProjectDocument(id: string) {
    return await dbDeleteProjectDocument(id);
}

export async function createShareToken(projectId: string) {
    return await dbCreateShareToken(projectId);
}

export async function getProjectByShareToken(token: string) {
    return await dbGetProjectByShareToken(token);
}
