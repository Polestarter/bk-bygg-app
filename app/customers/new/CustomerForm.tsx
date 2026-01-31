"use client";

import { addCustomer, updateCustomer, getUsers } from "@/lib/data";
import { Customer, User } from "@/lib/types";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface CustomerFormProps {
    initialData?: Customer;
}

export default function CustomerForm({ initialData }: CustomerFormProps) {
    const router = useRouter();
    const isEditing = !!initialData;
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        getUsers().then(u => {
            setUsers(u);
            const admin = u.find(user => user.role === "admin");
            if (admin) setCurrentUser(admin);
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        const userId = currentUser?.id || users[0]?.id;
        if (!userId) {
            alert("Mangler bruker-ID for logging. Kan ikke lagre.");
            setLoading(false);
            return;
        }

        const customerData: Customer = {
            id: initialData?.id || Math.random().toString(36).substring(2, 9),
            companyId: initialData?.companyId || users[0]?.companyId,
            name: formData.get("name") as string,
            email: formData.get("email") as string,
            phone: formData.get("phone") as string,
            address: formData.get("address") as string,
        };

        if (!customerData.name) {
            setLoading(false);
            return;
        }

        try {
            if (isEditing) {
                await updateCustomer(customerData, userId);
            } else {
                await addCustomer(customerData, userId);
            }
            router.push("/customers");
            router.refresh();
        } catch (error) {
            console.error("Failed to save customer", error);
            alert("Kunne ikke lagre kunde.");
            setLoading(false);
        }
    };

    return (
        <main className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem", maxWidth: "800px" }}>
            <Link href="/customers" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--muted-foreground)", marginBottom: "1rem" }}>
                <ArrowLeft size={16} /> Tilbake
            </Link>

            <div className="flex-between" style={{ marginBottom: "2rem" }}>
                <h1>{isEditing ? "Rediger Kunde" : "Ny Kunde"}</h1>
            </div>

            <form onSubmit={handleSubmit} className="card" style={{ display: "grid", gap: "1.5rem" }}>
                <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Navn</label>
                    <input
                        name="name"
                        defaultValue={initialData?.name}
                        type="text"
                        required
                        className="input"
                        placeholder="Ola Nordmann / Bedrift AS"
                        style={{ width: "100%", padding: "0.75rem", borderRadius: "var(--radius)", border: "1px solid var(--border)", backgroundColor: "var(--input)", color: "var(--foreground)" }}
                    />
                </div>

                <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>E-post</label>
                    <input
                        name="email"
                        defaultValue={initialData?.email}
                        type="email"
                        required
                        className="input"
                        placeholder="post@bedrift.no"
                        style={{ width: "100%", padding: "0.75rem", borderRadius: "var(--radius)", border: "1px solid var(--border)", backgroundColor: "var(--input)", color: "var(--foreground)" }}
                    />
                </div>

                <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Telefon</label>
                    <input
                        name="phone"
                        defaultValue={initialData?.phone}
                        type="tel"
                        required
                        className="input"
                        placeholder="123 45 678"
                        style={{ width: "100%", padding: "0.75rem", borderRadius: "var(--radius)", border: "1px solid var(--border)", backgroundColor: "var(--input)", color: "var(--foreground)" }}
                    />
                </div>

                <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Adresse</label>
                    <input
                        name="address"
                        defaultValue={initialData?.address}
                        type="text"
                        required
                        className="input"
                        placeholder="Gateadresse 1, 0000 Sted"
                        style={{ width: "100%", padding: "0.75rem", borderRadius: "var(--radius)", border: "1px solid var(--border)", backgroundColor: "var(--input)", color: "var(--foreground)" }}
                    />
                </div>

                <div style={{ paddingTop: "1rem", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end" }}>
                    <button type="submit" disabled={loading} className="btn btn-primary" style={{ gap: "0.5rem" }}>
                        <Save size={18} /> {loading ? "Lagrer..." : (isEditing ? "Oppdater Kunde" : "Lagre Kunde")}
                    </button>
                </div>
            </form>
        </main>
    );
}
