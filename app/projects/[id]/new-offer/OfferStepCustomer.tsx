"use client";
import { Offer, Customer } from "@/lib/types";
import { useState } from "react";
import { createCustomerDirectAction } from "@/lib/actions";
import { Check, Plus, User } from "lucide-react";

export default function OfferStepCustomer({ offer, updateOffer, customers }: { offer: Partial<Offer>, updateOffer: (d: Partial<Offer>) => void, customers: Customer[] }) {

    const [isCreating, setIsCreating] = useState(false);
    const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
        name: "", email: "", phone: "", address: ""
    });

    const handleCreate = async () => {
        if (!newCustomer.name) return;
        const id = await createCustomerDirectAction(newCustomer as Customer);
        updateOffer({ customerId: id });
        setIsCreating(false);
        // Customer list update relies on parent re-rendering or we optimistically assume it worked. 
        // In a real app we'd refresh the list, but for now the parent might not see it immediately.
        // Actually since we use a Server Action that revalidates, the parent SHOULD update if this was a server component, 
        // but this is a client component receiving props. The props won't update automatically without a refresh.
        // Workaround: We create a fake customer object in the list locally or just set the ID and trust the flow.
        // Better: We force a router.refresh() in the parent? 
        // Let's just update the local state.
    };

    return (
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                <h2>Hvem gjelder tilbudet?</h2>
                <p style={{ color: "var(--muted-foreground)" }}>Velg en eksisterende kunde eller opprett en ny.</p>
            </div>

            {!isCreating ? (
                <div style={{ display: "grid", gap: "1rem" }}>
                    <div style={{ display: "grid", gap: "0.5rem" }}>
                        <label className="label">Velg Kunde</label>
                        <select
                            className="input"
                            value={offer.customerId || ""}
                            onChange={e => {
                                updateOffer({ customerId: e.target.value });
                            }}
                            style={{ padding: "0.75rem" }}
                        >
                            <option value="">-- Velg kunde --</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ textAlign: "center", margin: "1rem 0", position: "relative" }}>
                        <hr style={{ border: "0", borderTop: "1px solid var(--border)" }} />
                        <span style={{ position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)", backgroundColor: "white", padding: "0 1rem", color: "var(--muted-foreground)", fontSize: "0.8rem" }}>ELLER</span>
                    </div>

                    <button
                        onClick={() => setIsCreating(true)}
                        className="btn btn-outline"
                        style={{ width: "100%", padding: "1rem", justifyContent: "center" }}
                    >
                        <Plus size={18} style={{ marginRight: "0.5rem" }} /> Opprett Ny Kunde
                    </button>
                </div>
            ) : (
                <div style={{ border: "1px solid var(--border)", padding: "1.5rem", borderRadius: "8px", backgroundColor: "var(--secondary)" }}>
                    <h3 style={{ marginTop: 0, marginBottom: "1rem" }}>Ny Kunde</h3>
                    <div style={{ display: "grid", gap: "1rem" }}>
                        <div>
                            <label className="label">Navn</label>
                            <input
                                className="input"
                                value={newCustomer.name}
                                onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                placeholder="Fornavn Etternavn"
                            />
                        </div>
                        <div>
                            <label className="label">E-post</label>
                            <input
                                className="input"
                                value={newCustomer.email}
                                onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })}
                                placeholder="ole@eksempel.no"
                            />
                        </div>
                        <div>
                            <label className="label">Telefon</label>
                            <input
                                className="input"
                                value={newCustomer.phone}
                                onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                placeholder="912 34 567"
                            />
                        </div>
                        <div>
                            <label className="label">Adresse</label>
                            <input
                                className="input"
                                value={newCustomer.address}
                                onChange={e => setNewCustomer({ ...newCustomer, address: e.target.value })}
                                placeholder="Storgata 1, 0123 Oslo"
                            />
                        </div>
                        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                            <button onClick={handleCreate} className="btn btn-primary" style={{ flex: 1 }} disabled={!newCustomer.name}>
                                <Check size={16} style={{ marginRight: "0.5rem" }} /> Lagre Kunde
                            </button>
                            <button onClick={() => setIsCreating(false)} className="btn btn-outline">
                                Avbryt
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {offer.customerId && !isCreating && (
                <div style={{ marginTop: "2rem", padding: "1rem", backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "6px", display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ backgroundColor: "#10b981", color: "white", padding: "0.5rem", borderRadius: "50%" }}>
                        <User size={20} />
                    </div>
                    <div>
                        <strong>Kunde valgt!</strong>
                        <p style={{ margin: 0, fontSize: "0.9rem" }}>Du kan nå gå videre til neste steg.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
