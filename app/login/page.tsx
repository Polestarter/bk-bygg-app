"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { Lock, Mail, Loader2 } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { session } = useAuth();

    useEffect(() => {
        if (session) {
            router.push("/");
        }
    }, [session, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            router.push("/");
            router.refresh(); // Ensure state updates

        } catch (err) {
            setError((err as any).message || "Innlogging feilet");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            backgroundColor: "var(--background)",
            padding: "1rem"
        }}>
            <div className="card" style={{ width: "100%", maxWidth: "400px", padding: "2rem" }}>
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <div style={{
                        width: "50px", height: "50px",
                        backgroundColor: "var(--primary)",
                        borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        margin: "0 auto 1rem auto",
                        color: "white"
                    }}>
                        <Lock size={24} />
                    </div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>B&K Bygg</h1>
                    <p style={{ color: "var(--muted-foreground)" }}>Logg inn for å få tilgang</p>
                </div>

                {error && (
                    <div style={{
                        backgroundColor: "#fee2e2",
                        color: "#ef4444",
                        padding: "0.75rem",
                        borderRadius: "var(--radius)",
                        marginBottom: "1rem",
                        fontSize: "0.875rem"
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} style={{ display: "grid", gap: "1rem" }}>
                    <div>
                        <label className="label">E-post</label>
                        <div style={{ position: "relative" }}>
                            <Mail size={18} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                className="input"
                                style={{ paddingLeft: "2.5rem", width: "100%" }}
                                placeholder="din@epost.no"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="label">Passord</label>
                        <div style={{ position: "relative" }}>
                            <Lock size={18} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                className="input"
                                style={{ paddingLeft: "2.5rem", width: "100%" }}
                                placeholder="******"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}
                    >
                        {loading && <Loader2 className="animate-spin" size={18} style={{ marginRight: "0.5rem" }} />}
                        Logg inn
                    </button>
                </form>
            </div>
        </div>
    );
}
