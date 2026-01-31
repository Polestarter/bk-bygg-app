import { getProjects, getCustomer, getChecklistTemplates, getChecklists, deleteProject, getUsers } from "@/lib/data";
import { Project, Customer, ChecklistTemplate, Checklist, User } from "@/lib/types";
import Link from "next/link";
import { ArrowLeft, CheckSquare, Clock, Banknote, Calendar, Building2, MapPin, Edit, Trash2, ShieldCheck, ClipboardCheck, AlertTriangle, User as UserIcon, PlusSquare } from "lucide-react";
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
    const [leader, setLeader] = useState<User | undefined>(undefined);
    const [currentUser, setCurrentUser] = useState<User | undefined>(undefined);
    const [checklistTemplates, setChecklistTemplates] = useState<ChecklistTemplate[]>([]);
    const [projectChecklists, setProjectChecklists] = useState<Checklist[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            Promise.all([
                getProjects(),
                getUsers(),
                getChecklistTemplates(),
                getChecklists()
            ]).then(async ([projects, users, templates, allChecklists]) => {
                const foundProject = projects.find(p => p.id === id);
                if (foundProject) {
                    setProject(foundProject);
                    setLeader(users.find(u => u.id === foundProject.projectLeaderId));
                    setChecklistTemplates(templates);
                    setProjectChecklists(allChecklists.filter(c => c.projectId === foundProject.id));

                    if (foundProject.customerId) {
                        const cust = await getCustomer(foundProject.customerId);
                        setCustomer(cust);
                    }
                }
                const admin = users.find(u => u.role === "admin");
                if (admin) setCurrentUser(admin);
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, [id]);

    const handleDelete = async () => {
        if (!project) return;
        if (confirm("Er du sikker på at du vil slette dette prosjektet? Dette kan ikke angres.")) {
            // Use current user ID or fallback
            const userId = currentUser?.id || "unknown";
            await deleteProject(project.id, userId);
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
    const unbilledExtras = (project.extras || []).filter(e => e.status === "Pending").length;

    // Revenue calculations
    const totalRevenue = project.budgetExVAT + totalExtras;
    const totalSpent = project.spentExVAT + totalTimeCost;
    const profit = totalRevenue - totalSpent;

    const refreshProject = async () => {
        if (!id) return;
        const projects = await getProjects();
        const foundProject = projects.find(p => p.id === id);
        if (foundProject) {
            setProject(foundProject);
        }
    };

    return (
        <main className="container" style={{ paddingTop: "2rem", paddingBottom: "6rem" }}>
            <Link href="/projects" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--muted-foreground)", marginBottom: "1rem" }}>
                <ArrowLeft size={16} /> Tilbake
            </Link>

            <div className="flex-between" style={{ marginBottom: "2rem", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
                        <h1 style={{ fontSize: "2.5rem", margin: 0 }}>{project.name}</h1>
                        <span style={{
                            padding: "0.25rem 0.75rem",
                            borderRadius: "99px",
                            backgroundColor: project.status === "Aktiv" ? "rgba(16, 185, 129, 0.1)" : "var(--secondary)",
                            color: project.status === "Aktiv" ? "#10b981" : "var(--foreground)",
                            border: `1px solid ${project.status === "Aktiv" ? "#10b981" : "var(--border)"}`,
                            fontWeight: "600",
                            fontSize: "0.875rem"
                        }}>
                            {project.status}
                        </span>
                    </div>

                    <div style={{ display: "flex", gap: "1.5rem", color: "var(--muted-foreground)", flexWrap: "wrap" }}>
                        {customer && (
                            <Link href={`/customers/details?id=${customer.id}`} style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--primary)", textDecoration: "none" }}>
                                <Building2 size={16} /> {customer.name}
                            </Link>
                        )}
                        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <MapPin size={16} /> {project.address}
                        </span>
                        {leader && (
                            <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <UserIcon size={16} /> {leader.firstName} {leader.lastName}
                            </span>
                        )}
                        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <Calendar size={16} /> {new Date(project.startDate).toLocaleDateString()}
                            {project.endDateEstimated && ` - ${new Date(project.endDateEstimated).toLocaleDateString()}`}
                        </span>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                        {project.projectType && <span className="badge">{project.projectType}</span>}
                        {project.contractType && <span className="badge">{project.contractType}</span>}
                    </div>
                </div>

                <div style={{ textAlign: "right", display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                    <Link href={`/projects/edit?id=${project.id}`} className="btn btn-secondary" style={{ gap: "0.5rem" }}>
                        <Edit size={16} /> Rediger
                    </Link>
                    <button onClick={handleDelete} className="btn btn-destructive" style={{ gap: "0.5rem" }}>
                        <Trash2 size={16} /> Slett
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>

                {/* 1. Status / Progress */}
                <div className="card">
                    <div className="flex-between" style={{ marginBottom: "0.5rem" }}>
                        <h3 style={{ fontSize: "1rem", color: "var(--muted-foreground)" }}>Fremdrift</h3>
                        <Clock size={20} color="var(--primary)" />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <div className="flex-between">
                            <span style={{ fontWeight: "600", fontSize: "1.5rem" }}>{project.status}</span>
                        </div>
                        <div style={{ width: "100%", height: "8px", backgroundColor: "var(--secondary)", borderRadius: "99px" }}>
                            <div style={{
                                width: project.status === "Fullført" ? "100%" : "50%",
                                height: "100%",
                                backgroundColor: project.status === "Aktiv" ? "var(--primary)" : "var(--muted)",
                                borderRadius: "99px"
                            }}></div>
                        </div>
                    </div>
                </div>

                {/* 2. Economy / Budget */}
                <div className="card">
                    <div className="flex-between" style={{ marginBottom: "0.5rem" }}>
                        <h3 style={{ fontSize: "1rem", color: "var(--muted-foreground)" }}>Økonomi</h3>
                        <Banknote size={20} color={totalSpent > totalRevenue ? "var(--destructive)" : "var(--primary)"} />
                    </div>
                    <div>
                        <div className="flex-between" style={{ alignItems: "baseline" }}>
                            <span style={{ fontWeight: "600", fontSize: "1.5rem" }}>{Math.round((totalSpent / totalRevenue) * 100) || 0}%</span>
                            <span style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>av budsjett</span>
                        </div>
                        <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>
                            Brukt: {totalSpent.toLocaleString()} / {totalRevenue.toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* 3. Extras */}
                <div className="card">
                    <div className="flex-between" style={{ marginBottom: "0.5rem" }}>
                        <h3 style={{ fontSize: "1rem", color: "var(--muted-foreground)" }}>Tillegg</h3>
                        <PlusSquare size={20} color="var(--primary)" />
                    </div>
                    <div>
                        <div className="flex-between" style={{ alignItems: "baseline" }}>
                            <span style={{ fontWeight: "600", fontSize: "1.5rem" }}>{unbilledExtras}</span>
                            <span style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>ubehandlede</span>
                        </div>
                        <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>
                            Verdi: {totalExtras.toLocaleString()} kr
                        </p>
                    </div>
                </div>
            </div>

            {/* Existing Lists */}
            <div style={{ marginBottom: "3rem" }}>
                <div className="flex-between" style={{ marginBottom: "1rem" }}>
                    <h2>HMS & Sikkerhet</h2>
                </div>
                {/* ... HMS Grid ... */}
                <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
                    <Link href={`/projects/sja?projectId=${project.id}`} style={{ textDecoration: "none" }}>
                        <div className="card hover-effect" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            <div style={{
                                width: "48px", height: "48px", borderRadius: "12px",
                                backgroundColor: "rgba(16, 185, 129, 0.1)", display: "flex",
                                alignItems: "center", justifyContent: "center"
                            }}>
                                <ShieldCheck size={24} color="#10b981" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: "1.1rem", margin: 0, marginBottom: "0.25rem" }}>Sikker Jobb Analyse (SJA)</h3>
                                <p style={{ margin: 0, color: "var(--muted-foreground)", fontSize: "0.875rem" }}>
                                    Risikovurdering, tiltak og signering
                                </p>
                            </div>
                        </div>
                    </Link>

                    <Link href={`/projects/safety-rounds?projectId=${project.id}`} style={{ textDecoration: "none" }}>
                        <div className="card hover-effect" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            <div style={{
                                width: "48px", height: "48px", borderRadius: "12px",
                                backgroundColor: "rgba(59, 130, 246, 0.1)", display: "flex", // Blue tint
                                alignItems: "center", justifyContent: "center"
                            }}>
                                <ClipboardCheck size={24} color="#3b82f6" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: "1.1rem", margin: 0, marginBottom: "0.25rem" }}>Vernerunder</h3>
                                <p style={{ margin: 0, color: "var(--muted-foreground)", fontSize: "0.875rem" }}>
                                    Inspeksjon, avvikshåndtering og bilder
                                </p>
                            </div>
                        </div>
                    </Link>

                    <Link href={`/projects/deviations?projectId=${project.id}`} style={{ textDecoration: "none" }}>
                        <div className="card hover-effect" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            <div style={{
                                width: "48px", height: "48px", borderRadius: "12px",
                                backgroundColor: "rgba(249, 115, 22, 0.1)", display: "flex", // Orange tint
                                alignItems: "center", justifyContent: "center"
                            }}>
                                <AlertTriangle size={24} color="#f97316" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: "1.1rem", margin: 0, marginBottom: "0.25rem" }}>Avvik</h3>
                                <p style={{ margin: 0, color: "var(--muted-foreground)", fontSize: "0.875rem" }}>
                                    Registrer uønskede hendelser
                                </p>
                            </div>
                        </div>
                    </Link>

                    <Link href={`/projects/hms?projectId=${project.id}`} style={{ textDecoration: "none" }}>
                        <div className="card hover-effect" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            <div style={{
                                width: "48px", height: "48px", borderRadius: "12px",
                                backgroundColor: "rgba(139, 92, 246, 0.1)", display: "flex", // Violet tint
                                alignItems: "center", justifyContent: "center"
                            }}>
                                <ShieldCheck size={24} color="#8b5cf6" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: "1.1rem", margin: 0, marginBottom: "0.25rem" }}>HMS Dokumenter</h3>
                                <p style={{ margin: 0, color: "var(--muted-foreground)", fontSize: "0.875rem" }}>
                                    SHA, SJA og sikkerhetsrutiner
                                </p>
                            </div>
                        </div>
                    </Link>
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
