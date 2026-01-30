"use client";

import { getProjects, getSafetyRound, updateSafetyRound } from "@/lib/data";
import { Project, SafetyRound, SafetyRoundItem } from "@/lib/types";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Check, X, Minus, Camera, Save, Download, Mail, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function SafetyRoundDetailsContent() {
    const searchParams = useSearchParams();
    const projectId = searchParams.get("projectId");
    const id = searchParams.get("id");

    const [project, setProject] = useState<Project | undefined>(undefined);
    const [round, setRound] = useState<SafetyRound | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [expandedItem, setExpandedItem] = useState<string | null>(null);

    useEffect(() => {
        if (projectId && id) {
            getProjects().then(async (projects) => {
                const foundProject = projects.find(p => p.id === projectId);
                if (foundProject) {
                    setProject(foundProject);
                    const foundRound = await getSafetyRound(id);
                    setRound(foundRound);
                }
                setLoading(false);
            });
        }
    }, [projectId, id]);

    const handleUpdateItem = (itemId: string, updates: Partial<SafetyRoundItem>) => {
        if (!round) return;
        const newItems = round.items.map(item =>
            item.id === itemId ? { ...item, ...updates } : item
        );
        setRound({ ...round, items: newItems });
    };

    const handlePhotoUpload = (itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleUpdateItem(itemId, { photoUrl: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async (sign: boolean = false) => {
        if (!round) return;
        setSaving(true);
        const updatedRound = { ...round };

        if (sign) {
            updatedRound.status = "Signert";
            updatedRound.signatureLeader = "Signert av " + (round.participants.split(',')[0] || "Ukjent");
            updatedRound.signatureLeaderDate = new Date().toISOString();
        }

        await updateSafetyRound(updatedRound);
        setRound(updatedRound);
        setSaving(false);
        if (sign) alert("Vernerunde signert!");
    };

    const handleSendEmail = async () => {
        if (!round || !project) return;

        // 1. Generate PDF
        const input = document.getElementById('safety-round-content');
        if (!input) return;

        try {
            const canvas = await html2canvas(input, { scale: 2 } as any);
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const contentHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, contentHeight);
            const pdfBlob = pdf.output('blob');
            const safeProjectName = (project.name || "Prosjekt").replace(/[^a-zA-Z0-9]/g, '_');
            const filename = `Vernerunde-${safeProjectName}-${new Date().toISOString().split('T')[0]}.pdf`;
            const file = new File([pdfBlob], filename, { type: 'application/pdf' });

            // 2. Try Native Share
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: `Vernerunde: ${project.name}`,
                    text: `Vernerunde for ${project.address}`,
                    files: [file]
                });
                return;
            }

            // 3. Fallback
            pdf.save(filename);
            const subject = encodeURIComponent(`Vernerunde: ${project.name}`);
            const body = encodeURIComponent(`Hei,\n\nVedlagt ligger rapport fra vernerunde.\n\nProsjekt: ${project.name}\nDato: ${new Date(round.date).toLocaleDateString()}`);
            window.location.href = `mailto:?subject=${subject}&body=${body}`;

        } catch (error) {
            console.error("Share failed", error);
            alert("Kunne ikke dele dokument.");
        }
    };

    if (loading) return <div className="container" style={{ paddingTop: "2rem" }}>Laster...</div>;
    if (!project || !round) return <div className="container" style={{ paddingTop: "2rem" }}>Fant ikke vernerunde</div>;

    const isSigned = round.status === "Signert";

    // Group items by category
    const groupedItems: Record<string, SafetyRoundItem[]> = {};
    round.items.forEach(item => {
        if (!groupedItems[item.category]) groupedItems[item.category] = [];
        groupedItems[item.category].push(item);
    });

    return (
        <main className="container" style={{ paddingTop: "2rem", paddingBottom: "6rem" }}>
            <div className="flex-between" style={{ marginBottom: "1rem" }}>
                <Link href={`/projects/safety-rounds?projectId=${project.id}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--muted-foreground)" }}>
                    <ArrowLeft size={16} /> Tilbake til liste
                </Link>
                {isSigned && (
                    <div style={{ color: "#166534", display: "flex", gap: "0.5rem", alignItems: "center", fontWeight: "600" }}>
                        <CheckCircle size={20} /> Signert {new Date(round.signatureLeaderDate!).toLocaleDateString()}
                    </div>
                )}
            </div>

            <div id="safety-round-content" style={{ backgroundColor: "white", padding: "1rem" }}>
                <h1 style={{ marginBottom: "0.5rem" }}>Vernerunde</h1>
                <p style={{ color: "var(--muted-foreground)", marginBottom: "2rem" }}>
                    Prosjekt: {project.name}<br />
                    Dato: {new Date(round.date).toLocaleDateString()}<br />
                    Deltakere: {round.participants}
                </p>

                <div style={{ display: "grid", gap: "2rem" }}>
                    {Object.entries(groupedItems).map(([category, items]) => (
                        <div key={category}>
                            <h3 style={{ borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
                                {category}
                            </h3>
                            <div style={{ display: "grid", gap: "1rem" }}>
                                {items.map(item => (
                                    <div key={item.id} className="card" style={{ padding: "1rem" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "1rem" }}>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontWeight: "500", marginBottom: "0.5rem" }}>{item.question}</p>
                                                {/* Preview status/photo if collapsed */}
                                                {item.status !== "OK" && (
                                                    <span className="badge badge-destructive" style={{ fontSize: "0.75rem", marginRight: "0.5rem" }}>
                                                        {item.status}
                                                    </span>
                                                )}
                                                {item.photoUrl && <span style={{ fontSize: "0.75rem", color: "var(--primary)" }}>📷 Bilde vedlagt</span>}
                                            </div>

                                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                                {/* Quick Actions (only if not signed) */}
                                                {!isSigned && (
                                                    <>
                                                        <button
                                                            className={`btn btn-ghost ${item.status === "OK" ? "bg-green-100 text-green-700" : ""}`}
                                                            style={{ padding: "0.5rem", backgroundColor: item.status === "OK" ? "#dcfce7" : "transparent" }}
                                                            onClick={() => handleUpdateItem(item.id, { status: "OK" })}
                                                            title="OK"
                                                        >
                                                            <Check size={20} color={item.status === "OK" ? "#166534" : "var(--muted-foreground)"} />
                                                        </button>
                                                        <button
                                                            className={`btn btn-ghost ${item.status === "Avvik" ? "bg-red-100 text-red-700" : ""}`}
                                                            style={{ padding: "0.5rem", backgroundColor: item.status === "Avvik" ? "#fee2e2" : "transparent" }}
                                                            onClick={() => handleUpdateItem(item.id, { status: "Avvik" })}
                                                            title="Avvik"
                                                        >
                                                            <X size={20} color={item.status === "Avvik" ? "#991b1b" : "var(--muted-foreground)"} />
                                                        </button>
                                                        <button
                                                            className={`btn btn-ghost ${item.status === "Ikke relevant" ? "bg-gray-100" : ""}`}
                                                            style={{ padding: "0.5rem", backgroundColor: item.status === "Ikke relevant" ? "#f3f4f6" : "transparent" }}
                                                            onClick={() => handleUpdateItem(item.id, { status: "Ikke relevant" })}
                                                            title="Ikke relevant"
                                                        >
                                                            <Minus size={20} color={item.status === "Ikke relevant" ? "#374151" : "var(--muted-foreground)"} />
                                                        </button>
                                                    </>
                                                )}

                                                <button
                                                    className="btn btn-ghost"
                                                    onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                                                >
                                                    {expandedItem === item.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                                </button>
                                            </div>
                                        </div>

                                        {(expandedItem === item.id || isSigned) && (
                                            <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px dashed var(--border)" }}>
                                                {isSigned ? (
                                                    <>
                                                        {item.comment && <p><strong>Kommentar:</strong> {item.comment}</p>}
                                                        {item.photoUrl && <img src={item.photoUrl} alt="Dokumentasjon" style={{ maxWidth: "100%", borderRadius: "8px", marginTop: "0.5rem" }} />}
                                                    </>
                                                ) : (
                                                    <div style={{ display: "grid", gap: "1rem" }}>
                                                        <textarea
                                                            className="input"
                                                            placeholder="Kommentar..."
                                                            value={item.comment || ""}
                                                            onChange={e => handleUpdateItem(item.id, { comment: e.target.value })}
                                                        />

                                                        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                                                            <label className="btn btn-secondary" style={{ cursor: "pointer" }}>
                                                                <Camera size={16} style={{ marginRight: "0.5rem" }} />
                                                                {item.photoUrl ? "Endre bilde" : "Ta bilde"}
                                                                <input type="file" accept="image/*" hidden onChange={e => handlePhotoUpload(item.id, e)} />
                                                            </label>
                                                            {item.photoUrl && <span style={{ fontSize: "0.8rem", color: "green" }}>Bilde lagret!</span>}
                                                        </div>

                                                        {item.photoUrl && (
                                                            <img src={item.photoUrl} alt="Preview" style={{ maxWidth: "100%", maxHeight: "200px", borderRadius: "8px", objectFit: "cover" }} />
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {isSigned && (
                    <div style={{ marginTop: "3rem", borderTop: "2px solid var(--border)", paddingTop: "1rem" }}>
                        <h3>Signatur</h3>
                        <p>{round.signatureLeader}</p>
                        <p style={{ fontSize: "0.9rem", color: "var(--muted-foreground)" }}>{new Date(round.signatureLeaderDate!).toLocaleString()}</p>
                    </div>
                )}
            </div>

            <div style={{ marginTop: "2rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                {!isSigned ? (
                    <>
                        <button className="btn btn-secondary" onClick={() => handleSave(false)} disabled={saving}>
                            <Save size={16} style={{ marginRight: "0.5rem" }} /> Lagre kladd
                        </button>
                        <button className="btn btn-primary" onClick={() => handleSave(true)} disabled={saving}>
                            Signer Vernerunde
                        </button>
                    </>
                ) : (
                    <button className="btn btn-primary" onClick={handleSendEmail} style={{ width: "100%", justifyContent: "center" }}>
                        <Mail size={16} style={{ marginRight: "0.5rem" }} /> Send på E-post
                    </button>
                )}
            </div>
        </main>
    );
}

export default function SafetyRoundDetailsPage() {
    return (
        <Suspense fallback={<div className="container" style={{ paddingTop: "2rem" }}>Laster...</div>}>
            <SafetyRoundDetailsContent />
        </Suspense>
    );
}
