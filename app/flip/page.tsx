'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getFlipProjects, addFlipProject } from '@/lib/flip-db'; // Using current path
import { FlipProject } from '@/lib/flip-types';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { Plus, ArrowRight, DollarSign, Calendar } from 'lucide-react';

export default function FlipListPage() {
    const [projects, setProjects] = useState<FlipProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        setLoading(true);
        const data = await getFlipProjects();
        setProjects(data);
        setLoading(false);
    };

    const handleCreate = async () => {
        if (!newProjectName) return;

        const newProj: Partial<FlipProject> = {
            name: newProjectName,
            startDate: new Date().toISOString().split('T')[0],
            status: 'Planlagt',
            enableLaborPayout: true,
            laborDefaultRate: 500,
            treatCompanyPaymentsAsLoan: true,
            allowNegativeProfitSettlement: true,
            roundingMode: 'nearest'
        };

        await addFlipProject(newProj);
        setNewProjectName('');
        setIsCreateModalOpen(false);
        loadProjects();
    };

    return (
        <AuthenticatedLayout>
            <div className="p-6 max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">FlippeOppgjør</h1>
                        <p className="text-gray-500">Oversikt over flippe-prosjekter og økonomisk oppgjør</p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition"
                    >
                        <Plus size={20} />
                        Nytt Prosjekt
                    </button>
                </div>

                {loading ? (
                    <div>Laster prosjekter...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map(project => (
                            <Link key={project.id} href={`/flip/${project.id}`}>
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer h-full flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`px-2 py-1 rounded text-xs font-medium 
                                            ${project.status === 'Aktiv' ? 'bg-green-100 text-green-700' :
                                                project.status === 'Avsluttet' ? 'bg-gray-100 text-gray-700' :
                                                    project.status === 'Solgt' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {project.status}
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
                                    <p className="text-gray-500 text-sm mb-4 line-clamp-1">{project.address || 'Ingen adresse registrert'}</p>

                                    <div className="mt-auto border-t pt-4 text-sm text-gray-500 flex justify-between">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            {project.startDate}
                                        </div>
                                        <div className="flex items-center gap-1 text-blue-600">
                                            Gå til oppgjør <ArrowRight size={14} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Create Modal */}
                {isCreateModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-md">
                            <h2 className="text-xl font-bold mb-4">Opprett nytt flippe-prosjekt</h2>
                            <label className="block text-sm font-medium mb-1">Prosjektnavn</label>
                            <input
                                type="text"
                                className="w-full border rounded-lg p-2 mb-6"
                                placeholder="F.eks. Storgata 12"
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Avbryt
                                </button>
                                <button
                                    onClick={handleCreate}
                                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                                >
                                    Opprett
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
