'use client';

import { useMemo, useState } from 'react';
import { FlipLaborEntry, FlipParticipant } from '@/lib/flip-types';
import { addFlipLabor, deleteFlipLabor } from '@/lib/flip-db';
import { Clock3, Plus, Trash2 } from 'lucide-react';

interface Props {
    projectId: string;
    labor: FlipLaborEntry[];
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

export default function LaborTab({ projectId, labor, participants, onUpdate }: Props) {
    const firstParticipantId = participants[0]?.id || '';

    const getRate = (participantId: string) => {
        return participants.find((participant) => participant.id === participantId)?.standardRate || 500;
    };

    const [isAdding, setIsAdding] = useState(false);
    const [form, setForm] = useState<Partial<FlipLaborEntry>>({
        date: new Date().toISOString().split('T')[0],
        participantId: firstParticipantId,
        hours: 0,
        rate: getRate(firstParticipantId),
        description: '',
        isBillable: true
    });

    const totals = useMemo(() => {
        const totalHours = labor.reduce((sum, entry) => sum + entry.hours, 0);
        const billableValue = labor.reduce((sum, entry) => sum + (entry.isBillable ? entry.hours * entry.rate : 0), 0);
        return { totalHours, billableValue };
    }, [labor]);

    const handleParticipantChange = (participantId: string) => {
        setForm({ ...form, participantId, rate: getRate(participantId) });
    };

    const handleAdd = async () => {
        if (!form.participantId || !form.hours) return;

        await addFlipLabor({
            projectId,
            participantId: form.participantId,
            date: form.date || new Date().toISOString().split('T')[0],
            hours: Number(form.hours),
            rate: Number(form.rate) || 0,
            description: form.description?.trim() || undefined,
            isBillable: form.isBillable !== false
        });

        setForm({
            ...form,
            hours: 0,
            description: ''
        });

        setIsAdding(false);
        onUpdate();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Vil du slette denne timeforingen?')) return;
        await deleteFlipLabor(id);
        onUpdate();
    };

    const getParticipantName = (participantId: string) => {
        return participants.find((participant) => participant.id === participantId)?.name || 'Ukjent';
    };

    return (
        <div style={{ display: 'grid', gap: '1rem' }}>
            <div className="flex-between" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock3 size={20} /> Timer
                    </h2>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>
                        For timer per deltaker med sats og fakturerbar status.
                    </p>
                </div>

                <button className="btn btn-primary" onClick={() => setIsAdding(true)} style={{ gap: '0.5rem' }}>
                    <Plus size={16} /> Ny timeforing
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                <div className="card" style={{ padding: '0.85rem 1rem' }}>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '0.85rem' }}>Totale timer</p>
                    <p style={{ fontWeight: 700, fontSize: '1.2rem' }}>{totals.totalHours.toLocaleString()} t</p>
                </div>
                <div className="card" style={{ padding: '0.85rem 1rem' }}>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '0.85rem' }}>Fakturerbar verdi</p>
                    <p style={{ fontWeight: 700, fontSize: '1.2rem' }}>{totals.billableValue.toLocaleString()} NOK</p>
                </div>
            </div>

            <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 880 }}>
                    <thead>
                        <tr style={{ backgroundColor: 'var(--secondary)' }}>
                            <th style={headerCell}>Dato</th>
                            <th style={headerCell}>Deltaker</th>
                            <th style={headerCell}>Beskrivelse</th>
                            <th style={{ ...headerCell, textAlign: 'right' }}>Timer</th>
                            <th style={{ ...headerCell, textAlign: 'right' }}>Sats</th>
                            <th style={{ ...headerCell, textAlign: 'right' }}>Verdi</th>
                            <th style={{ ...headerCell, textAlign: 'right' }}>Handling</th>
                        </tr>
                    </thead>
                    <tbody>
                        {labor.length === 0 && (
                            <tr>
                                <td colSpan={7} style={{ ...cell, color: 'var(--muted-foreground)', textAlign: 'center', padding: '2rem 1rem' }}>
                                    Ingen timer registrert enda.
                                </td>
                            </tr>
                        )}

                        {labor.map((entry) => (
                            <tr key={entry.id} style={{ borderTop: '1px solid var(--border)', backgroundColor: entry.isBillable ? 'transparent' : '#f8fafc' }}>
                                <td style={cell}>{entry.date}</td>
                                <td style={cell}>{getParticipantName(entry.participantId)}</td>
                                <td style={{ ...cell, color: 'var(--muted-foreground)' }}>
                                    {entry.description || '-'}
                                    {!entry.isBillable && (
                                        <span style={nonBillableStyle}>Ikke fakturerbar</span>
                                    )}
                                </td>
                                <td style={{ ...cell, textAlign: 'right' }}>{entry.hours.toLocaleString()}</td>
                                <td style={{ ...cell, textAlign: 'right' }}>{entry.rate.toLocaleString()} NOK/t</td>
                                <td style={{ ...cell, textAlign: 'right', fontWeight: 600 }}>
                                    {(entry.hours * entry.rate).toLocaleString()} NOK
                                </td>
                                <td style={{ ...cell, textAlign: 'right' }}>
                                    <button
                                        className="btn btn-ghost"
                                        style={{ color: 'var(--destructive)', padding: '0.4rem 0.6rem' }}
                                        onClick={() => handleDelete(entry.id)}
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
                    <div className="card" style={{ width: '100%', maxWidth: 620 }}>
                        <h3 style={{ marginBottom: '1rem' }}>Ny timeforing</h3>

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
                                    <label style={labelStyle}>Deltaker</label>
                                    <select
                                        style={inputStyle}
                                        value={form.participantId || ''}
                                        onChange={(event) => handleParticipantChange(event.target.value)}
                                    >
                                        {participants.map((participant) => (
                                            <option key={participant.id} value={participant.id}>
                                                {participant.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={labelStyle}>Timer</label>
                                    <input
                                        style={inputStyle}
                                        type="number"
                                        min={0}
                                        value={form.hours || 0}
                                        onChange={(event) => setForm({ ...form, hours: Number(event.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Sats (NOK/t)</label>
                                    <input
                                        style={inputStyle}
                                        type="number"
                                        min={0}
                                        value={form.rate || 0}
                                        onChange={(event) => setForm({ ...form, rate: Number(event.target.value) })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>Beskrivelse</label>
                                <input
                                    style={inputStyle}
                                    value={form.description || ''}
                                    onChange={(event) => setForm({ ...form, description: event.target.value })}
                                    placeholder="F.eks. sparkling, maling, administrasjon"
                                />
                            </div>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                <input
                                    type="checkbox"
                                    checked={form.isBillable !== false}
                                    onChange={(event) => setForm({ ...form, isBillable: event.target.checked })}
                                />
                                Fakturerbar i oppgjor
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

const nonBillableStyle: React.CSSProperties = {
    display: 'inline-block',
    marginLeft: '0.45rem',
    fontSize: '0.75rem',
    padding: '0.1rem 0.45rem',
    borderRadius: 999,
    border: '1px solid var(--border)',
    color: 'var(--muted-foreground)'
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
