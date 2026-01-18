"use client";

import { getProjects, Project } from "@/lib/data";
import OfferWizard from "./OfferWizard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function NewOfferContent() {
    const searchParams = useSearchParams();
    const projectId = searchParams.get("projectId");

    const [project, setProject] = useState<Project | undefined>(undefined);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (projectId) {
            getProjects().then((projects) => {
                const found = projects.find(p => p.id === projectId);
                setProject(found);
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, [projectId]);

    if (loading) {
        return (
            <main className="container" style={{ paddingTop: "2rem" }}>
                <p>Laster prosjekt...</p>
            </main>
        );
    }

    if (!project) return (
        <main className="container" style={{ paddingTop: "2rem" }}>
            <div>Prosjekt ikke funnet (ID: {projectId})</div>
            <Link href="/projects" className="btn btn-primary" style={{ marginTop: "1rem" }}>Tilbake til prosjekter</Link>
        </main>
    );

    return (
        <main className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
            <Link href={`/projects/details?id=${project.id}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--muted-foreground)", marginBottom: "1rem" }}>
                <ArrowLeft size={16} /> Tilbake til prosjekt
            </Link>

            <h1 style={{ marginBottom: "2rem" }}>Opprett Nytt Tilbud</h1>

            <OfferWizard project={project} />
        </main>
    );
}

export default function NewOfferPage() {
    return (
        <Suspense fallback={<div className="container" style={{ paddingTop: "2rem" }}>Laster...</div>}>
            <NewOfferContent />
        </Suspense>
    );
}
