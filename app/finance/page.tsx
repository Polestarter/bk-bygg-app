import { getProjects, getStats } from "@/lib/data";
import { Banknote, TrendingUp, AlertCircle } from "lucide-react";

export default async function FinancePage() {
    const projects = await getProjects();
    const stats = await getStats();

    const totalMargin = stats.totalBudgetExVAT - stats.totalSpentExVAT;
    const marginPercentage = (totalMargin / stats.totalBudgetExVAT) * 100;

    return (
        <main className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
            <div className="flex-between" style={{ marginBottom: "2rem" }}>
                <div>
                    <h1>Økonomi</h1>
                    <p style={{ color: "var(--muted-foreground)" }}>Total oversikt over prosjektøkonomien</p>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
                <div className="card">
                    <h3 style={{ fontSize: "0.875rem", fontWeight: "500", color: "var(--muted-foreground)" }}>Total Omsetning (Budsjett)</h3>
                    <p style={{ fontSize: "2.5rem", fontWeight: "bold", marginTop: "0.5rem" }}>
                        {(stats.totalBudgetExVAT / 1000).toLocaleString()}k <span style={{ fontSize: "1rem", color: "var(--muted-foreground)" }}>NOK</span>
                    </p>
                </div>
                <div className="card">
                    <h3 style={{ fontSize: "0.875rem", fontWeight: "500", color: "var(--muted-foreground)" }}>Totale Kostnader</h3>
                    <p style={{ fontSize: "2.5rem", fontWeight: "bold", marginTop: "0.5rem" }}>
                        {(stats.totalSpentExVAT / 1000).toLocaleString()}k <span style={{ fontSize: "1rem", color: "var(--muted-foreground)" }}>NOK</span>
                    </p>
                </div>
                <div className="card" style={{ borderColor: marginPercentage < 0 ? "var(--destructive)" : "var(--border)" }}>
                    <h3 style={{ fontSize: "0.875rem", fontWeight: "500", color: "var(--muted-foreground)" }}>Margin</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <p style={{ fontSize: "2.5rem", fontWeight: "bold", marginTop: "0.5rem", color: marginPercentage >= 0 ? "#10b981" : "var(--destructive)" }}>
                            {(totalMargin / 1000).toLocaleString()}k
                        </p>
                        <span style={{
                            padding: "0.25rem 0.5rem",
                            borderRadius: "var(--radius)",
                            backgroundColor: marginPercentage >= 0 ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                            color: marginPercentage >= 0 ? "#10b981" : "var(--destructive)",
                            fontSize: "0.875rem", fontWeight: "600"
                        }}>
                            {marginPercentage.toFixed(1)}%
                        </span>
                    </div>
                </div>
            </div>

            <h2>Prosjektfordeling</h2>
            <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
                {projects.map(project => {
                    const percentage = Math.min(100, (project.spentExVAT / project.budgetExVAT) * 100);
                    const isOverBudget = project.spentExVAT > project.budgetExVAT;

                    return (
                        <div key={project.id} className="card">
                            <div className="flex-between" style={{ marginBottom: "1rem" }}>
                                <div>
                                    <h3 style={{ fontSize: "1.1rem" }}>{project.name}</h3>
                                    <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>{project.status}</p>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <p style={{ fontWeight: "bold" }}>{(project.spentExVAT / 1000).toLocaleString()}k / {(project.budgetExVAT / 1000).toLocaleString()}k</p>
                                    <p style={{ fontSize: "0.875rem", color: isOverBudget ? "var(--destructive)" : "var(--muted-foreground)" }}>
                                        {isOverBudget ? "Over budsjett!" : `${(project.budgetExVAT - project.spentExVAT) / 1000}k gjenstår`}
                                    </p>
                                </div>
                            </div>

                            <div style={{ height: "10px", backgroundColor: "var(--secondary)", borderRadius: "99px", overflow: "hidden", position: "relative" }}>
                                <div style={{
                                    width: `${percentage}%`,
                                    height: "100%",
                                    backgroundColor: isOverBudget ? "var(--destructive)" : "var(--primary)",
                                    borderRadius: "99px"
                                }}></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </main>
    );
}
