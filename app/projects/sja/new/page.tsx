"use client";

import { addSJA, getProjects, getSJATemplates } from "@/lib/data";
import { analyzeImage } from "@/lib/ai-service";
import { Project, SJA, SJAMeasure, SJARisk, SJATemplate } from "@/lib/types";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Check,
    CheckCircle,
    ChevronRight,
    Loader2,
    PlusCircle,
    Sparkles,
    Thermometer,
    Upload,
    AlertTriangle,
} from "lucide-react";

function NewSJAContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const projectId = searchParams.get("projectId");

    const [project, setProject] = useState<Project | undefined>(undefined);
    const [templates, setTemplates] = useState<SJATemplate[]>([]);
    const [step, setStep] = useState<"template" | "site-conditions" | "specifics">("template");

    const [selectedTemplate, setSelectedTemplate] = useState<SJATemplate | null>(null);
    const [weather, setWeather] = useState("");
    const [workOperation, setWorkOperation] = useState("");
    const [location, setLocation] = useState("");
    const [participants, setParticipants] = useState("");
    const [emergencyResponse, setEmergencyResponse] = useState("");

    const [aiRisks, setAiRisks] = useState<Omit<SJARisk, "id">[]>([]);
    const [specificRisks, setSpecificRisks] = useState<Omit<SJARisk, "id">[]>([]);

    const [photoUploaded, setPhotoUploaded] = useState(false);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);

    const [newRiskActivity, setNewRiskActivity] = useState("");
    const [newRiskDescription, setNewRiskDescription] = useState("");
    const [newRiskMeasure, setNewRiskMeasure] = useState("");

    useEffect(() => {
        if (!projectId) {
            setLoading(false);
            router.push("/projects");
            return;
        }

        getProjects().then(async (projects) => {
            const foundProject = projects.find((p) => p.id === projectId);
            if (foundProject) {
                setProject(foundProject);
                const loadedTemplates = await getSJATemplates();
                setTemplates(loadedTemplates);
                setLocation(foundProject.address);
            }
            setLoading(false);
        });
    }, [projectId, router]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;
        setPhotoUploaded(true);
        setAnalyzing(true);
        try {
            const result = await analyzeImage(e.target.files[0]);
            setAiRisks((prev) => [...prev, ...result.suggestedRisks]);
        } catch (error) {
            console.error("AI Analysis failed", error);
            alert("Kunne ikke analysere bildet, men det er lastet opp.");
        } finally {
            setAnalyzing(false);
        }
    };

    const addSpecificRisk = () => {
        if (!newRiskActivity || !newRiskDescription || !newRiskMeasure) return;

        const measure: SJAMeasure = {
            id: crypto.randomUUID(),
            description: newRiskMeasure,
            responsible: "Alle",
            completed: false,
        };

        const risk: Omit<SJARisk, "id"> = {
            activity: newRiskActivity,
            description: newRiskDescription,
            probability: "Middels",
            severity: "Middels",
            measures: [measure],
        };

        setSpecificRisks((prev) => [...prev, risk]);
        setNewRiskActivity("");
        setNewRiskDescription("");
        setNewRiskMeasure("");
    };

    const handleCreate = async () => {
        if (!project) return;

        let initialRisks: SJARisk[] = [];

        if (selectedTemplate) {
            initialRisks = selectedTemplate.risks.map((risk) => ({
                ...risk,
                id: crypto.randomUUID(),
                measures: risk.measures.map((measure) => ({ ...measure, id: crypto.randomUUID() })),
            }));
        }

        const aiRisksWithIds = aiRisks.map((risk) => ({
            ...risk,
            id: crypto.randomUUID(),
            measures: risk.measures.map((measure) => ({ ...measure, id: crypto.randomUUID() })),
        }));

        const specificRisksWithIds = specificRisks.map((risk) => ({
            ...risk,
            id: crypto.randomUUID(),
            measures: risk.measures.map((measure) => ({ ...measure, id: crypto.randomUUID() })),
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
            signatureExecutor: "",
        };

        await addSJA(newSJA);
        router.push(`/projects/sja/details?id=${newSJA.id}&projectId=${project.id}`);
    };

    if (loading) return <div className="container" style={{ paddingTop: "2rem" }}>Laster...</div>;
    if (!project) return <div className="container" style={{ paddingTop: "2rem" }}>Prosjekt ikke funnet</div>;

    return (
        <main className="container page-shell">
            <Link href={`/projects/sja?projectId=${project.id}`} className="back-link">
                <ArrowLeft size={16} /> Avbryt
            </Link>

            <h1 style={{ marginBottom: "2rem" }}>Ny SJA (Sikker Jobb Analyse)</h1>

            <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", alignItems: "center", fontSize: "0.9rem", flexWrap: "wrap" }}>
                <div style={{ fontWeight: step === "template" ? 700 : 400, color: step === "template" ? "var(--primary)" : "var(--muted-foreground)" }}>
                    1. Arbeidstype og mal
                </div>
                <div style={{ width: "20px", height: "1px", backgroundColor: "var(--border)" }} />
                <div style={{ fontWeight: step === "site-conditions" ? 700 : 400, color: step === "site-conditions" ? "var(--primary)" : "var(--muted-foreground)" }}>
                    2. Bilder og forhold
                </div>
                <div style={{ width: "20px", height: "1px", backgroundColor: "var(--border)" }} />
                <div style={{ fontWeight: step === "specifics" ? 700 : 400, color: step === "specifics" ? "var(--primary)" : "var(--muted-foreground)" }}>
                    3. Stedsspesifikk vurdering
                </div>
            </div>

            {step === "template" && (
                <div>
                    <div
                        className="alert-box"
                        style={{
                            marginBottom: "2rem",
                            backgroundColor: "#eff6ff",
                            borderColor: "#bfdbfe",
                            color: "#1e3a8a",
                        }}
                    >
                        <strong>80% Standard:</strong> Velg malen som passer best til arbeidet. Vi fyller ut standardfarer for deg.
                    </div>

                    <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
                        <button
                            className="card"
                            style={{
                                textAlign: "left",
                                cursor: "pointer",
                                borderColor: selectedTemplate === null ? "var(--primary)" : "var(--border)",
                                backgroundColor: selectedTemplate === null ? "rgba(163, 230, 53, 0.12)" : "var(--card)",
                            }}
                            onClick={() => setSelectedTemplate(null)}
                        >
                            <div className="flex-between" style={{ marginBottom: "0.5rem" }}>
                                <span style={{ fontWeight: 600 }}>Tom SJA (ingen mal)</span>
                                {selectedTemplate === null && <Check size={20} color="var(--primary)" />}
                            </div>
                            <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>Start helt blankt.</p>
                        </button>

                        {templates.map((template) => (
                            <button
                                key={template.id}
                                className="card"
                                style={{
                                    textAlign: "left",
                                    cursor: "pointer",
                                    borderColor: selectedTemplate?.id === template.id ? "var(--primary)" : "var(--border)",
                                    backgroundColor: selectedTemplate?.id === template.id ? "rgba(163, 230, 53, 0.12)" : "var(--card)",
                                }}
                                onClick={() => setSelectedTemplate(template)}
                            >
                                <div className="flex-between" style={{ marginBottom: "0.5rem" }}>
                                    <span style={{ fontWeight: 600 }}>{template.name}</span>
                                    {selectedTemplate?.id === template.id && <Check size={20} color="var(--primary)" />}
                                </div>
                                <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>
                                    {template.risks.length} standardrisikoer inkludert.
                                </p>
                            </button>
                        ))}
                    </div>

                    <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
                        <button className="btn btn-primary" onClick={() => setStep("site-conditions")}>
                            Neste steg <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {step === "site-conditions" && (
                <div>
                    <div style={{ marginBottom: "2rem" }}>
                        <h2 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>Dokumenter forholdene</h2>
                        <div
                            style={{
                                padding: "2rem",
                                border: "2px dashed var(--border)",
                                borderRadius: "12px",
                                backgroundColor: "var(--secondary)",
                                textAlign: "center",
                            }}
                        >
                            {photoUploaded ? (
                                <div style={{ color: "green", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                                    <CheckCircle size={48} />
                                    <p>Bilde lastet opp. AI-analyse fullf\u00f8rt.</p>
                                    {aiRisks.length > 0 && (
                                        <p style={{ fontSize: "0.9rem", color: "var(--foreground)" }}>
                                            Fant {aiRisks.length} potensielle risikoer.
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <Sparkles size={32} color="#8b5cf6" style={{ marginBottom: "1rem" }} />
                                    <h3 style={{ fontSize: "1.1rem" }}>Last opp bilde av arbeidsstedet (p\u00e5krevd)</h3>
                                    <p style={{ color: "var(--muted-foreground)", marginBottom: "1.5rem", maxWidth: "420px", marginInline: "auto" }}>
                                        {`Ta bilde av omr\u00e5det. Vi bruker ogs\u00e5 AI for \u00e5 se etter farer.`}
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
                                            {analyzing ? (
                                                <>
                                                    <Loader2 size={16} className="spin" style={{ marginRight: "0.5rem" }} /> Analyserer...
                                                </>
                                            ) : (
                                                <>
                                                    <Upload size={16} style={{ marginRight: "0.5rem" }} /> Last opp bilde
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="form-group" style={{ maxWidth: "400px" }}>
                        <label>
                            <Thermometer size={16} /> V\u00e6rforhold
                        </label>
                        <input
                            type="text"
                            className="input"
                            placeholder={`Sol, regn, vind, sn\u00f8...`}
                            value={weather}
                            onChange={(e) => setWeather(e.target.value)}
                        />
                    </div>

                    <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between" }}>
                        <button className="btn btn-secondary" onClick={() => setStep("template")}>Tilbake</button>
                        <button
                            className="btn btn-primary"
                            disabled={!photoUploaded}
                            title={!photoUploaded ? "Du m\u00e5 laste opp bilde f\u00f8rst" : ""}
                            onClick={() => setStep("specifics")}
                        >
                            G\u00e5 videre <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {step === "specifics" && (
                <div style={{ maxWidth: "800px" }}>
                    <div
                        className="alert-box"
                        style={{
                            marginBottom: "2rem",
                            backgroundColor: "#fffbeb",
                            borderColor: "#fcd34d",
                            color: "#92400e",
                        }}
                    >
                        <strong>20% Spesifikt:</strong> Hva er annerledes her enn normalt? Du m\u00e5 legge til minst en stedsspesifikk fare.
                    </div>

                    <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "1fr 1fr" }}>
                        <div className="form-group">
                            <label>Konkret arbeidsoperasjon</label>
                            <input
                                type="text"
                                className="input"
                                placeholder={`F.eks. riving av b\u00e6revegg i 2. etg`}
                                value={workOperation}
                                onChange={(e) => setWorkOperation(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Deltakere (hvem utf\u00f8rer?)</label>
                            <input
                                type="text"
                                className="input"
                                placeholder={`Navn p\u00e5 ansatte...`}
                                value={participants}
                                onChange={(e) => setParticipants(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginTop: "1rem" }}>
                        <label>{`Beredskap (m\u00f8teplass / f\u00f8rstehjelp / r\u00f8mning)`}</label>
                        <input
                            type="text"
                            className="input"
                            placeholder={`F.eks. f\u00f8rstehjelpsskrin i bil, m\u00f8teplass ved postkasser`}
                            value={emergencyResponse}
                            onChange={(e) => setEmergencyResponse(e.target.value)}
                        />
                    </div>

                    <div style={{ margin: "2rem 0", padding: "1.5rem", border: "1px solid var(--border)", borderRadius: "8px", backgroundColor: "var(--card)" }}>
                        <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--destructive)" }}>
                            <AlertTriangle size={20} /> Legg til lokal risiko (p\u00e5krevd)
                        </h3>
                        <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)", marginBottom: "1rem" }}>
                            Se deg rundt. Hva kan g\u00e5 galt akkurat her i dag?
                        </p>

                        <div style={{ display: "grid", gap: "1rem" }}>
                            <input
                                className="input"
                                placeholder="Hva er faren? (aktivitet/fare)"
                                value={newRiskActivity}
                                onChange={(e) => setNewRiskActivity(e.target.value)}
                            />
                            <textarea
                                className="input"
                                placeholder="Beskriv hvorfor det er farlig..."
                                value={newRiskDescription}
                                onChange={(e) => setNewRiskDescription(e.target.value)}
                            />
                            <input
                                className="input"
                                placeholder={`Hva gj\u00f8r vi for \u00e5 unng\u00e5 det? (tiltak)`}
                                value={newRiskMeasure}
                                onChange={(e) => setNewRiskMeasure(e.target.value)}
                            />
                            <button
                                className="btn btn-secondary"
                                onClick={addSpecificRisk}
                                disabled={!newRiskActivity || !newRiskDescription || !newRiskMeasure}
                            >
                                <PlusCircle size={16} style={{ marginRight: "0.5rem" }} /> Legg til risiko
                            </button>
                        </div>

                        {specificRisks.length > 0 && (
                            <div style={{ marginTop: "1rem" }}>
                                <h4 style={{ fontSize: "0.9rem" }}>Lokal risiko lagt til:</h4>
                                <ul style={{ fontSize: "0.875rem", paddingLeft: "1.5rem", color: "green" }}>
                                    {specificRisks.map((risk, index) => (
                                        <li key={index}>{risk.activity} - {risk.description}</li>
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
                            title={specificRisks.length === 0 ? "Du m\u00e5 legge til minst en lokal risiko" : ""}
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
