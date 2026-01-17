import fs from "fs/promises";
import path from "path";
import { Project, Customer, Checklist, ChecklistTemplate, Offer } from "./types";

const DB_PATH = path.join(process.cwd(), "db.json");

interface Database {
    projects: Project[];
    customers: Customer[];
    checklists: Checklist[];
    checklistTemplates: ChecklistTemplate[];
    offers: Offer[];
}

async function readDb(): Promise<Database> {
    try {
        const data = await fs.readFile(DB_PATH, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        return { projects: [], customers: [], checklists: [], checklistTemplates: [], offers: [] };
    }
}

async function writeDb(data: Database): Promise<void> {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function getOffers(): Promise<Offer[]> {
    const db = await readDb();
    return db.offers || [];
}

export async function addOffer(offer: Offer): Promise<void> {
    const db = await readDb();
    if (!db.offers) db.offers = [];
    db.offers.push(offer);
    await writeDb(db);
}

export async function updateOfferInDb(offer: Offer): Promise<void> {
    const db = await readDb();
    if (!db.offers) return;
    const index = db.offers.findIndex(o => o.id === offer.id);
    if (index !== -1) {
        db.offers[index] = offer;
        await writeDb(db);
    }
}

export async function getProjects(): Promise<Project[]> {
    const db = await readDb();
    return db.projects;
}

export async function getCustomers(): Promise<Customer[]> {
    const db = await readDb();
    return db.customers;
}

export async function getChecklists(): Promise<Checklist[]> {
    const db = await readDb();
    return db.checklists;
}

export async function getChecklist(id: string): Promise<Checklist | undefined> {
    const db = await readDb();
    return db.checklists.find(c => c.id === id);
}

export async function addProject(project: Project): Promise<void> {
    const db = await readDb();
    db.projects.push(project);
    await writeDb(db);
}

export async function addCustomer(customer: Customer): Promise<void> {
    const db = await readDb();
    db.customers.push(customer);
    await writeDb(db);
}

export async function getChecklistTemplates(): Promise<ChecklistTemplate[]> {
    const db = await readDb();
    return db.checklistTemplates || [];
}

export async function addChecklistTemplate(template: ChecklistTemplate): Promise<void> {
    const db = await readDb();
    if (!db.checklistTemplates) db.checklistTemplates = [];
    db.checklistTemplates.push(template);
    await writeDb(db);
}

export async function addChecklist(checklist: Checklist): Promise<void> {
    const db = await readDb();
    if (!db.checklists) db.checklists = [];
    db.checklists.push(checklist);
    await writeDb(db);
}

export async function updateProject(updatedProject: Project): Promise<void> {
    const db = await readDb();
    const index = db.projects.findIndex(p => p.id === updatedProject.id);
    if (index !== -1) {
        db.projects[index] = updatedProject;
        await writeDb(db);
    }
}
