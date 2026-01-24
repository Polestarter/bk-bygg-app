"use client";

import { getProjects, getSJA, updateSJA } from "@/lib/data";
import { Project, SJA, SJARisk, SJAMeasure } from "@/lib/types";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Save, Trash2, CheckCircle, AlertTriangle, Download, Mail } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function RiskItem({ risk, onChange, onDelete, readOnly }: { risk: SJARisk, onChange: (r: SJARisk) => void, onDelete: () => void, readOnly: boolean }) {
    const addMeasure = () => {
        const newMeasure: SJAMeasure = {
            id: crypto.randomUUID(),
            description: "",
            responsible: "Alle",
            completed: false
        };
        onChange({ ...risk, measures: [...risk.measures, newMeasure] });
    };

    const updateMeasure = (index: number, m: SJAMeasure) => {
        const newMeasures = [...risk.measures];
        newMeasures[index] = m;
        onChange({ ...risk, measures: newMeasures });
    };

    const removeMeasure = (index: number) => {
        const newMeasures = risk.measures.filter((_, i) => i !== index);
        onChange({ ...risk, measures: newMeasures });
    };

    return (
        <div className="card" style={{ marginBottom: "1rem", borderLeft: risk.severity === "Høy" ? "4px solid var(--destructive)" : "4px solid var(--border)" }}>
            <div className="flex-between" style={{ alignItems: "flex-start", marginBottom: "1rem" }}>
                <div style={{ flex: 1 }}>
                    {readOnly ? (
                        <h3 style={{ fontSize: "1.1rem", marginBottom: "0.25rem" }}>{risk.activity}</h3>
                    ) : (
                        <input
                            className="input"
                            style={{ fontWeight: "bold", marginBottom: "0.5rem" }}
                            value={risk.activity}
                            onChange={e => onChange({ ...risk, activity: e.target.value })}
                            placeholder="Aktivitet / Fare"
                        />
                    )}

                    {readOnly ? (
                        <p style={{ color: "var(--muted-foreground)" }}>{risk.description}</p>
                    ) : (
                        <textarea
                            className="input"
                            style={{ minHeight: "60px" }}
                            value={risk.description}
                            onChange={e => onChange({ ...risk, description: e.target.value })}
                            placeholder="Beskrivelse av risiko..."
                        />
                    )}
                </div>
                {!readOnly && (
                    <button onClick={onDelete} className="btn btn-ghost" style={{ color: "var(--destructive)" }}>
                        <Trash2 size={16} />
                    </button>
                )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                    <label style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>Sannsynlighet</label>
                    {readOnly ? (
                        <div style={{ fontWeight: "500" }}>{risk.probability}</div>
                    ) : (
                        <select
                            className="input"
                            value={risk.probability}
                            onChange={e => onChange({ ...risk, probability: e.target.value as any })}
                            style={{ padding: "0.25rem" }}
                        >
                            <option value="Lav">Lav</option>
                            <option value="Middels">Middels</option>
                            <option value="Høy">Høy</option>
                        </select>
                    )}
                </div>
                <div>
                    <label style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>Konsekvens</label>
                    {readOnly ? (
                        <div style={{ fontWeight: "500" }}>{risk.severity}</div>
                    ) : (
                        <select
                            className="input"
                            value={risk.severity}
                            onChange={e => onChange({ ...risk, severity: e.target.value as any })}
                            style={{ padding: "0.25rem" }}
                        >
                            <option value="Lav">Lav</option>
                            <option value="Middels">Middels</option>
                            <option value="Høy">Høy</option>
                        </select>
                    )}
                </div>
            </div>

            <div style={{ backgroundColor: "var(--secondary)", padding: "1rem", borderRadius: "8px" }}>
                <h4 style={{ fontSize: "0.9rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <CheckCircle size={14} /> Tiltak
                </h4>
                <div style={{ display: "grid", gap: "0.5rem" }}>
                    {risk.measures.map((m, idx) => (
                        <div key={m.id} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                            {readOnly ? (
                                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    <input type="checkbox" checked={m.completed} disabled />
                                    <span>{m.description}</span>
                                    <span style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", marginLeft: "auto" }}>Ansvar: {m.responsible}</span>
                                </div>
                            ) : (
                                <>
                                    <input
                                        className="input"
                                        value={m.description}
                                        onChange={e => updateMeasure(idx, { ...m, description: e.target.value })}
                                        placeholder="Beskriv tiltak..."
                                        style={{ flex: 1 }}
                                    />
                                    <select
                                        className="input"
                                        value={m.responsible}
                                        onChange={e => updateMeasure(idx, { ...m, responsible: e.target.value })}
                                        style={{ width: "100px" }}
                                    >
                                        <option value="Alle">Alle</option>
                                        <option value="Leder">Leder</option>
                                        <option value="UE">UE</option>
                                    </select>
                                    <button onClick={() => removeMeasure(idx)} className="btn btn-ghost" style={{ padding: "0.25rem" }}>
                                        <Trash2 size={14} />
                                    </button>
                                </>
                            )}
                        </div>
                    ))}
                    {!readOnly && (
                        <button onClick={addMeasure} className="btn btn-secondary" style={{ fontSize: "0.8rem", padding: "0.25rem 0.5rem", width: "fit-content" }}>
                            + Legg til tiltak
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function SJADetailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const projectId = searchParams.get("projectId");
    const sjaId = searchParams.get("id");

    const [project, setProject] = useState<Project | undefined>(undefined);
    const [sja, setSja] = useState<SJA | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (projectId && sjaId) {
            getProjects().then(async (projects) => {
                const foundProject = projects.find(p => p.id === projectId);
                if (foundProject) {
                    setProject(foundProject);
                    const foundSja = await getSJA(sjaId);
                    setSja(foundSja);
                }
                setLoading(false);
            });
        }
    }, [projectId, sjaId]);

    const handleSave = async (signed: boolean = false) => {
        if (!sja) return;
        setSaving(true);
        const updatedSja = { ...sja };
        if (signed) {
            updatedSja.status = "Signert";
            updatedSja.signatureLeader = "Signert av " + (sja.participants.split(',')[0] || "Ukjent"); // Mock signature
            updatedSja.signatureLeaderDate = new Date().toISOString();
        }
        await updateSJA(updatedSja);
        setSja(updatedSja);
        setSaving(false);
        if (signed) {
            alert("SJA er signert!");
        }
    };

    const addRisk = () => {
        if (!sja) return;
        const newRisk: SJARisk = {
            id: crypto.randomUUID(),
            activity: "",
            description: "",
            probability: "Middels",
            severity: "Middels",
            measures: []
        };
        setSja({ ...sja, risks: [...sja.risks, newRisk] });
    };

    const handleDownloadPDF = async () => {
        const input = document.getElementById('sja-content');
        if (!input) return;

        try {
            const canvas = await html2canvas(input, { scale: 2 } as any);
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = pdfWidth / imgWidth;
            const contentHeight = imgHeight * ratio;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, contentHeight);
            pdf.save(`SJA-${project?.name || "Prosjekt"}-${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error("PDF Generation failed", error);
            alert("Kunne ikke generere PDF.");
        }
    };

    const handleSendEmail = async () => {
        if (!sja || !project) return;

        // Trigger download so user has file to attach
        await handleDownloadPDF();

        const subject = encodeURIComponent(`Signert SJA: ${sja.workOperation || "SJA"} - ${project.address}`);
        const body = encodeURIComponent(`Hei,\n\nVedlagt ligger signert SJA for arbeid på ${project.address}.\n\nArbeidsoperasjon: ${sja.workOperation || "SJA"}\nDato: ${new Date().toLocaleDateString()}\n\nMvh,\n${sja.signatureLeader?.replace("Signert av ", "") || ""}`);

        window.location.href = `mailto:?subject=${subject}&body=${body}`;

        alert("PDF er lastet ned. E-postklient åpnes. Vennligst legg ved filen manuelt.");
    };

    if (loading) return <div className="container" style={{ paddingTop: "2rem" }}>Laster...</div>;
    if (!project || !sja) return <div className="container" style={{ paddingTop: "2rem" }}>Fant ikke SJA</div>;

    const isSigned = sja.status === "Signert";

    return (
        <main className="container" style={{ paddingTop: "2rem", paddingBottom: "6rem" }}>
            <div className="flex-between" style={{ marginBottom: "1rem" }}>
                <Link href={`/projects/sja?projectId=${project.id}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--muted-foreground)" }}>
                    <ArrowLeft size={16} /> Tilbake til oversikt
                </Link>
                {isSigned && (
                    <div style={{ color: "#10b981", display: "flex", gap: "0.5rem", alignItems: "center", fontWeight: "600" }}>
                        <CheckCircle size={20} /> Signert {new Date(sja.signatureLeaderDate!).toLocaleDateString()}
                    </div>
                )}
            </div>

            <div id="sja-content" style={{ padding: "1rem", backgroundColor: "white" }}>
                <div className="flex-between" style={{ alignItems: "flex-start", marginBottom: "2rem" }}>
                    <div>
                        <h1 style={{ marginBottom: "0.5rem" }}>SJA: {sja.workOperation || sja.description || "Uten navn"}</h1>
                        <div style={{ display: "grid", gap: "0.5rem", color: "var(--muted-foreground)" }}>
                            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                <strong>Sted:</strong> {sja.location}
                            </div>
                            {sja.weather && (
                                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                    <strong>Værforhold:</strong> {sja.weather}
                                </div>
                            )}
                            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                <strong>Deltakere:</strong> {sja.participants}
                            </div>
                            {sja.emergencyResponse && (
                                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", color: "var(--destructive)" }}>
                                    <strong>Beredskap:</strong> {sja.emergencyResponse}
                                </div>
                            )}
                        </div>
                    </div>
                    {!isSigned ? (
                        <div style={{ display: "flex", gap: "1rem" }}>
                            <button className="btn btn-secondary" onClick={() => handleSave(false)} disabled={saving}>
                                <Save size={16} style={{ marginRight: "0.5rem" }} /> {saving ? "Lagrer..." : "Lagre kladd"}
                            </button>
                            <button className="btn btn-primary" onClick={() => handleSave(true)} disabled={saving}>
                                Signer SJA
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: "flex", gap: "1rem" }}>
                            <button className="btn btn-outline" onClick={handleDownloadPDF}>
                                <Download size={16} style={{ marginRight: "0.5rem" }} /> PDF
                            </button>
                            <button className="btn btn-primary" onClick={handleSendEmail}>
                                <Mail size={16} style={{ marginRight: "0.5rem" }} /> Send på E-post
                            </button>
                        </div>
                    )}
                </div>

                <div style={{ marginBottom: "2rem" }}>
                    <div className="flex-between" style={{ marginBottom: "1rem" }}>
                        <h2>Risikomomenter</h2>
                        {!isSigned && (
                            <button className="btn btn-outline" onClick={addRisk}>
                                <Plus size={16} style={{ marginRight: "0.5rem" }} /> Legg til risiko
                            </button>
                        )}
                    </div>

                    {sja.risks.length === 0 && (
                        <div className="card" style={{ textAlign: "center", padding: "2rem", fontStyle: "italic", color: "var(--muted-foreground)" }}>
                            Ingen risikomomenter lagt til enda.
                        </div>
                    )}

                    {sja.risks.map((risk, index) => (
                        <RiskItem
                            key={risk.id}
                            risk={risk}
                            readOnly={isSigned}
                            onChange={(updatedRisk) => {
                                const newRisks = [...sja.risks];
                                newRisks[index] = updatedRisk;
                                setSja({ ...sja, risks: newRisks });
                            }}
                            onDelete={() => {
                                const newRisks = sja.risks.filter((_, i) => i !== index);
                                setSja({ ...sja, risks: newRisks });
                            }}
                        />
                    ))}
                </div>

                {isSigned && (
                    <div style={{ marginTop: "2rem", borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
                        <h3>Signatur</h3>
                        <p>Signert av: {sja.signatureLeader}</p>
                        <p>Dato: {new Date(sja.signatureLeaderDate!).toLocaleString()}</p>
                    </div>
                )}
            </div>
        </main>
    );
}

export default function SJADetailPage() {
    return (
        <Suspense fallback={<div className="container" style={{ paddingTop: "2rem" }}>Laster...</div>}>
            <SJADetailContent />
        </Suspense>
    );
}
