"use client";

import { getProjects, getSafetyRounds } from "@/lib/data";
import { Project, SafetyRound } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Calendar, CheckCircle } from "lucide-react";

function SafetyRoundsList() {
    const searchParams = useSearchParams();
    const projectId = searchParams.get("projectId");

    const [project, setProject] = useState<Project | undefined>(undefined);
    const [rounds, setRounds] = useState<SafetyRound[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (projectId) {
            getProjects().then(async (projects) => {
                const foundProject = projects.find(p => p.id === projectId);
                if (foundProject) {
                    setProject(foundProject);
                    const projectRounds = await getSafetyRounds(projectId);
                    setRounds(projectRounds);
                }
                setLoading(false);
            });
        }
    }, [projectId]);

    if (loading) return <div className="container" style={{ paddingTop: "2rem" }}>Laster...</div>;
    if (!project) return <div className="container" style={{ paddingTop: "2rem" }}>Prosjekt ikke funnet</div>;

    return (
        <main className="container" style={{ paddingTop: "2rem", paddingBottom: "6rem" }}>
            <Link href={`/projects/details?id=${project.id}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--muted-foreground)", marginBottom: "1rem" }}>
                <ArrowLeft size={16} /> Tilbake til prosjekt
            </Link>

            <div className="flex-between" style={{ marginBottom: "2rem" }}>
                <h1>Vernerunder: {project.name}</h1>
                <Link href={`/projects/safety-rounds/new?projectId=${project.id}`} className="btn btn-primary">
                    <Plus size={16} style={{ marginRight: "0.5rem" }} /> Ny Vernerunde
                </Link>
            </div>

            {rounds.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "3rem", color: "var(--muted-foreground)" }}>
                    <p>Ingen vernerunder gjennomført enda.</p>
                </div>
            ) : (
                <div style={{ display: "grid", gap: "1rem" }}>
                    {rounds.map(round => (
                        <Link key={round.id} href={`/projects/safety-rounds/details?id=${round.id}&projectId=${project.id}`} style={{ textDecoration: "none" }}>
                            <div className="card hover-effect">
                                <div className="flex-between">
                                    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                                        <div style={{
                                            backgroundColor: round.status === "Signert" ? "#dcfce7" : "#f3f4f6",
                                            padding: "0.5rem", borderRadius: "8px",
                                            color: round.status === "Signert" ? "#166534" : "#4b5563"
                                        }}>
                                            {round.status === "Signert" ? <CheckCircle size={24} /> : <Calendar size={24} />}
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Vernerunde {new Date(round.date).toLocaleDateString()}</h3>
                                            <p style={{ margin: 0, color: "var(--muted-foreground)", fontSize: "0.9rem" }}>
                                                {round.description || "Ingen beskrivelse"}
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <span className={`badge ${round.status === "Signert" ? "badge-success" : "badge-secondary"}`}>
                                            {round.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </main>
    );
}

export default function SafetyRoundsPage() {
    return (
        <Suspense fallback={<div className="container" style={{ paddingTop: "2rem" }}>Laster...</div>}>
            <SafetyRoundsList />
        </Suspense>
    );
}
