"use client";
import { Offer, OfferCondition } from "@/lib/types";
import { OFFER_CONDITIONS } from "@/lib/offer-constants";
import { useState, useMemo } from "react";
import { Info, Search, AlertTriangle } from "lucide-react";

export default function OfferStepConditions({ offer, updateOffer }: { offer: Partial<Offer>, updateOffer: (d: Partial<Offer>) => void }) {
    const [search, setSearch] = useState("");

    // Toggle logic
    const toggleCondition = (id: string) => {
        const current = offer.selectedConditionIds || [];
        if (current.includes(id)) {
            updateOffer({ selectedConditionIds: current.filter(c => c !== id) });
        } else {
            updateOffer({ selectedConditionIds: [...current, id] });
        }
    };

    // Filter logic
    const filteredConditions = useMemo(() => {
        return OFFER_CONDITIONS.filter(c =>
            c.text.toLowerCase().includes(search.toLowerCase()) ||
            c.title.toLowerCase().includes(search.toLowerCase())
        );
    }, [search]);

    // Group by category
    const groupedConditions = useMemo(() => {
        const groups: Record<string, OfferCondition[]> = {};
        filteredConditions.forEach(c => {
            if (!groups[c.category]) groups[c.category] = [];
            groups[c.category].push(c);
        });
        return groups;
    }, [filteredConditions]);

    // Recommended logic (simple tag match)
    const recommendedIds = useMemo(() => {
        if (!offer.projectType) return [];
        return OFFER_CONDITIONS.filter(c => c.tags?.some(t => t.toLowerCase() === offer.projectType?.toLowerCase())).map(c => c.id);
    }, [offer.projectType]);

    return (
        <div style={{ display: "grid", gap: "1.5rem" }}>
            <div className="flex-between">
                <h2>Velg Forbehold</h2>
                <div style={{ position: "relative" }}>
                    <Search size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
                    <input
                        type="text"
                        placeholder="Søk i maler..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="input"
                        style={{ paddingLeft: "2.5rem" }}
                    />
                </div>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                <span style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>Anbefalt for {offer.projectType}:</span>
                {recommendedIds.length > 0 ? (
                    <button
                        className="btn btn-outline"
                        style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                        onClick={() => {
                            const newIds = new Set([...(offer.selectedConditionIds || []), ...recommendedIds]);
                            updateOffer({ selectedConditionIds: Array.from(newIds) });
                        }}
                    >
                        + Velg alle anbefalte
                    </button>
                ) : <span>Ingen spesifikke anbefalinger</span>}
            </div>

            <div style={{ display: "grid", gap: "1rem", maxHeight: "500px", overflowY: "auto", border: "1px solid var(--border)", borderRadius: "8px", padding: "1rem" }}>
                {Object.entries(groupedConditions).map(([category, conditions]) => (
                    <div key={category}>
                        <h3 style={{ fontSize: "1rem", color: "var(--primary)", marginBottom: "0.5rem", position: "sticky", top: 0, backgroundColor: "white", padding: "0.5rem 0", zIndex: 10 }}>{category}</h3>
                        <div style={{ display: "grid", gap: "0.5rem" }}>
                            {conditions.map(c => {
                                const isSelected = offer.selectedConditionIds?.includes(c.id);
                                const isRecommended = recommendedIds.includes(c.id);
                                return (
                                    <div
                                        key={c.id}
                                        onClick={() => toggleCondition(c.id)}
                                        style={{
                                            padding: "0.75rem",
                                            borderRadius: "6px",
                                            border: `1px solid ${isSelected ? "var(--primary)" : "var(--border)"}`,
                                            backgroundColor: isSelected ? "rgba(var(--primary-rgb), 0.05)" : "transparent",
                                            cursor: "pointer",
                                            transition: "all 0.2s"
                                        }}
                                    >
                                        <div className="flex-between" style={{ marginBottom: "0.25rem" }}>
                                            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                                <input type="checkbox" checked={isSelected} readOnly style={{ accentColor: "var(--primary)" }} />
                                                <span style={{ fontWeight: "600" }}>{c.title}</span>
                                                {isRecommended && <span style={{ fontSize: "0.7rem", backgroundColor: "#dbeafe", color: "#1e40af", padding: "0.1rem 0.4rem", borderRadius: "99px" }}>Anbefalt</span>}
                                                {c.severity === "high" && <AlertTriangle size={14} color="#ef4444" />}
                                            </div>
                                            {c.tooltip && <div title={c.tooltip}><Info size={14} color="var(--muted-foreground)" /></div>}
                                        </div>
                                        <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)", margin: 0, paddingLeft: "1.8rem" }}>
                                            {c.text}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
