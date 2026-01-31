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
    startTime?: string; // HH:mm
    endTime?: string;   // HH:mm
    breakMinutes?: number;
    userId?: string;
    userEmail?: string;
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

export type RiskProbability = "Lav" | "Middels" | "Høy";
export type RiskSeverity = "Lav" | "Middels" | "Høy";

export interface SJAMeasure {
    id: string;
    description: string;
    responsible: string; // "Alle", "Leder", or specific name
    completed: boolean;
}

export interface SJARisk {
    id: string;
    activity: string; // e.g. "Arbeid i høyden"
    description: string; // What can go wrong?
    probability: RiskProbability;
    severity: RiskSeverity;
    measures: SJAMeasure[];
}

export interface SJA {
    id: string;
    projectId: string;
    date: string;
    location: string;
    description: string; // Description of the job
    participants: string; // Names of people involved
    risks: SJARisk[];
    status: "Utkast" | "Signert";
    // Signatures
    signatureLeader?: string;
    signatureLeaderDate?: string;
    signatureExecutor?: string; // Sentralt: Signatur fra utførende (den som gjør jobben)
    signatureExecutorDate?: string;

    // SJA 2.0 Fields
    weather?: string; // Værforhold
    workOperation?: string; // Konkret arbeidsoperasjon
    emergencyResponse?: string; // Beredskap
}

// Safety Rounds (Vernerunder)
export interface SafetyRoundItem {
    id: string;
    category: string;
    question: string;
    status: "OK" | "Avvik" | "Ikke relevant";
    comment?: string;
    photoUrl?: string; // Base64
}

export interface SafetyRound {
    id: string;
    projectId: string; // UUID
    date: string;
    description: string;
    participants: string;
    status: "Utkast" | "Signert";
    items: SafetyRoundItem[];
    signatureLeader?: string;
    signatureLeaderDate?: string;
}

export interface SJATemplate {
    id: string;
    name: string;
    risks: Omit<SJARisk, "id">[];
}

// Deviations (Avvik)
export type DeviationSeverity = "Lav" | "Middels" | "Høy" | "Kritisk";
export type DeviationStatus = "Ny" | "Pågår" | "Utbedret" | "Lukket";

export interface DeviationAction {
    id: string;
    deviationId: string;
    description: string;
    completed: boolean;
    completedBy?: string;
    completedAt?: string;
    createdAt: string;
}

export interface Deviation {
    id: string;
    projectId: string; // Can be empty string if general
    sjaId?: string; // Optional link to SJA
    userId?: string;
    title: string;
    description: string;
    category: string;
    severity: DeviationSeverity;
    status: DeviationStatus;
    location?: {
        text: string;
        lat?: number;
        lng?: number;
    };
    responsiblePerson?: string;
    dueDate?: string;
    photos: string[]; // Base64 or URLs
    createdAt: string;
    updatedAt: string;
    closedBy?: string;
    actions?: DeviationAction[]; // Joined view
}

// HMS Module
export interface HMSHandbookSection {
    id: string;
    title: string;
    content: string; // Markdown/HTML
    orderIndex: number;
    lastUpdatedAt: string;
}

export interface ProjectDocument {
    id: string;
    projectId: string;
    title: string;
    category: "SHA" | "SJA" | "Stoffkartotek" | "Brukermanualer" | "Samsvarserklæringer" | "Tilsyn/Export";
    description?: string;
    fileUrl: string;
    uploadedAt: string;
    uploadedBy?: string;
}
