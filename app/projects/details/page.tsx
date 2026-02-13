"use client";

import {
    getProjects,
    getCustomer,
    getChecklistTemplates,
    getChecklists,
    deleteProject,
    getUsers,
} from "@/lib/data";
import { Project, Customer, ChecklistTemplate, Checklist, User } from "@/lib/types";
import Link from "next/link";
import {
    ArrowLeft,
    CheckSquare,
    Clock,
    Banknote,
    Calendar,
    Building2,
    MapPin,
    Edit,
    Trash2,
    ShieldCheck,
    ClipboardCheck,
    AlertTriangle,
    User as UserIcon,
    PlusSquare,
} from "lucide-react";
import DocumentList from "./DocumentList";
import EconomyDetails from "./EconomyDetails";
import TimeTracking from "./TimeTracking";
import NewChecklistButton from "./NewChecklistButton";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState, type ReactNode } from "react";

function SafetyLinkCard({
    href,
    title,
    description,
    icon,
    iconColor,
    iconBackground,
}: {
    href: string;
    title: string;
    description: string;
    icon: ReactNode;
    iconColor: string;
    iconBackground: string;
}) {
    return (
        <Link href={href} style={{ textDecoration: "none" }}>
            <div className="card hover-effect" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div
                    style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "12px",
                        backgroundColor: iconBackground,
                        color: iconColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {icon}
                </div>
                <div>
                    <h3 style={{ fontSize: "1.1rem", margin: 0, marginBottom: "0.25rem" }}>{title}</h3>
                    <p style={{ margin: 0, color: "var(--muted-foreground)", fontSize: "0.875rem" }}>{description}</p>
                </div>
            </div>
        </Link>
    );
}

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
        if (!id) {
            setLoading(false);
            return;
        }

        Promise.all([getProjects(), getUsers(), getChecklistTemplates(), getChecklists()]).then(
            async ([projects, users, templates, allChecklists]) => {
                const foundProject = projects.find((p) => p.id === id);
                if (foundProject) {
                    setProject(foundProject);
                    setLeader(users.find((u) => u.id === foundProject.projectLeaderId));
                    setChecklistTemplates(templates);
                    setProjectChecklists(allChecklists.filter((c) => c.projectId === foundProject.id));

                    if (foundProject.customerId) {
                        const foundCustomer = await getCustomer(foundProject.customerId);
                        setCustomer(foundCustomer);
                    }
                }

                const admin = users.find((u) => u.role === "admin");
                if (admin) {
                    setCurrentUser(admin);
                }
                setLoading(false);
            },
        );
    }, [id]);

    const handleDelete = async () => {
        if (!project) return;
        if (confirm("Er du sikker p\u00e5 at du vil slette dette prosjektet? Dette kan ikke angres.")) {
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
                <Link href="/projects" className="btn btn-primary" style={{ marginTop: "1rem" }}>
                    Tilbake til oversikt
                </Link>
            </main>
        );
    }

    const totalTimeCost = (project.timeEntries || []).reduce((sum, t) => sum + t.hours * t.hourlyRate, 0);
    const totalExtras = (project.extras || []).reduce((sum, e) => sum + e.amount, 0);
    const unbilledExtras = (project.extras || []).filter((e) => e.status === "Pending").length;
    const totalRevenue = project.budgetExVAT + totalExtras;
    const totalSpent = project.spentExVAT + totalTimeCost;
    const progressWidth = project.status === "Fullf\u00f8rt" ? "100%" : "50%";

    const refreshProject = async () => {
        if (!id) return;
        const projects = await getProjects();
        const foundProject = projects.find((p) => p.id === id);
        if (foundProject) {
            setProject(foundProject);
        }
    };

    return (
        <main className="container page-shell">
            <Link href="/projects" className="back-link">
                <ArrowLeft size={16} /> Tilbake
            </Link>

            <div className="flex-between" style={{ marginBottom: "2rem", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                        <h1 style={{ fontSize: "2.5rem", margin: 0 }}>{project.name}</h1>
                        <span
                            style={{
                                padding: "0.25rem 0.75rem",
                                borderRadius: "99px",
                                backgroundColor: project.status === "Aktiv" ? "rgba(16, 185, 129, 0.1)" : "var(--secondary)",
                                color: project.status === "Aktiv" ? "#10b981" : "var(--foreground)",
                                border: `1px solid ${project.status === "Aktiv" ? "#10b981" : "var(--border)"}`,
                                fontWeight: 600,
                                fontSize: "0.875rem",
                            }}
                        >
                            {project.status}
                        </span>
                    </div>

                    <div style={{ display: "flex", gap: "1.5rem", color: "var(--muted-foreground)", flexWrap: "wrap" }}>
                        {customer && (
                            <Link
                                href={`/customers/details?id=${customer.id}`}
                                style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--primary)" }}
                            >
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
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
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

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
                <div className="card">
                    <div className="flex-between" style={{ marginBottom: "0.5rem" }}>
                        <h3 style={{ fontSize: "1rem", color: "var(--muted-foreground)" }}>Fremdrift</h3>
                        <Clock size={20} color="var(--primary)" />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <div className="flex-between">
                            <span style={{ fontWeight: 600, fontSize: "1.5rem" }}>{project.status}</span>
                        </div>
                        <div style={{ width: "100%", height: "8px", backgroundColor: "var(--secondary)", borderRadius: "99px" }}>
                            <div
                                style={{
                                    width: progressWidth,
                                    height: "100%",
                                    backgroundColor: project.status === "Aktiv" ? "var(--primary)" : "var(--muted)",
                                    borderRadius: "99px",
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex-between" style={{ marginBottom: "0.5rem" }}>
                        <h3 style={{ fontSize: "1rem", color: "var(--muted-foreground)" }}>\u00d8konomi</h3>
                        <Banknote size={20} color={totalSpent > totalRevenue ? "var(--destructive)" : "var(--primary)"} />
                    </div>
                    <div>
                        <div className="flex-between" style={{ alignItems: "baseline" }}>
                            <span style={{ fontWeight: 600, fontSize: "1.5rem" }}>{Math.round((totalSpent / totalRevenue) * 100) || 0}%</span>
                            <span style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>av budsjett</span>
                        </div>
                        <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>
                            Brukt: {totalSpent.toLocaleString()} / {totalRevenue.toLocaleString()}
                        </p>
                    </div>
                </div>

                <div className="card">
                    <div className="flex-between" style={{ marginBottom: "0.5rem" }}>
                        <h3 style={{ fontSize: "1rem", color: "var(--muted-foreground)" }}>Tillegg</h3>
                        <PlusSquare size={20} color="var(--primary)" />
                    </div>
                    <div>
                        <div className="flex-between" style={{ alignItems: "baseline" }}>
                            <span style={{ fontWeight: 600, fontSize: "1.5rem" }}>{unbilledExtras}</span>
                            <span style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>ubehandlede</span>
                        </div>
                        <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>Verdi: {totalExtras.toLocaleString()} kr</p>
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: "3rem" }}>
                <div className="flex-between" style={{ marginBottom: "1rem" }}>
                    <h2>HMS & Sikkerhet</h2>
                </div>
                <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
                    <SafetyLinkCard
                        href={`/projects/sja?projectId=${project.id}`}
                        title="Sikker Jobb Analyse (SJA)"
                        description="Risikovurdering, tiltak og signering"
                        icon={<ShieldCheck size={24} />}
                        iconColor="#10b981"
                        iconBackground="rgba(16, 185, 129, 0.1)"
                    />
                    <SafetyLinkCard
                        href={`/projects/safety-rounds?projectId=${project.id}`}
                        title="Vernerunder"
                        description={`Inspeksjon, avviksh\u00e5ndtering og bilder`}
                        icon={<ClipboardCheck size={24} />}
                        iconColor="#3b82f6"
                        iconBackground="rgba(59, 130, 246, 0.1)"
                    />
                    <SafetyLinkCard
                        href={`/projects/deviations?projectId=${project.id}`}
                        title="Avvik"
                        description={`Registrer u\u00f8nskede hendelser`}
                        icon={<AlertTriangle size={24} />}
                        iconColor="#f97316"
                        iconBackground="rgba(249, 115, 22, 0.1)"
                    />
                    <SafetyLinkCard
                        href={`/projects/hms?projectId=${project.id}`}
                        title="HMS Dokumenter"
                        description="SHA, SJA og sikkerhetsrutiner"
                        icon={<ShieldCheck size={24} />}
                        iconColor="#8b5cf6"
                        iconBackground="rgba(139, 92, 246, 0.1)"
                    />
                </div>
            </div>

            <div style={{ marginBottom: "3rem" }}>
                <div className="flex-between" style={{ marginBottom: "1rem" }}>
                    <h2>Sjekklister</h2>
                    <NewChecklistButton projectId={project.id} templates={checklistTemplates} />
                </div>
                {projectChecklists.length > 0 ? (
                    <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
                        {projectChecklists.map((list) => {
                            const completedCount = list.items.filter((i) => i.status === "Safe" || i.status === "NA").length;
                            const totalCount = list.items.length;
                            const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

                            return (
                                <Link key={list.id} href={`/checklists/details?id=${list.id}`} style={{ textDecoration: "none" }}>
                                    <div className="card hover-effect">
                                        <div className="flex-between" style={{ marginBottom: "0.5rem" }}>
                                            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                                                <CheckSquare size={20} color="var(--primary)" />
                                                <h3 style={{ fontSize: "1rem", margin: 0 }}>{list.name}</h3>
                                            </div>
                                            <span
                                                style={{
                                                    fontSize: "0.75rem",
                                                    padding: "0.1rem 0.5rem",
                                                    borderRadius: "99px",
                                                    backgroundColor: list.status === "Fullf\u00f8rt" ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)",
                                                    color: list.status === "Fullf\u00f8rt" ? "#10b981" : "var(--primary)",
                                                }}
                                            >
                                                {list.status}
                                            </span>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: "var(--muted-foreground)" }}>
                                            <div style={{ flex: 1, height: "4px", backgroundColor: "var(--secondary)", borderRadius: "99px" }}>
                                                <div
                                                    style={{
                                                        width: `${percentage}%`,
                                                        height: "100%",
                                                        backgroundColor: list.status === "Fullf\u00f8rt" ? "#10b981" : "var(--primary)",
                                                        borderRadius: "99px",
                                                    }}
                                                />
                                            </div>
                                            <span>{percentage}%</span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="card">
                        <p style={{ color: "var(--muted-foreground)", fontStyle: "italic" }}>
                            Ingen sjekklister opprettet for dette prosjektet enda.
                        </p>
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
