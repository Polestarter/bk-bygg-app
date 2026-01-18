"use client";

import { getOffers, getCustomers, updateOfferInDb, addProject } from "@/lib/db";
import { Offer, Project, Customer } from "@/lib/types";
import OfferStepPreview from "@/app/projects/details/new-offer/OfferStepPreview";
// import OfferStepPreview from "@/app/projects/[id]/new-offer/OfferStepPreview"; // OLD PATH
import Link from "next/link";
import { Edit, Check, X, ArrowLeft } from "lucide-react";
import OfferActions from "./OfferActions";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function OfferDetailContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const router = useRouter();

    const [offer, setOffer] = useState<Offer | undefined>(undefined);
    const [customer, setCustomer] = useState<Customer | undefined>(undefined);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            Promise.all([getOffers(), getCustomers()]).then(([offers, customers]) => {
                const foundOffer = offers.find(o => o.id === id);
                if (foundOffer) {
                    setOffer(foundOffer);
                    const foundCustomer = customers.find(c => c.id === foundOffer.customerId);
                    setCustomer(foundCustomer);
                }
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, [id]);

    const handleUpdateStatus = async (status: Offer["status"]) => {
        if (!offer) return;
        const updatedOffer = { ...offer, status };
        setOffer(updatedOffer); // Optimistic update
        await updateOfferInDb(updatedOffer);
    };

    const handleAccept = async () => {
        if (!offer) return;

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
        const updatedOffer = { ...offer, status: "Accepted" as const, projectId: newProject.id };
        setOffer(updatedOffer);
        await updateOfferInDb(updatedOffer);

        router.push(`/projects/details?id=${newProject.id}`);
    };

    if (loading) return <div className="container" style={{ paddingTop: "2rem" }}>Laster tilbud...</div>;
    if (!offer) return <div className="container" style={{ paddingTop: "2rem" }}>Ikke funnet</div>;

    // Create a mock project object for the Preview component
    const mockProject: Project = {
        id: "temp",
        name: offer.projectType || "Tilbud",
        customerId: offer.customerId,
        status: "Planlagt",
        startDate: "",
        endDate: "",
        address: offer.projectAddress || customer?.address || "",
        budgetExVAT: 0,
        spentExVAT: 0,
        pricingType: "Fastpris",
        expenses: [],
        extras: [],
        timeEntries: [],
        files: []
    };

    return (
        <main className="container" style={{ paddingBottom: "6rem", paddingTop: "2rem" }}>
            <div className="flex-between hide-on-print" style={{ marginBottom: "1rem" }}>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <Link href="/offers" className="btn btn-outline">
                        <ArrowLeft size={16} style={{ marginRight: "0.5rem" }} /> Tilbake
                    </Link>
                    <OfferActions offer={offer} customer={customer} />
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    {offer.status === "Draft" || offer.status === "Sent" ? (
                        <>
                            <button
                                onClick={() => handleUpdateStatus("Rejected")}
                                className="btn btn-outline"
                                style={{ color: "var(--destructive)", borderColor: "var(--destructive)" }}
                            >
                                <X size={16} style={{ marginRight: "0.5rem" }} /> Forkast
                            </button>

                            <Link href={`/offers/details/edit?id=${offer.id}`} className="btn btn-outline">
                                <Edit size={16} style={{ marginRight: "0.5rem" }} /> Revider
                            </Link>

                            <button
                                onClick={handleAccept}
                                className="btn btn-success"
                                style={{ backgroundColor: "#10b981", color: "white" }}
                            >
                                <Check size={16} style={{ marginRight: "0.5rem" }} /> Aksepter (Lag Prosjekt)
                            </button>
                        </>
                    ) : (
                        <div style={{ padding: "0.5rem 1rem", backgroundColor: "#f3f4f6", borderRadius: "6px", fontWeight: "600" }}>
                            Status: {offer.status}
                        </div>
                    )}
                </div>
            </div>

            <OfferStepPreview offer={offer} project={mockProject} customerName={customer?.name} />
        </main>
    );
}

export default function OfferDetailPage() {
    return (
        <Suspense fallback={<div className="container" style={{ paddingTop: "2rem" }}>Laster...</div>}>
            <OfferDetailContent />
        </Suspense>
    );
}
