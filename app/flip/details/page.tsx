'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getFlipProject, getFlipParticipants, getFlipExpenses, getFlipLoans, getFlipLabor, getFlipSale } from '@/lib/flip-db';
import { calculateFlipSettlement } from '@/lib/flip-calculations';
import { FlipProject, FlipParticipant, FlipExpense, FlipLoan, FlipLaborEntry, FlipSale, SettlementResult } from '@/lib/flip-types';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { ArrowLeft, Users, Receipt, Banknote, Clock, Gavel, FileText, ChevronRight } from 'lucide-react';

import ParticipantsTab from '@/components/flip/ParticipantsTab';
import ExpensesTab from '@/components/flip/ExpensesTab';
import LoansTab from '@/components/flip/LoansTab';
import LaborTab from '@/components/flip/LaborTab';
import SaleTab from '@/components/flip/SaleTab';
import SettlementTab from '@/components/flip/SettlementTab';

function FlipProjectContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const router = useRouter();

    const [project, setProject] = useState<FlipProject | null>(null);
    const [participants, setParticipants] = useState<FlipParticipant[]>([]);
    const [expenses, setExpenses] = useState<FlipExpense[]>([]);
    const [loans, setLoans] = useState<FlipLoan[]>([]);
    const [labor, setLabor] = useState<FlipLaborEntry[]>([]);
    const [sale, setSale] = useState<FlipSale | undefined>(undefined);

    const [settlement, setSettlement] = useState<SettlementResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'participants' | 'expenses' | 'loans' | 'labor' | 'sale' | 'settlement'>('overview');

    useEffect(() => {
        if (id) {
            loadData(id);
        } else {
            setLoading(false);
        }
    }, [id]);

    const loadData = async (projectId: string) => {
        setLoading(true);
        // Parallel fetch
        const [p, parts, exps, lns, lab, sl] = await Promise.all([
            getFlipProject(projectId),
            getFlipParticipants(projectId),
            getFlipExpenses(projectId),
            getFlipLoans(projectId),
            getFlipLabor(projectId),
            getFlipSale(projectId)
        ]);

        if (p) {
            setProject(p);
            setParticipants(parts);
            setExpenses(exps);
            setLoans(lns);
            setLabor(lab);
            setSale(sl);

            // Recalculate settlement
            const res = calculateFlipSettlement(p, parts, exps, lns, lab, sl);
            setSettlement(res);
        }
        setLoading(false);
    };

    if (loading) return (
        <AuthenticatedLayout>
            <div className="h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
        </AuthenticatedLayout>
    );

    if (!id || !project) return (
        <AuthenticatedLayout>
            <div className="p-8">
                <h1 className="text-xl font-bold">Fant ikke prosjektet</h1>
                <button onClick={() => router.push('/flip')} className="mt-4 underline">Tilbake</button>
            </div>
        </AuthenticatedLayout>
    );

    const tabs = [
        { id: 'overview', label: 'Oversikt', icon: FileText },
        { id: 'participants', label: 'Deltakere', icon: Users },
        { id: 'expenses', label: 'Utlegg', icon: Receipt },
        { id: 'loans', label: 'Lån', icon: Banknote },
        { id: 'labor', label: 'Timeliste', icon: Clock },
        { id: 'sale', label: 'Salg & Oppgjør', icon: Gavel },
    ];

    const handleUpdate = () => {
        if (id) loadData(id);
    };

    return (
        <AuthenticatedLayout>
            <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-50/50">
                {/* Sidebar Navigation for this Project */}
                <div className="w-72 bg-white border-r border-gray-200 flex flex-col shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] z-10">
                    <div className="p-6">
                        <button
                            onClick={() => router.push('/flip')}
                            className="group flex items-center gap-2 text-gray-500 hover:text-black mb-6 text-sm font-medium transition-colors"
                        >
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Tilbake til oversikt
                        </button>

                        <h1 className="text-2xl font-bold break-words text-gray-900 tracking-tight leading-tight mb-2">
                            {project.name}
                        </h1>
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {project.status}
                        </div>
                    </div>

                    <nav className="flex-1 overflow-y-auto px-4 space-y-1 pb-4">
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2 mt-2">Meny</div>
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                                    ${activeTab === tab.id
                                        ? 'bg-black text-white shadow-lg shadow-black/10'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <tab.icon size={18} className={activeTab === tab.id ? 'text-white' : 'text-gray-500'} />
                                    {tab.label}
                                </div>
                                {activeTab === tab.id && <ChevronRight size={14} className="opacity-50" />}
                            </button>
                        ))}
                    </nav>

                    {/* Financial Summary Widget */}
                    <div className="p-6 border-t bg-gray-50/50 backdrop-blur-sm">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Prosjektøkonomi</h4>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center text-gray-600">
                                <span>Estimert Salg</span>
                                <span className="font-medium">{(sale?.grossSalePrice || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-gray-600">
                                <span>Totale Utlegg</span>
                                <span className="font-medium text-red-600">
                                    -{expenses.reduce((s, e) => s + e.amount, 0).toLocaleString()}
                                </span>
                            </div>
                            <div className="pt-3 border-t border-gray-200">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-gray-900">Netto Resultat</span>
                                    <span className={`font-bold text-lg ${settlement?.netProceeds! > 0 ? "text-emerald-600" : "text-gray-900"}`}>
                                        {(settlement?.netProceeds || 0).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-auto bg-gray-50/50">
                    <div className="max-w-5xl mx-auto p-8 lg:p-12">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 min-h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {activeTab === 'participants' && <ParticipantsTab projectId={project.id} participants={participants} onUpdate={handleUpdate} />}
                            {activeTab === 'expenses' && <ExpensesTab projectId={project.id} expenses={expenses} participants={participants} onUpdate={handleUpdate} />}
                            {activeTab === 'loans' && <LoansTab projectId={project.id} loans={loans} participants={participants} onUpdate={handleUpdate} />}
                            {activeTab === 'labor' && <LaborTab projectId={project.id} labor={labor} participants={participants} onUpdate={handleUpdate} />}
                            {activeTab === 'sale' && (
                                <div className="space-y-12">
                                    <SaleTab projectId={project.id} sale={sale} onUpdate={handleUpdate} />
                                    <div className="border-t pt-8">
                                        <SettlementTab result={settlement} />
                                    </div>
                                </div>
                            )}

                            {/* Combined Sale/Settlement into one tab for better UX, removing separate settlement tab logic above but kept in state for now */}
                            {activeTab === 'settlement' && <SettlementTab result={settlement} />}

                            {activeTab === 'overview' && (
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-2xl font-bold text-gray-900">Prosjektoversikt</h2>
                                        <span className="text-gray-400 text-sm">Sist oppdatert: {new Date().toLocaleDateString()}</span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100">
                                            <h3 className="text-sm font-semibold text-emerald-800 mb-1">Netto Proveny</h3>
                                            <div className="text-3xl font-bold text-emerald-900">
                                                {(settlement?.netProceeds || 0).toLocaleString()} NOK
                                            </div>
                                        </div>
                                        <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                                            <h3 className="text-sm font-semibold text-blue-800 mb-1">Aktive Deltakere</h3>
                                            <div className="text-3xl font-bold text-blue-900">{participants.length}</div>
                                        </div>
                                        <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-200">
                                            <h3 className="text-sm font-semibold text-gray-700 mb-1">Status</h3>
                                            <div className="text-3xl font-bold text-gray-900">{project.status}</div>
                                        </div>
                                    </div>

                                    {/* Waterfall Preview */}
                                    <div className="border rounded-2xl overflow-hidden shadow-sm">
                                        <div className="px-6 py-4 bg-gray-50 border-b font-semibold text-gray-700 flex justify-between items-center">
                                            <span>Fordelingsnøkkel (Estimert)</span>
                                            <button onClick={() => setActiveTab('sale')} className="text-xs text-blue-600 font-medium hover:underline">Se detaljer</button>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead className="bg-white text-gray-500 border-b">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left font-medium">Navn</th>
                                                        <th className="px-6 py-3 text-right font-medium">Eierandel</th>
                                                        <th className="px-6 py-3 text-right font-medium">Totalt Utbetalt</th>
                                                        <th className="px-6 py-3 text-right font-medium">Netto Resultat</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 bg-white">
                                                    {settlement?.participants.map(p => (
                                                        <tr key={p.participantId} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-6 py-4 font-medium text-gray-900">{p.name}</td>
                                                            <td className="px-6 py-4 text-right text-gray-500">{p.ownershipShare}%</td>
                                                            <td className="px-6 py-4 text-right font-medium text-gray-900">{Math.round(p.totalPayout).toLocaleString()}</td>
                                                            <td className={`px-6 py-4 text-right font-bold ${p.balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                                {Math.round(p.balance).toLocaleString()}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {settlement?.participants.length === 0 && (
                                                        <tr>
                                                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Ingen deltakere eller data å vise ennå.</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

export default function FlipProjectPage() {
    return (
        <Suspense fallback={<AuthenticatedLayout><div>Laster...</div></AuthenticatedLayout>}>
            <FlipProjectContent />
        </Suspense>
    );
}
