"use client";

import { getSJAs } from "@/lib/data";
import { getProjects } from "@/lib/data";
import { Project, SJA } from "@/lib/types";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Plus, Calendar, User, FileText } from "lucide-react";

function ProjectSJAListContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const projectId = searchParams.get("projectId");

    const [project, setProject] = useState<Project | undefined>(undefined);
    const [sjas, setSjas] = useState<SJA[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (projectId) {
            getProjects().then(async (projects) => {
                const foundProject = projects.find(p => p.id === projectId);
                if (foundProject) {
                    setProject(foundProject);
                    const projectSjas = await getSJAs(projectId);
                    setSjas(projectSjas);
                }
                setLoading(false);
            });
        } else {
            setLoading(false);
            router.push("/projects");
        }
    }, [projectId, router]);

    if (loading) {
        return (
            <main className="container" style={{ paddingTop: "2rem" }}>
                <p>Laster SJA-oversikt...</p>
            </main>
        );
    }

    if (!project) {
        return (
            <main className="container" style={{ paddingTop: "2rem" }}>
                <h1>Prosjekt ikke funnet</h1>
                <Link href="/projects" className="btn btn-primary">Tilbake</Link>
            </main>
        );
    }

    return (
        <main className="container" style={{ paddingTop: "2rem", paddingBottom: "6rem" }}>
            <Link href={`/projects/details?id=${project.id}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--muted-foreground)", marginBottom: "1rem" }}>
                <ArrowLeft size={16} /> Tilbake til prosjekt
            </Link>

            <div className="flex-between" style={{ marginBottom: "2rem" }}>
                <div>
                    <h1 style={{ marginBottom: "0.5rem" }}>Sikker Jobb Analyse (SJA)</h1>
                    <p style={{ color: "var(--muted-foreground)" }}>Prosjekt: {project.name}</p>
                </div>
                <Link href={`/projects/sja/new?projectId=${project.id}`} className="btn btn-primary" style={{ gap: "0.5rem" }}>
                    <Plus size={16} /> Ny SJA
                </Link>
            </div>

            {sjas.length > 0 ? (
                <div style={{ display: "grid", gap: "1rem" }}>
                    {sjas.map(sja => (
                        <Link key={sja.id} href={`/projects/sja/details?id=${sja.id}&projectId=${project.id}`} style={{ textDecoration: "none" }}>
                            <div className="card" style={{ transition: "border-color 0.2s" }}>
                                <div className="flex-between" style={{ marginBottom: "0.5rem" }}>
                                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                                        <ShieldCheck size={20} color={sja.status === "Signert" ? "#10b981" : "var(--primary)"} />
                                        <h3 style={{ fontSize: "1.1rem", margin: 0 }}>{sja.location || "Uten stedsnavn"}</h3>
                                    </div>
                                    <span style={{
                                        fontSize: "0.75rem", padding: "0.1rem 0.5rem", borderRadius: "99px",
                                        backgroundColor: sja.status === "Signert" ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)",
                                        color: sja.status === "Signert" ? "#10b981" : "var(--primary)"
                                    }}>
                                        {sja.status}
                                    </span>
                                </div>
                                <p style={{ color: "var(--foreground)", marginBottom: "0.5rem" }}>{sja.description}</p>
                                <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.875rem", color: "var(--muted-foreground)" }}>
                                    <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <Calendar size={14} /> {new Date(sja.date).toLocaleDateString()}
                                    </span>
                                    <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <User size={14} /> {sja.participants.split(',').length} deltakere
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
                    <ShieldCheck size={48} color="var(--muted-foreground)" style={{ marginBottom: "1rem", opacity: 0.5 }} />
                    <h3 style={{ marginBottom: "0.5rem" }}>Ingen SJA opprettet</h3>
                    <p style={{ color: "var(--muted-foreground)", marginBottom: "1.5rem" }}>Opprett en SJA for å dokumentere risikovurdering for dette prosjektet.</p>
                    <Link href={`/projects/sja/new?projectId=${project.id}`} className="btn btn-primary">
                        Opprett første SJA
                    </Link>
                </div>
            )}
        </main>
    );
}

export default function ProjectSJAListPage() {
    return (
        <Suspense fallback={<div className="container" style={{ paddingTop: "2rem" }}>Laster...</div>}>
            <ProjectSJAListContent />
        </Suspense>
    );
}
