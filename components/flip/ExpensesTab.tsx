'use client';

import { useMemo, useState } from 'react';
import { FlipExpense, FlipParticipant } from '@/lib/flip-types';
import { addFlipExpense, deleteFlipExpense } from '@/lib/flip-db';
import { Plus, Receipt, Trash2 } from 'lucide-react';

interface Props {
    projectId: string;
    expenses: FlipExpense[];
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

export default function ExpensesTab({ projectId, expenses, participants, onUpdate }: Props) {
    const [isAdding, setIsAdding] = useState(false);
    const [form, setForm] = useState<Partial<FlipExpense>>({
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: 0,
        category: 'Materialer',
        paidByParticipantId: participants[0]?.id,
        distributionRule: 'ownership',
        tags: []
    });

    const totalAmount = useMemo(
        () => expenses.reduce((sum, expense) => sum + expense.amount, 0),
        [expenses]
    );

    const handleAdd = async () => {
        if (!form.description?.trim() || !form.amount) return;

        await addFlipExpense({
            projectId,
            date: form.date || new Date().toISOString().split('T')[0],
            description: form.description.trim(),
            amount: Number(form.amount),
            category: form.category?.trim() || undefined,
            paidByParticipantId: form.paidByParticipantId || undefined,
            paidByExternal: form.paidByParticipantId ? undefined : (form.paidByExternal?.trim() || 'Ekstern'),
            distributionRule: form.distributionRule || 'ownership',
            tags: form.tags || []
        });

        setForm({
            date: new Date().toISOString().split('T')[0],
            description: '',
            amount: 0,
            category: 'Materialer',
            paidByParticipantId: participants[0]?.id,
            distributionRule: 'ownership',
            tags: []
        });

        setIsAdding(false);
        onUpdate();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Vil du slette dette utlegget?')) return;
        await deleteFlipExpense(id);
        onUpdate();
    };

    const getPayerName = (expense: FlipExpense) => {
        if (expense.paidByParticipantId) {
            return participants.find((participant) => participant.id === expense.paidByParticipantId)?.name || 'Ukjent';
        }
        return expense.paidByExternal || 'Ekstern';
    };

    return (
        <div style={{ display: 'grid', gap: '1rem' }}>
            <div className="flex-between" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Receipt size={20} /> Utlegg
                    </h2>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>
                        Registrer kostnader og hvem som har lagt ut.
                    </p>
                </div>

                <button className="btn btn-primary" onClick={() => setIsAdding(true)} style={{ gap: '0.5rem' }}>
                    <Plus size={16} /> Nytt utlegg
                </button>
            </div>

            <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 860 }}>
                    <thead>
                        <tr style={{ backgroundColor: 'var(--secondary)' }}>
                            <th style={headerCell}>Dato</th>
                            <th style={headerCell}>Beskrivelse</th>
                            <th style={headerCell}>Betalt av</th>
                            <th style={headerCell}>Kategori</th>
                            <th style={{ ...headerCell, textAlign: 'right' }}>Belop</th>
                            <th style={{ ...headerCell, textAlign: 'right' }}>Handling</th>
                        </tr>
                    </thead>
                    <tbody>
                        {expenses.length === 0 && (
                            <tr>
                                <td colSpan={6} style={{ ...cell, color: 'var(--muted-foreground)', textAlign: 'center', padding: '2rem 1rem' }}>
                                    Ingen utlegg registrert enda.
                                </td>
                            </tr>
                        )}

