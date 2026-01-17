"use server";

import { revalidatePath } from "next/cache";
import { addProject, addCustomer, getProjects, updateProject, getChecklistTemplates, addChecklistTemplate, addChecklist, getChecklist, addOffer, getOffers, updateOfferInDb } from "./db";
import { Project, Customer, PricingType, Checklist, ChecklistItem, ChecklistTemplate, Offer } from "./types";
import { redirect } from "next/navigation";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function createProjectAction(formData: FormData) {
    const name = formData.get("name") as string;
    const customerId = formData.get("customerId") as string;
    const address = formData.get("address") as string;
    const pricingType = formData.get("pricingType") as PricingType;
    const budget = formData.get("budget") as string;
    const startDate = formData.get("startDate") as string;

    if (!name || !customerId) {
        throw new Error("Missing required fields");
    }

    const newProject: Project = {
        id: Math.random().toString(36).substring(2, 9),
        name,
        customerId,
        address,
        pricingType,
        status: "Planlagt",
        budgetExVAT: Number(budget) || 0,
        spentExVAT: 0,
        startDate: startDate || new Date().toISOString().split("T")[0],
        endDate: undefined,
        files: [],
        expenses: [],
        extras: [],
        timeEntries: []
    };

    await addProject(newProject);

    revalidatePath("/projects");
    revalidatePath(`/customers/${customerId}`);
    redirect("/projects");
}

export async function logTime(formData: FormData) {
    const projectId = formData.get("projectId") as string;
    const description = formData.get("description") as string;
    const hours = Number(formData.get("hours"));
    const hourlyRate = Number(formData.get("hourlyRate"));
    const date = formData.get("date") as string;

    if (!projectId || !description || !hours || !hourlyRate) {
        throw new Error("Missing required fields");
    }

    const projects = await getProjects();
    const project = projects.find(p => p.id === projectId);

    if (project) {
        if (!project.timeEntries) project.timeEntries = [];

        project.timeEntries.push({
            id: Math.random().toString(36).substring(2, 9),
            description,
            hours,
            hourlyRate,
            date: date || new Date().toISOString().split("T")[0]
        });

        await updateProject(project);
        revalidatePath(`/projects/${projectId}`);
    }
}

export async function addExpense(formData: FormData) {
    const projectId = formData.get("projectId") as string;
    const description = formData.get("description") as string;
    const amount = Number(formData.get("amount"));
    const date = formData.get("date") as string;
    const category = formData.get("category") as string;

    if (!projectId || !description || !amount) {
        throw new Error("Missing required fields");
    }

    const projects = await getProjects();
    const project = projects.find(p => p.id === projectId);

    if (project) {
        if (!project.expenses) project.expenses = [];

        project.expenses.push({
            id: Math.random().toString(36).substring(2, 9),
            description,
            amount,
            date: date || new Date().toISOString().split("T")[0],
            category
        });

        // Update spent amount automatically
        const totalExpenses = project.expenses.reduce((sum, e) => sum + e.amount, 0);
        project.spentExVAT = totalExpenses;

        await updateProject(project);
        revalidatePath(`/projects/${projectId}`);
    }
}

export async function addExtra(formData: FormData) {
    const projectId = formData.get("projectId") as string;
    const description = formData.get("description") as string;
    const amount = Number(formData.get("amount"));
    const date = formData.get("date") as string;

    if (!projectId || !description || !amount) {
        throw new Error("Missing required fields");
    }

    const projects = await getProjects();
    const project = projects.find(p => p.id === projectId);

    if (project) {
        if (!project.extras) project.extras = [];

        project.extras.push({
            id: Math.random().toString(36).substring(2, 9),
            description,
            amount,
            date: date || new Date().toISOString().split("T")[0],
            status: "Pending"
        });

        await updateProject(project);
        revalidatePath(`/projects/${projectId}`);
    }
}

export async function createCustomerAction(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;

    if (!name) {
        throw new Error("Missing required fields");
    }

    const newCustomer: Customer = {
        id: Math.random().toString(36).substring(2, 9),
        name,
        email,
        phone,
        address
    };

    await addCustomer(newCustomer);

    revalidatePath("/customers");
    redirect("/customers");
}


export async function createChecklistAction(formData: FormData) {
    const projectId = formData.get("projectId") as string;
    const name = formData.get("name") as string;
    const templateId = formData.get("templateId") as string;
    const dueDate = formData.get("dueDate") as string;

    if (!projectId || !name) {
        throw new Error("Missing required fields");
    }

    let items: ChecklistItem[] = [];

    if (templateId) {
        const templates = await getChecklistTemplates();
        const template = templates.find(t => t.id === templateId);
        if (template) {
            items = template.items.map(i => ({
                id: Math.random().toString(36).substring(2, 9),
                text: i.text,
                status: null
            }));
        }
    }

    const newChecklist: Checklist = {
        id: Math.random().toString(36).substring(2, 9),
        projectId,
        name,
        status: "Ny",
        items,
        dueDate: dueDate || undefined
    };

    await addChecklist(newChecklist);
    revalidatePath(`/projects/${projectId}`);
    return newChecklist.id;
}

