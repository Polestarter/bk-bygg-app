"use client";

import { getChecklist } from "@/lib/data";
import ChecklistDetailClient from "../new/ChecklistDetailClient";
// The import path needs to be adjusted because we are in app/checklists/details
// ".." is app/checklists. "new" is app/checklists/new.
// So "../new/ChecklistDetailClient" is correct relative to "app/checklists/details/page.tsx".
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Checklist } from "@/lib/types";

function ChecklistDetailContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    const [checklist, setChecklist] = useState<Checklist | undefined>(undefined);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            getChecklist(id).then((found) => {
                setChecklist(found);
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, [id]);

    if (loading) {
        return (
            <main className="container" style={{ paddingTop: "2rem" }}>
                <p>Laster sjekkliste...</p>
            </main>
        );
    }

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

export default function ChecklistDetailPage() {
    return (
        <Suspense fallback={<div className="container" style={{ paddingTop: "2rem" }}>Laster...</div>}>
            <ChecklistDetailContent />
        </Suspense>
    );
}
