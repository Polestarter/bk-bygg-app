"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, FileText, Upload, Folder, Shield, Download, Eye, QrCode, X } from "lucide-react";
import { getProjects, getProjectDocuments, addProjectDocument } from "@/lib/data"; // Need to implement these
import { Project, ProjectDocument } from "@/lib/types";

// Missing imports
import { Book, FileCheck } from "lucide-react";
import UploadDocumentModal from "./UploadDocumentModal";
import { jsPDF } from "jspdf";

export default function ProjectHMSPage() {
    return (
        <Suspense fallback={<div className="container">Laster...</div>}>
            <ProjectHMSContent />
        </Suspense>
    );
}

function ProjectHMSContent() {
    const searchParams = useSearchParams();
    const projectId = searchParams.get("projectId");
    const [project, setProject] = useState<Project | undefined>(undefined);
    const [documents, setDocuments] = useState<ProjectDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [showUpload, setShowUpload] = useState(false);
    const [qrToken, setQrToken] = useState<string | null>(null);
    const [showQr, setShowQr] = useState(false);

    // Categories
    const categories = [
        { id: "SHA", label: "SHA-plan", icon: Shield, color: "#ef4444" },
        { id: "SJA", label: "SJA", icon: FileText, color: "#f97316" },
        { id: "Stoffkartotek", label: "Stoffkartotek", icon: Folder, color: "#3b82f6" },
        { id: "Brukermanualer", label: "Brukermanualer", icon: Book, color: "#10b981" },
        { id: "Samsvarserklæringer", label: "Samsvarserklæringer", icon: FileCheck, color: "#8b5cf6" },
    ];

    useEffect(() => {
        if (projectId) {
            Promise.all([
                getProjects().then(p => p.find(x => x.id === projectId)),
                import("@/lib/db").then(mod => mod.getProjectDocuments(projectId))
            ]).then(([foundProject, docs]) => {
                setProject(foundProject);
                setDocuments(docs);
                setLoading(false);
            });
        }
    }, [projectId]);

    const handleShowQr = async () => {
        if (!project) return;
        try {
            // Lazy load createShareToken
            const { createShareToken } = await import("@/lib/data");
            const token = await createShareToken(project.id);
            setQrToken(token);
            setShowQr(true);
        } catch (error) {
            console.error(error);
            alert("Kunne ikke generere QR-kode");
        }
    };

    const generatePDF = () => {
        if (!project) return;
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.text("HMS Dokumentasjonsoversikt", 20, 20);

        doc.setFontSize(16);
        doc.text(project.name, 20, 30);
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(project.address, 20, 36);
        doc.text(`Generert: ${new Date().toLocaleDateString()}`, 20, 42);
        doc.setTextColor(0);

        let y = 60;

        categories.forEach(cat => {
            const catDocs = documents.filter(d => d.category === cat.id);

            // Category Header
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text(cat.label, 20, y);
            y += 8;

            if (catDocs.length === 0) {
                doc.setFont("helvetica", "italic");
                doc.setFontSize(10);
                doc.text("- Ingen dokumenter -", 25, y);
                y += 10;
            } else {
                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                catDocs.forEach(d => {
                    doc.text(`• ${d.title} (${new Date(d.uploadedAt).toLocaleDateString()})`, 25, y);
                    y += 6;
                });
                y += 4;
            }

            // Page break check
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
        });

        doc.save(`HMS-Oversikt-${project.name}.pdf`);
    };

    if (loading) return <div className="container" style={{ paddingTop: "2rem" }}>Laster HMS-dokumenter...</div>;
    if (!project) return <div className="container" style={{ paddingTop: "2rem" }}>Prosjekt ikke funnet</div>;

    const filteredDocs = activeCategory ? documents.filter(d => d.category === activeCategory) : [];

    return (
        <main className="container" style={{ paddingTop: "2rem", paddingBottom: "6rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
                <div>
                    <Link href={`/projects/details?id=${project.id}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--muted-foreground)", marginBottom: "0.5rem" }}>
                        <ArrowLeft size={16} /> Tilbake til prosjekt
                    </Link>
                    <h1 style={{ margin: 0, fontSize: "1.75rem" }}>HMS-dokumentasjon</h1>
                    <p style={{ margin: 0, color: "var(--muted-foreground)" }}>{project.name} - {project.address}</p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                        onClick={handleShowQr}
                        className="btn btn-outline"
                        title="Vis QR-kode"
                    >
                        <QrCode size={20} />
                    </button>
                    <button
                        onClick={generatePDF}
                        className="btn btn-outline"
                        title="Last ned oversikt"
                    >
                        <Download size={20} />
                    </button>
                </div>
            </div>

            {/* Category Grid */}
            {!activeCategory ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "1rem" }}>
                    {categories.map(cat => {
                        const Icon = cat.icon;
                        const count = documents.filter(d => d.category === cat.id).length;
                        return (
                            <div
                                key={cat.id}
                                className="card hover-effect"
                                onClick={() => setActiveCategory(cat.id)}
                                style={{
                                    cursor: "pointer",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    textAlign: "center",
                                    gap: "0.5rem",
                                    padding: "1.5rem"
                                }}
                            >
                                <div style={{
                                    padding: "1rem",
                                    backgroundColor: `${cat.color}20`,
                                    borderRadius: "50%",
                                    color: cat.color
                                }}>
                                    <Icon size={28} />
                                </div>
                                <h3 style={{ margin: 0, fontSize: "1rem" }}>{cat.label}</h3>
                                <span style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>{count} dokumenter</span>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div>
                    <button
                        onClick={() => setActiveCategory(null)}
                        style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
                    >
                        <ArrowLeft size={16} /> Tilbake til oversikt
                    </button>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                        <h2 style={{ margin: 0 }}>{categories.find(c => c.id === activeCategory)?.label}</h2>
                        <button
                            className="btn btn-primary"
                            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                            onClick={() => setShowUpload(true)}
                        >
                            <Upload size={16} /> Last opp
                        </button>
                    </div>

                    {filteredDocs.length === 0 ? (
                        <div className="card" style={{ textAlign: "center", padding: "3rem", color: "var(--muted-foreground)" }}>
                            <p>Ingen dokumenter i denne kategorien enda.</p>
                        </div>
                    ) : (
                        <div style={{ display: "grid", gap: "1rem" }}>
                            {filteredDocs.map(doc => (
                                <ProjectDocumentItem key={doc.id} doc={doc} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {showUpload && project && (
                <UploadDocumentModal
                    projectId={project.id}
                    category={activeCategory || undefined}
                    onClose={() => setShowUpload(false)}
                    onUploadComplete={(newDoc) => {
                        setDocuments([newDoc, ...documents]);
                    }}
                />
            )}

            {showQr && qrToken && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
                }}>
                    <div className="card" style={{ padding: "2rem", textAlign: "center", position: "relative", maxWidth: "400px" }}>
                        <button
                            onClick={() => setShowQr(false)}
                            style={{ position: "absolute", top: "1rem", right: "1rem", background: "none", border: "none", cursor: "pointer" }}
                        >
                            <X size={20} />
                        </button>
                        <h2 style={{ marginBottom: "1rem" }}>Scan QR for HMS</h2>
                        <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${window.location.origin}${window.location.pathname.includes("/bk-bygg-app") ? "/bk-bygg-app" : ""}/share/hms?token=${qrToken}`)}`}
                            alt="QR Code"
                            style={{ marginBottom: "1rem" }}
                        />
                        <p style={{ fontSize: "0.9rem", color: "var(--muted-foreground)", marginBottom: "1rem" }}>
                            Scan med kamera for å se HMS-dokumentasjon (Read-only).
                        </p>
                        <div style={{ background: "#f5f5f5", padding: "0.5rem", borderRadius: "4px", fontSize: "0.8rem", wordBreak: "break-all" }}>
                            {window.location.origin}{window.location.pathname.includes("/bk-bygg-app") ? "/bk-bygg-app" : ""}/share/hms?token={qrToken}
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

function ProjectDocumentItem({ doc }: { doc: ProjectDocument }) {
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const { getProjectDocumentContent } = await import("@/lib/db");
            const content = await getProjectDocumentContent(doc.id);
            if (!content) {
                alert("Kunne ikke laste dokumentinnhold.");
                return;
            }
            // Trigger download
            const a = document.createElement("a");
            a.href = content;
            a.download = doc.title; // Best guess name, real type is unknown
            a.click();
        } catch (error) {
            console.error(error);
            alert("Feil ved nedlasting.");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <FileText size={24} color="var(--primary)" />
                <div>
                    <h4 style={{ margin: 0 }}>{doc.title}</h4>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                        Lastet opp {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                </div>
            </div>
            <button
                onClick={handleDownload}
                className="btn-icon"
                disabled={downloading}
                title="Last ned / Vis"
            >
                {downloading ? <span className="loading loading-spinner loading-xs">...</span> : <Eye size={20} />}
            </button>
        </div>
    );
}