export async function saveTemplateAction(formData: FormData) {
    const sourceChecklistId = formData.get("sourceChecklistId") as string;
    const templateName = formData.get("templateName") as string;

    if (!sourceChecklistId || !templateName) {
        throw new Error("Missing required fields");
    }

    const checklist = await getChecklist(sourceChecklistId);

    if (checklist) {
        const newTemplate: ChecklistTemplate = {
            id: Math.random().toString(36).substring(2, 9),
            name: templateName,
            items: checklist.items.map(item => ({ text: item.text }))
        };

        await addChecklistTemplate(newTemplate);
        // We technically don't need to revalidate a specific path here unless we have a "Manage Templates" page.
        // But if the "Success" UI needs to show, we might return something.
    }
}


export async function uploadFile(formData: FormData) {
    const file = formData.get("file") as File;
    const projectId = formData.get("projectId") as string;
    const type = formData.get("type") as "FDV" | "Sjekkliste" | "Annet";

    if (!file || !projectId) {
        throw new Error("Missing file or project ID");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), "uploads");

    // Ensure upload directory exists
    try {
        await mkdir(uploadDir, { recursive: true });
    } catch (e) {
        // Ignore if exists
    }

    const uniqueName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    const filePath = path.join(uploadDir, uniqueName);
    await writeFile(filePath, buffer);

    // Update DB
    const projects = await getProjects();
    const project = projects.find(p => p.id === projectId);

    if (project) {
        project.files.push({
            id: Math.random().toString(36).substring(2, 9),
            name: file.name,
            path: uniqueName,
            type: type || "Annet",
            uploadedAt: new Date().toISOString()
        });

        await updateProject(project);
        revalidatePath(`/projects/${projectId}`);
    }
}


export async function createOfferAction(offerData: Offer) {
    // Ensure we have a customer. If the UI sent a "new customer" object, we'd handle it here, 
    // but the UI will likely use addCustomer separately or we can bundle it.
    // For now, assuming offerData has a valid customerId.

    await addOffer(offerData);

    // Revalidate offers page and project page if linked
    revalidatePath("/offers");
    if (offerData.projectId) {
        revalidatePath(`/projects/${offerData.projectId}`);
    }
}

export async function acceptOfferAction(offerId: string) {
    const db = await getOffers(); // We need to read the full DB to get the offer, using internal helpers ideally
    const offer = db.find(o => o.id === offerId);
    if (!offer) throw new Error("Offer not found");

    // 1. Create Project
    const newProject: Project = {
        id: Math.random().toString(36).substring(2, 9),
        name: offer.projectType + " - " + offer.projectAddress,
        customerId: offer.customerId,
        status: "Planlagt",
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
        address: offer.projectAddress,
        budgetExVAT: offer.totalPrice || 0,
        spentExVAT: 0,
        pricingType: offer.pricingModel === "Time + materialer" ? "Timespris" : "Fastpris",
        expenses: [],
        extras: [],
        timeEntries: [],
        files: []
    };

    await addProject(newProject);

    // 2. Update Offer
    offer.status = "Accepted";
    offer.projectId = newProject.id;
    // We need to update the offer in the DB. Since we don't have updateOffer, we'll implement a basic one or just overwrite via writeDb in a real app.
    // Hack: We'll read/write the whole list in `updateOfferStatus` helper if we had one.
    // For now, I'll add a helper `updateOffer` in db.ts or just handle it here if I import `readDb/writeDb`.
    // Actually, `addOffer` appends. I need `updateOffer`.

    // Let's add updateOffer to db.ts first to be clean.
    await updateOfferInDb(offer);

    revalidatePath("/offers");
    return newProject.id;
}

export async function updateOfferStatusAction(offerId: string, status: Offer["status"]) {
    const db = await getOffers();
    const offer = db.find(o => o.id === offerId);
    if (offer) {
        offer.status = status;
        await updateOfferInDb(offer);
        revalidatePath("/offers");
        if (offer.projectId) revalidatePath(`/projects/${offer.projectId}`);
    }
}
export async function createCustomerDirectAction(data: Customer): Promise<string> {
    const newCustomer: Customer = {
        ...data,
        id: Math.random().toString(36).substring(2, 9)
    };
    await addCustomer(newCustomer);
    revalidatePath("/customers");
    revalidatePath("/offers/new");
    return newCustomer.id;
}
