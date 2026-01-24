"use client";

import { getSJATemplates, addSJA } from "@/lib/data";
import { getProjects } from "@/lib/data";
import { analyzeImage, AIAnalysisResult } from "@/lib/ai-service";
import { Project, SJATemplate, SJA, SJARisk, SJAMeasure } from "@/lib/types";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Check, ChevronRight, Upload, Sparkles, Loader2, PlusCircle, AlertTriangle, MapPin, Thermometer, CheckCircle } from "lucide-react";

function NewSJAContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const projectId = searchParams.get("projectId");

    const [project, setProject] = useState<Project | undefined>(undefined);
    const [templates, setTemplates] = useState<SJATemplate[]>([]);
    const [step, setStep] = useState<"template" | "site-conditions" | "specifics">("template");

    // Form State
    const [selectedTemplate, setSelectedTemplate] = useState<SJATemplate | null>(null);
    const [weather, setWeather] = useState("");
    const [workOperation, setWorkOperation] = useState("");
    const [location, setLocation] = useState("");
    const [participants, setParticipants] = useState("");
    const [emergencyResponse, setEmergencyResponse] = useState("");

    // Risks
    const [aiRisks, setAiRisks] = useState<Omit<SJARisk, "id">[]>([]);
    const [specificRisks, setSpecificRisks] = useState<Omit<SJARisk, "id">[]>([]);

    // Validation State
    const [photoUploaded, setPhotoUploaded] = useState(false);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);

    // Specific Risk Input State
    const [newRiskActivity, setNewRiskActivity] = useState("");
    const [newRiskDescription, setNewRiskDescription] = useState("");
    const [newRiskMeasure, setNewRiskMeasure] = useState("");

    useEffect(() => {
        if (projectId) {
            getProjects().then(async (projects) => {
                const foundProject = projects.find(p => p.id === projectId);
                if (foundProject) {
                    setProject(foundProject);
                    const tmpls = await getSJATemplates();
                    setTemplates(tmpls);
                    setLocation(foundProject.address); // Default location
                }
                setLoading(false);
            });
        } else {
            setLoading(false);
            router.push("/projects");
        }
    }, [projectId, router]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPhotoUploaded(true);
            setAnalyzing(true);
            try {
                const result = await analyzeImage(e.target.files[0]);
                setAiRisks(prev => [...prev, ...result.suggestedRisks]);
            } catch (error) {
                console.error("AI Analysis failed", error);
                alert("Kunne ikke analysere bildet, men det er lastet opp.");
            } finally {
                setAnalyzing(false);
            }
        }
    };

    const addSpecificRisk = () => {
        if (!newRiskActivity || !newRiskDescription || !newRiskMeasure) return;

        const measure: SJAMeasure = {
            id: crypto.randomUUID(),
            description: newRiskMeasure,
            responsible: "Alle", // Default
            completed: false
        };

        const risk: Omit<SJARisk, "id"> = {
            activity: newRiskActivity,
            description: newRiskDescription,
            probability: "Middels",
            severity: "Middels",
            measures: [measure]
        };

        setSpecificRisks([...specificRisks, risk]);
        setNewRiskActivity("");
        setNewRiskDescription("");
        setNewRiskMeasure("");
    };

    const handleCreate = async () => {
        if (!project) return;

        let initialRisks: SJARisk[] = [];

        // 1. Add template risks
        if (selectedTemplate) {
            initialRisks = selectedTemplate.risks.map(r => ({
                ...r,
                id: crypto.randomUUID(),
                measures: r.measures.map(m => ({ ...m, id: crypto.randomUUID() }))
            }));
        }

        // 2. Add AI risks
        const aiRisksWithIds = aiRisks.map(r => ({
            ...r,
            id: crypto.randomUUID(),
            measures: r.measures.map(m => ({ ...m, id: crypto.randomUUID() }))
        }));

        // 3. Add Specific risks
        const specificRisksWithIds = specificRisks.map(r => ({
            ...r,
            id: crypto.randomUUID(),
            measures: r.measures.map(m => ({ ...m, id: crypto.randomUUID() }))
        }));

        initialRisks = [...initialRisks, ...aiRisksWithIds, ...specificRisksWithIds];

        const newSJA: SJA = {
            id: crypto.randomUUID(),
            projectId: project.id,
            date: new Date().toISOString(),
            status: "Utkast",
            description: workOperation || (selectedTemplate ? selectedTemplate.name : "SJA"),
            location: location || project.address,
            participants,
            risks: initialRisks,
            weather,
            workOperation,
            emergencyResponse,
            signatureExecutor: ""
        };

        await addSJA(newSJA);
        router.push(`/projects/sja/details?id=${newSJA.id}&projectId=${project.id}`);
    };

    if (loading) return <div className="container" style={{ paddingTop: "2rem" }}>Laster...</div>;
    if (!project) return <div className="container" style={{ paddingTop: "2rem" }}>Prosjekt ikke funnet</div>;

    return (
        <main className="container" style={{ paddingTop: "2rem", paddingBottom: "6rem" }}>
            <Link href={`/projects/sja?projectId=${project.id}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--muted-foreground)", marginBottom: "1rem" }}>
                <ArrowLeft size={16} /> Avbryt
            </Link>

            <h1 style={{ marginBottom: "2rem" }}>Ny SJA (Sikker Jobb Analyse)</h1>

            {/* Stepper */}
            <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", alignItems: "center", fontSize: "0.9rem" }}>
                <div style={{ fontWeight: step === "template" ? "bold" : "normal", color: step === "template" ? "var(--primary)" : "var(--muted-foreground)" }}>1. Arbeidstype & Mal</div>
                <div style={{ width: "20px", height: "1px", backgroundColor: "var(--border)" }} />
                <div style={{ fontWeight: step === "site-conditions" ? "bold" : "normal", color: step === "site-conditions" ? "var(--primary)" : "var(--muted-foreground)" }}>2. Bilder & Forhold</div>
                <div style={{ width: "20px", height: "1px", backgroundColor: "var(--border)" }} />
                <div style={{ fontWeight: step === "specifics" ? "bold" : "normal", color: step === "specifics" ? "var(--primary)" : "var(--muted-foreground)" }}>3. Stedsspesifikk Vurdering</div>
            </div>

            {step === "template" && (
                <div>
                    <div className="alert-box" style={{ marginBottom: "2rem", backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", padding: "1rem", borderRadius: "8px", color: "#1e3a8a" }}>
                        <strong>80% Standard:</strong> Velg den malen som passer best til dagens arbeid. Vi fyller ut standardfarer for deg.
                    </div>

                    <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
                        <button
                            className="card"
                            style={{
                                textAlign: "left", cursor: "pointer",
                                borderColor: selectedTemplate === null ? "var(--primary)" : "var(--border)",
                                backgroundColor: selectedTemplate === null ? "rgba(var(--primary-rgb), 0.05)" : "var(--card)"
                            }}
                            onClick={() => setSelectedTemplate(null)}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                                <span style={{ fontWeight: "600" }}>Tom SJA (Ingen mal)</span>
                                {selectedTemplate === null && <Check size={20} color="var(--primary)" />}
                            </div>
                            <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>Start helt blankt.</p>
                        </button>

                        {templates.map(t => (
                            <button
                                key={t.id}
                                className="card"
                                style={{
                                    textAlign: "left", cursor: "pointer",
                                    borderColor: selectedTemplate?.id === t.id ? "var(--primary)" : "var(--border)",
                                    backgroundColor: selectedTemplate?.id === t.id ? "rgba(var(--primary-rgb), 0.05)" : "var(--card)"
                                }}
                                onClick={() => setSelectedTemplate(t)}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                                    <span style={{ fontWeight: "600" }}>{t.name}</span>
                                    {selectedTemplate?.id === t.id && <Check size={20} color="var(--primary)" />}
                                </div>
                                <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>{t.risks.length} standardrisikoer inkludert.</p>
                            </button>
                        ))}
                    </div>
                    <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
                        <button className="btn btn-primary" onClick={() => setStep("site-conditions")}>
                            Neste Steg <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {step === "site-conditions" && (
                <div>
                    <div style={{ marginBottom: "2rem" }}>
                        <h2 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>Dokumenter Forholdene</h2>
                        <div style={{ padding: "2rem", border: "2px dashed var(--border)", borderRadius: "12px", backgroundColor: "var(--secondary)", textAlign: "center" }}>
                            {photoUploaded ? (
                                <div style={{ color: "green", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                                    <CheckCircle size={48} />
                                    <p>Bilde lastet opp! AI-analyse fullført.</p>
                                    {aiRisks.length > 0 && <p style={{ fontSize: "0.9rem", color: "var(--foreground)" }}>Fant {aiRisks.length} potensielle risikoer.</p>}
                                </div>
                            ) : (
                                <>
                                    <Sparkles size={32} color="#8b5cf6" style={{ marginBottom: "1rem" }} />
                                    <h3 style={{ fontSize: "1.1rem" }}>Last opp bilde av arbeidsstedet (Påkrevd)</h3>
                                    <p style={{ color: "var(--muted-foreground)", marginBottom: "1.5rem", maxWidth: "400px", marginInline: "auto" }}>
                                        Ta bilde av området. Vi bruker også AI for å se etter farer.
                                    </p>
                                    <div style={{ display: "inline-block", position: "relative" }}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                            style={{ position: "absolute", width: "100%", height: "100%", opacity: 0, cursor: "pointer" }}
                                            disabled={analyzing}
                                        />
                                        <button className="btn btn-primary" disabled={analyzing} style={{ backgroundColor: "#8b5cf6", borderColor: "#7c3aed" }}>
                                            {analyzing ? <><Loader2 size={16} className="spin" style={{ marginRight: "0.5rem" }} /> Analyserer...</> : <><Upload size={16} style={{ marginRight: "0.5rem" }} /> Last opp bilde</>}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="form-group" style={{ maxWidth: "400px" }}>
                        <label className="flex items-center gap-2"><Thermometer size={16} /> Værforhold</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="Sol, Regn, Vind, Snø..."
                            value={weather}
                            onChange={e => setWeather(e.target.value)}
                        />
                    </div>

                    <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between" }}>
                        <button className="btn btn-secondary" onClick={() => setStep("template")}>Tilbake</button>
                        <button
                            className="btn btn-primary"
                            disabled={!photoUploaded}
                            title={!photoUploaded ? "Du må laste opp bilde først" : ""}
                            onClick={() => setStep("specifics")}
                        >
                            Gå videre <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {step === "specifics" && (
                <div style={{ maxWidth: "800px" }}>
                    <div className="alert-box" style={{ marginBottom: "2rem", backgroundColor: "#fffbeb", border: "1px solid #fcd34d", padding: "1rem", borderRadius: "8px", color: "#92400e" }}>
                        <strong>20% Spesifikt:</strong> Hva er annerledes her enn normalt? Du MÅ legge til minst én stedsspesifikk fare.
                    </div>

                    <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "1fr 1fr" }}>
                        <div className="form-group">
                            <label>Konkret Arbeidsoperasjon</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="F.eks. Riving av bærevegg i 2. etg"
                                value={workOperation}
                                onChange={e => setWorkOperation(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Deltakere (Hvem utfører?)</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="Navn på ansatte..."
                                value={participants}
                                onChange={e => setParticipants(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginTop: "1rem" }}>
                        <label>Beredskap (Møteplass / Førstehjelp / Rømning)</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="F.eks. Førstehjelpsskrin i bil, møteplass ved postkasser"
                            value={emergencyResponse}
                            onChange={e => setEmergencyResponse(e.target.value)}
                        />
                    </div>

                    <div style={{ margin: "2rem 0", padding: "1.5rem", border: "1px solid var(--border)", borderRadius: "8px", backgroundColor: "var(--card)" }}>
                        <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--destructive)" }}>
                            <AlertTriangle size={20} /> Legg til Lokal Risiko (Påkrevd)
                        </h3>
                        <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)", marginBottom: "1rem" }}>
                            Se deg rundt. Hva kan gå galt akkurat her i dag? (Eks: Trang adkomst, istapper, barnehage i nærheten)
                        </p>

                        <div style={{ display: "grid", gap: "1rem" }}>
                            <input
                                className="input"
                                placeholder="Hva er faren? (Aktivitet/Fare)"
                                value={newRiskActivity}
                                onChange={e => setNewRiskActivity(e.target.value)}
                            />
                            <textarea
                                className="input"
                                placeholder="Beskriv hvorfor det er farlig..."
                                value={newRiskDescription}
                                onChange={e => setNewRiskDescription(e.target.value)}
                            />
                            <input
                                className="input"
                                placeholder="Hva gjør vi for å unngå det? (Tiltak)"
                                value={newRiskMeasure}
                                onChange={e => setNewRiskMeasure(e.target.value)}
                            />
                            <button
                                className="btn btn-secondary"
                                onClick={addSpecificRisk}
                                disabled={!newRiskActivity || !newRiskDescription || !newRiskMeasure}
                            >
                                <PlusCircle size={16} style={{ marginRight: "0.5rem" }} /> Legg til Risiko
                            </button>
                        </div>

                        {specificRisks.length > 0 && (
                            <div style={{ marginTop: "1rem" }}>
                                <h4 style={{ fontSize: "0.9rem" }}>Lokal risiko lagt til:</h4>
                                <ul style={{ fontSize: "0.875rem", paddingLeft: "1.5rem", color: "green" }}>
                                    {specificRisks.map((r, i) => (
                                        <li key={i}>{r.activity} - {r.description}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem" }}>
                        <button className="btn btn-secondary" onClick={() => setStep("site-conditions")}>Tilbake</button>
                        <button
                            className="btn btn-primary"
                            disabled={specificRisks.length === 0 || !workOperation}
                            title={specificRisks.length === 0 ? "Du MÅ legge til minst én lokal risiko" : ""}
                            onClick={handleCreate}
                        >
                            Opprett SJA <Check size={16} style={{ marginLeft: "0.5rem" }} />
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}

export default function NewSJAPage() {
    return (
        <Suspense fallback={<div className="container" style={{ paddingTop: "2rem" }}>Laster...</div>}>
            <NewSJAContent />
        </Suspense>
    );
}
