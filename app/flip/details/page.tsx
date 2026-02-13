'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    getFlipProject,
    getFlipParticipants,
    getFlipExpenses,
    getFlipLoans,
    getFlipLabor,
    getFlipSale
} from '@/lib/flip-db';
import { calculateFlipSettlement } from '@/lib/flip-calculations';
import {
    FlipExpense,
    FlipLaborEntry,
    FlipLoan,
    FlipParticipant,
    FlipProject,
    FlipSale,
    SettlementResult
} from '@/lib/flip-types';
import { ArrowLeft, Banknote, Clock3, FileText, Gavel, Receipt, Users } from 'lucide-react';

import ParticipantsTab from '@/components/flip/ParticipantsTab';
import ExpensesTab from '@/components/flip/ExpensesTab';
import LoansTab from '@/components/flip/LoansTab';
import LaborTab from '@/components/flip/LaborTab';
import SaleTab from '@/components/flip/SaleTab';
import SettlementTab from '@/components/flip/SettlementTab';

type TabId = 'overview' | 'participants' | 'expenses' | 'loans' | 'labor' | 'sale';

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
    const [activeTab, setActiveTab] = useState<TabId>('overview');

    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }

        void loadData(id);
    }, [id]);

    const loadData = async (projectId: string) => {
        setLoading(true);

        const [projectData, participantData, expenseData, loanData, laborData, saleData] = await Promise.all([
            getFlipProject(projectId),
            getFlipParticipants(projectId),
            getFlipExpenses(projectId),
            getFlipLoans(projectId),
            getFlipLabor(projectId),
            getFlipSale(projectId)
        ]);

        if (projectData) {
            setProject(projectData);
            setParticipants(participantData);
            setExpenses(expenseData);
            setLoans(loanData);
            setLabor(laborData);
            setSale(saleData);
            setSettlement(calculateFlipSettlement(projectData, participantData, expenseData, loanData, laborData, saleData));
        }

        setLoading(false);
    };

    const summary = useMemo(() => {
        const saleAmount = sale?.grossSalePrice || 0;
        const loanAmount = loans.reduce((sum, loan) => sum + loan.principalAmount, 0);
        const expenseAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const laborHours = labor.reduce((sum, entry) => sum + entry.hours, 0);

        return {
            saleAmount,
            loanAmount,
            expenseAmount,
            laborHours,
            net: settlement?.netProceeds || 0
        };
    }, [sale, loans, expenses, labor, settlement]);

    if (loading) {
        return (
            <main className="container" style={{ paddingTop: '2rem' }}>
                <div className="card">
                    <p style={{ color: 'var(--muted-foreground)' }}>Laster prosjekt ...</p>
                </div>
            </main>
        );
    }

    if (!id || !project) {
        return (
            <main className="container" style={{ paddingTop: '2rem' }}>
                <div className="card">
                    <p style={{ color: 'var(--muted-foreground)' }}>Fant ikke prosjektet.</p>
                </div>
            </main>
        );
    }

    const handleUpdate = () => {
        if (!id) return;
        void loadData(id);
    };

    return (
        <main className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <button
                    onClick={() => router.push('/flip')}
                    className="btn btn-ghost"
                    style={{ paddingLeft: 0, color: 'var(--muted-foreground)', gap: '0.45rem' }}
                >
                    <ArrowLeft size={16} /> Tilbake til oversikt
                </button>
            </div>

            <div className="flex-between" style={{ marginBottom: '1.2rem', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                    <h1 style={{ marginBottom: '0.25rem' }}>{project.name}</h1>
                    <span style={project.status === 'Aktiv' ? activeBadge : badgeStyle}>{project.status}</span>
                </div>

                <div style={{ textAlign: 'right' }}>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '0.85rem' }}>Nettoproveny</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: summary.net >= 0 ? '#166534' : 'var(--destructive)' }}>
                        {Math.round(summary.net).toLocaleString()} NOK
                    </p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.2rem' }}>
                <StatCard label="Salg" value={`${Math.round(summary.saleAmount).toLocaleString()} NOK`} />
                <StatCard label="Utlegg" value={`${Math.round(summary.expenseAmount).toLocaleString()} NOK`} />
                <StatCard label="Lan" value={`${Math.round(summary.loanAmount).toLocaleString()} NOK`} />
                <StatCard label="Timer" value={`${summary.laborHours.toLocaleString()} t`} />
            </div>

            <div style={{ display: 'flex', gap: '0.45rem', borderBottom: '1px solid var(--border)', marginBottom: '1.2rem', overflowX: 'auto' }}>
                <TabButton id="overview" label="Oversikt" activeTab={activeTab} onChange={setActiveTab} icon={FileText} />
                <TabButton id="participants" label="Deltakere" activeTab={activeTab} onChange={setActiveTab} icon={Users} />
                <TabButton id="expenses" label="Utlegg" activeTab={activeTab} onChange={setActiveTab} icon={Receipt} />
                <TabButton id="loans" label="Lan" activeTab={activeTab} onChange={setActiveTab} icon={Banknote} />
                <TabButton id="labor" label="Timer" activeTab={activeTab} onChange={setActiveTab} icon={Clock3} />
                <TabButton id="sale" label="Salg og oppgjor" activeTab={activeTab} onChange={setActiveTab} icon={Gavel} />
            </div>

            <div>
                {activeTab === 'overview' && (
                    <div style={{ display: 'grid', gap: '0.9rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                        <div className="card">
                            <h3 style={{ marginBottom: '0.7rem' }}>Prosjektstatus</h3>
                            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', marginBottom: '0.45rem' }}>
                                Startdato: {project.startDate}
                            </p>
                            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', marginBottom: '0.45rem' }}>
                                Adresse: {project.address || 'Ikke satt'}
                            </p>
                            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>
                                Valuta: {project.currency}
                            </p>
                        </div>

                        <div className="card">
                            <h3 style={{ marginBottom: '0.7rem' }}>Deltakere</h3>
                            {participants.length === 0 ? (
                                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>
                                    Ingen deltakere registrert.
                                </p>
                            ) : (
                                <div style={{ display: 'grid', gap: '0.45rem' }}>
                                    {participants.map((participant) => (
                                        <div key={participant.id} className="flex-between">
                                            <span>{participant.name}</span>
                                            <strong>{participant.ownershipShare}%</strong>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'participants' && (
                    <ParticipantsTab projectId={project.id} participants={participants} onUpdate={handleUpdate} />
                )}

                {activeTab === 'expenses' && (
                    <ExpensesTab projectId={project.id} expenses={expenses} participants={participants} onUpdate={handleUpdate} />
                )}

                {activeTab === 'loans' && (
                    <LoansTab projectId={project.id} loans={loans} participants={participants} onUpdate={handleUpdate} />
                )}

                {activeTab === 'labor' && (
                    <LaborTab projectId={project.id} labor={labor} participants={participants} onUpdate={handleUpdate} />
                )}

                {activeTab === 'sale' && (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <SaleTab projectId={project.id} sale={sale} onUpdate={handleUpdate} />
                        <SettlementTab result={settlement} />
                    </div>
                )}
            </div>
        </main>
    );
}

function TabButton({
    id,
    label,
    icon: Icon,
    activeTab,
    onChange
}: {
    id: TabId;
    label: string;
    icon: React.ComponentType<{ size?: number }>;
    activeTab: TabId;
    onChange: (id: TabId) => void;
}) {
    const active = activeTab === id;

    return (
        <button
            onClick={() => onChange(id)}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.65rem 0.8rem',
                border: 'none',
                borderBottom: active ? '2px solid var(--primary)' : '2px solid transparent',
                background: 'none',
                color: active ? 'var(--foreground)' : 'var(--muted-foreground)',
                fontWeight: active ? 600 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
            }}
        >
            <Icon size={16} />
            {label}
        </button>
    );
}

function StatCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="card" style={{ padding: '0.85rem 1rem' }}>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.85rem' }}>{label}</p>
            <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>{value}</p>
        </div>
    );
}

const badgeStyle: React.CSSProperties = {
    padding: '0.18rem 0.6rem',
    borderRadius: 999,
    border: '1px solid var(--border)',
    backgroundColor: 'var(--secondary)',
    fontSize: '0.8rem',
    fontWeight: 600
};

const activeBadge: React.CSSProperties = {
    ...badgeStyle,
    borderColor: '#86efac',
    color: '#166534',
    backgroundColor: '#dcfce7'
};

export default function FlipProjectPage() {
    return (
        <Suspense
            fallback={
                <main className="container" style={{ paddingTop: '2rem' }}>
                    <div className="card">
                        <p style={{ color: 'var(--muted-foreground)' }}>Laster prosjekt ...</p>
                    </div>
                </main>
            }
        >
            <FlipProjectContent />
        </Suspense>
    );
}
