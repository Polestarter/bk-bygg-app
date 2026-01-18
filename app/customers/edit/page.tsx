"use client";

import CustomerForm from "../new/CustomerForm";
import { getCustomer } from "@/lib/db";
import { Customer } from "@/lib/types";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";

function EditCustomerContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = searchParams.get("id");
    const [customer, setCustomer] = useState<Customer | undefined>(undefined);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            getCustomer(id).then((cust) => {
                setCustomer(cust);
                setLoading(false);
            });
        } else {
            setLoading(false);
            router.push("/customers");
        }
    }, [id, router]);

    if (loading) {
        return (
            <main className="container" style={{ paddingTop: "2rem" }}>
                <p>Laster kundedata...</p>
            </main>
        );
    }

    if (!customer) {
        return (
            <main className="container" style={{ paddingTop: "2rem" }}>
                <h1>Kunde ikke funnet</h1>
                <Link href="/customers" className="btn btn-primary">Tilbake</Link>
            </main>
        );
    }

    return <CustomerForm initialData={customer} />;
}

export default function EditCustomerPage() {
    return (
        <Suspense fallback={<div className="container" style={{ paddingTop: "2rem" }}>Laster...</div>}>
            <EditCustomerContent />
        </Suspense>
    );
}
