'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getFlipProjects, addFlipProject } from '@/lib/flip-db';
import { FlipProject } from '@/lib/flip-types';
import { Plus, Search, Calendar, ArrowRight, TrendingUp } from 'lucide-react';

export default function FlipListPage() {
    const [projects, setProjects] = useState<FlipProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [search, setSearch] = useState("");

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        setLoading(true);
        const data = await getFlipProjects();
        setProjects(data);
        setLoading(false);
    };

    const handleCreate = async () => {
        if (!newProjectName) return;

        const newProj: Partial<FlipProject> = {
            name: newProjectName,
            startDate: new Date().toISOString().split('T')[0],
            status: 'Planlagt',
            enableLaborPayout: true,
            laborDefaultRate: 500,
            treatCompanyPaymentsAsLoan: true,
            allowNegativeProfitSettlement: true,
            roundingMode: 'nearest'
        };

        await addFlipProject(newProj);
        setNewProjectName('');
        setIsCreateModalOpen(false);
        loadProjects();
    };

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.address && p.address.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <main className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
            <div className="flex-between" style={{ marginBottom: "2rem" }}>
                <div>
                    <h1>FlippeOppgjør</h1>
                    <p style={{ color: "var(--muted-foreground)" }}>Oversikt over flippe-prosjekter og oppgjør</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="btn btn-primary"
                    style={{ gap: "0.5rem" }}
                >
                    <Plus size={18} /> Nytt Prosjekt
                </button>
            </div>

            {/* Filters */}
            <div style={{ marginBottom: "2rem" }}>
                <div style={{ position: "relative" }}>
                    <input
                        type="text"
                        placeholder="Søk i flippe-prosjekter..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "0.75rem 1rem 0.75rem 2.5rem",
                            borderRadius: "var(--radius)",
                            border: "1px solid var(--border)",
                            backgroundColor: "var(--input)",
                            color: "var(--foreground)",
                            fontSize: "1rem"
                        }}
                    />
                    <Search size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
                </div>
            </div>

            {loading ? (
                <p>Laster prosjekter...</p>
            ) : (
                <div style={{ display: "grid", gap: "1rem" }}>
                    {filteredProjects.length === 0 ? (
                        <div className="card" style={{ padding: "2rem", textAlign: "center", color: "var(--muted-foreground)" }}>
                            Ingen prosjekter funnet.
                        </div>
                    ) : (
                        filteredProjects.map(project => (
                            <Link key={project.id} href={`/flip/details?id=${project.id}`} style={{ textDecoration: "none" }}>
                                <div className="card flex-between card-interactive">
                                    <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                                        <div style={{
                                            width: "56px", height: "56px",
                                            borderRadius: "var(--radius)",
                                            backgroundColor: "var(--secondary)",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            color: "var(--secondary-foreground)"
                                        }}>
                                            <TrendingUp size={24} />
                                        </div>
                                        <div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                <h3 style={{ fontSize: "1.25rem", margin: 0 }}>{project.name}</h3>
                                            </div>
                                            <p style={{ color: "var(--muted-foreground)", margin: 0 }}>{project.address || 'Ingen adresse'}</p>
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", gap: "2rem", alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
                                        <div className="hide-on-mobile" style={{ textAlign: "right" }}>
                                            <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)", margin: 0 }}>Oppstart</p>
                                            <p style={{ fontWeight: "500", margin: 0 }}>{project.startDate}</p>
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                            <span style={{
                                                padding: "0.25rem 0.75rem",
                                                borderRadius: "99px",
                                                backgroundColor: project.status === "Aktiv" ? "rgba(163, 230, 53, 0.2)" : "var(--secondary)",
                                                color: project.status === "Aktiv" ? "var(--primary-foreground)" : "var(--foreground)",
                                                border: project.status === "Aktiv" ? "1px solid var(--primary)" : "1px solid transparent",
                                                fontSize: "0.875rem",
                                                fontWeight: "500"
                                            }}>
                                                {project.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            )}

            {/* Create Modal - using inline styles to avoid external dependencies or complexity */}
            {isCreateModalOpen && (
                <div style={{
                    position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)",
                    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100
                }}>
                    <div className="card" style={{ width: "100%", maxWidth: "400px" }}>
                        <h2 style={{ marginBottom: "1rem" }}>Nytt Prosjekt</h2>
                        <div style={{ marginBottom: "1.5rem" }}>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: "500" }}>Prosjektnavn</label>
                            <input
                                type="text"
                                style={{
                                    width: "100%", padding: "0.5rem", borderRadius: "var(--radius)",
                                    border: "1px solid var(--border)", backgroundColor: "var(--input)"
                                }}
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                            />
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                            <button onClick={() => setIsCreateModalOpen(false)} className="btn btn-ghost">Avbryt</button>
                            <button onClick={handleCreate} className="btn btn-primary">Opprett</button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
