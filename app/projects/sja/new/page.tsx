"use client";

import { getSJATemplates, addSJA } from "@/lib/data";
import { getProjects } from "@/lib/data";
import { analyzeImage, AIAnalysisResult } from "@/lib/ai-service";
import { Project, SJATemplate, SJA, SJARisk } from "@/lib/types";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Check, ChevronRight, Upload, Sparkles, Loader2, PlusCircle } from "lucide-react";

function NewSJAContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const projectId = searchParams.get("projectId");

    const [project, setProject] = useState<Project | undefined>(undefined);
    const [templates, setTemplates] = useState<SJATemplate[]>([]);
    const [step, setStep] = useState<"template-selection" | "ai-assistant" | "details">("template-selection");

    // Form State
    const [selectedTemplate, setSelectedTemplate] = useState<SJATemplate | null>(null);
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [participants, setParticipants] = useState("");
    const [aiRisks, setAiRisks] = useState<Omit<SJARisk, "id">[]>([]);

    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);

    useEffect(() => {
        if (projectId) {
            getProjects().then(async (projects) => {
                const foundProject = projects.find(p => p.id === projectId);
                if (foundProject) {
                    setProject(foundProject);
                    const tmpls = await getSJATemplates();
                    setTemplates(tmpls);
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
            setAnalyzing(true);
            try {
                const result = await analyzeImage(e.target.files[0]);
                setAiRisks(prev => [...prev, ...result.suggestedRisks]);
            } catch (error) {
                console.error("AI Analysis failed", error);
                alert("Kunne ikke analysere bildet.");
            } finally {
                setAnalyzing(false);
            }
        }
    };

    const handleCreate = async () => {
        if (!project) return;

        let initialRisks: SJARisk[] = [];

        // Add template risks
        if (selectedTemplate) {
            initialRisks = selectedTemplate.risks.map(r => ({
                ...r,
                id: crypto.randomUUID(),
                measures: r.measures.map(m => ({ ...m, id: crypto.randomUUID() }))
            }));
        }

        // Add AI risks
        const aiRisksWithIds = aiRisks.map(r => ({
            ...r,
            id: crypto.randomUUID(),
            measures: r.measures.map(m => ({ ...m, id: crypto.randomUUID() }))
        }));

        initialRisks = [...initialRisks, ...aiRisksWithIds];

        const newSJA: SJA = {
            id: crypto.randomUUID(),
            projectId: project.id,
            date: new Date().toISOString(),
            status: "Utkast",
            description,
            location: location || project.address,
            participants,
            risks: initialRisks
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

            <h1 style={{ marginBottom: "2rem" }}>Ny Risikovurdering / SJA</h1>

            {/* Stepper Visualization */}
            <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", alignItems: "center" }}>
                <div style={{ fontWeight: step === "template-selection" ? "bold" : "normal", color: step === "template-selection" ? "var(--primary)" : "var(--muted-foreground)" }}>1. Mal</div>
                <div style={{ width: "20px", height: "1px", backgroundColor: "var(--border)" }} />
                <div style={{ fontWeight: step === "ai-assistant" ? "bold" : "normal", color: step === "ai-assistant" ? "var(--primary)" : "var(--muted-foreground)" }}>2. AI Assistent</div>
                <div style={{ width: "20px", height: "1px", backgroundColor: "var(--border)" }} />
                <div style={{ fontWeight: step === "details" ? "bold" : "normal", color: step === "details" ? "var(--primary)" : "var(--muted-foreground)" }}>3. Detaljer</div>
            </div>

            {step === "template-selection" && (
                <div>
                    <h2 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>Velg Mal</h2>
                    <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
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
                                <span style={{ fontWeight: "600" }}>Tom SJA</span>
                                {selectedTemplate === null && <Check size={20} color="var(--primary)" />}
                            </div>
                            <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>Start med en blank risikovurdering uten forhåndsutfylte risikoer.</p>
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
                                <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>{t.risks.length} forhåndsdefinerte risikoer.</p>
                            </button>
                        ))}
                    </div>
                    <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
                        <button className="btn btn-primary" onClick={() => setStep("ai-assistant")}>
                            Neste Steg <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {step === "ai-assistant" && (
                <div>
                    <div style={{ marginBottom: "2rem", textAlign: "center", padding: "3rem", border: "2px dashed var(--border)", borderRadius: "12px", backgroundColor: "var(--secondary)" }}>
                        <Sparkles size={48} color="#8b5cf6" style={{ marginBottom: "1rem" }} />
                        <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>AI Risikoanalyse</h2>
                        <p style={{ color: "var(--muted-foreground)", marginBottom: "1.5rem", maxWidth: "400px", marginInline: "auto" }}>
                            Last opp bilde av arbeidsstedet, så foreslår vår AI relevante risikoer og tiltak for deg.
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
                    </div>

                    {aiRisks.length > 0 && (
                        <div style={{ marginBottom: "2rem" }}>
                            <h3>Foreslåtte Risikoer ({aiRisks.length})</h3>
                            <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
                                {aiRisks.map((risk, idx) => (
                                    <div key={idx} className="card" style={{ borderLeft: "4px solid #8b5cf6" }}>
                                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.5rem" }}>
                                            <Sparkles size={16} color="#8b5cf6" />
                                            <h4 style={{ margin: 0 }}>{risk.activity}</h4>
                                        </div>
                                        <p style={{ fontSize: "0.9rem", color: "var(--foreground)" }}>{risk.description}</p>
                                        <div style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                                            <strong>Tiltak:</strong> {risk.measures.map(m => m.description).join(", ")}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem" }}>
                        <button className="btn btn-secondary" onClick={() => setStep("template-selection")}>Tilbake</button>
                        <button className="btn btn-primary" onClick={() => setStep("details")}>
                            Gå videre <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {step === "details" && (
                <div style={{ maxWidth: "600px" }}>
                    <h2 style={{ fontSize: "1.2rem", marginBottom: "1.5rem" }}>Prosjektdetaljer</h2>

                    <div style={{ display: "grid", gap: "1.5rem" }}>
                        <div className="form-group">
                            <label>Hva skal gjøres? (Arbeidsoperasjon)</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="F.eks. Skifte takstein, Rive bærevegg..."
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>Hvor utføres arbeidet? (Sted i bygget)</label>
                            <input
                                type="text"
                                className="input"
                                placeholder={project.address}
                                value={location}
                                onChange={e => setLocation(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>Deltakere (Hvem er med på SJA?)</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="Ola Nordmann, Kari ..."
                                value={participants}
                                onChange={e => setParticipants(e.target.value)}
                            />
                        </div>

                        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                            <button className="btn btn-secondary" onClick={() => setStep("ai-assistant")}>
                                Tilbake
                            </button>
                            <button
                                className="btn btn-primary"
                                disabled={!description}
                                onClick={handleCreate}
                            >
                                Opprett og gå til Risikovurdering
                            </button>
                        </div>
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
