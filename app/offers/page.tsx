import { getOffers, getCustomers } from "@/lib/db";
import Link from "next/link";
import { Plus, FileText, CheckCircle, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OffersPage() {
    const offers = await getOffers();
    const customers = await getCustomers();

    const getCustomerName = (id: string) => customers.find(c => c.id === id)?.name || "Ukjent kunde";

    return (
        <main className="container" style={{ paddingTop: "2rem", paddingBottom: "6rem" }}>
            <div className="flex-between" style={{ marginBottom: "2rem" }}>
                <h1>Tilbud</h1>
                <Link href="/offers/new" className="btn btn-primary">
                    <Plus size={16} style={{ marginRight: "0.5rem" }} /> Nytt Tilbud
                </Link>
            </div>

            <div style={{ display: "grid", gap: "1rem" }}>
                {offers.length === 0 ? (
                    <div className="card" style={{ padding: "3rem", textAlign: "center", color: "var(--muted-foreground)" }}>
                        <p>Ingen tilbud opprettet enda.</p>
                    </div>
                ) : (
                    offers.map(offer => {
                        const customerName = getCustomerName(offer.customerId);
                        return (
                            <Link key={offer.id} href={`/offers/${offer.id}`} style={{ textDecoration: "none" }}>
                                <div className="card" style={{ transition: "border-color 0.2s" }}>
                                    <div className="flex-between" style={{ marginBottom: "0.5rem" }}>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: "1.1rem" }}>{offer.projectType}</h3>
                                            <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--muted-foreground)" }}>{customerName} • {offer.projectAddress}</p>
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                            <Badge status={offer.status} />
                                            <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>{offer.date}</p>
                                        </div>
                                    </div>
                                    <div className="flex-between" style={{ fontSize: "0.9rem" }}>
                                        <span>{offer.pricingModel}</span>
                                        <span style={{ fontWeight: "600" }}>{(offer.totalPrice || 0).toLocaleString()} kr</span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                )}
            </div>
        </main>
    );
}

function Badge({ status }: { status: string }) {
    let color = "#6b7280";
    let bg = "rgba(107, 114, 128, 0.1)";
    let icon = <FileText size={14} />;

    if (status === "Accepted") {
        color = "#10b981";
        bg = "rgba(16, 185, 129, 0.1)";
        icon = <CheckCircle size={14} />;
    } else if (status === "Rejected") {
        color = "#ef4444";
        bg = "rgba(239, 68, 68, 0.1)";
        icon = <XCircle size={14} />;
    } else if (status === "Sent") {
        color = "#3b82f6";
        bg = "rgba(59, 130, 246, 0.1)";
    }

    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: "0.25rem",
            padding: "0.25rem 0.75rem", borderRadius: "99px",
            backgroundColor: bg, color: color, fontSize: "0.75rem", fontWeight: "600"
        }}>
            {icon} {status}
        </span>
    );
}
