"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getProjectByShareToken, getProjectDocuments } from "@/lib/data";
import { Project, ProjectDocument } from "@/lib/types";
import { Shield, FileText, Folder, Book, FileCheck, Download } from "lucide-react";

export default function SharedHMSPageWrapper() {
    return (
        <Suspense fallback={<div className="p-8 text-center">Laster...</div>}>
            <SharedHMSPage />
        </Suspense>
    );
}

function SharedHMSPage() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [project, setProject] = useState<Project | null>(null);
    const [documents, setDocuments] = useState<ProjectDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    useEffect(() => {
        if (!token) {
            setError("Mangler token.");
            setLoading(false);
            return;
        }
        loadData(token);
    }, [token]);

    const loadData = async (t: string) => {
        try {
            const proj = await getProjectByShareToken(t);
            if (!proj) {
                setError("Ugyldig eller utløpt lenke.");
                return;
            }
            setProject(proj);

            // Fetch documents for this project
            const docs = await getProjectDocuments(proj.id);
            setDocuments(docs);
        } catch (err) {
            console.error(err);
            setError("Kunne ikke laste HMS-data.");
        } finally {
            setLoading(false);
        }
    };

    const categories = [
        { id: "SHA", label: "SHA-plan", icon: Shield, color: "#ef4444" },
        { id: "SJA", label: "SJA", icon: FileText, color: "#f97316" },
        { id: "Stoffkartotek", label: "Stoffkartotek", icon: Folder, color: "#3b82f6" },
        { id: "Brukermanualer", label: "Brukermanualer", icon: Book, color: "#10b981" },
        { id: "Samsvarserklæringer", label: "Samsvarserklæringer", icon: FileCheck, color: "#8b5cf6" },
    ];

    if (loading) return <div className="p-8 text-center">Laster HMS-oversikt...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!project) return null;

    const filteredDocs = activeCategory ? documents.filter(d => d.category === activeCategory) : [];

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">HMS Dokumentasjon</h1>
                        <p className="text-sm text-gray-500">{project.name} - {project.address}</p>
                    </div>
                    <div className="text-xs text-gray-400">
                        Read-only View
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-6">
                {!activeCategory ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {categories.map(cat => {
                            const Icon = cat.icon;
                            const count = documents.filter(d => d.category === cat.id).length;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center gap-3 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="p-3 rounded-full" style={{ backgroundColor: `${cat.color}20`, color: cat.color }}>
                                        <Icon size={32} />
                                    </div>
                                    <span className="font-medium text-gray-900">{cat.label}</span>
                                    <span className="text-xs text-gray-500">{count} filer</span>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div>
                        <button
                            onClick={() => setActiveCategory(null)}
                            className="mb-4 text-sm text-gray-600 flex items-center gap-1 hover:text-gray-900"
                        >
                            ← Tilbake til oversikt
                        </button>

                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            {categories.find(c => c.id === activeCategory)?.icon && (() => {
                                const Icon = categories.find(c => c.id === activeCategory)!.icon;
                                return <Icon size={20} />;
                            })()}
                            {categories.find(c => c.id === activeCategory)?.label}
                        </h2>

                        {filteredDocs.length === 0 ? (
                            <div className="bg-white p-8 rounded-lg text-center text-gray-500 border border-dashed">
                                Ingen dokumenter i denne kategorien.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredDocs.map(doc => (
                                    <div key={doc.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-gray-500">
                                                <FileText size={16} />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-medium text-sm text-gray-900 truncate">{doc.title}</h3>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(doc.uploadedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <a
                                            href={doc.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                        >
                                            <Download size={20} />
                                        </a>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
