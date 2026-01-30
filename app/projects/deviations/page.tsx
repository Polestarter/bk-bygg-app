"use client";

import { getProjects, getDeviations } from "@/lib/data";
import { Project, Deviation } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, AlertTriangle, CheckCircle, Clock } from "lucide-react";

function DeviationsList() {
    const searchParams = useSearchParams();
    const projectId = searchParams.get("projectId");

    const [project, setProject] = useState<Project | undefined>(undefined);
    const [deviations, setDeviations] = useState<Deviation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (projectId) {
            getProjects().then(async (projects) => {
                const foundProject = projects.find(p => p.id === projectId);
                if (foundProject) {
                    setProject(foundProject);
                    const list = await getDeviations(projectId);
                    setDeviations(list);
                }
                setLoading(false);
            });
        }
    }, [projectId]);

    if (loading) return <div className="container" style={{ paddingTop: "2rem" }}>Laster...</div>;
    if (!project) return <div className="container" style={{ paddingTop: "2rem" }}>Prosjekt ikke funnet</div>;

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case "Kritisk": return "#ef4444"; // Red 500
            case "Høy": return "#f97316"; // Orange 500
            case "Middels": return "#eab308"; // Yellow 500
            default: return "#10b981"; // Green 500
        }
    };

    const getStatusBadge = (status: string) => {
        let color = "#6b7280";
        let bg = "#f3f4f6";

        if (status === "Ny") { color = "#ef4444"; bg = "#fee2e2"; }
        else if (status === "Pågår") { color = "#eab308"; bg = "#fef9c3"; }
        else if (status === "Utbedret") { color = "#3b82f6"; bg = "#dbeafe"; }
        else if (status === "Lukket") { color = "#10b981"; bg = "#dcfce7"; }

        return (
            <span style={{
                padding: "0.25rem 0.75rem",
                borderRadius: "99px",
                fontSize: "0.75rem",
                fontWeight: "600",
                backgroundColor: bg,
                color: color
            }}>
                {status}
            </span>
        );
    };

    return (
        <main className="container" style={{ paddingTop: "2rem", paddingBottom: "6rem" }}>
            <Link href={`/projects/details?id=${project.id}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--muted-foreground)", marginBottom: "1rem" }}>
                <ArrowLeft size={16} /> Tilbake til prosjekt
            </Link>

            <div className="flex-between" style={{ marginBottom: "2rem" }}>
                <div>
                    <h1 style={{ marginBottom: "0.5rem" }}>Avvik: {project.name}</h1>
                    <p style={{ color: "var(--muted-foreground)" }}>Registrer og følg opp uønskede hendelser</p>
                </div>
                <Link href={`/projects/deviations/new?projectId=${project.id}`} className="btn btn-primary">
                    <Plus size={16} style={{ marginRight: "0.5rem" }} /> Nytt Avvik
                </Link>
            </div>

            {deviations.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "3rem", color: "var(--muted-foreground)" }}>
                    <p>Ingen avvik registrert på dette prosjektet.</p>
                </div>
            ) : (
                <div style={{ display: "grid", gap: "1rem" }}>
                    {deviations.map(dev => (
                        <Link key={dev.id} href={`/projects/deviations/details?id=${dev.id}`} style={{ textDecoration: "none" }}>
                            <div className="card hover-effect">
                                <div className="flex-between">
                                    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                                        <div style={{
                                            backgroundColor: getSeverityColor(dev.severity) + "20",
                                            padding: "0.75rem", borderRadius: "12px",
                                            color: getSeverityColor(dev.severity)
                                        }}>
                                            <AlertTriangle size={24} />
                                        </div>
                                        <div>
                                            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.25rem" }}>
                                                <h3 style={{ margin: 0, fontSize: "1.1rem" }}>{dev.title}</h3>
                                                <span style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", border: "1px solid var(--border)", padding: "0 0.4rem", borderRadius: "4px" }}>
                                                    {dev.category}
                                                </span>
                                            </div>
                                            <p style={{ margin: 0, color: "var(--muted-foreground)", fontSize: "0.9rem" }}>
                                                {new Date(dev.createdAt).toLocaleDateString()} • {dev.location?.text || "Ingen stedsangivelse"}
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
                                        {getStatusBadge(dev.status)}
                                        {dev.dueDate && (
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", color: new Date(dev.dueDate) < new Date() && dev.status !== "Lukket" ? "var(--destructive)" : "var(--muted-foreground)" }}>
                                                <Clock size={12} /> Frist: {new Date(dev.dueDate).toLocaleDateString()}
                                            </div>
                                        )}
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

export default function DeviationsPage() {
    return (
        <Suspense fallback={<div className="container" style={{ paddingTop: "2rem" }}>Laster...</div>}>
            <DeviationsList />
        </Suspense>
    );
}
