"use client";

import { useState } from "react";
import { Project, TimeEntry } from "@/lib/types";
import { updateProject } from "@/lib/db";
import { Clock, Plus, Timer } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TimeTracking({ project }: { project: Project }) {
    const router = useRouter();
    const [showLogTime, setShowLogTime] = useState(false);
    const timeEntries = project.timeEntries || [];

    const totalHours = timeEntries.reduce((sum, t) => sum + t.hours, 0);
    const totalTimeCost = timeEntries.reduce((sum, t) => sum + (t.hours * t.hourlyRate), 0);
    const averageRate = totalHours > 0 ? totalTimeCost / totalHours : 0;

    const handleLogTime = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const newTimeEntry: TimeEntry = {
            id: Math.random().toString(36).substring(2, 9),
            description: formData.get("description") as string,
            hours: Number(formData.get("hours")),
            hourlyRate: Number(formData.get("hourlyRate")),
            date: formData.get("date") as string
        };

        const updatedProject = {
            ...project,
            timeEntries: [...timeEntries, newTimeEntry]
        };

        await updateProject(updatedProject);
        setShowLogTime(false);
        router.refresh();
    };

    return (
        <div style={{ marginTop: "3rem" }}>
            <h2 style={{ marginBottom: "1.5rem" }}>Timeføring & Lønnsomhet</h2>

            <div style={{ display: "grid", gap: "2rem" }}>
                <div className="card">
                    <div className="flex-between" style={{ marginBottom: "1rem" }}>
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                            <Clock size={20} color="var(--primary)" />
                            <h3 style={{ fontSize: "1.1rem" }}>Registrerte Timer</h3>
                        </div>
                        <button onClick={() => setShowLogTime(!showLogTime)} className="btn btn-secondary" style={{ padding: "0.25rem 0.5rem", fontSize: "0.875rem" }}>
                            <Plus size={14} /> Før Timer
                        </button>
                    </div>

                    {showLogTime && (
                        <form onSubmit={handleLogTime} style={{ backgroundColor: "var(--background)", padding: "1rem", borderRadius: "var(--radius)", marginBottom: "1rem", border: "1px solid var(--border)" }}>
                            <input type="hidden" name="projectId" value={project.id} />
                            <div style={{ display: "grid", gap: "0.5rem" }}>
                                <input name="description" placeholder="Hva har du gjort?" required className="input" style={{ width: "100%", padding: "0.5rem" }} />
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
                                    <input name="hours" type="number" step="0.5" placeholder="Antall timer" required className="input" style={{ width: "100%", padding: "0.5rem" }} />
                                    <input name="hourlyRate" type="number" placeholder="Timesats (eks mva)" defaultValue="750" required className="input" style={{ width: "100%", padding: "0.5rem" }} />
                                    <input name="date" type="date" className="input" style={{ width: "100%", padding: "0.5rem" }} />
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ marginTop: "0.5rem", width: "100%" }}>Lagre Timer</button>
                            </div>
                        </form>
                    )}

                    <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                        {timeEntries.length === 0 ? (
                            <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem", fontStyle: "italic" }}>Ingen timer ført enda.</p>
                        ) : (
                            <table style={{ width: "100%", fontSize: "0.875rem", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ borderBottom: "1px solid var(--border)", textAlign: "left" }}>
                                        <th style={{ padding: "0.5rem 0" }}>Dato</th>
                                        <th style={{ padding: "0.5rem 0" }}>Beskrivelse</th>
                                        <th style={{ padding: "0.5rem 0", textAlign: "right" }}>Timer</th>
                                        <th style={{ padding: "0.5rem 0", textAlign: "right" }}>Sats</th>
                                        <th style={{ padding: "0.5rem 0", textAlign: "right" }}>Totalt</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {timeEntries.map(t => (
                                        <tr key={t.id} style={{ borderBottom: "1px solid var(--secondary)" }}>
                                            <td style={{ padding: "0.5rem 0" }}>{t.date}</td>
                                            <td style={{ padding: "0.5rem 0" }}>{t.description}</td>
                                            <td style={{ padding: "0.5rem 0", textAlign: "right" }}>{t.hours}</td>
                                            <td style={{ padding: "0.5rem 0", textAlign: "right" }}>{t.hourlyRate} kr</td>
                                            <td style={{ padding: "0.5rem 0", textAlign: "right" }}>{(t.hours * t.hourlyRate).toLocaleString()} kr</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                <div className="card" style={{ backgroundColor: "var(--secondary)" }}>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "1rem" }}>
                        <Timer size={20} />
                        <h3 style={{ fontSize: "1.1rem" }}>Resultatsberegning</h3>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
                        <div>
                            <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>Totalt Timer</p>
                            <p style={{ fontSize: "1.25rem", fontWeight: "600" }}>{totalHours}t</p>
                        </div>
                        <div>
                            <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>Snitt Timesats</p>
                            <p style={{ fontSize: "1.25rem", fontWeight: "600" }}>{Math.round(averageRate).toLocaleString()} kr</p>
                        </div>
                        <div>
                            <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>Total Timekostnad</p>
                            <p style={{ fontSize: "1.25rem", fontWeight: "600" }}>{totalTimeCost.toLocaleString()} kr</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
