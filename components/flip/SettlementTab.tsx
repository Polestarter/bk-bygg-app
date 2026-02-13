'use client';

import { SettlementResult } from '@/lib/flip-types';
import { ArrowDown } from 'lucide-react';

interface Props {
    result: SettlementResult | null;
}

export default function SettlementTab({ result }: Props) {
    if (!result) {
        return (
            <div className="card">
                <p style={{ color: 'var(--muted-foreground)' }}>Ingen oppgjor beregnet enda.</p>
            </div>
        );
    }

    const { netProceeds, waterfall, participants, externalCreditors } = result;

    return (
        <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
                <h2 style={{ fontSize: '1.25rem' }}>Oppgjor</h2>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>
                    Fordeling skjer i prioritert rekkefolge fra nettoproveny.
                </p>
            </div>

            <div style={{ display: 'grid', gap: '0.6rem' }}>
                <StepCard
                    title="Start: nettoproveny"
                    subtitle="Belop tilgjengelig etter salgskostnader"
                    right={`${Math.round(netProceeds).toLocaleString()} NOK`}
                    accent="#166534"
                    background="#dcfce7"
                />

                <ArrowBreak />

                <StepCard
                    title="1. Private lan og innskudd (prio 1)"
                    subtitle={`Krav ${Math.round(waterfall.step1_privateLoans.total).toLocaleString()} NOK, betalt ${Math.round(waterfall.step1_privateLoans.paid).toLocaleString()} NOK`}
                    right={`Rest ${Math.round(waterfall.step1_privateLoans.remaining).toLocaleString()} NOK`}
                />

                <ArrowBreak />

                <div className="card" style={{ padding: '0.95rem 1rem' }}>
                    <div className="flex-between" style={{ gap: '0.75rem', flexWrap: 'wrap' }}>
                        <div>
                            <h3 style={{ fontSize: '1rem' }}>2. Eksterne lan (prio 2)</h3>
                            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.85rem' }}>
                                Krav {Math.round(waterfall.step2_otherLoans.total).toLocaleString()} NOK, betalt {Math.round(waterfall.step2_otherLoans.paid).toLocaleString()} NOK
                            </p>
                        </div>
                        <strong style={{ fontSize: '0.95rem' }}>
                            Rest {Math.round(waterfall.step2_otherLoans.remaining).toLocaleString()} NOK
                        </strong>
                    </div>

                    {externalCreditors.length > 0 && (
                        <div style={{ marginTop: '0.8rem', borderTop: '1px solid var(--border)' }}>
                            {externalCreditors.map((creditor) => (
                                <div
                                    key={`${creditor.name}-${creditor.type}`}
                                    className="flex-between"
                                    style={{ paddingTop: '0.55rem', fontSize: '0.88rem', color: 'var(--muted-foreground)' }}
                                >
                                    <span>{creditor.name} ({creditor.type})</span>
                                    <span>
                                        {Math.round(creditor.amountPaid).toLocaleString()} / {Math.round(creditor.amountOwed).toLocaleString()} NOK
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <ArrowBreak />

                <StepCard
                    title="3. Arbeidstimer (prio 3)"
                    subtitle={`Krav ${Math.round(waterfall.step3_labor.total).toLocaleString()} NOK, betalt ${Math.round(waterfall.step3_labor.paid).toLocaleString()} NOK`}
                    right={`Rest ${Math.round(waterfall.step3_labor.remaining).toLocaleString()} NOK`}
                />

                <ArrowBreak />

                <StepCard
                    title="4. Overskudd etter eierandel"
                    subtitle="Resterende belop fordeles pa eiere"
                    right={`${Math.round(waterfall.step4_equity.pool).toLocaleString()} NOK`}
                    accent="#1d4ed8"
                    background="#dbeafe"
                />
            </div>

            <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 980 }}>
                    <thead>
                        <tr style={{ backgroundColor: 'var(--secondary)' }}>
                            <th style={headerCell}>Deltaker</th>
                            <th style={{ ...headerCell, textAlign: 'right' }}>Refusjon utlegg</th>
                            <th style={{ ...headerCell, textAlign: 'right' }}>Tilbakebetaling lan</th>
                            <th style={{ ...headerCell, textAlign: 'right' }}>Utbetaling timer</th>
                            <th style={{ ...headerCell, textAlign: 'right' }}>Andel overskudd</th>
                            <th style={{ ...headerCell, textAlign: 'right' }}>Totalt ut</th>
                            <th style={{ ...headerCell, textAlign: 'right' }}>Netto</th>
                        </tr>
                    </thead>
                    <tbody>
                        {participants.map((participant) => (
                            <tr key={participant.participantId} style={{ borderTop: '1px solid var(--border)' }}>
                                <td style={cell}>
                                    <strong>{participant.name}</strong>
                                    <div style={{ color: 'var(--muted-foreground)', fontSize: '0.8rem' }}>
                                        {participant.ownershipShare}% eierandel
                                    </div>
                                </td>
                                <td style={{ ...cell, textAlign: 'right' }}>{Math.round(participant.reimbursementExpenses).toLocaleString()} NOK</td>
                                <td style={{ ...cell, textAlign: 'right' }}>{Math.round(participant.reimbursementLoans).toLocaleString()} NOK</td>
                                <td style={{ ...cell, textAlign: 'right' }}>{Math.round(participant.payoutLabor).toLocaleString()} NOK</td>
                                <td style={{ ...cell, textAlign: 'right' }}>{Math.round(participant.payoutEquity).toLocaleString()} NOK</td>
                                <td style={{ ...cell, textAlign: 'right', fontWeight: 700 }}>{Math.round(participant.totalPayout).toLocaleString()} NOK</td>
                                <td style={{ ...cell, textAlign: 'right', fontWeight: 700, color: participant.balance >= 0 ? '#166534' : 'var(--destructive)' }}>
                                    {Math.round(participant.balance).toLocaleString()} NOK
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function ArrowBreak() {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--muted-foreground)' }}>
            <ArrowDown size={16} />
        </div>
    );
}

function StepCard({
    title,
    subtitle,
    right,
    accent,
    background
}: {
    title: string;
    subtitle: string;
    right: string;
    accent?: string;
    background?: string;
}) {
    return (
        <div className="card" style={{ padding: '0.95rem 1rem', backgroundColor: background || 'var(--card)' }}>
            <div className="flex-between" style={{ gap: '0.75rem', flexWrap: 'wrap' }}>
                <div>
                    <h3 style={{ fontSize: '1rem', color: accent || 'var(--foreground)' }}>{title}</h3>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '0.85rem' }}>{subtitle}</p>
                </div>
                <strong style={{ fontSize: '0.95rem', color: accent || 'var(--foreground)' }}>{right}</strong>
            </div>
        </div>
    );
}

const headerCell: React.CSSProperties = {
    padding: '0.85rem 1rem',
    textAlign: 'left',
    fontSize: '0.85rem',
    color: 'var(--muted-foreground)',
    fontWeight: 600
};

const cell: React.CSSProperties = {
    padding: '0.85rem 1rem',
    fontSize: '0.9rem'
};
