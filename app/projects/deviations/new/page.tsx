"use client";

import { getProjects, addDeviation } from "@/lib/data";
import { Project, Deviation, DeviationSeverity } from "@/lib/types";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Camera, MapPin, AlertTriangle, Save, X } from "lucide-react";

function NewDeviationContent() {
    const searchParams = useSearchParams();
    const projectId = searchParams.get("projectId");
    const router = useRouter();

    const [project, setProject] = useState<Project | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("Farlig forhold");
    const [severity, setSeverity] = useState<DeviationSeverity>("Middels");
    const [locationText, setLocationText] = useState("");
    const [sjaId, setSjaId] = useState("");
    const [projectSjas, setProjectSjas] = useState<any[]>([]);
    // Mocking photo upload for now
    const [hasPhoto, setHasPhoto] = useState(false);

    useEffect(() => {
        if (projectId) {
            getProjects().then(async (projects) => {
                const foundProject = projects.find(p => p.id === projectId);
                if (foundProject) setProject(foundProject);
                setLoading(false);

                // Fetch SJAs for linking
                try {
                    const { getSJAs } = await import("@/lib/data");
                    const sjas = await getSJAs(projectId);
                    setProjectSjas(sjas);
                } catch (e) {
                    console.error("Could not fetch SJAs", e);
                }
            });
        } else {
            setLoading(false);
        }
    }, [projectId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectId) return;

        setSubmitting(true);

        try {
            const newDeviation: Omit<Deviation, "id" | "createdAt" | "updatedAt" | "actions"> = {
                projectId,
                sjaId: sjaId || undefined,
                title,
                description,
                category,
                severity,
                status: "Ny",
                location: { text: locationText },
                photos: hasPhoto ? ["placeholder-image"] : [],
                // Default due date 7 days from now
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            };

            await addDeviation(newDeviation);
            router.push(`/projects/deviations?projectId=${projectId}`);
        } catch (error) {
            console.error("Failed to create deviation", error);
            alert("Feil ved lagring av avvik.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="container" style={{ paddingTop: "2rem" }}>Laster...</div>;
    if (!project) return <div className="container" style={{ paddingTop: "2rem" }}>Prosjekt ikke funnet</div>;

    const categories = ["Ulykke", "Nestenulykke", "Farlig forhold", "Materiell skade", "Miljø", "Kvalitet", "Annet"];
    const severities: { value: DeviationSeverity; label: string; color: string }[] = [
        { value: "Lav", label: "Lav", color: "#10b981" },
        { value: "Middels", label: "Middels", color: "#eab308" },
        { value: "Høy", label: "Høy", color: "#f97316" },
        { value: "Kritisk", label: "Kritisk", color: "#ef4444" }
    ];

    return (
        <main className="container" style={{ paddingTop: "2rem", paddingBottom: "6rem", maxWidth: "600px" }}>
            <Link href={`/projects/deviations?projectId=${project.id}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--muted-foreground)", marginBottom: "1rem" }}>
                <ArrowLeft size={16} /> Avbryt
            </Link>

            <h1 style={{ marginBottom: "1.5rem" }}>Registrer Avvik</h1>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1.5rem" }}>

                {/* Photo Upload - Mocked UI */}
                <div
                    onClick={() => setHasPhoto(!hasPhoto)}
                    style={{
                        height: "150px",
                        backgroundColor: hasPhoto ? "rgba(16, 185, 129, 0.1)" : "var(--secondary)",
                        border: `2px dashed ${hasPhoto ? "#10b981" : "var(--border)"}`,
                        borderRadius: "12px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: hasPhoto ? "#10b981" : "var(--muted-foreground)"
                    }}
                >
                    {hasPhoto ? (
                        <>
                            <CheckCircle size={32} style={{ marginBottom: "0.5rem" }} />
                            <span>Bilde lagt til! (Klikk for å fjerne)</span>
                        </>
                    ) : (
                        <>
                            <Camera size={32} style={{ marginBottom: "0.5rem" }} />
                            <span style={{ fontWeight: "600" }}>Ta bilde / Last opp</span>
                            <span style={{ fontSize: "0.8rem" }}>Klikk her for å simulere opplasting</span>
                        </>
                    )}
                </div>

                {/* What happened? */}
                <div className="card">
                    <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>Hva har skjedd?</h2>

                    <div style={{ marginBottom: "1rem" }}>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Kort tittel <span style={{ color: "red" }}>*</span></label>
                        <input
                            type="text"
                            required
                            placeholder="F.eks. Manglende rekkverk"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="input"
                            style={{ width: "100%", padding: "0.75rem" }}
                        />
                    </div>

                    <div style={{ marginBottom: "1rem" }}>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Kategori <span style={{ color: "red" }}>*</span></label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="input"
                            style={{ width: "100%", padding: "0.75rem" }}
                        >
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Alvorlighet <span style={{ color: "red" }}>*</span></label>
                        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                            {severities.map(sev => (
                                <button
                                    key={sev.value}
                                    type="button"
                                    onClick={() => setSeverity(sev.value)}
                                    style={{
                                        border: `2px solid ${severity === sev.value ? sev.color : "transparent"}`,
                                        backgroundColor: severity === sev.value ? `${sev.color}20` : "var(--secondary)",
                                        color: severity === sev.value ? sev.color : "var(--foreground)",
                                        padding: "0.5rem 1rem",
                                        borderRadius: "8px",
                                        fontWeight: "600",
                                        flex: 1,
                                        cursor: "pointer"
                                    }}
                                >
                                    {sev.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Details */}
                <div className="card">
                    <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>Detaljer</h2>

                    <div style={{ marginBottom: "1rem" }}>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Beskrivelse</label>
                        <textarea
                            rows={4}
                            placeholder="Beskriv hendelsen nærmere..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="input"
                            style={{ width: "100%", padding: "0.75rem" }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Hvor? (Sted)</label>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", backgroundColor: "var(--secondary)", padding: "0.5rem", borderRadius: "8px" }}>
                            <MapPin size={20} color="var(--muted-foreground)" />
                            <input
                                type="text"
                                placeholder="F.eks. 2. etg, rom 204"
                                value={locationText}
                                onChange={(e) => setLocationText(e.target.value)}
                                style={{ flex: 1, border: "none", background: "transparent", outline: "none" }}
                            />
                        </div>
                    </div>

                    {projectSjas.length > 0 && (
                        <div style={{ marginTop: "1rem" }}>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Koble til SJA (Valgfritt)</label>
                            <select
                                value={sjaId}
                                onChange={(e) => setSjaId(e.target.value)}
                                className="input"
                                style={{ width: "100%", padding: "0.75rem" }}
                            >
                                <option value="">Ingen SJA valgt</option>
                                {projectSjas.map(sja => (
                                    <option key={sja.id} value={sja.id}>
                                        SJA {new Date(sja.date).toLocaleDateString()} - {sja.description || "Uten navn"}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "1rem", backgroundColor: "var(--background)", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "center" }}>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="btn btn-primary"
                        style={{ width: "100%", maxWidth: "600px", padding: "1rem" }}
                    >
                        {submitting ? "Lagrer..." : <><Save size={18} style={{ marginRight: "0.5rem" }} /> Send inn Avvik</>}
                    </button>
                </div>
            </form>
        </main>
    );
}

// Missing import fix
import { CheckCircle } from "lucide-react";

export default function NewDeviationPage() {
    return (
        <Suspense fallback={<div className="container" style={{ paddingTop: "2rem" }}>Laster...</div>}>
            <NewDeviationContent />
        </Suspense>
    );
}
