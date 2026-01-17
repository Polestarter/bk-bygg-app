export type ProjectStatus = "Aktiv" | "Fullført" | "Planlagt";
export type PricingType = "Fastpris" | "Timespris";
export type ItemStatus = "Safe" | "Unsafe" | "NA" | null;

export interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
}

export interface ProjectFile {
    id: string;
    name: string;
    path: string;
    type: "FDV" | "Sjekkliste" | "Annet";
    uploadedAt: string;
}

export interface Expense {
    id: string;
    description: string;
    amount: number;
    date: string;
    category?: string;
}

export interface Extra {
    id: string;
    description: string;
    amount: number;
    date: string;
    status: "Pending" | "Approved" | "Rejected";
}

export interface TimeEntry {
    id: string;
    date: string;
    description: string;
    hours: number;
    hourlyRate: number;
}

export interface Project {
    id: string;
    name: string;
    customerId: string;
    address: string;
    status: ProjectStatus;
    startDate: string;
    endDate: string | undefined;
    budgetExVAT: number;
    spentExVAT: number;
    pricingType: PricingType;
    files: ProjectFile[];
    expenses: Expense[];
    extras: Extra[];
    timeEntries: TimeEntry[];
}

export interface ChecklistItem {
    id: string;
    text: string;
    status: ItemStatus;
    comment?: string;
    imageUrl?: string;
}

export interface Checklist {
    id: string;
    projectId: string;
    name: string;
    status: "Ny" | "Pågår" | "Fullført";
    items: ChecklistItem[];
    dueDate?: string;
}

export interface ChecklistTemplate {
    id: string;
    name: string;
    items: { text: string }[];
}

export interface OfferCondition {
    id: string;
    category: string;
    title: string;
    tooltip?: string;
    text: string;
    tags?: string[];
    defaultOn?: boolean;
    severity?: "low" | "medium" | "high";
}

export interface OfferLineItem {
    id: string;
    type: "material" | "labor" | "fixed" | "custom";
    description: string;
    unit: "stk" | "m" | "m2" | "timer" | "fastpris" | "liter" | "kg";
    quantity: number;
    unitCost: number; // Innkjøpspris (skjult for kunde)
    markup: number;   // Påslag i prosent (f.eks 20 for 20%)
    unitPrice: number; // Utpris til kunde (beregnes: cost * (1 + markup/100))
    totalPrice: number; // quantity * unitPrice
    showInOffer: boolean; // Om denne linjen skal vises spesifisert i tilbudet
}

export interface Offer {
    id: string;
    projectId?: string; // Optional: Linked when accepted or if created from project
    customerId: string; // Required
    date: string;
    status: "Draft" | "Sent" | "Accepted" | "Rejected" | "Archived";

    // Info
    projectAddress: string; // Address for the work (might differ from customer address)
    projectDescription: string;
    customerType: "Privat" | "Bedrift";
    projectType: string;

    // Price
    pricingModel: "Fastpris" | "Time + materialer" | "Fastpris med forbehold";
    lineItems: OfferLineItem[]; // NEW: Detailed calc
    totalPrice?: number; // Sum of lineItems
    hourlyRate?: number; // Fallback / Global rate
    estimatedHours?: number;
    includeMaterials?: boolean;
    validDays: number;
    paymentPlan: string;

    // Conditions
    selectedConditionIds: string[];
}
