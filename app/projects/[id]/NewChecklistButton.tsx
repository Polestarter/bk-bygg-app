"use client";

import { useState } from "react";
import { ChecklistTemplate } from "@/lib/types";
import { createChecklistAction } from "@/lib/actions";
import { Plus, X } from "lucide-react";

export default function NewChecklistButton({ projectId, templates }: { projectId: string; templates: ChecklistTemplate[] }) {
    const [isOpen, setIsOpen] = useState(false);

    if (!isOpen) {
        return (
            <button onClick={() => setIsOpen(true)} className="btn btn-outline" style={{ fontSize: "0.875rem", gap: "0.5rem" }}>
                <Plus size={16} /> Ny liste
            </button>
        );
    }

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50
        }}>
            <form action={async (formData) => {
                await createChecklistAction(formData);
                setIsOpen(false);
            }} className="card" style={{ width: "90%", maxWidth: "500px", padding: "2rem", display: "grid", gap: "1.5rem" }}>

                <div className="flex-between">
                    <h2>Ny Sjekkliste</h2>
                    <button type="button" onClick={() => setIsOpen(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                        <X size={24} />
                    </button>
                </div>

                <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Navn på liste</label>
                    <input name="name" type="text" placeholder="F.eks. Rørleggerkontroll" required className="input" style={{ width: "100%", padding: "0.75rem" }} />
                </div>

                <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Bruk Mal (Valgfritt)</label>
                    <select name="templateId" className="input" style={{ width: "100%", padding: "0.75rem" }}>
                        <option value="">-- Ingen (Blank liste) --</option>
                        {templates.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Frist (Valgfritt)</label>
                    <input name="dueDate" type="date" className="input" style={{ width: "100%", padding: "0.75rem" }} />
                </div>

                <input type="hidden" name="projectId" value={projectId} />

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
                    <button type="button" onClick={() => setIsOpen(false)} className="btn btn-secondary">Avbryt</button>
                    <button type="submit" className="btn btn-primary">Opprett Liste</button>
                </div>
            </form>
        </div>
    );
}
