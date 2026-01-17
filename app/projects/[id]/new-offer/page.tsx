import { getProjects } from "@/lib/db";
import OfferWizard from "./OfferWizard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewOfferPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const projects = await getProjects();
    const project = projects.find(p => p.id === id);

    if (!project) return <div>Prosjekt ikke funnet</div>;

    return (
        <main className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
            <Link href={`/projects/${id}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--muted-foreground)", marginBottom: "1rem" }}>
                <ArrowLeft size={16} /> Tilbake til prosjekt
            </Link>

            <h1 style={{ marginBottom: "2rem" }}>Opprett Nytt Tilbud</h1>

            <OfferWizard project={project} />
        </main>
    );
}
