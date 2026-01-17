import { getChecklists, getProjects } from "@/lib/data";
import Link from "next/link";
import { Plus, CheckSquare, Calendar, ArrowRight } from "lucide-react";

export default async function ChecklistsPage() {
    const checklists = await getChecklists();
    const projects = await getProjects();

    const getProjectName = (id: string) => projects.find(p => p.id === id)?.name || "Ukjent prosjekt";

    return (
        <main className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
            <div className="flex-between" style={{ marginBottom: "2rem" }}>
                <div>
                    <h1>Sjekklister</h1>
                    <p style={{ color: "var(--muted-foreground)" }}>Oversikt over alle kontroller og lister</p>
                </div>
                <Link href="/projects" className="btn btn-outline" style={{ gap: "0.5rem", textDecoration: "none" }}>
                    <Plus size={18} /> Gå til Prosjekt for å opprette
                </Link>
            </div>

            <div style={{ display: "grid", gap: "1rem" }}>
                {checklists.map(list => {
                    const completedCount = list.items.filter(i => i.status === "Safe" || i.status === "NA").length;
                    const totalCount = list.items.length;
                    const percentage = Math.round((completedCount / totalCount) * 100);

                    return (
                        <Link key={list.id} href={`/checklists/${list.id}`} style={{ textDecoration: "none" }}>
                            <div className="card" style={{ transition: "border-color 0.2s" }}>
                                <div className="flex-between" style={{ marginBottom: "1rem" }}>
                                    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                                        <CheckSquare size={24} color={list.status === "Fullført" ? "var(--primary)" : "var(--muted-foreground)"} />
                                        <div>
                                            <h3 style={{ fontSize: "1.1rem" }}>{list.name}</h3>
                                            <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>{getProjectName(list.projectId)}</p>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <span style={{
                                            padding: "0.25rem 0.75rem",
                                            borderRadius: "99px",
                                            backgroundColor: list.status === "Fullført" ? "rgba(16, 185, 129, 0.1)" : list.status === "Pågår" ? "rgba(245, 158, 11, 0.1)" : "var(--secondary)",
                                            color: list.status === "Fullført" ? "#10b981" : list.status === "Pågår" ? "var(--primary)" : "var(--foreground)",
                                            fontSize: "0.875rem",
                                            fontWeight: "500"
                                        }}>
                                            {list.status}
                                        </span>
                                    </div>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: "1rem", fontSize: "0.875rem", color: "var(--muted-foreground)" }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                                            <span>Fremdrift ({completedCount}/{totalCount})</span>
                                            <span>{percentage}%</span>
                                        </div>
                                        <div style={{ height: "6px", backgroundColor: "var(--secondary)", borderRadius: "99px", overflow: "hidden" }}>
                                            <div style={{ width: `${percentage}%`, height: "100%", backgroundColor: list.status === "Fullført" ? "#10b981" : "var(--primary)" }}></div>
                                        </div>
                                    </div>
                                    {list.dueDate && (
                                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", minWidth: "120px", justifyContent: "flex-end" }}>
                                            <Calendar size={16} />
                                            <span>Frist: {list.dueDate}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </main>
    );
}
