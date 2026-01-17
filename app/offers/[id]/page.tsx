import { getOffers, getCustomers, getProjects } from "@/lib/db";
import { Offer, Project, Customer } from "@/lib/types";
import OfferStepPreview from "@/app/projects/[id]/new-offer/OfferStepPreview";
import { acceptOfferAction, updateOfferStatusAction } from "@/lib/actions";
import Link from "next/link";
import { Edit, Check, X, ArrowLeft } from "lucide-react";
import OfferActions from "./OfferActions";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function OfferDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const offers = await getOffers();
    console.log("Looking for offer:", id);
    console.log("Available offers:", offers.map(o => o.id));

    const offer = offers.find(o => o.id === id);
    const customers = await getCustomers();

    if (!offer) return <div>Ikke funnet</div>;

    const customer = customers.find(c => c.id === offer.customerId);

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
        <main className="container" style={{ paddingBottom: "6rem" }}>
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
                            <form action={async () => {
                                "use server";
                                await updateOfferStatusAction(offer.id, "Rejected");
                            }}>
                                <button className="btn btn-outline" style={{ color: "var(--destructive)", borderColor: "var(--destructive)" }}>
                                    <X size={16} style={{ marginRight: "0.5rem" }} /> Forkast
                                </button>
                            </form>

                            <Link href={`/offers/${offer.id}/edit`} className="btn btn-outline">
                                <Edit size={16} style={{ marginRight: "0.5rem" }} /> Revider
                            </Link>

                            <form action={async () => {
                                "use server";
                                const projectId = await acceptOfferAction(offer.id);
                                redirect(`/projects/${projectId}`);
                            }}>
                                <button className="btn btn-success" style={{ backgroundColor: "#10b981", color: "white" }}>
                                    <Check size={16} style={{ marginRight: "0.5rem" }} /> Aksepter (Lag Prosjekt)
                                </button>
                            </form>
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
