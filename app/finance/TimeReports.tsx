"use client";

import { useState } from "react";
import { Project, TimeEntry } from "@/lib/types";
import { FileDown, Filter } from "lucide-react";
// import * as XLSX from 'xlsx'; // Need to install this, or use simple CSV generation

interface TimeReportsProps {
    projects: Project[];
}

export default function TimeReports({ projects }: TimeReportsProps) {
    const [selectedUser, setSelectedUser] = useState<string>("all");
    const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().substring(0, 7)); // YYYY-MM
    const [selectedProject, setSelectedProject] = useState<string>("all");

    // Flatten all time entries with project info
    const allEntries = projects.flatMap(p =>
        (p.timeEntries || []).map(t => ({ ...t, projectName: p.name, projectId: p.id }))
    );

    // Extract unique users
    const users = Array.from(new Set(allEntries.map(e => e.userEmail || "Ukjent").filter(u => u !== "Ukjent")));

    // Filter entries
    const filteredEntries = allEntries.filter(e => {
        const entryMonth = e.date.substring(0, 7);
        const userMatch = selectedUser === "all" || (e.userEmail || "Ukjent") === selectedUser;
        const monthMatch = !selectedMonth || entryMonth === selectedMonth;
        const projectMatch = selectedProject === "all" || e.projectId === selectedProject;

        return userMatch && monthMatch && projectMatch;
    });

    const totalHours = filteredEntries.reduce((sum, e) => sum + e.hours, 0);
    const totalCost = filteredEntries.reduce((sum, e) => sum + (e.hours * e.hourlyRate), 0);

    const handleExport = () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + "Dato,Ansatt,Prosjekt,Beskrivelse,Start,Slutt,Pause,Timer,Sats,Totalt\n"
            + filteredEntries.map(e => {
                return `${e.date},${e.userEmail || "Ukjent"},${e.projectName},"${e.description.replace(/"/g, '""')}",${e.startTime || ""},${e.endTime || ""},${e.breakMinutes || 0},${e.hours.toLocaleString().replace('.', ',')},${e.hourlyRate},${(e.hours * e.hourlyRate).toLocaleString().replace('.', ',')}`;
            }).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `timeliste_${selectedUser}_${selectedMonth}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="card" style={{ marginTop: "2rem" }}>
            <div className="flex-between" style={{ marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "1.25rem" }}>Timelister & Rapporter</h2>
                <button onClick={handleExport} className="btn btn-outline" style={{ gap: "0.5rem" }}>
                    <FileDown size={16} /> Eksportèr til Excel (CSV)
                </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem", padding: "1rem", backgroundColor: "var(--secondary)", borderRadius: "var(--radius)" }}>
                <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: "500" }}>Ansatt</label>
                    <select
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                        className="input"
                        style={{ width: "100%", padding: "0.5rem" }}
                    >
                        <option value="all">Alle ansatte</option>
                        {users.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                </div>
                <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: "500" }}>Måned</label>
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="input"
                        style={{ width: "100%", padding: "0.5rem" }}
                    />
                </div>
                <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: "500" }}>Prosjekt</label>
                    <select
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        className="input"
                        style={{ width: "100%", padding: "0.5rem" }}
                    >
                        <option value="all">Alle prosjekter</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
            </div>

            <div style={{ marginBottom: "1rem" }}>
                <p>Viser <strong>{filteredEntries.length}</strong> timeregistreringer. Totalt: <strong>{totalHours.toFixed(1)} timer</strong> ({totalCost.toLocaleString()} kr).</p>
            </div>

            <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", fontSize: "0.875rem", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ borderBottom: "2px solid var(--border)", textAlign: "left" }}>
                            <th style={{ padding: "0.75rem 0.5rem" }}>Dato</th>
                            <th style={{ padding: "0.75rem 0.5rem" }}>Ansatt</th>
                            <th style={{ padding: "0.75rem 0.5rem" }}>Prosjekt</th>
                            <th style={{ padding: "0.75rem 0.5rem" }}>Beskrivelse</th>
                            <th style={{ padding: "0.75rem 0.5rem" }}>Tid</th>
                            <th style={{ padding: "0.75rem 0.5rem", textAlign: "right" }}>Timer</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEntries.map((e, i) => (
                            <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                                <td style={{ padding: "0.5rem" }}>{e.date}</td>
                                <td style={{ padding: "0.5rem" }}>{e.userEmail?.split('@')[0] || "Ukjent"}</td>
                                <td style={{ padding: "0.5rem" }}>{e.projectName}</td>
                                <td style={{ padding: "0.5rem" }}>{e.description}</td>
                                <td style={{ padding: "0.5rem" }}>{e.startTime ? `${e.startTime}-${e.endTime}` : "-"}</td>
                                <td style={{ padding: "0.5rem", textAlign: "right" }}>{e.hours.toFixed(1)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
