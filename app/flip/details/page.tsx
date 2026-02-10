'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getFlipProject, getFlipParticipants, getFlipExpenses, getFlipLoans, getFlipLabor, getFlipSale } from '@/lib/flip-db';
import { calculateFlipSettlement } from '@/lib/flip-calculations';
import { FlipProject, FlipParticipant, FlipExpense, FlipLoan, FlipLaborEntry, FlipSale, SettlementResult } from '@/lib/flip-types';
import { ArrowLeft, Users, Receipt, Banknote, Clock, Gavel, FileText } from 'lucide-react';

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
    const [activeTab, setActiveTab] = useState<'overview' | 'participants' | 'expenses' | 'loans' | 'labor' | 'sale'>('overview');

    useEffect(() => {
        if (id) {
            loadData(id);
        } else {
            setLoading(false);
        }
    }, [id]);

    const loadData = async (projectId: string) => {
        setLoading(true);
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
            const res = calculateFlipSettlement(p, parts, exps, lns, lab, sl);
            setSettlement(res);
        }
        setLoading(false);
    };

    if (loading) return <main className="container" style={{ paddingTop: "2rem" }}><p>Laster...</p></main>;
    if (!id || !project) return <main className="container" style={{ paddingTop: "2rem" }}><p>Fant ikke prosjektet.</p></main>;

    const handleUpdate = () => {
        if (id) loadData(id);
    };

    const TabButton = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
        <button
            onClick={() => setActiveTab(id)}
            style={{
                display: "flex", alignItems: "center", gap: "0.5rem",
                padding: "0.75rem 1rem",
                borderBottom: activeTab === id ? "2px solid var(--primary)" : "2px solid transparent",
                color: activeTab === id ? "var(--foreground)" : "var(--muted-foreground)",
                fontWeight: "500",
                background: "none", borderLeft: "none", borderRight: "none", borderTop: "none",
                cursor: "pointer", fontSize: "0.9rem"
            }}
        >
            <Icon size={16} />
            {label}
        </button>
    );

    return (
        <main className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
            <div style={{ marginBottom: "2rem" }}>
                <button
                    onClick={() => router.push('/flip')}
                    style={{
                        display: "flex", alignItems: "center", gap: "0.5rem",
                        color: "var(--muted-foreground)", background: "none",
                        border: "none", cursor: "pointer", marginBottom: "1rem"
                    }}
                >
                    <ArrowLeft size={16} /> Tilbake til oversikt
                </button>
                <div className="flex-between">
                    <div>
                        <h1 style={{ marginBottom: "0.25rem" }}>{project.name}</h1>
                        <span style={{
                            fontSize: "0.875rem", padding: "2px 8px", borderRadius: "4px",
                            backgroundColor: "var(--secondary)", color: "var(--secondary-foreground)"
                        }}>
                            {project.status}
                        </span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>Netto Resultat</p>
                        <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: (settlement?.netProceeds || 0) > 0 ? "var(--primary-foreground)" : "var(--foreground)" }}>
                            {(settlement?.netProceeds || 0).toLocaleString()} NOK
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{
                display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--border)",
                marginBottom: "2rem", overflowX: "auto"
            }}>
                <TabButton id="overview" label="Oversikt" icon={FileText} />
                <TabButton id="participants" label="Deltakere" icon={Users} />
                <TabButton id="expenses" label="Utlegg" icon={Receipt} />
                <TabButton id="loans" label="Lån" icon={Banknote} />
                <TabButton id="labor" label="Timer" icon={Clock} />
                <TabButton id="sale" label="Salg & Oppgjør" icon={Gavel} />
            </div>

            {/* Content */}
            <div>
                {activeTab === 'overview' && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
                        <div className="card">
                            <h3 style={{ marginBottom: "1rem", fontSize: "1.1rem" }}>Økonomisk Sammendrag</h3>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                <span style={{ color: "var(--muted-foreground)" }}>Salgssum</span>
                                <span>{(sale?.grossSalePrice || 0).toLocaleString()}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                <span style={{ color: "var(--muted-foreground)" }}>Totale Utlegg</span>
                                <span>{expenses.reduce((s, e) => s + e.amount, 0).toLocaleString()}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                <span style={{ color: "var(--muted-foreground)" }}>Totale Lån</span>
                                <span>{loans.reduce((s, l) => s + l.principalAmount, 0).toLocaleString()}</span>
                            </div>
                            <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
                                <span>Netto til fordeling</span>
                                <span>{(settlement?.netProceeds || 0).toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="card">
                            <h3 style={{ marginBottom: "1rem", fontSize: "1.1rem" }}>Prosjektdeltakere</h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                {participants.map(p => (
                                    <div key={p.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                        <div style={{
                                            width: "32px", height: "32px", borderRadius: "50%",
                                            backgroundColor: "var(--secondary)", display: "flex",
                                            alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: "bold"
                                        }}>
                                            {p.name.charAt(0)}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: "0.9rem", fontWeight: "500" }}>{p.name}</div>
                                            <div style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>{p.role}</div>
                                        </div>
                                        <div style={{ fontSize: "0.9rem", fontWeight: "bold" }}>{p.ownershipShare}%</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'participants' && <ParticipantsTab projectId={project.id} participants={participants} onUpdate={handleUpdate} />}
                {activeTab === 'expenses' && <ExpensesTab projectId={project.id} expenses={expenses} participants={participants} onUpdate={handleUpdate} />}
                {activeTab === 'loans' && <LoansTab projectId={project.id} loans={loans} participants={participants} onUpdate={handleUpdate} />}
                {activeTab === 'labor' && <LaborTab projectId={project.id} labor={labor} participants={participants} onUpdate={handleUpdate} />}
                {activeTab === 'sale' && (
                    <div style={{ display: "grid", gap: "2rem" }}>
                        <SaleTab projectId={project.id} sale={sale} onUpdate={handleUpdate} />
                        <SettlementTab result={settlement} />
                    </div>
                )}
            </div>
        </main>
    );
}

export default function FlipProjectPage() {
    return (
        <Suspense fallback={<main className="container" style={{ paddingTop: "2rem" }}><p>Laster...</p></main>}>
            <FlipProjectContent />
        </Suspense>
    );
}
