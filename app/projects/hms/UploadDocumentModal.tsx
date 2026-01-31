"use client";

import { useState } from "react";
import { Upload, X } from "lucide-react";
import { ProjectDocument } from "@/lib/types";
import { addProjectDocument } from "@/lib/data";

interface UploadDocumentModalProps {
    projectId: string;
    category?: string;
    onClose: () => void;
    onUploadComplete: (newDoc: ProjectDocument) => void;
}

export default function UploadDocumentModal({ projectId, category, onClose, onUploadComplete }: UploadDocumentModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(category || "SHA");
    const [description, setDescription] = useState("");
    const [uploading, setUploading] = useState(false);

    const categories = [
        "SHA", "SJA", "Stoffkartotek", "Brukermanualer", "Samsvarserklæringer", "Tilsyn/Export"
    ];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            // Auto-fill title if empty
            if (!title) {
                setTitle(e.target.files[0].name.split('.')[0]);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !title) return;

        setUploading(true);
        try {
            // Convert file to Base64
            const reader = new FileReader();
            reader.readAsDataURL(file);

            reader.onload = async () => {
                const base64File = reader.result as string;

                const content = {
                    projectId,
                    title,
                    category: selectedCategory as any,
                    description,
                    fileUrl: base64File, // Store the actual file data
                    uploadedBy: "Jolly (Demo)"
                };

                const newDoc = await addProjectDocument(content);
                onUploadComplete(newDoc);
                onClose();
            };

            reader.onerror = (error) => {
                console.error("File reading failed", error);
                alert("Kunne ikke lese filen.");
                setUploading(false);
            };

        } catch (error) {
            console.error("Upload failed", error);
            alert("Opplasting feilet");
            setUploading(false);
        }
    };

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
            <div className="card" style={{ width: "100%", maxWidth: "500px", position: "relative" }}>
                <button
                    onClick={onClose}
                    style={{ position: "absolute", top: "1rem", right: "1rem", background: "none", border: "none", cursor: "pointer" }}
                >
                    <X size={20} />
                </button>

                <h2 style={{ marginBottom: "1.5rem" }}>Last opp dokument</h2>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Fil</label>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            required
                            style={{ width: "100%" }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Tittel</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="input"
                            placeholder="Dokumentnavn"
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Kategori</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="input"
                        >
                            {categories.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Beskrivelse (valgfritt)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="input"
                            rows={3}
                        />
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
                        <button type="button" onClick={onClose} className="btn">Avbryt</button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={!file || uploading}
                            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                        >
                            {uploading ? "Laster opp..." : <><Upload size={16} /> Last opp</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
