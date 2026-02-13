"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Book, Download, FileCheck, FileText, Folder, Shield } from "lucide-react";
import { getProjectByShareToken, getProjectDocuments } from "@/lib/data";
import { Project, ProjectDocument } from "@/lib/types";

export default function SharedHMSPageWrapper() {
    return (
        <Suspense fallback={<div className="container" style={{ paddingTop: "2rem", textAlign: "center" }}>Laster...</div>}>
            <SharedHMSPage />
        </Suspense>
    );
}

function SharedHMSPage() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [project, setProject] = useState<Project | null>(null);
    const [documents, setDocuments] = useState<ProjectDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    useEffect(() => {
        if (!token) {
            setError("Mangler token.");
            setLoading(false);
            return;
        }
        loadData(token);
    }, [token]);

    const loadData = async (shareToken: string) => {
        try {
            const loadedProject = await getProjectByShareToken(shareToken);
            if (!loadedProject) {
                setError("Ugyldig eller utl\u00f8pt lenke.");
                return;
            }
            setProject(loadedProject);
            const docs = await getProjectDocuments(loadedProject.id);
            setDocuments(docs);
        } catch (err) {
            console.error(err);
            setError("Kunne ikke laste HMS-data.");
        } finally {
            setLoading(false);
        }
    };

    const categories = [
        { id: "SHA", label: "SHA-plan", icon: Shield, color: "#ef4444" },
        { id: "SJA", label: "SJA", icon: FileText, color: "#f97316" },
        { id: "Stoffkartotek", label: "Stoffkartotek", icon: Folder, color: "#3b82f6" },
        { id: "Brukermanualer", label: "Brukermanualer", icon: Book, color: "#10b981" },
        { id: "Samsvarserkl\u00e6ringer", label: "Samsvarserkl\u00e6ringer", icon: FileCheck, color: "#8b5cf6" },
    ];

    if (loading) {
        return <div className="container" style={{ paddingTop: "2rem", textAlign: "center" }}>Laster HMS-oversikt...</div>;
    }

    if (error) {
        return <div className="container" style={{ paddingTop: "2rem", textAlign: "center", color: "var(--destructive)" }}>{error}</div>;
    }

    if (!project) {
        return null;
    }

    const filteredDocs = activeCategory ? documents.filter((doc) => doc.category === activeCategory) : [];

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "var(--secondary)", paddingBottom: "4rem" }}>
            <header
                style={{
                    backgroundColor: "var(--card)",
                    borderBottom: "1px solid var(--border)",
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                }}
            >
                <div className="container flex-between" style={{ paddingTop: "1rem", paddingBottom: "1rem" }}>
                    <div>
                        <h1 style={{ fontSize: "1.25rem", marginBottom: "0.25rem" }}>HMS Dokumentasjon</h1>
                        <p style={{ fontSize: "0.9rem", color: "var(--muted-foreground)" }}>
                            {project.name} - {project.address}
                        </p>
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>Read-only View</div>
                </div>
            </header>

            <main className="container" style={{ paddingTop: "1.5rem" }}>
                {!activeCategory ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
                        {categories.map((category) => {
                            const Icon = category.icon;
                            const count = documents.filter((doc) => doc.category === category.id).length;
                            return (
                                <button
                                    key={category.id}
                                    onClick={() => setActiveCategory(category.id)}
                                    className="card card-interactive"
                                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", textAlign: "center" }}
                                >
                                    <div style={{ padding: "0.75rem", borderRadius: "999px", backgroundColor: `${category.color}20`, color: category.color }}>
                                        <Icon size={32} />
                                    </div>
                                    <span style={{ fontWeight: 600 }}>{category.label}</span>
                                    <span style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>{count} filer</span>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div>
                        <button
                            onClick={() => setActiveCategory(null)}
                            className="btn btn-ghost"
                            style={{ marginBottom: "1rem", color: "var(--muted-foreground)" }}
                        >
                            {"\u2190"} Tilbake til oversikt
                        </button>

                        <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            {categories.find((category) => category.id === activeCategory)?.icon && (() => {
                                const Icon = categories.find((category) => category.id === activeCategory)!.icon;
                                return <Icon size={20} />;
                            })()}
                            {categories.find((category) => category.id === activeCategory)?.label}
                        </h2>

                        {filteredDocs.length === 0 ? (
                            <div className="card" style={{ borderStyle: "dashed", textAlign: "center", color: "var(--muted-foreground)" }}>
                                Ingen dokumenter i denne kategorien.
                            </div>
                        ) : (
                            <div style={{ display: "grid", gap: "0.75rem" }}>
                                {filteredDocs.map((doc) => (
                                    <div key={doc.id} className="card flex-between" style={{ padding: "1rem", gap: "1rem" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", overflow: "hidden" }}>
                                            <div
                                                style={{
                                                    width: "32px",
                                                    height: "32px",
                                                    borderRadius: "8px",
                                                    backgroundColor: "var(--secondary)",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    color: "var(--muted-foreground)",
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <FileText size={16} />
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <h3
                                                    style={{
                                                        fontWeight: 600,
                                                        fontSize: "0.95rem",
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                    }}
                                                >
                                                    {doc.title}
                                                </h3>
                                                <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>
                                                    {new Date(doc.uploadedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <a
                                            href={doc.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-outline"
                                            style={{ padding: "0.45rem 0.55rem", color: "#2563eb" }}
                                        >
                                            <Download size={20} />
                                        </a>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
