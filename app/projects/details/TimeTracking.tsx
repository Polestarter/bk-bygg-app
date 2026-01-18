"use client";

import { useState } from "react";
import { Project, TimeEntry } from "@/lib/types";
import { updateProject } from "@/lib/db";
import { Clock, Plus, Timer, Calculator } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function TimeTracking({ project, onUpdate }: { project: Project; onUpdate?: () => void }) {
    const router = useRouter();
    const { user } = useAuth();
    const [showLogTime, setShowLogTime] = useState(false);
    const timeEntries = project.timeEntries || [];

    const totalHours = timeEntries.reduce((sum, t) => sum + t.hours, 0);
    const totalTimeCost = timeEntries.reduce((sum, t) => sum + (t.hours * t.hourlyRate), 0);
    const averageRate = totalHours > 0 ? totalTimeCost / totalHours : 0;

    const [startTime, setStartTime] = useState("07:00");
    const [endTime, setEndTime] = useState("15:00");
    const [breakMinutes, setBreakMinutes] = useState(30);

    const calculateHours = (start: string, end: string, breakMin: number) => {
        const [startH, startM] = start.split(":").map(Number);
        const [endH, endM] = end.split(":").map(Number);

        const startDate = new Date(0, 0, 0, startH, startM);
        const endDate = new Date(0, 0, 0, endH, endM);

        let diffMs = endDate.getTime() - startDate.getTime();
        if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000; // Handle overnight? Assume same day for now/next day wrap

        const diffMinutes = diffMs / (1000 * 60);
        const netMinutes = diffMinutes - breakMin;

        return Math.max(0, netMinutes / 60);
    };

    const calculatedHours = calculateHours(startTime, endTime, breakMinutes);

    const handleLogTime = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const newTimeEntry: TimeEntry = {
            id: Math.random().toString(36).substring(2, 9),
            description: formData.get("description") as string,
            hours: calculatedHours,
            hourlyRate: Number(formData.get("hourlyRate")),
            date: formData.get("date") as string,
            startTime: startTime,
            endTime: endTime,
            breakMinutes: breakMinutes,
            userId: user?.id,
            userEmail: user?.email
        };

        const updatedProject = {
            ...project,
            timeEntries: [...timeEntries, newTimeEntry]
        };

        await updateProject(updatedProject);
        setShowLogTime(false);
        if (onUpdate) onUpdate();
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
                            <div style={{ display: "grid", gap: "1rem" }}>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                    <div>
                                        <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.875rem" }}>Dato</label>
                                        <input
                                            name="date"
                                            type="date"
                                            required
                                            defaultValue={new Date().toISOString().split('T')[0]}
                                            className="input"
                                            style={{ width: "100%", padding: "0.5rem" }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.875rem" }}>Beskrivelse</label>
                                        <input name="description" placeholder="Hva har du gjort?" required className="input" style={{ width: "100%", padding: "0.5rem" }} />
                                    </div>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                                    <div>
                                        <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.875rem" }}>Start</label>
                                        <input
                                            type="time"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            required
                                            className="input"
                                            style={{ width: "100%", padding: "0.5rem" }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.875rem" }}>Slutt</label>
                                        <input
                                            type="time"
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                            required
                                            className="input"
                                            style={{ width: "100%", padding: "0.5rem" }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.875rem" }}>Pause (min)</label>
                                        <select
                                            value={breakMinutes}
                                            onChange={(e) => setBreakMinutes(Number(e.target.value))}
                                            className="input"
                                            style={{ width: "100%", padding: "0.5rem" }}
                                        >
                                            <option value="0">Ingen</option>
                                            <option value="15">15 min</option>
                                            <option value="30">30 min</option>
                                            <option value="45">45 min</option>
                                            <option value="60">60 min</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex-between" style={{ padding: "0.75rem", backgroundColor: "var(--secondary)", borderRadius: "var(--radius)" }}>
                                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                        <Calculator size={16} />
                                        <span style={{ fontWeight: "500" }}>Beregnet arbeidstid:</span>
                                    </div>
                                    <span style={{ fontWeight: "bold", fontSize: "1.1rem" }}>{calculatedHours.toFixed(2)} timer</span>
                                </div>

                                <div>
                                    <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.875rem" }}>Timesats</label>
                                    <input name="hourlyRate" type="number" placeholder="Timesats (eks mva)" defaultValue="750" required className="input" style={{ width: "100%", padding: "0.5rem" }} />
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
                                        <th style={{ padding: "0.5rem 0" }}>Ansatt</th>
                                        <th style={{ padding: "0.5rem 0" }}>Tid</th>
                                        <th style={{ padding: "0.5rem 0", textAlign: "right" }}>Timer</th>
                                        <th style={{ padding: "0.5rem 0", textAlign: "right" }}>Totalt</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {timeEntries.map(t => (
                                        <tr key={t.id} style={{ borderBottom: "1px solid var(--secondary)" }}>
                                            <td style={{ padding: "0.5rem 0" }}>{t.date}</td>
                                            <td style={{ padding: "0.5rem 0" }}>
                                                {t.userEmail ? t.userEmail.split('@')[0] : (t.description)}
                                                {!t.userEmail && <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>{t.description}</div>}
                                            </td>
                                            <td style={{ padding: "0.5rem 0" }}>
                                                {t.startTime ? `${t.startTime} - ${t.endTime}` : "-"}
                                                {t.breakMinutes ? ` (Pause: ${t.breakMinutes}m)` : ""}
                                            </td>
                                            <td style={{ padding: "0.5rem 0", textAlign: "right" }}>{t.hours.toFixed(1)}</td>
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
                            <p style={{ fontSize: "1.25rem", fontWeight: "600" }}>{totalHours.toFixed(1)}t</p>
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
