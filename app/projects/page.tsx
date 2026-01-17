import { getProjects } from "@/lib/data";
import Link from "next/link";
import { Plus, Search } from "lucide-react";

export default async function ProjectsPage() {
    const projects = await getProjects();

    return (
        <main className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
            <div className="flex-between" style={{ marginBottom: "2rem" }}>
                <div>
                    <h1>Prosjekter</h1>
                    <p style={{ color: "var(--muted-foreground)" }}>Administrer dine byggprosjekter</p>
                </div>
                <button className="btn btn-primary" style={{ gap: "0.5rem" }}>
                    <Plus size={18} /> Nytt Prosjekt
                </button>
            </div>

            <div style={{ marginBottom: "2rem", position: "relative" }}>
                <input
                    type="text"
                    placeholder="Søk i prosjekter..."
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

            <div style={{ display: "grid", gap: "1rem" }}>
                {projects.map(project => (
                    <Link key={project.id} href={`/projects/${project.id}`} style={{ textDecoration: "none" }}>
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
                                    <h3 style={{ fontSize: "1.25rem" }}>{project.name}</h3>
                                    <p style={{ color: "var(--muted-foreground)" }}>{project.address}</p>
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
                                <div style={{ textAlign: "right" }}>
                                    <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>Budsjett</p>
                                    <p style={{ fontWeight: "600" }}>{(project.budgetExVAT / 1000).toLocaleString()}k</p>
                                </div>
                                <div style={{ width: "120px" }}>
                                    <div className="flex-between" style={{ marginBottom: "0.5rem" }}>
                                        <span style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>Brukt</span>
                                        <span style={{ fontWeight: "600" }}>{Math.round((project.spentExVAT / project.budgetExVAT) * 100)}%</span>
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
                ))}
            </div>
        </main>
    );
}
