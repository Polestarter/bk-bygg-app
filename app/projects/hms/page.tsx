"use client";

import { Suspense, useEffect, useState, type ComponentType } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Book, Download, Eye, FileCheck, FileText, Folder, Loader2, QrCode, Shield, Trash2, Upload, X } from "lucide-react";
import { getProjects } from "@/lib/data";
import { Project, ProjectDocument } from "@/lib/types";
import UploadDocumentModal from "./UploadDocumentModal";
import { jsPDF } from "jspdf";

type Category = {
    id: ProjectDocument["category"];
    label: string;
    icon: ComponentType<{ size?: number }>;
    color: string;
};

const categories: Category[] = [
    { id: "SHA", label: "SHA-plan", icon: Shield, color: "#ef4444" },
    { id: "SJA", label: "SJA", icon: FileText, color: "#f97316" },
    { id: "Stoffkartotek", label: "Stoffkartotek", icon: Folder, color: "#3b82f6" },
    { id: "Brukermanualer", label: "Brukermanualer", icon: Book, color: "#10b981" },
    { id: "Samsvarserkl\u00e6ringer", label: "Samsvarserkl\u00e6ringer", icon: FileCheck, color: "#8b5cf6" },
];

export default function ProjectHMSPage() {
    return (
        <Suspense fallback={<div className="container" style={{ paddingTop: "2rem" }}>Laster...</div>}>
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
    const [activeCategory, setActiveCategory] = useState<ProjectDocument["category"] | null>(null);
    const [showUpload, setShowUpload] = useState(false);
    const [qrToken, setQrToken] = useState<string | null>(null);
    const [showQr, setShowQr] = useState(false);

    useEffect(() => {
        if (!projectId) {
            setLoading(false);
            return;
        }

        Promise.all([
            getProjects().then((projects) => projects.find((projectItem) => projectItem.id === projectId)),
            import("@/lib/db").then((mod) => mod.getProjectDocuments(projectId)),
        ]).then(([foundProject, docs]) => {
            setProject(foundProject);
            setDocuments(docs);
            setLoading(false);
        });
    }, [projectId]);

    const handleShowQr = async () => {
        if (!project) return;
        try {
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
        categories.forEach((category) => {
            const categoryDocs = documents.filter((projectDoc) => projectDoc.category === category.id);
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text(category.label, 20, y);
            y += 8;

            if (categoryDocs.length === 0) {
                doc.setFont("helvetica", "italic");
                doc.setFontSize(10);
                doc.text("- Ingen dokumenter -", 25, y);
                y += 10;
            } else {
                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                categoryDocs.forEach((projectDoc) => {
                    doc.text(`- ${projectDoc.title} (${new Date(projectDoc.uploadedAt).toLocaleDateString()})`, 25, y);
                    y += 6;
                });
                y += 4;
            }

            if (y > 270) {
                doc.addPage();
                y = 20;
            }
        });

        doc.save(`HMS-Oversikt-${project.name}.pdf`);
    };

    const handleDownloadAllZip = async () => {
        if (!project || documents.length === 0) return;
        const shouldDownload = window.confirm(`Vil du laste ned ${documents.length} dokumenter som ZIP?`);
        if (!shouldDownload) return;

        try {
            const JSZip = (await import("jszip")).default;
            const { saveAs } = await import("file-saver");
            const { getProjectDocumentContent } = await import("@/lib/db");
            const zip = new JSZip();
            const folder = zip.folder("HMS-Dokumenter");

            let fileCount = 0;
            for (const projectDoc of documents) {
                const content = await getProjectDocumentContent(projectDoc.id);
                if (!content) continue;
                const base64Data = content.split(",")[1];
                if (!base64Data) continue;

                let extension = "pdf";
                if (content.includes("image/jpeg")) extension = "jpg";
                if (content.includes("image/png")) extension = "png";
                folder?.file(`${projectDoc.title}.${extension}`, base64Data, { base64: true });
                fileCount++;
            }

            if (fileCount === 0) {
                alert(`Fant ingen filer \u00e5 laste ned.`);
                return;
            }

            const blob = await zip.generateAsync({ type: "blob" });
            saveAs(blob, `HMS-Dokumenter-${project.name}.zip`);
        } catch (error) {
            console.error("ZIP export failed", error);
            alert("Kunne ikke generere ZIP-fil.");
        }
    };

    if (loading) return <div className="container" style={{ paddingTop: "2rem" }}>Laster HMS-dokumenter...</div>;
    if (!project) return <div className="container" style={{ paddingTop: "2rem" }}>Prosjekt ikke funnet</div>;

    const filteredDocs = activeCategory ? documents.filter((projectDoc) => projectDoc.category === activeCategory) : [];
    const shareBase = `${window.location.origin}${window.location.pathname.includes("/bk-bygg-app") ? "/bk-bygg-app" : ""}/share/hms`;
    const shareUrl = qrToken ? `${shareBase}?token=${qrToken}` : "";

    return (
        <main className="container page-shell">
            <div className="flex-between" style={{ marginBottom: "2rem", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                    <Link href={`/projects/details?id=${project.id}`} className="back-link" style={{ marginBottom: "0.5rem" }}>
                        <ArrowLeft size={16} /> Tilbake til prosjekt
                    </Link>
                    <h1 style={{ margin: 0, fontSize: "1.75rem" }}>HMS-dokumentasjon</h1>
                    <p style={{ margin: 0, color: "var(--muted-foreground)" }}>{project.name} - {project.address}</p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <button onClick={handleShowQr} className="btn btn-outline" title="Vis QR-kode">
                        <QrCode size={20} />
                    </button>
                    <button onClick={generatePDF} className="btn btn-outline" title="Last ned oversikt (PDF)">
                        <FileText size={20} />
                    </button>
                    <button onClick={handleDownloadAllZip} className="btn btn-outline" title="Last ned alle (ZIP)" disabled={documents.length === 0}>
                        <Download size={20} />
                    </button>
                </div>
            </div>

            {!activeCategory ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: "1rem" }}>
                    {categories.map((category) => {
                        const Icon = category.icon;
                        const count = documents.filter((projectDoc) => projectDoc.category === category.id).length;
                        return (
                            <button
                                key={category.id}
                                className="card hover-effect"
                                onClick={() => setActiveCategory(category.id)}
                                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.6rem", textAlign: "center", cursor: "pointer" }}
                            >
                                <div style={{ padding: "0.9rem", borderRadius: "999px", backgroundColor: `${category.color}20`, color: category.color }}>
                                    <Icon size={28} />
                                </div>
                                <h3 style={{ margin: 0, fontSize: "1rem" }}>{category.label}</h3>
                                <span style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>{count} dokumenter</span>
                            </button>
                        );
                    })}
                </div>
            ) : (
                <div>
                    <button onClick={() => setActiveCategory(null)} className="btn btn-ghost" style={{ marginBottom: "1rem", color: "var(--muted-foreground)" }}>
                        <ArrowLeft size={16} /> Tilbake til oversikt
                    </button>

                    <div className="flex-between" style={{ marginBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
                        <h2 style={{ margin: 0 }}>{categories.find((category) => category.id === activeCategory)?.label}</h2>
                        <button className="btn btn-primary" style={{ gap: "0.5rem" }} onClick={() => setShowUpload(true)}>
                            <Upload size={16} /> Last opp
                        </button>
                    </div>

                    {filteredDocs.length === 0 ? (
                        <div className="card" style={{ textAlign: "center", color: "var(--muted-foreground)" }}>
                            <p>Ingen dokumenter i denne kategorien enda.</p>
                        </div>
                    ) : (
                        <div style={{ display: "grid", gap: "1rem" }}>
                            {filteredDocs.map((projectDoc) => (
                                <ProjectDocumentItem
                                    key={projectDoc.id}
                                    doc={projectDoc}
                                    onDelete={(deletedId) => {
                                        setDocuments((prev) => prev.filter((item) => item.id !== deletedId));
                                    }}
                                />
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
                        setDocuments((prev) => [newDoc, ...prev]);
                    }}
                />
            )}

            {showQr && qrToken && (
                <div className="overlay">
                    <div className="modal-card" style={{ position: "relative", textAlign: "center" }}>
                        <button onClick={() => setShowQr(false)} className="btn-icon" style={{ position: "absolute", top: "0.75rem", right: "0.75rem" }}>
                            <X size={18} />
                        </button>
                        <h2 style={{ marginBottom: "1rem" }}>Scan QR for HMS</h2>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`}
                            alt="QR Code"
                            style={{ marginBottom: "1rem" }}
                        />
                        <p style={{ fontSize: "0.9rem", color: "var(--muted-foreground)", marginBottom: "1rem" }}>
                            Scan med kamera for \u00e5 se HMS-dokumentasjon (read-only).
                        </p>
                        <div style={{ backgroundColor: "var(--secondary)", padding: "0.6rem", borderRadius: "var(--radius)", fontSize: "0.8rem", wordBreak: "break-all" }}>
                            {shareUrl}
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

function ProjectDocumentItem({ doc, onDelete }: { doc: ProjectDocument; onDelete: (id: string) => void }) {
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleView = async () => {
        setLoading(true);
        try {
            const { getProjectDocumentContent } = await import("@/lib/db");
            const content = await getProjectDocumentContent(doc.id);
            if (!content) {
                alert("Kunne ikke laste dokumentinnhold.");
                return;
            }
            const win = window.open();
            if (win) {
                win.document.write(`<iframe src="${content}" frameborder="0" style="border:0;width:100%;height:100%;" allowfullscreen></iframe>`);
            } else {
                window.location.href = content;
            }
        } catch (error) {
            console.error(error);
            alert(`Feil ved \u00e5pning.`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`Er du sikker p\u00e5 at du vil slette dette dokumentet?`)) return;
        setDeleting(true);
        try {
            const { deleteProjectDocument } = await import("@/lib/data");
            await deleteProjectDocument(doc.id);
            onDelete(doc.id);
        } catch (error) {
            console.error(error);
            alert("Kunne ikke slette dokumentet.");
            setDeleting(false);
        }
    };

    return (
        <div className="card flex-between" style={{ gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", overflow: "hidden" }}>
                <FileText size={24} color="var(--primary)" style={{ flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                    <h4 style={{ margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{doc.title}</h4>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--muted-foreground)" }}>{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                </div>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={handleView} className="btn-icon" disabled={loading || deleting} title="Vis dokument">
                    {loading ? <Loader2 size={16} className="spin" /> : <Eye size={20} />}
                </button>
                <button onClick={handleDelete} className="btn-icon" disabled={loading || deleting} title="Slett dokument" style={{ color: "var(--destructive)" }}>
                    {deleting ? <Loader2 size={16} className="spin" /> : <Trash2 size={20} />}
                </button>
            </div>
        </div>
    );
}
