import { getStats, getProjects } from "@/lib/data";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";

export default async function Home() {
  const stats = await getStats();
  const projects = await getProjects();
  const recentProjects = projects.slice(0, 5);

  return (
    <main className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
      <div className="flex-between" style={{ marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Oversikt</h1>
          <p style={{ color: "var(--muted-foreground)" }}>Velkommen til B&K Bygg prosjektstyring.</p>
        </div>
        <Link href="/projects" className="btn btn-primary" style={{ gap: "0.5rem" }}>
          <Plus size={18} /> Nytt Prosjekt
        </Link>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "1.5rem",
        marginBottom: "3rem"
      }}>
        <div className="card">
          <h3 style={{ fontSize: "0.875rem", fontWeight: "500", color: "var(--muted-foreground)" }}>Aktive Prosjekter</h3>
          <p style={{ fontSize: "2.5rem", fontWeight: "bold", color: "var(--primary)", marginTop: "0.5rem" }}>{stats.active}</p>
        </div>
        <div className="card">
          <h3 style={{ fontSize: "0.875rem", fontWeight: "500", color: "var(--muted-foreground)" }}>Fullførte Prosjekter</h3>
          <p style={{ fontSize: "2.5rem", fontWeight: "bold", marginTop: "0.5rem" }}>{stats.completed}</p>
        </div>

        {/* HMS Håndbok Snarvei */}
        <Link href="/hms/handbok" style={{ textDecoration: "none" }}>
          <div className="card hover-effect" style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#10b981" }}>
                <ArrowRight size={20} />
              </div>
              <h3 style={{ fontSize: "1rem", fontWeight: "600", margin: 0, color: "#10b981" }}>HMS Håndbok</h3>
            </div>
            <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)", margin: 0 }}>
              Bedriftens rutiner og sikkerhet
            </p>
          </div>
        </Link>
      </div>

      <div className="flex-between" style={{ marginBottom: "1.5rem" }}>
        <h2>Nylige Prosjekter</h2>
        <Link href="/projects" className="flex-center" style={{ gap: "0.5rem", color: "var(--primary)", fontWeight: "500" }}>
          Se alle <ArrowRight size={16} />
        </Link>
      </div>

      <div style={{ display: "grid", gap: "1rem" }}>
        {recentProjects.map(project => (
          <Link key={project.id} href={`/projects`} style={{ textDecoration: "none" }}>
            <div className="card card-interactive flex-between">
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <div style={{
                  width: "48px", height: "48px",
                  borderRadius: "var(--radius)",
                  backgroundColor: "var(--background)",
                  border: "1px solid var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: "bold", color: "var(--muted-foreground)"
                }}>
                  {project.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: "1.1rem" }}>{project.name}</h3>
                  <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>{project.address}</p>
                </div>
              </div>

              <div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: "2rem" }}>
                <div style={{ marginBottom: "1rem", width: "120px" }}>
                  <div className="flex-between" style={{ marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>Budsjett brukt</span>
                    <span style={{ fontWeight: "600" }}>{Math.round((project.spentExVAT / project.budgetExVAT) * 100)}%</span>
                  </div>
                  <div style={{ width: "100%", height: "8px", backgroundColor: "var(--secondary)", borderRadius: "99px", overflow: "hidden" }}>
                    <div style={{ width: `${Math.min(100, (project.spentExVAT / project.budgetExVAT) * 100)}%`, height: "100%", backgroundColor: "var(--primary)", borderRadius: "99px" }}></div>
                  </div>
                </div>

                <span style={{
                  padding: "0.25rem 0.75rem",
                  borderRadius: "99px",
                  backgroundColor: project.status === "Aktiv" ? "rgba(245, 158, 11, 0.1)" : "var(--secondary)",
                  color: project.status === "Aktiv" ? "var(--primary)" : "var(--foreground)",
                  border: project.status === "Aktiv" ? "1px solid var(--primary)" : "1px solid transparent",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  minWidth: "80px",
                  textAlign: "center"
                }}>
                  {project.status}
                </span>

                <ArrowRight size={20} color="var(--muted-foreground)" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
