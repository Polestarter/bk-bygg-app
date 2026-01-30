"use client";

import { getProjects, getDeviation, updateDeviation, addDeviationAction, toggleDeviationAction } from "@/lib/data";
import { Project, Deviation, DeviationAction, DeviationStatus } from "@/lib/types";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Calendar, User, Save, CheckSquare, Square, Plus, Trash2, Camera, AlertTriangle } from "lucide-react";

function DeviationDetailsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = searchParams.get("id");
    const projectId = searchParams.get("projectId"); // Optional, but good for back link

    const [project, setProject] = useState<Project | undefined>(undefined);
    const [deviation, setDeviation] = useState<Deviation | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Edit State
    const [status, setStatus] = useState<DeviationStatus>("Ny");
    const [responsible, setResponsible] = useState("");
    const [dueDate, setDueDate] = useState("");

    // Actions State
    const [newActionText, setNewActionText] = useState("");
    const [showAddAction, setShowAddAction] = useState(false);

    useEffect(() => {
        if (id) {
            loadData();
        }
    }, [id]);

    const loadData = async () => {
        if (!id) return;
        const dev = await getDeviation(id);
        if (dev) {
            setDeviation(dev);
            setStatus(dev.status);
            setResponsible(dev.responsiblePerson || "");
            setDueDate(dev.dueDate ? dev.dueDate.split("T")[0] : ""); // YYYY-MM-DD

            if (dev.projectId) {
                const projects = await getProjects();
                const found = projects.find(p => p.id === dev.projectId);
                setProject(found);
            }
        }
        setLoading(false);
    };

    const handleSaveMetadata = async () => {
        if (!id) return;
        setSaving(true);
        try {
            await updateDeviation(id, {
                status,
                responsiblePerson: responsible,
                dueDate: dueDate ? new Date(dueDate).toISOString() : undefined
            });
            // Refresh local data
            await loadData();
            alert("Endringer lagret!");
        } catch (error) {
            console.error(error);
            alert("Kunne ikke lagre endringer.");
        } finally {
            setSaving(false);
        }
    };

    const handleAddAction = async () => {
        if (!id || !newActionText.trim()) return;
        try {
            await addDeviationAction(id, newActionText);
            setNewActionText("");
            setShowAddAction(false);
            await loadData(); // Refresh to see new action
        } catch (error) {
            console.error(error);
            alert("Klarte ikke legge til tiltak");
        }
    };

    const handleToggleAction = async (action: DeviationAction) => {
        try {
            // Mock user for now
            await toggleDeviationAction(action.id, !action.completed, "Ola Nordmann");
            await loadData();
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="container" style={{ paddingTop: "2rem" }}>Laster...</div>;
    if (!deviation) return <div className="container" style={{ paddingTop: "2rem" }}>Avvik ikke funnet</div>;

    const getStatusColor = (s: string) => {
        switch (s) {
            case "Ny": return "#ef4444";
            case "Pågår": return "#eab308";
            case "Utbedret": return "#3b82f6";
            case "Lukket": return "#10b981";
            default: return "#6b7280";
        }
    };

    return (
        <main className="container" style={{ paddingTop: "2rem", paddingBottom: "6rem" }}>
            <Link href={project ? `/projects/deviations?projectId=${project.id}` : "/projects"} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--muted-foreground)", marginBottom: "1rem" }}>
                <ArrowLeft size={16} /> Tilbake til oversikt
            </Link>

            <div className="flex-between" style={{ alignItems: "flex-start", marginBottom: "1.5rem" }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                        <span style={{
                            backgroundColor: getStatusColor(deviation.severity) + "20",
                            color: getStatusColor(deviation.severity),
                            padding: "0.2rem 0.6rem", borderRadius: "99px", fontSize: "0.75rem", fontWeight: "600"
                        }}>
                            {deviation.severity}
                        </span>
                        <span style={{ color: "var(--muted-foreground)", fontSize: "0.9rem" }}>{deviation.category}</span>
                    </div>
                    <h1 style={{ fontSize: "1.8rem", margin: 0 }}>{deviation.title}</h1>
                    <p style={{ color: "var(--muted-foreground)", margin: "0.5rem 0 0 0" }}>
                        Opprettet {new Date(deviation.createdAt).toLocaleString()}
                    </p>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>

                {/* Left Column: Details & Photos */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

                    {/* Photos */}
                    <div className="card">
                        <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>Bilder</h3>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "0.5rem" }}>
                            {deviation.photos && deviation.photos.length > 0 ? (
                                deviation.photos.map((photo, i) => (
                                    <div key={i} style={{ aspectRatio: "1/1", backgroundColor: "#eee", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        {/* Placeholder for real image */}
                                        <Camera size={24} color="#9ca3af" />
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem" }}>Ingen bilder registrert.</p>
                            )}
                        </div>
                    </div>

                    {/* Description & Location */}
                    <div className="card">
                        <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>Beskrivelse</h3>
                        <p style={{ whiteSpace: "pre-wrap", marginBottom: "1.5rem" }}>{deviation.description || "Ingen beskrivelse"}</p>

                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--muted-foreground)", fontSize: "0.9rem" }}>
                            <MapPin size={16} />
                            <span>{deviation.location?.text || "Ingen stedsangivelse"}</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Handling & Actions */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

                    {/* Status & Assignment */}
                    <div className="card" style={{ borderTop: `4px solid ${getStatusColor(status)}` }}>
                        <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>Behandling</h3>

                        <div style={{ marginBottom: "1rem" }}>
                            <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.25rem", color: "var(--muted-foreground)" }}>Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as DeviationStatus)}
                                className="input"
                                style={{ width: "100%" }}
                            >
                                <option value="Ny">Ny</option>
                                <option value="Pågår">Pågår</option>
                                <option value="Utbedret">Utbedret</option>
                                <option value="Lukket">Lukket</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: "1rem" }}>
                            <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.25rem", color: "var(--muted-foreground)" }}>Ansvarlig</label>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <User size={16} color="var(--muted-foreground)" />
                                <input
                                    type="text"
                                    value={responsible}
                                    onChange={(e) => setResponsible(e.target.value)}
                                    placeholder="Navn på ansvarlig"
                                    className="input"
                                    style={{ flex: 1 }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: "1.5rem" }}>
                            <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.25rem", color: "var(--muted-foreground)" }}>Frist</label>
                            <Calendar size={16} color="var(--muted-foreground)" style={{ position: "absolute", marginTop: "10px", marginLeft: "10px", pointerEvents: "none" }} />
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="input"
                                style={{ width: "100%", paddingLeft: "2.2rem" }}
                            />
                        </div>

                        <button
                            onClick={handleSaveMetadata}
                            disabled={saving}
                            className="btn btn-primary"
                            style={{ width: "100%", display: "flex", justifyContent: "center", gap: "0.5rem" }}
                        >
                            <Save size={16} /> {saving ? "Lagrer..." : "Lagre endringer"}
                        </button>
                    </div>

                    {/* Actions (Tiltak) */}
                    <div className="card">
                        <div className="flex-between" style={{ marginBottom: "1rem" }}>
                            <h3 style={{ fontSize: "1.1rem", margin: 0 }}>Tiltaksplan</h3>
                            <button
                                onClick={() => setShowAddAction(!showAddAction)}
                                className="btn btn-sm btn-outline"
                                style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
                            >
                                <Plus size={14} /> Nytt tiltak
                            </button>
                        </div>

                        {showAddAction && (
                            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                                <input
                                    type="text"
                                    value={newActionText}
                                    onChange={(e) => setNewActionText(e.target.value)}
                                    placeholder="Beskriv tiltak..."
                                    className="input"
                                    style={{ flex: 1 }}
                                    autoFocus
                                />
                                <button onClick={handleAddAction} className="btn btn-primary">Legg til</button>
                            </div>
                        )}

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            {deviation.actions && deviation.actions.length > 0 ? (
                                deviation.actions.map(action => (
                                    <div
                                        key={action.id}
                                        style={{
                                            display: "flex", alignItems: "flex-start", gap: "0.75rem",
                                            padding: "0.5rem",
                                            backgroundColor: action.completed ? "#f0fdf4" : "transparent",
                                            borderRadius: "6px",
                                            textDecoration: action.completed ? "line-through" : "none",
                                            color: action.completed ? "var(--muted-foreground)" : "inherit"
                                        }}
                                    >
                                        <button
                                            onClick={() => handleToggleAction(action)}
                                            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: action.completed ? "#10b981" : "var(--muted-foreground)" }}
                                        >
                                            {action.completed ? <CheckSquare size={20} /> : <Square size={20} />}
                                        </button>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ margin: 0 }}>{action.description}</p>
                                            {action.completed && (
                                                <p style={{ margin: 0, fontSize: "0.7rem", color: "var(--muted-foreground)" }}>
                                                    Utført av {action.completedBy} den {new Date(action.completedAt!).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: "var(--muted-foreground)", fontStyle: "italic", fontSize: "0.9rem" }}>Ingen tiltak definert.</p>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}

export default function DeviationDetailsPage() {
    return (
        <Suspense fallback={<div className="container" style={{ paddingTop: "2rem" }}>Laster...</div>}>
            <DeviationDetailsContent />
        </Suspense>
    );
}
