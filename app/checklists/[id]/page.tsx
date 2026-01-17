import { getChecklist } from "@/lib/data";
import ChecklistDetailClient from "../new/ChecklistDetailClient";
import Link from "next/link";

export default async function ChecklistDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const checklist = await getChecklist(id);

    if (!checklist) {
        return (
            <main className="container" style={{ paddingTop: "2rem" }}>
                <h1>Sjekkliste ikke funnet</h1>
                <Link href="/checklists" className="btn btn-primary" style={{ marginTop: "1rem" }}>Tilbake til oversikt</Link>
            </main>
        );
    }

    return <ChecklistDetailClient initialChecklist={checklist} />;
}
