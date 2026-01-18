"use client";

import { useState } from "react";
import { Project, ProjectFile } from "@/lib/types";
import { updateProject } from "@/lib/db"; // Use direct DB update
import { supabase } from "@/lib/supabaseClient"; // Direct storage access
import { FileText, Upload, Download, File as FileIcon, Loader2, Trash2 } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { useRouter } from "next/navigation"; // For refreshing

export default function DocumentList({ project }: { project: Project }) {
    const router = useRouter();
    const [isUploading, setIsUploading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    const fdvFiles = project.files.filter(f => f.type === "FDV");
    const checklistFiles = project.files.filter(f => f.type === "Sjekkliste");
    const otherFiles = project.files.filter(f => f.type === "Annet");

    const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const file = formData.get("file") as File;
        const type = formData.get("type") as "FDV" | "Annet";

        if (!file || file.size === 0) return;

        try {
            // 1. Upload to Supabase Storage
            // Path: project-id/timestamp-filename
            const filePath = `${project.id}/${Date.now()}-${file.name}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('files')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('files')
                .getPublicUrl(filePath);

            // 3. Update Project Database
            const newFile: ProjectFile = {
                id: Math.random().toString(36).substring(2, 9),
                name: file.name,
                path: publicUrl, // Store the full URL for easy access
                type: type,
                uploadedAt: new Date().toISOString()
            };

            const updatedProject = {
                ...project,
                files: [...project.files, newFile]
            };

            await updateProject(updatedProject);

            setIsUploading(false);
            router.refresh(); // Refresh to show new file
            alert("Fil lastet opp!");

        } catch (error) {
            console.error("Upload failed:", error);
            alert("Opplasting feilet: " + (error as any).message);
        }
    };

    const handleDownloadAll = async () => {
        if (project.files.length === 0) return;
        setIsDownloading(true);

        try {
            const zip = new JSZip();

            // Loop through all files and fetch them
            const filePromises = project.files.map(async (file) => {
                try {
                    // Fetch the file content
                    const response = await fetch(file.path);
                    if (!response.ok) throw new Error(`Failed to fetch ${file.name}`);
                    const blob = await response.blob();

                    // Add to zip folder based on type
                    const folder = zip.folder(file.type);
                    if (folder) {
                        folder.file(file.name, blob);
                    } else {
                        zip.file(file.name, blob);
                    }
                } catch (err) {
                    console.error(`Skipping file ${file.name}:`, err);
                }
            });

            await Promise.all(filePromises);

            // Generate zip
            const content = await zip.generateAsync({ type: "blob" });
            saveAs(content, `Dokumenter-${project.name.replace(/\s+/g, "_")}.zip`);

        } catch (error) {
            console.error("Zip generation failed:", error);
            alert("Kunne ikke generere zip-fil.");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div style={{ marginTop: "3rem" }}>
            <div className="flex-between" style={{ marginBottom: "1rem" }}>
                <h2>Dokumenter & FDV</h2>

                <div style={{ display: "flex", gap: "1rem" }}>
                    <button
                        onClick={handleDownloadAll}
                        disabled={project.files.length === 0 || isDownloading}
                        className="btn btn-secondary"
                        style={{ gap: "0.5rem" }}
                    >
                        {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                        {isDownloading ? "Lager Zip..." : "Last ned alt (Zip)"}
                    </button>

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
                    <form onSubmit={handleUpload} style={{ display: "grid", gap: "1rem" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Velg fil</label>
                            <input type="file" name="file" required style={{ width: "100%" }} />
                            <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", marginTop: "0.25rem" }}>Maks 50MB</p>
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
                            <a
                                href={file.path}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ fontWeight: "500", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block", color: "inherit", textDecoration: "none" }}
                                title={file.name}
                            >
                                {file.name}
                            </a>
                            <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>{new Date(file.uploadedAt).toLocaleDateString()}</p>
                        </div>
                        <a href={file.path} download target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ padding: "0.5rem" }}>
                            <Download size={16} color="var(--muted-foreground)" />
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
}
