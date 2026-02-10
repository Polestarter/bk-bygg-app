'use client';

import { useState } from 'react';
import { FlipLoan, FlipParticipant } from '@/lib/flip-types';
import { addFlipLoan, deleteFlipLoan } from '@/lib/flip-db';
import { Plus, Trash2, Banknote } from 'lucide-react';

interface Props {
    projectId: string;
    loans: FlipLoan[];
    participants: FlipParticipant[];
    onUpdate: () => void;
}

export default function LoansTab({ projectId, loans, participants, onUpdate }: Props) {
    const [isAdding, setIsAdding] = useState(false);
    const [newLoan, setNewLoan] = useState<Partial<FlipLoan>>({
        type: 'PrivateLoan',
        principalAmount: 0,
        lenderParticipantId: participants[0]?.id || '',
        lenderExternal: '',
        notes: ''
    });

    const handleAdd = async () => {
        if (!newLoan.principalAmount) return;

        await addFlipLoan({
            projectId,
            type: newLoan.type!,
            principalAmount: Number(newLoan.principalAmount),
            lenderParticipantId: newLoan.type === 'PrivateLoan' ? newLoan.lenderParticipantId : undefined,
            lenderExternal: newLoan.type === 'OtherLoan' ? (newLoan.lenderExternal || 'Bank') : undefined,
            notes: newLoan.notes
        });

        setIsAdding(false);
        setNewLoan({
            type: 'PrivateLoan',
            principalAmount: 0,
            lenderParticipantId: participants[0]?.id || '',
            lenderExternal: '',
            notes: ''
        });
        onUpdate();
    };

    const handleDelete = async (id: string) => {
        if (confirm('Slett lån?')) {
            await deleteFlipLoan(id);
            onUpdate();
        }
    };

    const getLenderName = (l: FlipLoan) => {
        if (l.type === 'PrivateLoan' && l.lenderParticipantId) {
            return participants.find(p => p.id === l.lenderParticipantId)?.name || 'Ukjent partner';
        }
        return l.lenderExternal || 'Ekstern';
    };

    return (
        <div className="max-w-4xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Banknote size={24} /> Lån & Finansiering
                </h2>
                <button
                    onClick={() => setIsAdding(true)}
                    className="bg-black text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-800"
                >
                    <Plus size={16} /> Nytt Lån
                </button>
            </div>

            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <h3 className="font-bold text-blue-900 mb-1">Privat Lån (Prio 1)</h3>
                    <p className="text-sm text-blue-700">Lån fra partnere. Tilbakebetales først ved oppgjør.</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-1">Andre Lån (Prio 2)</h3>
                    <p className="text-sm text-gray-700">Banklån, firmalån, etc. Tilbakebetales etter private lån men før overskudd.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 font-medium">
                        <tr>
                            <th className="px-6 py-4 text-left">Type</th>
                            <th className="px-6 py-4 text-left">Långiver</th>
                            <th className="px-6 py-4 text-left">Notat</th>
                            <th className="px-6 py-4 text-right">Beløp</th>
                            <th className="px-6 py-4 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loans.map(l => (
                            <tr key={l.id}>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-medium 
                                        ${l.type === 'PrivateLoan' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                        {l.type === 'PrivateLoan' ? 'Privat (Prio 1)' : 'Annet (Prio 2)'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-medium">{getLenderName(l)}</td>
                                <td className="px-6 py-4 text-gray-500">{l.notes || '-'}</td>
                                <td className="px-6 py-4 text-right font-medium">{l.principalAmount.toLocaleString()}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleDelete(l.id)} className="text-red-500 hover:text-red-700">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isAdding && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">Registrer Lån</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Type Lån</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setNewLoan({ ...newLoan, type: 'PrivateLoan' })}
                                        className={`py-2 rounded-lg border text-sm ${newLoan.type === 'PrivateLoan' ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold' : 'border-gray-200'}`}
                                    >
                                        Privat (Partner)
                                    </button>
                                    <button
                                        onClick={() => setNewLoan({ ...newLoan, type: 'OtherLoan', lenderExternal: 'Bank' })}
                                        className={`py-2 rounded-lg border text-sm ${newLoan.type === 'OtherLoan' ? 'bg-gray-100 border-gray-500 text-black font-bold' : 'border-gray-200'}`}
                                    >
                                        Annet (Bank/Firma)
                                    </button>
                                </div>
                            </div>

                            {newLoan.type === 'PrivateLoan' ? (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Långiver (Partner)</label>
                                    <select
                                        className="w-full border rounded-lg p-2"
                                        value={newLoan.lenderParticipantId}
                                        onChange={(e) => setNewLoan({ ...newLoan, lenderParticipantId: e.target.value })}
                                    >
                                        {participants.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Långiver (Navn/Bank)</label>
                                    <input
                                        className="w-full border rounded-lg p-2"
                                        value={newLoan.lenderExternal}
                                        onChange={(e) => setNewLoan({ ...newLoan, lenderExternal: e.target.value })}
                                        placeholder="F.eks. DNB Boliglån"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium mb-1">Lånebeløp</label>
                                <input
                                    type="number"
                                    className="w-full border rounded-lg p-2"
                                    value={newLoan.principalAmount}
                                    onChange={(e) => setNewLoan({ ...newLoan, principalAmount: Number(e.target.value) })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Notat</label>
                                <textarea
                                    className="w-full border rounded-lg p-2"
                                    value={newLoan.notes}
                                    onChange={(e) => setNewLoan({ ...newLoan, notes: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Avbryt</button>
                            <button onClick={handleAdd} className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">Lagre</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
