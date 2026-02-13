'use client';

import { useMemo, useState } from 'react';
import { FlipParticipant } from '@/lib/flip-types';
import { addFlipParticipant, deleteFlipParticipant } from '@/lib/flip-db';
import { Plus, Trash2, Users } from 'lucide-react';

interface Props {
    projectId: string;
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

export default function ParticipantsTab({ projectId, participants, onUpdate }: Props) {
    const [isAdding, setIsAdding] = useState(false);
    const [form, setForm] = useState({
        name: '',
        role: '',
        standardRate: 500,
        ownershipShare: 0,
        bankAccount: ''
    });

    const totalOwnership = useMemo(
        () => participants.reduce((sum, participant) => sum + participant.ownershipShare, 0),
        [participants]
    );

    const handleAdd = async () => {
        const name = form.name.trim();
        if (!name) return;

        await addFlipParticipant({
            projectId,
            name,
            role: form.role.trim() || undefined,
            standardRate: Number(form.standardRate) || 0,
            ownershipShare: Number(form.ownershipShare) || 0,
            bankAccount: form.bankAccount.trim() || undefined
        });

        setForm({
            name: '',
            role: '',
            standardRate: 500,
            ownershipShare: 0,
            bankAccount: ''
        });
        setIsAdding(false);
        onUpdate();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Vil du slette denne deltakeren?')) return;
        await deleteFlipParticipant(id);
        onUpdate();
    };

    return (
        <div style={{ display: 'grid', gap: '1rem' }}>
            <div className="flex-between" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={20} /> Deltakere
                    </h2>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>
                        Sett roller, timesats og eierandel per deltaker.
                    </p>
                </div>

                <button className="btn btn-primary" onClick={() => setIsAdding(true)} style={{ gap: '0.5rem' }}>
                    <Plus size={16} /> Ny deltaker
                </button>
            </div>

            <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
                    <thead>
                        <tr style={{ backgroundColor: 'var(--secondary)' }}>
                            <th style={headerCell}>Navn</th>
                            <th style={headerCell}>Rolle</th>
                            <th style={headerCell}>Konto</th>
                            <th style={{ ...headerCell, textAlign: 'right' }}>Timesats</th>
                            <th style={{ ...headerCell, textAlign: 'right' }}>Eierandel</th>
                            <th style={{ ...headerCell, textAlign: 'right' }}>Handling</th>
                        </tr>
                    </thead>
                    <tbody>
                        {participants.length === 0 && (
                            <tr>
                                <td colSpan={6} style={{ ...cell, color: 'var(--muted-foreground)', textAlign: 'center', padding: '2rem 1rem' }}>
                                    Ingen deltakere er registrert enda.
                                </td>
                            </tr>
                        )}

                        {participants.map((participant) => (
                            <tr key={participant.id} style={{ borderTop: '1px solid var(--border)' }}>
                                <td style={cell}>{participant.name}</td>
                                <td style={{ ...cell, color: 'var(--muted-foreground)' }}>{participant.role || '-'}</td>
                                <td style={{ ...cell, color: 'var(--muted-foreground)' }}>{participant.bankAccount || '-'}</td>
                                <td style={{ ...cell, textAlign: 'right' }}>{participant.standardRate.toLocaleString()} NOK/t</td>
                                <td style={{ ...cell, textAlign: 'right', fontWeight: 600 }}>{participant.ownershipShare}%</td>
                                <td style={{ ...cell, textAlign: 'right' }}>
                                    <button
                                        className="btn btn-ghost"
                                        style={{ color: 'var(--destructive)', padding: '0.4rem 0.6rem' }}
                                        onClick={() => handleDelete(participant.id)}
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
                                Sum eierandel
                            </td>
                            <td
                                style={{
                                    ...cell,
                                    textAlign: 'right',
                                    fontWeight: 700,
                                    color: totalOwnership === 100 ? '#166534' : 'var(--destructive)'
                                }}
                            >
                                {totalOwnership}%
                            </td>
                            <td style={cell} />
                        </tr>
                    </tfoot>
                </table>
            </div>

            {totalOwnership !== 100 && (
                <div className="card" style={{ padding: '0.9rem 1rem', borderColor: '#f59e0b', backgroundColor: '#fffbeb' }}>
                    <p style={{ fontSize: '0.9rem', color: '#92400e' }}>
                        Eierandelene summerer ikke til 100%. Oppgjoret kan bli feil før dette er korrigert.
                    </p>
                </div>
            )}

            {isAdding && (
                <div style={modalOverlay}>
                    <div className="card" style={{ width: '100%', maxWidth: 560 }}>
                        <h3 style={{ marginBottom: '1rem' }}>Ny deltaker</h3>

                        <div style={{ display: 'grid', gap: '0.9rem' }}>
                            <div>
                                <label style={labelStyle}>Navn</label>
                                <input
                                    style={inputStyle}
                                    value={form.name}
                                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                                    placeholder="Fornavn Etternavn"
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={labelStyle}>Rolle</label>
                                    <input
                                        style={inputStyle}
                                        value={form.role}
                                        onChange={(event) => setForm({ ...form, role: event.target.value })}
                                        placeholder="Snekker, investor ..."
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Bankkonto</label>
                                    <input
                                        style={inputStyle}
                                        value={form.bankAccount}
                                        onChange={(event) => setForm({ ...form, bankAccount: event.target.value })}
                                        placeholder="Valgfritt"
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={labelStyle}>Eierandel (%)</label>
                                    <input
                                        style={inputStyle}
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={form.ownershipShare}
                                        onChange={(event) => setForm({ ...form, ownershipShare: Number(event.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Standard timesats (NOK)</label>
                                    <input
                                        style={inputStyle}
                                        type="number"
                                        min={0}
                                        value={form.standardRate}
                                        onChange={(event) => setForm({ ...form, standardRate: Number(event.target.value) })}
                                    />
                                </div>
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
