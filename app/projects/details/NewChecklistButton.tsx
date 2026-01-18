"use client";

import { useState } from "react";
import { Checklist, ChecklistTemplate } from "@/lib/types";
import { addChecklist } from "@/lib/db";
import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewChecklistButton({ projectId, templates }: { projectId: string; templates: ChecklistTemplate[] }) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    if (!isOpen) {
        return (
            <button onClick={() => setIsOpen(true)} className="btn btn-outline" style={{ fontSize: "0.875rem", gap: "0.5rem" }}>
                <Plus size={16} /> Ny liste
            </button>
        );
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const templateId = formData.get("templateId") as string;
        const dueDate = formData.get("dueDate") as string;

        if (!name) return;

        let items: any[] = [];
        if (templateId) {
            const template = templates.find(t => t.id === templateId);
            if (template) {
                items = template.items.map(i => ({
                    id: Math.random().toString(36).substring(2, 9),
                    text: i.text,
                    status: null
                }));
            }
        }

        const newChecklist: Checklist = {
            id: Math.random().toString(36).substring(2, 9),
            projectId,
            name,
            status: "Ny",
            items,
            dueDate
        };

        await addChecklist(newChecklist);
        setIsOpen(false);
        router.refresh();
    };

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50
        }}>
            <form onSubmit={handleSubmit} className="card" style={{ width: "90%", maxWidth: "500px", padding: "2rem", display: "grid", gap: "1.5rem" }}>

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

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
                    <button type="button" onClick={() => setIsOpen(false)} className="btn btn-secondary">Avbryt</button>
                    <button type="submit" className="btn btn-primary">Opprett Liste</button>
                </div>
            </form>
        </div>
    );
}
