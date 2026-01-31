"use client";

import { getProjects, getUsers } from "@/lib/data";
import { Project, User } from "@/lib/types";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("Alle");
    const [typeFilter, setTypeFilter] = useState("Alle");
    const [leaderFilter, setLeaderFilter] = useState("Alle");

    useEffect(() => {
        Promise.all([
            getProjects(),
            getUsers()
        ]).then(([data, userData]) => {
            setProjects(data);
            setUsers(userData);
            setLoading(false);
        });
    }, []);

    const filteredProjects = projects.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.address.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "Alle" || p.status === statusFilter;
        // Handle undefined projectType safely
        const matchesType = typeFilter === "Alle" || (p.projectType && p.projectType.toLowerCase() === typeFilter.toLowerCase());
        const matchesLeader = leaderFilter === "Alle" || p.projectLeaderId === leaderFilter;

        return matchesSearch && matchesStatus && matchesType && matchesLeader;
    });

    if (loading) {
        return (
            <main className="container" style={{ paddingTop: "2rem" }}>
                <p>Laster prosjekter...</p>
            </main>
        );
    }

    const projectLeaders = users.filter(u => u.role === "project_leader" || u.role === "admin");

    return (
        <main className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
            <div className="flex-between" style={{ marginBottom: "2rem" }}>
                <div>
                    <h1>Prosjekter</h1>
                    <p style={{ color: "var(--muted-foreground)" }}>Administrer dine byggprosjekter</p>
                </div>
                <Link href="/projects/new" className="btn btn-primary" style={{ gap: "0.5rem", display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
                    <Plus size={18} /> Nytt Prosjekt
                </Link>
            </div>

            {/* Filters */}
            <div style={{ marginBottom: "2rem", display: "grid", gap: "1rem" }}>
                <div style={{ position: "relative" }}>
                    <input
                        type="text"
                        placeholder="Søk i prosjekter..."
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

                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="input"
                        style={{ minWidth: "150px" }}
                    >
                        <option value="Alle">Alle Statuser</option>
                        <option value="Aktiv">Aktiv</option>
                        <option value="Planlagt">Planlagt</option>
                        <option value="Fullført">Fullført</option>
                    </select>

                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="input"
                        style={{ minWidth: "150px" }}
                    >
                        <option value="Alle">Alle Typer</option>
                        <option value="rehab">Rehab</option>
                        <option value="nybygg">Nybygg</option>
                        <option value="service">Service</option>
                    </select>

                    <select
                        value={leaderFilter}
                        onChange={(e) => setLeaderFilter(e.target.value)}
                        className="input"
                        style={{ minWidth: "150px" }}
                    >
                        <option value="Alle">Alle Prosjektledere</option>
                        {projectLeaders.map(u => (
                            <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div style={{ display: "grid", gap: "1rem" }}>
                {filteredProjects.length === 0 ? (
                    <div className="card" style={{ padding: "2rem", textAlign: "center", color: "var(--muted-foreground)" }}>
                        Ingen prosjekter funnet.
                    </div>
                ) : (
                    filteredProjects.map(project => (
                        <Link key={project.id} href={`/projects/details?id=${project.id}`} style={{ textDecoration: "none" }}>
                            <div className="card flex-between" style={{ transition: "border-color 0.2s" }}>
                                <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                                    <div style={{
                                        width: "56px", height: "56px",
                                        borderRadius: "var(--radius)",
                                        backgroundColor: "var(--background)",
                                        border: "1px solid var(--border)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontWeight: "bold", fontSize: "1.25rem", color: "var(--muted-foreground)"
                                    }}>
                                        {project.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                            <h3 style={{ fontSize: "1.25rem", margin: 0 }}>{project.name}</h3>
                                            {project.projectType && (
                                                <span style={{
                                                    fontSize: "0.7rem", padding: "2px 6px", borderRadius: "4px",
                                                    backgroundColor: "var(--secondary)", color: "var(--secondary-foreground)", textTransform: "capitalize"
                                                }}>
                                                    {project.projectType}
                                                </span>
                                            )}
                                        </div>
                                        <p style={{ color: "var(--muted-foreground)", margin: 0 }}>{project.address}</p>
                                    </div>
                                </div>

                                <div style={{ display: "flex", gap: "2rem", alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
                                    <div className="hide-on-mobile" style={{ textAlign: "right" }}>
                                        <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)", margin: 0 }}>Budsjett</p>
                                        <p style={{ fontWeight: "600", margin: 0 }}>{(project.budgetExVAT / 1000).toLocaleString()}k</p>
                                    </div>
                                    <div style={{ width: "120px" }}>
                                        <div className="flex-between" style={{ marginBottom: "0.5rem" }}>
                                            <span style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>Brukt</span>
                                            <span style={{ fontWeight: "600" }}>{Math.round((project.spentExVAT / project.budgetExVAT) * 100) || 0}%</span>
                                        </div>
                                        <div style={{ width: "100%", height: "8px", backgroundColor: "var(--secondary)", borderRadius: "99px", overflow: "hidden" }}>
                                            <div style={{ width: `${Math.min(100, (project.spentExVAT / project.budgetExVAT) * 100)}%`, height: "100%", backgroundColor: "var(--primary)", borderRadius: "99px" }}></div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <span style={{
                                            padding: "0.25rem 0.75rem",
                                            borderRadius: "99px",
                                            backgroundColor: project.status === "Aktiv" ? "rgba(245, 158, 11, 0.1)" : "var(--secondary)",
                                            color: project.status === "Aktiv" ? "var(--primary)" : "var(--foreground)",
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
        </main>
    );
}
