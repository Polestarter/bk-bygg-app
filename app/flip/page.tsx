'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getFlipProjects, addFlipProject } from '@/lib/flip-db';
import { FlipProject } from '@/lib/flip-types';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { Plus, ArrowRight, Calendar, TrendingUp, MapPin } from 'lucide-react';

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
            <div className="min-h-screen bg-gray-50/50">
                {/* Hero Section */}
                <div className="bg-white border-b px-8 py-12 mb-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex justify-between items-end">
                            <div>
                                <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-2 flex items-center gap-3">
                                    <TrendingUp className="text-black" size={36} />
                                    FlippeOppgjør
                                </h1>
                                <p className="text-lg text-gray-500 max-w-2xl">
                                    Full kontroll på økonomi, fordeling og oppgjør i dine eiendomsprosjekter.
                                </p>
                            </div>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="group bg-black text-white px-6 py-3 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                                Start Nytt Prosjekt
                            </button>
                        </div>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-8 pb-20">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <TrendingUp className="text-gray-400" size={32} />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Ingen prosjekter ennå</h3>
                            <p className="text-gray-500 mb-6">Start ditt første flippe-prosjekt for å komme i gang.</p>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="text-black font-medium hover:underline"
                            >
                                Opprett prosjekt
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {projects.map(project => (
                                <Link key={project.id} href={`/flip/details?id=${project.id}`} className="group">
                                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col relative overflow-hidden">

                                        {/* Status Badge */}
                                        <div className="flex justify-between items-start mb-6">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase
                                                ${project.status === 'Aktiv' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                                    project.status === 'Avsluttet' ? 'bg-gray-100 text-gray-700 border border-gray-200' :
                                                        project.status === 'Solgt' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                                            'bg-amber-50 text-amber-700 border border-amber-100'
                                                }`}>
                                                {project.status}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                            {project.name}
                                        </h3>

                                        <div className="flex items-center gap-2 text-gray-500 text-sm mb-6">
                                            <MapPin size={16} className="text-gray-400" />
                                            {project.address || 'Ingen adresse registrert'}
                                        </div>

                                        <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2 text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
                                                <Calendar size={14} />
                                                {project.startDate}
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center transform group-hover:translate-x-1 transition-transform">
                                                <ArrowRight size={16} />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Create Modal */}
                {isCreateModalOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                            <h2 className="text-2xl font-bold mb-2">Nytt Prosjekt</h2>
                            <p className="text-gray-500 mb-6">Start et nytt eiendomseventyr.</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Prosjektnavn</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                                        placeholder="F.eks. Sommergata 1"
                                        value={newProjectName}
                                        onChange={(e) => setNewProjectName(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-8">
                                <button
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-5 py-2.5 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors"
                                >
                                    Avbryt
                                </button>
                                <button
                                    onClick={handleCreate}
                                    className="px-5 py-2.5 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl"
                                >
                                    Opprett Prosjekt
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
