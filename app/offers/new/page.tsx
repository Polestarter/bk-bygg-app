"use client";

import { getCustomers } from "@/lib/db";
import OfferWizard from "@/app/projects/details/new-offer/OfferWizard";
import { useEffect, useState, Suspense } from "react";
import { Customer } from "@/lib/types";

function NewOfferContent() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCustomers().then((data) => {
            setCustomers(data);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <main className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
                <p>Laster...</p>
            </main>
        );
    }

    return (
        <main className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
            <h1 style={{ marginBottom: "2rem" }}>Nytt Tilbud</h1>
            <OfferWizard customers={customers} />
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