                        {expenses.map((expense) => (
                            <tr key={expense.id} style={{ borderTop: '1px solid var(--border)' }}>
                                <td style={cell}>{expense.date}</td>
                                <td style={cell}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                                        <span>{expense.description}</span>
                                        {expense.tags?.includes('SaleCost') && (
                                            <span style={saleTagStyle}>Salgskostnad</span>
                                        )}
                                    </div>
                                </td>
                                <td style={{ ...cell, color: 'var(--muted-foreground)' }}>{getPayerName(expense)}</td>
                                <td style={{ ...cell, color: 'var(--muted-foreground)' }}>{expense.category || '-'}</td>
                                <td style={{ ...cell, textAlign: 'right', fontWeight: 600 }}>
                                    {expense.amount.toLocaleString()} NOK
                                </td>
                                <td style={{ ...cell, textAlign: 'right' }}>
                                    <button
                                        className="btn btn-ghost"
                                        style={{ color: 'var(--destructive)', padding: '0.4rem 0.6rem' }}
                                        onClick={() => handleDelete(expense.id)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr style={{ borderTop: '1px solid var(--border)', backgroundColor: 'var(--secondary)' }}>
                            <td colSpan={4} style={{ ...cell, textAlign: 'right', fontWeight: 600 }}>
                                Sum
                            </td>
                            <td style={{ ...cell, textAlign: 'right', fontWeight: 700 }}>{totalAmount.toLocaleString()} NOK</td>
                            <td style={cell} />
                        </tr>
                    </tfoot>
                </table>
            </div>

            {isAdding && (
                <div style={modalOverlay}>
                    <div className="card" style={{ width: '100%', maxWidth: 620 }}>
                        <h3 style={{ marginBottom: '1rem' }}>Nytt utlegg</h3>

                        <div style={{ display: 'grid', gap: '0.9rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={labelStyle}>Dato</label>
                                    <input
                                        style={inputStyle}
                                        type="date"
                                        value={form.date || ''}
                                        onChange={(event) => setForm({ ...form, date: event.target.value })}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Belop (NOK)</label>
                                    <input
                                        style={inputStyle}
                                        type="number"
                                        min={0}
                                        value={form.amount || 0}
                                        onChange={(event) => setForm({ ...form, amount: Number(event.target.value) })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>Beskrivelse</label>
                                <input
                                    style={inputStyle}
                                    value={form.description || ''}
                                    onChange={(event) => setForm({ ...form, description: event.target.value })}
                                    placeholder="F.eks. materialer til bad"
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={labelStyle}>Betalt av</label>
                                    <select
                                        style={inputStyle}
                                        value={form.paidByParticipantId || 'external'}
                                        onChange={(event) => {
                                            if (event.target.value === 'external') {
                                                setForm({ ...form, paidByParticipantId: undefined, paidByExternal: 'Ekstern' });
                                                return;
                                            }
                                            setForm({ ...form, paidByParticipantId: event.target.value, paidByExternal: undefined });
                                        }}
                                    >
                                        {participants.map((participant) => (
                                            <option key={participant.id} value={participant.id}>
                                                {participant.name}
                                            </option>
                                        ))}
                                        <option value="external">Ekstern</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Kategori</label>
                                    <input
                                        style={inputStyle}
                                        value={form.category || ''}
                                        onChange={(event) => setForm({ ...form, category: event.target.value })}
                                        placeholder="Materialer, tjenester ..."
                                    />
                                </div>
                            </div>

                            {!form.paidByParticipantId && (
                                <div>
                                    <label style={labelStyle}>Ekstern betaler</label>
                                    <input
                                        style={inputStyle}
                                        value={form.paidByExternal || ''}
                                        onChange={(event) => setForm({ ...form, paidByExternal: event.target.value })}
                                        placeholder="F.eks. firma eller bank"
                                    />
                                </div>
                            )}

                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                <input
                                    type="checkbox"
                                    checked={form.tags?.includes('SaleCost') || false}
                                    onChange={(event) => {
                                        const tags = form.tags || [];
                                        if (event.target.checked) {
                                            setForm({ ...form, tags: [...tags.filter((tag) => tag !== 'SaleCost'), 'SaleCost'] });
                                            return;
                                        }
                                        setForm({ ...form, tags: tags.filter((tag) => tag !== 'SaleCost') });
                                    }}
                                />
                                Marker som salgskostnad (trekkes fra ved oppgjor)
                            </label>
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

const saleTagStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    padding: '0.15rem 0.45rem',
    borderRadius: 999,
    backgroundColor: '#dcfce7',
    color: '#166534',
    border: '1px solid #86efac'
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
