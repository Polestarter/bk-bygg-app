"use client";
import { Offer, Project, OfferLineItem } from "@/lib/types";
import { OFFER_CONDITIONS } from "@/lib/offer-constants";

export default function OfferStepPreview({ offer, project, customerName }: { offer: Partial<Offer>, project: Project, customerName?: string }) {

    // Helper to get selected conditions
    const selectedConditions = OFFER_CONDITIONS.filter(c => offer.selectedConditionIds?.includes(c.id));
    const lineItems = offer.lineItems || [];

    const groupedItems = {
        labor: lineItems.filter(i => i.type === "labor"),
        material: lineItems.filter(i => i.type === "material"),
        other: lineItems.filter(i => i.type !== "labor" && i.type !== "material")
    };

    const hasItems = lineItems.length > 0;

    return (
        <div style={{ display: "grid", gap: "1.5rem" }}>
            <div className="flex-between hide-on-print">
                <h2>Forhåndsvisning</h2>
                <div style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>
                    Sjekk at alt ser riktig ut før du lagrer.
                </div>
            </div>

            <div className="preview-document print-content" style={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                padding: "3rem",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                color: "#1f2937",
                fontFamily: "serif",
                fontSize: "14px",
                lineHeight: "1.6"
            }}>
                <div style={{ borderBottom: "1px solid #e5e7eb", paddingBottom: "1rem", marginBottom: "2rem" }}>
                    <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem", color: "#111827", fontFamily: "sans-serif" }}>Tilbud</h1>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div>
                            <strong>Til:</strong> {customerName || "Kunde"}<br />
                            <strong>Adresse:</strong> {project.address}
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <strong>Dato:</strong> {offer.date}<br />
                            <strong>Gyldig til:</strong> {addDays(offer.date || "", offer.validDays || 30)}
                        </div>
                    </div>
                </div>

                <div style={{ marginBottom: "2rem" }}>
                    <h3 style={{ borderBottom: "1px solid #e5e7eb", paddingBottom: "0.25rem", marginBottom: "0.5rem", fontFamily: "sans-serif", fontSize: "1.1rem" }}>1. Beskrivelse</h3>
                    <p style={{ whiteSpace: "pre-wrap" }}>{offer.projectDescription || "Ingen beskrivelse."}</p>
                </div>

                <div style={{ marginBottom: "2rem" }}>
                    <h3 style={{ borderBottom: "1px solid #e5e7eb", paddingBottom: "0.25rem", marginBottom: "0.5rem", fontFamily: "sans-serif", fontSize: "1.1rem" }}>2. Spesifikasjon og Pris</h3>

                    {hasItems ? (
                        <div style={{ marginBottom: "1.5rem" }}>
                            {/* Materials */}
                            {groupedItems.material.length > 0 && (
                                <div style={{ marginBottom: "1rem" }}>
                                    <strong style={{ fontFamily: "sans-serif", fontSize: "0.9rem" }}>Materiell og Utstyr</strong>
                                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem", marginTop: "0.25rem" }}>
                                        <tbody>
                                            {groupedItems.material.map((item, i) => (
                                                <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                                    <td style={{ padding: "0.25rem 0" }}>{item.description}</td>
                                                    <td style={{ textAlign: "right", padding: "0.25rem 0" }}>{item.quantity} {item.unit} x {item.unitPrice},-</td>
                                                    <td style={{ textAlign: "right", padding: "0.25rem 0", fontWeight: "600" }}>{item.totalPrice.toLocaleString()},-</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Labor */}
                            {groupedItems.labor.length > 0 && (
                                <div style={{ marginBottom: "1rem" }}>
                                    <strong style={{ fontFamily: "sans-serif", fontSize: "0.9rem" }}>Arbeid</strong>
                                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem", marginTop: "0.25rem" }}>
                                        <tbody>
                                            {groupedItems.labor.map((item, i) => (
                                                <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                                    <td style={{ padding: "0.25rem 0" }}>{item.description}</td>
                                                    <td style={{ textAlign: "right", padding: "0.25rem 0" }}>{item.quantity} {item.unit} x {item.unitPrice},-</td>
                                                    <td style={{ textAlign: "right", padding: "0.25rem 0", fontWeight: "600" }}>{item.totalPrice.toLocaleString()},-</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Other */}
                            {groupedItems.other.length > 0 && (
                                <div style={{ marginBottom: "1rem" }}>
                                    <strong style={{ fontFamily: "sans-serif", fontSize: "0.9rem" }}>Annet / Fastprisposter</strong>
                                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem", marginTop: "0.25rem" }}>
                                        <tbody>
                                            {groupedItems.other.map((item, i) => (
                                                <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                                    <td style={{ padding: "0.25rem 0" }}>{item.description}</td>
                                                    <td style={{ textAlign: "right", padding: "0.25rem 0" }}></td>
                                                    <td style={{ textAlign: "right", padding: "0.25rem 0", fontWeight: "600" }}>{item.totalPrice.toLocaleString()},-</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p style={{ fontStyle: "italic", color: "#6b7280" }}>Ingen spesifiserte linjer.</p>
                    )}

                    <div style={{ backgroundColor: "#f9fafb", padding: "1rem", borderRadius: "4px", marginTop: "1rem" }}>
                        <p style={{ margin: 0, display: "flex", justifyContent: "space-between", fontSize: "1.1rem" }}>
                            <strong>Totalsum (eks. mva):</strong>
                            <strong>{(offer.totalPrice || 0).toLocaleString()} kr</strong>
                        </p>
                        <p style={{ margin: "0.5rem 0 0 0", display: "flex", justifyContent: "space-between", fontSize: "0.9rem", color: "#6b7280" }}>
                            <span>Merverdiavgift (25%):</span>
                            <span>{((offer.totalPrice || 0) * 0.25).toLocaleString()} kr</span>
                        </p>
                        <div style={{ height: "1px", backgroundColor: "#d1d5db", margin: "0.5rem 0" }}></div>
                        <p style={{ margin: 0, display: "flex", justifyContent: "space-between", fontSize: "1.2rem", fontWeight: "bold" }}>
                            <span>Å betale (inkl. mva):</span>
                            <span>{((offer.totalPrice || 0) * 1.25).toLocaleString()} kr</span>
                        </p>
                    </div>
                    <p style={{ marginTop: "1rem" }}>
                        <strong>Prismodell:</strong> {offer.pricingModel}<br />
                        <strong>Betalingsplan:</strong> {offer.paymentPlan}
                    </p>
                </div>

                <div style={{ marginBottom: "2rem" }}>
                    <h3 style={{ borderBottom: "1px solid #e5e7eb", paddingBottom: "0.25rem", marginBottom: "0.5rem", fontFamily: "sans-serif", fontSize: "1.1rem" }}>3. Forutsetninger og Forbehold</h3>
                    <ul style={{ paddingLeft: "1.5rem", margin: 0 }}>
                        {selectedConditions.map(c => (
                            <li key={c.id} style={{ marginBottom: "0.75rem" }}>
                                <strong>{c.title}:</strong> {c.text}
                            </li>
                        ))}
                    </ul>
                </div>

                <div style={{ marginTop: "4rem", borderTop: "1px solid #e5e7eb", paddingTop: "1rem", fontSize: "0.8rem", color: "#6b7280", textAlign: "center" }}>
                    <p>BK Bygg AS - Org.nr 999 888 777 - Tlf: 912 34 567</p>
                </div>
            </div>
        </div>
    );
}

// Helpers
function customerName(id: string) {
    if (id === "1") return "Ola Nordmann";
    if (id === "2") return "Line Hansen";
    return "Kunde navn";
}

function addDays(dateStr: string, days: number) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString();
}
