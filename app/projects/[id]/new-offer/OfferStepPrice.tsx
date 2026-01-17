"use client";
import { Offer, OfferLineItem } from "@/lib/types";
import { useState, useMemo, useEffect } from "react";
import { Plus, Trash2, Calculator } from "lucide-react";

export default function OfferStepPrice({ offer, updateOffer }: { offer: Partial<Offer>, updateOffer: (d: Partial<Offer>) => void }) {

    // Ensure lineItems exists
    const lineItems = offer.lineItems || [];

    // Local state for the "Add New" row to keep UI clean
    const [newItem, setNewItem] = useState<Partial<OfferLineItem>>({
        type: "material",
        unit: "stk",
        quantity: 1,
        unitCost: 0,
        markup: 20,
        description: ""
    });

    // Helper to calculate totals based on line items
    useEffect(() => {
        const total = lineItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
        // Only update if different to avoid loop, though comparison might be tricky with floats. 
        // Better: The parent handles the definitive state. We just trigger an update IF the sum is different from offer.totalPrice?
        // Actually, we should just rely on lineItems being the source of truth for calculations now.
        if (total !== offer.totalPrice) {
            updateOffer({ totalPrice: total });
        }
    }, [lineItems, updateOffer, offer.totalPrice]);


    const addItem = () => {
        if (!newItem.description) return;

        const cost = Number(newItem.unitCost) || 0;
        const mk = Number(newItem.markup) || 0;
        const qty = Number(newItem.quantity) || 0;

        // Calculate price to customer
        const unitPrice = cost * (1 + mk / 100);
        const totalPrice = qty * unitPrice;

        const itemToAdd: OfferLineItem = {
            id: Math.random().toString(36).substring(2, 9),
            type: newItem.type as any,
            description: newItem.description,
            unit: newItem.unit as any,
            quantity: qty,
            unitCost: cost,
            markup: mk,
            unitPrice: Math.round(unitPrice),
            totalPrice: Math.round(totalPrice),
            showInOffer: true
        };

        updateOffer({ lineItems: [...lineItems, itemToAdd] });
        setNewItem({ ...newItem, description: "", unitCost: 0, quantity: 1 }); // keeping type/markup persistence for UX
    };

    const removeItem = (id: string) => {
        updateOffer({ lineItems: lineItems.filter(i => i.id !== id) });
    };

    const totalCost = lineItems.reduce((sum, i) => sum + (i.unitCost * i.quantity), 0);
    const totalProfit = (offer.totalPrice || 0) - totalCost;
    const marginPercent = (offer.totalPrice || 0) > 0 ? (totalProfit / (offer.totalPrice || 0)) * 100 : 0;

    return (
        <div style={{ display: "grid", gap: "2rem" }}>
            <div className="flex-between">
                <h2>Pris og Kalkyle</h2>
                <div style={{ textAlign: "right", fontSize: "0.9rem" }}>
                    <div style={{ color: "var(--muted-foreground)" }}>Intern Kost: {totalCost.toLocaleString()} kr</div>
                    <div style={{ color: "#10b981", fontWeight: "bold" }}>Dekningsbidrag: {totalProfit.toLocaleString()} kr ({marginPercent.toFixed(1)}%)</div>
                </div>
            </div>

            {/* Model Selection */}
            <div>
                <label className="label">Prismodell</label>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {(["Fastpris", "Time + materialer", "Fastpris med forbehold"] as const).map(model => (
                        <button
                            key={model}
                            onClick={() => updateOffer({ pricingModel: model })}
                            className={`btn ${offer.pricingModel === model ? "btn-primary" : "btn-outline"}`}
                        >
                            {model}
                        </button>
                    ))}
                </div>
            </div>

            {/* Line Item Editor */}
            <div style={{ border: "1px solid var(--border)", borderRadius: "8px", overflow: "hidden" }}>
                <div style={{ padding: "1rem", backgroundColor: "var(--secondary)", fontWeight: "600", display: "grid", gridTemplateColumns: "1.5fr 0.5fr 0.5fr 1fr 1fr 1fr 0.5fr", gap: "0.5rem", fontSize: "0.8rem" }}>
                    <div>Beskrivelse</div>
                    <div>Type</div>
                    <div>Antall</div>
                    <div>Kost (stk)</div>
                    <div>Påslag %</div>
                    <div>Utpris (stk)</div>
                    <div></div>
                </div>

                <div style={{ padding: "0.5rem", borderTop: "1px solid var(--border)", backgroundColor: "#fff" }}>
                    {lineItems.length === 0 && <p style={{ padding: "1rem", textAlign: "center", fontStyle: "italic", color: "var(--muted-foreground)" }}>Ingen linjer lagt til enda.</p>}

                    {lineItems.map(item => (
                        <div key={item.id} style={{ display: "grid", gridTemplateColumns: "1.5fr 0.5fr 0.5fr 1fr 1fr 1fr 0.5fr", gap: "0.5rem", alignItems: "center", padding: "0.5rem 0", borderBottom: "1px solid var(--border)", fontSize: "0.9rem" }}>
                            <div style={{ fontWeight: "500" }}>{item.description}</div>
                            <div style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>{item.type}</div>
                            <div>{item.quantity} {item.unit}</div>
                            <div style={{ color: "var(--muted-foreground)" }}>{item.unitCost},-</div>
                            <div style={{ color: "#10b981" }}>{item.markup}%</div>
                            <div style={{ fontWeight: "bold" }}>{item.unitPrice},-</div>
                            <button onClick={() => removeItem(item.id)} style={{ color: "var(--destructive)", background: "none", border: "none", cursor: "pointer" }}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}

                    {/* Add New Row */}
                    <div style={{ display: "grid", gridTemplateColumns: "1.5fr 0.5fr 0.5fr 1fr 1fr 1fr 0.5fr", gap: "0.5rem", paddingTop: "0.5rem", marginTop: "0.5rem", borderTop: "2px solid var(--border)" }}>
                        <input
                            placeholder="Ny vare/tjeneste..."
                            className="input"
                            style={{ padding: "0.3rem" }}
                            value={newItem.description}
                            onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                        />
                        <select
                            className="input"
                            style={{ padding: "0.3rem" }}
                            value={newItem.type}
                            onChange={e => setNewItem({ ...newItem, type: e.target.value as any })}
                        >
                            <option value="material">Materiell</option>
                            <option value="labor">Arbeid</option>
                            <option value="custom">Annet</option>
                        </select>
                        <div style={{ display: "flex", gap: "2px" }}>
                            <input
                                type="number"
                                className="input"
                                style={{ padding: "0.3rem", width: "50px" }}
                                value={newItem.quantity}
                                onChange={e => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                            />
                            <select
                                className="input"
                                style={{ padding: "0.3rem", width: "50px" }}
                                value={newItem.unit}
                                onChange={e => setNewItem({ ...newItem, unit: e.target.value as any })}
                            >
                                <option value="stk">stk</option>
                                <option value="m">m</option>
                                <option value="m2">m2</option>
                                <option value="timer">t</option>
                                <option value="fastpris">fast</option>
                            </select>
                        </div>
                        <input
                            type="number"
                            placeholder="Kost"
                            className="input"
                            style={{ padding: "0.3rem" }}
                            value={newItem.unitCost || ""}
                            onChange={e => setNewItem({ ...newItem, unitCost: Number(e.target.value) })}
                        />
                        <input
                            type="number"
                            placeholder="%"
                            className="input"
                            style={{ padding: "0.3rem" }}
                            value={newItem.markup}
                            onChange={e => setNewItem({ ...newItem, markup: Number(e.target.value) })}
                        />
                        <div style={{ display: "flex", alignItems: "center", fontWeight: "bold", fontSize: "0.9rem" }}>
                            {Math.round((newItem.unitCost || 0) * (1 + (newItem.markup || 0) / 100))} ,-
                        </div>
                        <button onClick={addItem} className="btn btn-primary" style={{ padding: "0.3rem" }} disabled={!newItem.description}>
                            <Plus size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Total Summary */}
            <div className="card" style={{ backgroundColor: "var(--primary)", color: "white", padding: "1.5rem" }}>
                <div className="flex-between" style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                    <span>Total Tilbudssum (eks. mva)</span>
                    <span>{(offer.totalPrice || 0).toLocaleString()} kr</span>
                </div>
                <div style={{ textAlign: "right", opacity: 0.9, marginTop: "0.5rem" }}>
                    Inkl. mva: {((offer.totalPrice || 0) * 1.25).toLocaleString()} kr
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                    <label className="label">Betalingsplan</label>
                    <select
                        className="input"
                        value={offer.paymentPlan}
                        onChange={e => updateOffer({ paymentPlan: e.target.value })}
                        style={{ width: "100%", padding: "0.75rem" }}
                    >
                        <option value="50/50">50% ved oppstart, 50% ved ferdigstillelse</option>
                        <option value="30/40/30">30% bestilling, 40% oppstart, 30% ferdig</option>
                        <option value="Løpende">Faktureres løpende hver 14. dag</option>
                        <option value="Etterskudd">Hele beløpet ved ferdigstillelse</option>
                    </select>
                </div>
                <div>
                    <label className="label">Gyldighet (dager)</label>
                    <input
                        type="number"
                        className="input"
                        value={offer.validDays}
                        onChange={e => updateOffer({ validDays: Number(e.target.value) })}
                        style={{ width: "100%" }}
                    />
                </div>
            </div>
        </div>
    );
}
