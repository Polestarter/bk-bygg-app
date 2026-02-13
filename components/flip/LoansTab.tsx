'use client';

import { useMemo, useState } from 'react';
import { FlipLoan, FlipParticipant } from '@/lib/flip-types';
import { addFlipLoan, deleteFlipLoan } from '@/lib/flip-db';
import { Banknote, Plus, Trash2 } from 'lucide-react';

interface Props {
    projectId: string;
    loans: FlipLoan[];
    participants: FlipParticipant[];
    onUpdate: () => void;
}

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.6rem 0.7rem',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--background)',
    color: 'var(--foreground)'
};

export default function LoansTab({ projectId, loans, participants, onUpdate }: Props) {
    const [isAdding, setIsAdding] = useState(false);
    const [form, setForm] = useState<Partial<FlipLoan>>({
        type: 'PrivateLoan',
        principalAmount: 0,
        lenderParticipantId: participants[0]?.id,
        lenderExternal: '',
        notes: ''
    });

    const totals = useMemo(() => {
        const privateTotal = loans
            .filter((loan) => loan.type === 'PrivateLoan')
            .reduce((sum, loan) => sum + loan.principalAmount, 0);

        const otherTotal = loans
            .filter((loan) => loan.type === 'OtherLoan')
            .reduce((sum, loan) => sum + loan.principalAmount, 0);

        return { privateTotal, otherTotal, all: privateTotal + otherTotal };
    }, [loans]);

    const handleAdd = async () => {
        if (!form.principalAmount) return;

        await addFlipLoan({
            projectId,
            type: form.type || 'PrivateLoan',
            principalAmount: Number(form.principalAmount),
            lenderParticipantId: form.type === 'PrivateLoan' ? form.lenderParticipantId : undefined,
            lenderExternal: form.type === 'OtherLoan' ? (form.lenderExternal?.trim() || 'Bank') : undefined,
            notes: form.notes?.trim() || undefined
        });

        setForm({
            type: 'PrivateLoan',
            principalAmount: 0,
            lenderParticipantId: participants[0]?.id,
            lenderExternal: '',
            notes: ''
        });

        setIsAdding(false);
        onUpdate();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Vil du slette dette lanet?')) return;
        await deleteFlipLoan(id);
        onUpdate();
    };

    const getLender = (loan: FlipLoan) => {
        if (loan.type === 'PrivateLoan' && loan.lenderParticipantId) {
            return participants.find((participant) => participant.id === loan.lenderParticipantId)?.name || 'Ukjent';
        }
        return loan.lenderExternal || 'Ekstern';
    };

    return (
        <div style={{ display: 'grid', gap: '1rem' }}>
            <div className="flex-between" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Banknote size={20} /> Lan
                    </h2>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>
                        Hold oversikt over private lan og eksterne lan.
                    </p>
                </div>

                <button className="btn btn-primary" onClick={() => setIsAdding(true)} style={{ gap: '0.5rem' }}>
                    <Plus size={16} /> Nytt lan
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                <div className="card" style={{ padding: '0.85rem 1rem' }}>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '0.85rem' }}>Privat lan (prio 1)</p>
                    <p style={{ fontWeight: 700, fontSize: '1.2rem' }}>{totals.privateTotal.toLocaleString()} NOK</p>
                </div>
                <div className="card" style={{ padding: '0.85rem 1rem' }}>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '0.85rem' }}>Andre lan (prio 2)</p>
                    <p style={{ fontWeight: 700, fontSize: '1.2rem' }}>{totals.otherTotal.toLocaleString()} NOK</p>
                </div>
                <div className="card" style={{ padding: '0.85rem 1rem' }}>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '0.85rem' }}>Totalt</p>
                    <p style={{ fontWeight: 700, fontSize: '1.2rem' }}>{totals.all.toLocaleString()} NOK</p>
                </div>
            </div>

            <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 820 }}>
                    <thead>
                        <tr style={{ backgroundColor: 'var(--secondary)' }}>
                            <th style={headerCell}>Type</th>
                            <th style={headerCell}>Langiver</th>
                            <th style={headerCell}>Notat</th>
                            <th style={{ ...headerCell, textAlign: 'right' }}>Belop</th>
                            <th style={{ ...headerCell, textAlign: 'right' }}>Handling</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loans.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ ...cell, color: 'var(--muted-foreground)', textAlign: 'center', padding: '2rem 1rem' }}>
                                    Ingen lan registrert enda.
                                </td>
                            </tr>
                        )}

                        {loans.map((loan) => (
                            <tr key={loan.id} style={{ borderTop: '1px solid var(--border)' }}>
                                <td style={cell}>
                                    <span style={loan.type === 'PrivateLoan' ? typePrivateStyle : typeOtherStyle}>
                                        {loan.type === 'PrivateLoan' ? 'Privat (prio 1)' : 'Annet (prio 2)'}
                                    </span>
                                </td>
                                <td style={cell}>{getLender(loan)}</td>
                                <td style={{ ...cell, color: 'var(--muted-foreground)' }}>{loan.notes || '-'}</td>
                                <td style={{ ...cell, textAlign: 'right', fontWeight: 600 }}>
                                    {loan.principalAmount.toLocaleString()} NOK
                                </td>
                                <td style={{ ...cell, textAlign: 'right' }}>
                                    <button
                                        className="btn btn-ghost"
                                        style={{ color: 'var(--destructive)', padding: '0.4rem 0.6rem' }}
                                        onClick={() => handleDelete(loan.id)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isAdding && (
                <div style={modalOverlay}>
                    <div className="card" style={{ width: '100%', maxWidth: 560 }}>
                        <h3 style={{ marginBottom: '1rem' }}>Nytt lan</h3>

                        <div style={{ display: 'grid', gap: '0.9rem' }}>
                            <div>
                                <label style={labelStyle}>Type</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        className="btn btn-outline"
                                        onClick={() => setForm({ ...form, type: 'PrivateLoan' })}
                                        style={form.type === 'PrivateLoan' ? selectedTypeStyle : undefined}
                                    >
                                        Privat lan
                                    </button>
                                    <button
                                        className="btn btn-outline"
                                        onClick={() => setForm({ ...form, type: 'OtherLoan', lenderExternal: form.lenderExternal || 'Bank' })}
                                        style={form.type === 'OtherLoan' ? selectedTypeStyle : undefined}
                                    >
                                        Annet lan
                                    </button>
                                </div>
                            </div>

                            {form.type === 'PrivateLoan' ? (
                                <div>
                                    <label style={labelStyle}>Langiver (deltaker)</label>
                                    <select
                                        style={inputStyle}
                                        value={form.lenderParticipantId || ''}
                                        onChange={(event) => setForm({ ...form, lenderParticipantId: event.target.value })}
                                    >
                                        {participants.map((participant) => (
                                            <option key={participant.id} value={participant.id}>
                                                {participant.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div>
                                    <label style={labelStyle}>Langiver (ekstern)</label>
                                    <input
                                        style={inputStyle}
                                        value={form.lenderExternal || ''}
                                        onChange={(event) => setForm({ ...form, lenderExternal: event.target.value })}
                                        placeholder="F.eks. DNB"
                                    />
                                </div>
                            )}

                            <div>
                                <label style={labelStyle}>Belop (NOK)</label>
                                <input
                                    style={inputStyle}
                                    type="number"
                                    min={0}
                                    value={form.principalAmount || 0}
                                    onChange={(event) => setForm({ ...form, principalAmount: Number(event.target.value) })}
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Notat</label>
                                <textarea
                                    style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                                    value={form.notes || ''}
                                    onChange={(event) => setForm({ ...form, notes: event.target.value })}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.2rem' }}>
                            <button className="btn btn-ghost" onClick={() => setIsAdding(false)}>Avbryt</button>
                            <button className="btn btn-primary" onClick={handleAdd}>Lagre</button>
                        </div>
                    </div>
                </div>
            )}
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
    fontSize: '0.92rem'
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '0.35rem',
    fontSize: '0.85rem',
    color: 'var(--muted-foreground)'
};

const typePrivateStyle: React.CSSProperties = {
    padding: '0.2rem 0.45rem',
    borderRadius: 999,
    backgroundColor: '#dcfce7',
    color: '#166534',
    border: '1px solid #86efac',
    fontSize: '0.75rem',
    fontWeight: 600
};

const typeOtherStyle: React.CSSProperties = {
    padding: '0.2rem 0.45rem',
    borderRadius: 999,
    backgroundColor: 'var(--secondary)',
    color: 'var(--foreground)',
    border: '1px solid var(--border)',
    fontSize: '0.75rem',
    fontWeight: 600
};

const selectedTypeStyle: React.CSSProperties = {
    borderColor: 'var(--primary)',
    backgroundColor: 'rgba(163, 230, 53, 0.2)'
};

const modalOverlay: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    zIndex: 50
};
