"use client";


import { getProjects, getCustomer, getChecklistTemplates, getChecklists, deleteProject } from "@/lib/db";
import { Project, Customer, ChecklistTemplate, Checklist } from "@/lib/types";
import Link from "next/link";
import { ArrowLeft, CheckSquare, Clock, Banknote, Calendar, Building2, MapPin, Edit, Trash2 } from "lucide-react";
import DocumentList from "./DocumentList";
import EconomyDetails from "./EconomyDetails";
import TimeTracking from "./TimeTracking";
import NewChecklistButton from "./NewChecklistButton";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function ProjectDetailsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = searchParams.get("id");

    const [project, setProject] = useState<Project | undefined>(undefined);
    const [customer, setCustomer] = useState<Customer | undefined>(undefined);
    const [checklistTemplates, setChecklistTemplates] = useState<ChecklistTemplate[]>([]);
    const [projectChecklists, setProjectChecklists] = useState<Checklist[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            getProjects().then(async (projects) => {
                const foundProject = projects.find(p => p.id === id);
                if (foundProject) {
                    setProject(foundProject);

                    const [cust, templates, allChecklists] = await Promise.all([
                        getCustomer(foundProject.customerId),
                        getChecklistTemplates(),
                        getChecklists()
                    ]);

                    setCustomer(cust);
                    setChecklistTemplates(templates);
                    setProjectChecklists(allChecklists.filter(c => c.projectId === foundProject.id));
                }
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, [id]);

    const handleDelete = async () => {
        if (!project) return;
        if (confirm("Er du sikker på at du vil slette dette prosjektet? Dette kan ikke angres.")) {
            await deleteProject(project.id);
            router.push("/projects");
            router.refresh();
        }
    };

    if (loading) {
        return (
            <main className="container" style={{ paddingTop: "2rem" }}>
                <p>Laster prosjektdata...</p>
            </main>
        );
    }

    if (!project) {
        return (
            <main className="container" style={{ paddingTop: "2rem" }}>
                <h1>Prosjekt ikke funnet</h1>
                <Link href="/projects" className="btn btn-primary" style={{ marginTop: "1rem" }}>Tilbake til oversikt</Link>
            </main>
        );
    }

    const totalTimeCost = (project.timeEntries || []).reduce((sum, t) => sum + (t.hours * t.hourlyRate), 0);
    const totalExtras = (project.extras || []).reduce((sum, e) => sum + e.amount, 0);
    const totalRevenue = project.budgetExVAT + totalExtras;
    const profit = totalRevenue - project.spentExVAT - totalTimeCost;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

    const refreshProject = async () => {
        if (!id) return;
        const projects = await getProjects();
        const foundProject = projects.find(p => p.id === id);
        if (foundProject) {
            setProject(foundProject);
            // Optionally refresh other dependent data if needed, but project is main one for these components
        }
    };

    return (
        <main className="container" style={{ paddingTop: "2rem", paddingBottom: "6rem" }}>
            <Link href="/projects" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--muted-foreground)", marginBottom: "1rem" }}>
                <ArrowLeft size={16} /> Tilbake
            </Link>

            <div className="flex-between" style={{ marginBottom: "2rem", alignItems: "flex-start" }}>
                <div>
                    <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>{project.name}</h1>
                    <div style={{ display: "flex", gap: "1.5rem", color: "var(--muted-foreground)" }}>
                        {customer && (
                            <Link href={`/customers/details?id=${customer.id}`} style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--primary)", textDecoration: "none" }}>
                                <Building2 size={16} /> {customer.name}
                            </Link>
                        )}
                        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <MapPin size={16} /> {project.address}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <Calendar size={16} /> Start: {new Date(project.startDate).toLocaleDateString()}
                        </span>
                    </div>
                </div>
                <div style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginBottom: "0.5rem" }}>
                        <Link href={`/projects/edit?id=${project.id}`} className="btn btn-secondary" style={{ gap: "0.5rem" }}>
                            <Edit size={16} /> Rediger
                        </Link>
                        <button onClick={handleDelete} className="btn btn-destructive" style={{ gap: "0.5rem" }}>
                            <Trash2 size={16} /> Slett
                        </button>
                    </div>
                    <span style={{
                        padding: "0.5rem 1rem",
                        borderRadius: "99px",
                        backgroundColor: project.status === "Aktiv" ? "rgba(245, 158, 11, 0.1)" : "var(--secondary)",
                        color: project.status === "Aktiv" ? "var(--primary)" : "var(--foreground)",
                        border: project.status === "Aktiv" ? "1px solid var(--primary)" : "1px solid transparent",
                        fontWeight: "600"
                    }}>
                        {project.status}
                    </span>
                    <p style={{ marginTop: "0.5rem", fontSize: "0.875rem", color: "var(--muted-foreground)" }}>
                        Prismodell: {project.pricingType}
                    </p>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem", marginBottom: "3rem" }}>
                <div className="card">
                    <div className="flex-between" style={{ marginBottom: "0.5rem" }}>
                        <span style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>Budsjett brukt</span>
                        <span style={{ fontWeight: "600" }}>{Math.round((project.spentExVAT / totalRevenue) * 100)}%</span>
                    </div>
                    <div style={{ width: "100%", height: "8px", backgroundColor: "var(--secondary)", borderRadius: "99px", overflow: "hidden" }}>
                        <div style={{ width: `${Math.min(100, (project.spentExVAT / totalRevenue) * 100)}%`, height: "100%", backgroundColor: "var(--primary)", borderRadius: "99px" }}></div>
                    </div>
                </div>

                <div className="card">
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "1rem", color: "var(--muted-foreground)" }}>
                        <Banknote size={20} />
                        <span style={{ fontWeight: "500" }}>Økonomisk Resultat</span>
                    </div>
                    <div style={{ display: "grid", gap: "0.5rem" }}>
                        <div className="flex-between">
                            <span>Avtalt Pris (eks. mva)</span>
                            <span style={{ fontWeight: "600" }}>{(project.budgetExVAT).toLocaleString()} kr</span>
                        </div>
                        {totalExtras > 0 && (
                            <div className="flex-between" style={{ color: "#10b981" }}>
                                <span>+ Uforutsette Tillegg</span>
                                <span>+ {totalExtras.toLocaleString()} kr</span>
                            </div>
                        )}
                        <div className="flex-between" style={{ color: "var(--destructive)" }}>
                            <span>- Utgifter (Varer/Mat)</span>
                            <span>- {(project.spentExVAT).toLocaleString()} kr</span>
                        </div>
                        <div className="flex-between" style={{ color: "var(--destructive)" }}>
                            <span>- Timekostnad</span>
                            <span>- {totalTimeCost.toLocaleString()} kr</span>
                        </div>
                        <div style={{ height: "1px", backgroundColor: "var(--border)", margin: "0.5rem 0" }}></div>
                        <div className="flex-between" style={{ fontSize: "1.1rem" }}>
                            <span style={{ fontWeight: "bold" }}>Resultat</span>
                            <span style={{ fontWeight: "bold", color: profit >= 0 ? "#10b981" : "var(--destructive)" }}>
                                {profit.toLocaleString()} kr ({profitMargin.toFixed(1)}%)
                            </span>
                        </div>

                        <Link href={`/projects/details/new-offer?projectId=${project.id}`} className="btn btn-outline" style={{ width: "100%", marginTop: "1rem", textAlign: "center", display: "block" }}>
                            + Lag Tilbud
                        </Link>

                        <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", marginTop: "0.5rem", textAlign: "right" }}>
                            Inkl. mva: {(totalRevenue * 1.25).toLocaleString()} kr
                        </p>
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: "3rem" }}>
                <div className="flex-between" style={{ marginBottom: "1rem" }}>
                    <h2>Sjekklister</h2>
                    <NewChecklistButton projectId={project.id} templates={checklistTemplates} />
                </div>
                {projectChecklists.length > 0 ? (
                    <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
                        {projectChecklists.map(list => {
                            const completedCount = list.items.filter(i => i.status === "Safe" || i.status === "NA").length;
                            const totalCount = list.items.length;
                            const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                            return (
                                <Link key={list.id} href={`/checklists/details?id=${list.id}`} style={{ textDecoration: "none" }}>
                                    <div className="card" style={{ transition: "border-color 0.2s" }}>
                                        <div className="flex-between" style={{ marginBottom: "0.5rem" }}>
                                            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                                                <CheckSquare size={20} color="var(--primary)" />
                                                <h3 style={{ fontSize: "1rem", margin: 0 }}>{list.name}</h3>
                                            </div>
                                            <span style={{
                                                fontSize: "0.75rem", padding: "0.1rem 0.5rem", borderRadius: "99px",
                                                backgroundColor: list.status === "Fullført" ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)",
                                                color: list.status === "Fullført" ? "#10b981" : "var(--primary)"
                                            }}>
                                                {list.status}
                                            </span>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: "var(--muted-foreground)" }}>
                                            <div style={{ flex: 1, height: "4px", backgroundColor: "var(--secondary)", borderRadius: "99px" }}>
                                                <div style={{ width: `${percentage}%`, height: "100%", backgroundColor: list.status === "Fullført" ? "#10b981" : "var(--primary)", borderRadius: "99px" }}></div>
                                            </div>
                                            <span>{percentage}%</span>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                ) : (
                    <div className="card">
                        <p style={{ color: "var(--muted-foreground)", fontStyle: "italic" }}>Ingen sjekklister opprettet for dette prosjektet enda.</p>
                    </div>
                )}
            </div>

            <TimeTracking project={project} onUpdate={refreshProject} />
            <DocumentList project={project} />
            <EconomyDetails project={project} onUpdate={refreshProject} />
        </main>
    );
}

export default function ProjectDetailsPage() {
    return (
        <Suspense fallback={<div className="container" style={{ paddingTop: "2rem" }}>Laster...</div>}>
            <ProjectDetailsContent />
        </Suspense>
    );
}
