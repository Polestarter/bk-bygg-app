"use client";

import { useState } from "react";
import { Checklist, ItemStatus, ChecklistTemplate } from "@/lib/types";
import { addChecklistTemplate } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, Save, CheckCircle, XCircle, MinusCircle, Camera, MessageSquare, ChevronDown, ChevronUp, Copy } from "lucide-react";

export default function ChecklistDetailClient({ initialChecklist }: { initialChecklist: Checklist }) {
    const [checklist, setChecklist] = useState<Checklist>(initialChecklist);
    const [expandedItem, setExpandedItem] = useState<string | null>(null);
    const [showSaveTemplate, setShowSaveTemplate] = useState(false);

    const handleSaveTemplate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const templateName = formData.get("templateName") as string;

        if (!templateName) return;

        const newTemplate: ChecklistTemplate = {
            id: Math.random().toString(36).substring(2, 9),
            name: templateName,
            items: checklist.items.map(item => ({ text: item.text }))
        };

        await addChecklistTemplate(newTemplate);
        setShowSaveTemplate(false);
        alert("Mal lagret!");
    };

    const updateItemStatus = (itemId: string, status: ItemStatus) => {
        setChecklist(prev => {
            const newItems = prev.items.map(item =>
                item.id === itemId ? { ...item, status } : item
            );

            // Auto-calculate enhanced status
            // If any unsafe -> Pågår (Attention needed)
            const hasUnsafe = newItems.some(i => i.status === "Unsafe");
            const allChecked = newItems.every(i => i.status !== null);

            let newStatus = prev.status;
            if (allChecked && !hasUnsafe) newStatus = "Fullført";
            else newStatus = "Pågår";

            return { ...prev, items: newItems, status: newStatus };
        });
    };

    const updateItemComment = (itemId: string, comment: string) => {
        setChecklist(prev => {
            return {
                ...prev,
                items: prev.items.map(i => i.id === itemId ? { ...i, comment } : i)
            };
        });
    };

    const handleImageUpload = (itemId: string, file: File | null) => {
        if (!file) return;
        // In real app: Upload to AWS S3 / Supabase Storage
        // Here: Create local object URL for preview
        const url = URL.createObjectURL(file);
        setChecklist(prev => {
            return {
                ...prev,
                items: prev.items.map(i => i.id === itemId ? { ...i, imageUrl: url } : i)
            };
        });
    };

    const handleSave = () => {
        console.log("Saving V2 checklist state:", checklist);
        alert("Sjekkliste lagret med nye data (Mock)!");
    };

    const completedCount = checklist.items.filter(i => i.status === "Safe" || i.status === "NA").length;
    const totalCount = checklist.items.length;
    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const handleDownloadPDF = async () => {
        if (typeof window === "undefined") return;
        const jsPDF = (await import("jspdf")).default;
        const html2canvas = (await import("html2canvas")).default;

        const element = document.getElementById("checklist-content");
        if (!element) return;

        try {
            const canvas = await html2canvas(element, { scale: 2 } as any);
            const imgData = canvas.toDataURL("image/png");

            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4"
            });

            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`sjekkliste-${checklist.name.replace(/\s+/g, "-").toLowerCase()}.pdf`);

            // In a real app we would also upload this blob to the server here
        } catch (err) {
            console.error("Failed to generate PDF", err);
            alert("Kunne ikke generere PDF.");
        }
    };

    return (
        <main className="container" style={{ paddingTop: "2rem", paddingBottom: "6rem" }}>
            <Link href="/checklists" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--muted-foreground)", marginBottom: "1rem" }}>
                <ArrowLeft size={16} /> Tilbake
            </Link>

            <div id="checklist-content" style={{ backgroundColor: "#fff", padding: "1rem", borderRadius: "8px" }}>
                <div className="flex-between" style={{ marginBottom: "2rem" }}>
                    <div>
                        <h1 style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>{checklist.name}</h1>
                        <div className="flex-center" style={{ gap: "0.75rem", justifyContent: "flex-start" }}>
                            <div style={{ height: "6px", width: "100px", backgroundColor: "var(--secondary)", borderRadius: "99px", overflow: "hidden" }}>
                                <div style={{ width: `${percentage}%`, height: "100%", backgroundColor: checklist.status === "Fullført" ? "#10b981" : "var(--primary)", transition: "width 0.3s" }}></div>
                            </div>
                            <span style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>{percentage}% Fullført</span>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button onClick={() => setShowSaveTemplate(true)} className="btn btn-secondary" style={{ gap: "0.5rem" }}>
                            <Copy size={18} /> <span className="hide-on-mobile">Lagre som Mal</span>
                        </button>
                        <button onClick={handleDownloadPDF} className="btn btn-outline" style={{ gap: "0.5rem" }}>
                            <span className="hide-on-mobile">Last ned PDF</span>
                        </button>
                        <button onClick={handleSave} className="btn btn-primary" style={{ gap: "0.5rem" }}>
                            <Save size={18} /> <span className="hide-on-mobile">Lagre</span>
                        </button>
                    </div>
                </div>

                {showSaveTemplate && (
                    <div style={{
                        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50
                    }}>
                        <form onSubmit={handleSaveTemplate} className="card" style={{ width: "90%", maxWidth: "400px", padding: "2rem", display: "grid", gap: "1.5rem" }}>
                            <div className="flex-between">
                                <h3 style={{ margin: 0 }}>Lagre som Mal</h3>
                                <button type="button" onClick={() => setShowSaveTemplate(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                                    <XCircle size={24} />
                                </button>
                            </div>
                            <input type="hidden" name="sourceChecklistId" value={checklist.id} />
                            <div>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Navn på ny mal</label>
                                <input name="templateName" type="text" placeholder="F.eks. Min Standard Sjekkliste" required className="input" style={{ width: "100%", padding: "0.75rem" }} />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>Lagre Mal</button>
                        </form>
                    </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {checklist.items.map((item) => {
                        const isExpanded = expandedItem === item.id;
                        return (
                            <div key={item.id} className="card" style={{ padding: "1rem", borderColor: item.status === "Unsafe" ? "var(--destructive)" : "var(--border)" }}>
                                <div className="flex-between" style={{ marginBottom: "1rem" }}>
                                    <span style={{ fontSize: "1.1rem", fontWeight: "500", flex: 1 }}>{item.text}</span>
                                    <div style={{ display: "flex", gap: "0.5rem" }}>
                                        {item.imageUrl && <Camera size={18} color="var(--primary)" />}
                                        {item.comment && <MessageSquare size={18} color="var(--primary)" />}
                                    </div>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem", marginBottom: "1rem" }}>
                                    <button
                                        onClick={() => updateItemStatus(item.id, "Safe")}
                                        style={{
                                            padding: "0.75rem",
                                            borderRadius: "var(--radius)",
                                            border: "1px solid",
                                            borderColor: item.status === "Safe" ? "#10b981" : "var(--border)",
                                            backgroundColor: item.status === "Safe" ? "rgba(16, 185, 129, 0.1)" : "transparent",
                                            color: item.status === "Safe" ? "#10b981" : "var(--muted-foreground)",
                                            display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem",
                                            cursor: "pointer"
                                        }}>
                                        <CheckCircle size={20} />
                                        <span style={{ fontSize: "0.75rem" }}>Ja</span>
                                    </button>
                                    <button
                                        onClick={() => updateItemStatus(item.id, "Unsafe")}
                                        style={{
                                            padding: "0.75rem",
                                            borderRadius: "var(--radius)",
                                            border: "1px solid",
                                            borderColor: item.status === "Unsafe" ? "var(--destructive)" : "var(--border)",
                                            backgroundColor: item.status === "Unsafe" ? "rgba(239, 68, 68, 0.1)" : "transparent",
                                            color: item.status === "Unsafe" ? "var(--destructive)" : "var(--muted-foreground)",
                                            display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem",
                                            cursor: "pointer"
                                        }}>
                                        <XCircle size={20} />
                                        <span style={{ fontSize: "0.75rem" }}>Nei</span>
                                    </button>
                                    <button
                                        onClick={() => updateItemStatus(item.id, "NA")}
                                        style={{
                                            padding: "0.75rem",
                                            borderRadius: "var(--radius)",
                                            border: "1px solid",
                                            borderColor: item.status === "NA" ? "var(--foreground)" : "var(--border)",
                                            backgroundColor: item.status === "NA" ? "var(--secondary)" : "transparent",
                                            color: item.status === "NA" ? "var(--foreground)" : "var(--muted-foreground)",
                                            display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem",
                                            cursor: "pointer"
                                        }}>
                                        <MinusCircle size={20} />
                                        <span style={{ fontSize: "0.75rem" }}>N/A</span>
                                    </button>
                                </div>

                                <button
                                    onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                                    style={{
                                        width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                                        padding: "0.5rem", background: "transparent", border: "none", color: "var(--muted-foreground)", cursor: "pointer"
                                    }}>
                                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    <span style={{ fontSize: "0.875rem" }}>{isExpanded ? "Skjul detaljer" : "Legg til bilde/kommentar"}</span>
                                </button>

                                {isExpanded && (
                                    <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border)", animation: "fadeIn 0.2s" }}>
                                        <div style={{ marginBottom: "1rem" }}>
                                            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem" }}>Kommentar</label>
                                            <textarea
                                                value={item.comment || ""}
                                                onChange={(e) => updateItemComment(item.id, e.target.value)}
                                                placeholder="Skriv en kommentar..."
                                                style={{
                                                    width: "100%", padding: "0.75rem", borderRadius: "var(--radius)",
                                                    border: "1px solid var(--border)", backgroundColor: "var(--input)", color: "var(--foreground)",
                                                    fontFamily: "inherit", resize: "vertical", minHeight: "80px"
                                                }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem" }}>Bilde</label>
                                            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    capture="environment"
                                                    onChange={(e) => handleImageUpload(item.id, e.target.files?.[0] || null)}
                                                    style={{ fontSize: "0.875rem" }}
                                                />
                                            </div>
                                            {item.imageUrl && (
                                                <div style={{ marginTop: "1rem", position: "relative", width: "100%", height: "200px", borderRadius: "var(--radius)", overflow: "hidden", border: "1px solid var(--border)" }}>
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={item.imageUrl} alt="Opplastet bilde" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </main>
    );
}
