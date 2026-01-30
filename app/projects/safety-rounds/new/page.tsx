"use client";

import { addSafetyRound, getProjects } from "@/lib/data";
import { Project, SafetyRound, SafetyRoundItem } from "@/lib/types";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight, ClipboardCheck } from "lucide-react";

const STANDARD_ITEMS: Omit<SafetyRoundItem, "id" | "status" | "comment" | "photoUrl">[] = [
    { category: "Orden og Renhold", question: "Er byggeplassen ryddig og fri for søppel?" },
    { category: "Orden og Renhold", question: "Er adkomstveier frie for hindringer?" },
    { category: "Stillas og Arbeid i høyden", question: "Er stillas forskriftsmessig montert og kontrollert (Grønt kort)?" },
    { category: "Stillas og Arbeid i høyden", question: "Er rekkverk/fallsikring på plass der det kreves?" },
    { category: "Verneutstyr (PPE)", question: "Bruker alle påbudt verneutstyr (Hjelm, vernesko, synlighetstøy)?" },
    { category: "El-sikkerhet", question: "Er skjøteledninger hengt opp og i god stand?" },
    { category: "Brannvern", question: "Er slukkeutstyr tilgjengelig og kontrollert?" },
    { category: "Kjemikalier", question: "Finnes datablader for kjemikalier på stedet?" },
];

function NewSafetyRoundContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const projectId = searchParams.get("projectId");

    const [project, setProject] = useState<Project | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [participants, setParticipants] = useState("");

    useEffect(() => {
        if (projectId) {
            getProjects().then(projects => {
                const found = projects.find(p => p.id === projectId);
                if (found) setProject(found);
                setLoading(false);
            });
        }
    }, [projectId]);

    const handleCreate = async () => {
        if (!project) return;

        const items: SafetyRoundItem[] = STANDARD_ITEMS.map(item => ({
            id: crypto.randomUUID(),
            ...item,
            status: "OK", // Default to OK
            comment: "",
            photoUrl: ""
        }));

        const newRound: SafetyRound = {
            id: crypto.randomUUID(),
            projectId: project.id,
            date: new Date().toISOString(),
            status: "Utkast",
            description: "Ordinær Vernerunde",
            participants,
            items
        };

        await addSafetyRound(newRound);
        router.push(`/projects/safety-rounds/details?id=${newRound.id}&projectId=${project.id}`);
    };

    if (loading) return <div className="container" style={{ paddingTop: "2rem" }}>Laster...</div>;
    if (!project) return <div className="container" style={{ paddingTop: "2rem" }}>Prosjekt ikke funnet</div>;

    return (
        <main className="container" style={{ paddingTop: "2rem", paddingBottom: "6rem" }}>
            <Link href={`/projects/safety-rounds?projectId=${project.id}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--muted-foreground)", marginBottom: "1rem" }}>
                <ArrowLeft size={16} /> Avbryt
            </Link>

            <h1 style={{ marginBottom: "2rem" }}>Ny Vernerunde</h1>

            <div className="card" style={{ maxWidth: "600px" }}>
                <h2 style={{ fontSize: "1.2rem", marginBottom: "1.5rem" }}>Start ny runde</h2>

                <div className="form-group">
                    <label>Deltakere (Hvem går runden?)</label>
                    <input
                        type="text"
                        className="input"
                        placeholder="Navn på deltakere..."
                        value={participants}
                        onChange={e => setParticipants(e.target.value)}
                    />
                </div>

                <div className="alert-box" style={{ margin: "1.5rem 0", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534" }}>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.5rem" }}>
                        <ClipboardCheck size={20} />
                        <strong>Standard Sjekkliste</strong>
                    </div>
                    <p style={{ fontSize: "0.9rem" }}>
                        Vi oppretter en sjekkliste med {STANDARD_ITEMS.length} standardpunkter for orden, stillas, brannvern og mer.
                    </p>
                </div>

                <button
                    className="btn btn-primary"
                    style={{ width: "100%", justifyContent: "center" }}
                    onClick={handleCreate}
                >
                    Start Vernerunde <ChevronRight size={16} />
                </button>
            </div>
        </main>
    );
}

export default function NewSafetyRoundPage() {
    return (
        <Suspense fallback={<div className="container" style={{ paddingTop: "2rem" }}>Laster...</div>}>
            <NewSafetyRoundContent />
        </Suspense>
    );
}
