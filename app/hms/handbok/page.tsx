"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Book, Edit, Save, ChevronDown, ChevronRight, FileText } from "lucide-react";
import { getHMSHandbookSections, updateHMSHandbookSection } from "@/lib/data";
import { HMSHandbookSection } from "@/lib/types";

export default function HMSHandbookPage() {
    const [sections, setSections] = useState<HMSHandbookSection[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState("");
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        loadSections();
    }, []);

    const loadSections = async () => {
        try {
            const data = await getHMSHandbookSections();
            setSections(data);
            // Expand first section by default
            if (data.length > 0) {
                setExpandedIds(new Set([data[0].id]));
            }
        } catch (error) {
            console.error("Failed to load handbook", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (id: string) => {
        const newSet = new Set(expandedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setExpandedIds(newSet);
    };

    const startEdit = (section: HMSHandbookSection) => {
        setEditingId(section.id);
        setEditContent(section.content || "");
    };

    const saveEdit = async (id: string) => {
        try {
            await updateHMSHandbookSection(id, editContent);
            setSections(sections.map(s => s.id === id ? { ...s, content: editContent, lastUpdatedAt: new Date().toISOString() } : s));
            setEditingId(null);
        } catch (error) {
            alert("Kunne ikke lagre endringer.");
        }
    };

    if (loading) return <div className="container" style={{ paddingTop: "2rem" }}>Laster HMS Håndbok...</div>;

    return (
        <main className="container" style={{ paddingTop: "2rem", paddingBottom: "6rem", maxWidth: "800px" }}>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--muted-foreground)", marginBottom: "1rem" }}>
                <ArrowLeft size={16} /> Tilbake til oversikt
            </Link>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
                <div style={{ padding: "1rem", backgroundColor: "rgba(16, 185, 129, 0.1)", borderRadius: "12px", color: "#10b981" }}>
                    <Book size={32} />
                </div>
                <div>
                    <h1 style={{ margin: 0, fontSize: "1.75rem" }}>HMS Håndbok</h1>
                    <p style={{ margin: 0, color: "var(--muted-foreground)" }}>Bedriftens interne retningslinjer og sikkerhetsrutiner.</p>
                </div>
            </div>

            <div style={{ display: "grid", gap: "1rem" }}>
                {sections.map(section => (
                    <div key={section.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
                        <div
                            onClick={() => toggleExpand(section.id)}
                            style={{
                                padding: "1rem",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                cursor: "pointer",
                                backgroundColor: "var(--secondary)"
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                {expandedIds.has(section.id) ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                <h3 style={{ margin: 0, fontSize: "1.1rem" }}>{section.title}</h3>
                            </div>
                            {editingId !== section.id && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); startEdit(section); }}
                                    className="btn-icon"
                                    title="Rediger"
                                >
                                    <Edit size={16} />
                                </button>
                            )}
                        </div>

                        {expandedIds.has(section.id) && (
                            <div style={{ padding: "1.5rem" }}>
                                {editingId === section.id ? (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                        <textarea
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            style={{
                                                width: "100%",
                                                minHeight: "200px",
                                                padding: "1rem",
                                                borderRadius: "8px",
                                                border: "1px solid var(--border)",
                                                fontFamily: "inherit"
                                            }}
                                        />
                                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="btn"
                                            >
                                                Avbryt
                                            </button>
                                            <button
                                                onClick={() => saveEdit(section.id)}
                                                className="btn btn-primary"
                                                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                                            >
                                                <Save size={16} /> Lagre
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{section.content || "Ingen innhold enda."}</div>
                                        <div style={{ marginTop: "1rem", fontSize: "0.8rem", color: "var(--muted-foreground)", borderTop: "1px solid var(--border)", paddingTop: "0.5rem" }}>
                                            Sist oppdatert: {new Date(section.lastUpdatedAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {sections.length === 0 && (
                <div style={{ textAlign: "center", padding: "3rem", color: "var(--muted-foreground)" }}>
                    <p>Ingen seksjoner funnet i håndboken.</p>
                </div>
            )}
        </main>
    );
}
