'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { getFlipProject, getFlipParticipants, getFlipExpenses, getFlipLoans, getFlipLabor, getFlipSale } from '@/lib/flip-db';
import { calculateFlipSettlement } from '@/lib/flip-calculations';
import { FlipProject, FlipParticipant, FlipExpense, FlipLoan, FlipLaborEntry, FlipSale, SettlementResult } from '@/lib/flip-types';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { ArrowLeft, Users, Receipt, Banknote, Clock, Gavel, FileText } from 'lucide-react';
import { formatCurrency } from '@/lib/utils'; // Assuming utils exists, or simple formatter

import ParticipantsTab from '@/components/flip/ParticipantsTab';
import ExpensesTab from '@/components/flip/ExpensesTab';
import LoansTab from '@/components/flip/LoansTab';
import LaborTab from '@/components/flip/LaborTab';
import SaleTab from '@/components/flip/SaleTab';
import SettlementTab from '@/components/flip/SettlementTab';

export default function FlipProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
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
        loadData();
    }, [id]);

    const loadData = async () => {
        setLoading(true);
        // Parallel fetch
        const [p, parts, exps, lns, lab, sl] = await Promise.all([
            getFlipProject(id),
            getFlipParticipants(id),
            getFlipExpenses(id),
            getFlipLoans(id),
            getFlipLabor(id),
            getFlipSale(id)
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

    if (loading) return <AuthenticatedLayout><div>Laster prosjektdata...</div></AuthenticatedLayout>;
    if (!project) return <AuthenticatedLayout><div>Fant ikke prosjektet</div></AuthenticatedLayout>;

    const tabs = [
        { id: 'participants', label: 'Deltakere', icon: Users },
        { id: 'expenses', label: 'Utlegg', icon: Receipt },
        { id: 'loans', label: 'Lån', icon: Banknote },
        { id: 'labor', label: 'Timer', icon: Clock },
        { id: 'sale', label: 'Salg', icon: Gavel },
        { id: 'settlement', label: 'Oppgjør', icon: FileText },
    ];

    return (
        <AuthenticatedLayout>
            <div className="flex h-screen overflow-hidden bg-gray-50">
                {/* Sidebar Navigation for this Project */}
                <div className="w-64 bg-white border-r flex flex-col pt-6">
                    <div className="px-6 mb-6">
                        <button onClick={() => router.push('/flip')} className="text-gray-500 hover:text-black flex items-center gap-2 mb-4 text-sm">
                            <ArrowLeft size={16} /> Tilbake
                        </button>
                        <h1 className="text-xl font-bold break-words">{project.name}</h1>
                        <div className="text-sm text-gray-500">{project.status}</div>
                    </div>

                    <nav className="flex-1 overflow-y-auto px-4 space-y-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition
                                    ${activeTab === tab.id ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}
                                `}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </nav>

                    {/* Mini Summary Sticky */}
                    <div className="p-4 border-t bg-gray-50">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Live Oversikt</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Salgspris:</span>
                                <span>{(sale?.grossSalePrice || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Utlegg:</span>
                                <span>{expenses.reduce((s, e) => s + e.amount, 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between font-bold border-t pt-1">
                                <span>Netto:</span>
                                <span className={settlement?.netProceeds! > 0 ? "text-green-600" : "text-red-600"}>
                                    {(settlement?.netProceeds || 0).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-auto p-8">
                    {activeTab === 'participants' && <ParticipantsTab projectId={project.id} participants={participants} onUpdate={loadData} />}
                    {activeTab === 'expenses' && <ExpensesTab projectId={project.id} expenses={expenses} participants={participants} onUpdate={loadData} />}
                    {activeTab === 'loans' && <LoansTab projectId={project.id} loans={loans} participants={participants} onUpdate={loadData} />}
                    {activeTab === 'labor' && <LaborTab projectId={project.id} labor={labor} participants={participants} onUpdate={loadData} />}
                    {activeTab === 'sale' && <SaleTab projectId={project.id} sale={sale} onUpdate={loadData} />}
                    {activeTab === 'settlement' && <SettlementTab result={settlement} />}

                    {activeTab === 'overview' && (
                        <div>
                            <h2 className="text-2xl font-bold mb-6">Prosjektoversikt</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-white p-6 rounded-xl shadow-sm border">
                                    <h3 className="text-sm font-medium text-gray-500">Netto Proveny</h3>
                                    <div className="text-3xl font-bold mt-2">
                                        {(settlement?.netProceeds || 0).toLocaleString()} NOK
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow-sm border">
                                    <h3 className="text-sm font-medium text-gray-500">Antall Deltakere</h3>
                                    <div className="text-3xl font-bold mt-2">{participants.length}</div>
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow-sm border">
                                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                                    <div className="text-3xl font-bold mt-2">{project.status}</div>
                                </div>
                            </div>

                            {/* Waterfall Preview */}
                            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                                <div className="px-6 py-4 border-b bg-gray-50 font-medium">Fordeling (Estimert)</div>
                                <table className="w-full">
                                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                        <tr>
                                            <th className="px-6 py-3 text-left">Navn</th>
                                            <th className="px-6 py-3 text-right">Eierandel</th>
                                            <th className="px-6 py-3 text-right">Totalt Utbetalt</th>
                                            <th className="px-6 py-3 text-right">Netto Resultat</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {settlement?.participants.map(p => (
                                            <tr key={p.participantId}>
                                                <td className="px-6 py-4">{p.name}</td>
                                                <td className="px-6 py-4 text-right">{p.ownershipShare}%</td>
                                                <td className="px-6 py-4 text-right font-medium">{Math.round(p.totalPayout).toLocaleString()}</td>
                                                <td className={`px-6 py-4 text-right font-bold ${p.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {Math.round(p.balance).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
