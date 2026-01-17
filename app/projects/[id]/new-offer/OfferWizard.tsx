"use client";

import { useState } from "react";
import { Project, Offer, Customer } from "@/lib/types";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import OfferStepInfo from "./OfferStepInfo";
import OfferStepPrice from "./OfferStepPrice";
import OfferStepConditions from "./OfferStepConditions";
import OfferStepPreview from "./OfferStepPreview";
import OfferStepCustomer from "./OfferStepCustomer";
import { createOfferAction } from "@/lib/actions";
import { useRouter } from "next/navigation";

export default function OfferWizard({ project, customers = [], initialData }: { project?: Project, customers?: Customer[], initialData?: Offer }) {
    const router = useRouter();

    // If project is provided, we skip customer selection step
    // If initialData is provided, we skip (or handle) based on its state?
    // If editing, we probably want to start at Step 1 (Info) or user can go back to Step 0?
    // Let's start at Step 1 if data exists.
    const [step, setStep] = useState(initialData ? 1 : (project ? 1 : 0));

    const [offer, setOffer] = useState<Partial<Offer>>(initialData || {
        id: Math.random().toString(36).substring(2, 9),
        projectId: project?.id, // Optional
        customerId: project?.customerId || "",
        date: new Date().toISOString().split("T")[0],
        status: "Draft",
        projectDescription: "",
        customerType: "Privat",
        projectType: "Rehab",
        pricingModel: "Fastpris",
        validDays: 30,
        paymentPlan: "50/50",
        selectedConditionIds: [],
        lineItems: []
    });

    // Helper to find selected customer object
    const selectedCustomer = customers.find(c => c.id === offer.customerId);

    // Mock project for steps that expect it, if we don't have a real one
    const activeProject: Project = project || {
        id: "temp",
        name: offer.projectType || "Nytt Tilbud",
        customerId: offer.customerId || "",
        status: "Planlagt",
        startDate: "",
        endDate: "",
        address: selectedCustomer?.address || "",
        budgetExVAT: 0,
        spentExVAT: 0,
        pricingType: "Fastpris",
        expenses: [],
        extras: [],
        timeEntries: [],
        files: []
    };

    const updateOffer = (data: Partial<Offer>) => {
        setOffer(prev => ({ ...prev, ...data }));
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const handleSave = async () => {
        if (!offer.projectDescription) {
            alert("Du må fylle ut prosjektbeskrivelse");
            return;
        }
        if (!offer.customerId) {
            alert("Du må velge en kunde");
            return;
        }
        await createOfferAction(offer as Offer);
        router.push("/offers"); // Redirect to offers list
    };

    const steps = [
        { num: 0, title: "Kunde" },
        { num: 1, title: "Informasjon" },
        { num: 2, title: "Pris & Betaling" },
        { num: 3, title: "Forbehold" },
        { num: 4, title: "Forhåndsvisning" }
    ];

    // Filter steps to show
    const visibleSteps = project ? steps.filter(s => s.num > 0) : steps;

    return (
        <div>
            {/* Stepper */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem", borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
                {visibleSteps.map(s => (
                    <div key={s.num} style={{
                        display: "flex", alignItems: "center", gap: "0.5rem",
                        color: step >= s.num ? "var(--primary)" : "var(--muted-foreground)",
                        fontWeight: step === s.num ? "bold" : "normal"
                    }}>
                        <div style={{
                            width: "24px", height: "24px", borderRadius: "50%",
                            backgroundColor: step >= s.num ? "var(--primary)" : "var(--secondary)",
                            color: step >= s.num ? "white" : "var(--foreground)",
                            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem"
                        }}>
                            {s.num + (project ? 0 : 1)}
                        </div>
                        <span className="hide-on-mobile">{s.title}</span>
                    </div>
                ))}
            </div>

            {/* Content */}
            <div className="card" style={{ padding: "2rem", minHeight: "400px" }}>
                {step === 0 && <OfferStepCustomer offer={offer} updateOffer={updateOffer} customers={customers} />}
                {step === 1 && <OfferStepInfo offer={offer} updateOffer={updateOffer} project={activeProject} />}
                {step === 2 && <OfferStepPrice offer={offer} updateOffer={updateOffer} />}
                {step === 3 && <OfferStepConditions offer={offer} updateOffer={updateOffer} />}
                {step === 4 && <OfferStepPreview offer={offer} project={activeProject} />}
            </div>

            {/* Navigation */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem" }}>
                <button
                    onClick={prevStep}
                    disabled={step === (project ? 1 : 0)}
                    className="btn btn-outline"
                    style={{ visibility: step === (project ? 1 : 0) ? "hidden" : "visible" }}
                >
                    <ArrowLeft size={16} style={{ marginRight: "0.5rem" }} /> Forrige
                </button>

                {step < 4 ? (
                    <button onClick={nextStep} className="btn btn-primary" disabled={step === 0 && !offer.customerId}>
                        Neste <ArrowRight size={16} style={{ marginLeft: "0.5rem" }} />
                    </button>
                ) : (
                    <button onClick={handleSave} className="btn btn-success" style={{ backgroundColor: "#10b981", color: "white" }}>
                        <Save size={16} style={{ marginRight: "0.5rem" }} /> Lagre Tilbud
                    </button>
                )}
            </div>
        </div>
    );
}
