"use client";

import { useState } from "react";
import { Project, ProjectFile } from "@/lib/types";
import { uploadFile } from "@/lib/actions";
import { FileText, Upload, Download, File as FileIcon } from "lucide-react";
import Link from "next/link";

export default function DocumentList({ project }: { project: Project }) {
    const [isUploading, setIsUploading] = useState(false);

    const fdvFiles = project.files.filter(f => f.type === "FDV");
    const checklistFiles = project.files.filter(f => f.type === "Sjekkliste");
    const otherFiles = project.files.filter(f => f.type === "Annet");

    return (
        <div style={{ marginTop: "3rem" }}>
            <div className="flex-between" style={{ marginBottom: "1rem" }}>
                <h2>Dokumenter & FDV</h2>
                <div style={{ display: "flex", gap: "1rem" }}>
                    <Link
                        href={`/api/projects/${project.id}/export`}
                        className="btn btn-secondary"
                        style={{ gap: "0.5rem" }}
                        prefetch={false} // Important for download links
                    >
                        <Download size={16} /> Last ned alt (Zip)
                    </Link>
                    <button
                        onClick={() => setIsUploading(!isUploading)}
                        className="btn btn-primary"
                        style={{ gap: "0.5rem" }}
                    >
                        <Upload size={16} /> Last opp fil
                    </button>
                </div>
            </div>

            {isUploading && (
                <div className="card" style={{ marginBottom: "2rem", backgroundColor: "var(--secondary)" }}>
                    <form action={async (formData) => {
                        await uploadFile(formData);
                        setIsUploading(false);
                    }} style={{ display: "grid", gap: "1rem" }}>
                        <input type="hidden" name="projectId" value={project.id} />

                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Velg fil</label>
                            <input type="file" name="file" required style={{ width: "100%" }} />
                        </div>

                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Type</label>
                            <select name="type" className="input" style={{ width: "100%", padding: "0.5rem" }}>
                                <option value="FDV">FDV Dokumentasjon</option>
                                <option value="Annet">Annet</option>
                            </select>
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
                            <button type="button" onClick={() => setIsUploading(false)} className="btn btn-secondary">Avbryt</button>
                            <button type="submit" className="btn btn-primary">Last opp</button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ display: "grid", gap: "2rem" }}>
                <FileSection title="FDV Dokumentasjon" files={fdvFiles} />
                <FileSection title="Lagrede Sjekklister" files={checklistFiles} />
                <FileSection title="Andre Filer" files={otherFiles} />
            </div>
        </div>
    );
}

function FileSection({ title, files }: { title: string, files: ProjectFile[] }) {
    if (files.length === 0) return null;

    return (
        <div>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem", color: "var(--muted-foreground)" }}>{title}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1rem" }}>
                {files.map(file => (
                    <div key={file.id} className="card" style={{ padding: "1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div style={{
                            width: "40px", height: "40px",
                            backgroundColor: "rgba(59, 130, 246, 0.1)",
                            color: "#3b82f6",
                            borderRadius: "var(--radius)",
                            display: "flex", alignItems: "center", justifyContent: "center"
                        }}>
                            <FileIcon size={20} />
                        </div>
                        <div style={{ flex: 1, overflow: "hidden" }}>
                            <p style={{ fontWeight: "500", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={file.name}>{file.name}</p>
                            <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>{new Date(file.uploadedAt).toLocaleDateString()}</p>
                        </div>
                        {/* In a real app, we would have a download link here pointing to a route handler that serves the file */}
                    </div>
                ))}
            </div>
        </div>
    );
}
