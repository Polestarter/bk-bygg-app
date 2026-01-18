"use client";

import { getOffers, getCustomers } from "@/lib/db";
import OfferWizard from "@/app/projects/details/new-offer/OfferWizard";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Offer, Customer } from "@/lib/types";

function EditOfferContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    const [offer, setOffer] = useState<Offer | undefined>(undefined);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            Promise.all([getOffers(), getCustomers()]).then(([offers, custs]) => {
                const found = offers.find(o => o.id === id);
                setOffer(found);
                setCustomers(custs);
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, [id]);

    if (loading) return <div className="container" style={{ paddingTop: "2rem" }}>Laster...</div>;
    if (!offer) return <div className="container" style={{ paddingTop: "2rem" }}>Ikke funnet</div>;

    return (
        <main className="container" style={{ paddingTop: "2rem" }}>
            <h1 style={{ marginBottom: "2rem" }}>Revider Tilbud</h1>
            <OfferWizard customers={customers} initialData={offer} />
        </main>
    );
}

export default function EditOfferPage() {
    return (
        <Suspense fallback={<div className="container" style={{ paddingTop: "2rem" }}>Laster...</div>}>
            <EditOfferContent />
        </Suspense>
    );
}
