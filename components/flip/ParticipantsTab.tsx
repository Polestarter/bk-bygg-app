'use client';

import { useState } from 'react';
import { FlipParticipant } from '@/lib/flip-types';
import { addFlipParticipant, deleteFlipParticipant, updateFlipParticipant } from '@/lib/flip-db';
import { Plus, Trash2, User } from 'lucide-react';

interface Props {
    projectId: string;
    participants: FlipParticipant[];
    onUpdate: () => void;
}

export default function ParticipantsTab({ projectId, participants, onUpdate }: Props) {
    const [isAdding, setIsAdding] = useState(false);
    const [newPart, setNewPart] = useState<Partial<FlipParticipant>>({
        name: '',
        role: '',
        standardRate: 500,
        ownershipShare: 0
    });

    const totalOwnership = participants.reduce((sum, p) => sum + p.ownershipShare, 0);

    const handleAdd = async () => {
        if (!newPart.name) return;

        await addFlipParticipant({
            projectId,
            name: newPart.name!,
            role: newPart.role,
            standardRate: newPart.standardRate || 500,
            ownershipShare: newPart.ownershipShare || 0,
            bankAccount: newPart.bankAccount
        });

        setNewPart({ name: '', role: '', standardRate: 500, ownershipShare: 0 });
        setIsAdding(false);
        onUpdate();
    };

    const handleDelete = async (id: string) => {
        if (confirm('Er du sikker på at du vil slette denne deltakeren?')) {
            await deleteFlipParticipant(id);
            onUpdate();
        }
    };

    return (
        <div className="max-w-4xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <User size={24} /> Deltakere
                </h2>
                <button
                    onClick={() => setIsAdding(true)}
                    className="bg-black text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-800"
                >
                    <Plus size={16} /> Legg til deltaker
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 font-medium">
                        <tr>
                            <th className="px-6 py-4 text-left">Navn</th>
                            <th className="px-6 py-4 text-left">Rolle</th>
                            <th className="px-6 py-4 text-right">Timesats</th>
                            <th className="px-6 py-4 text-right">Eierandel</th>
                            <th className="px-6 py-4 text-right">Handling</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {participants.map(p => (
                            <tr key={p.id}>
                                <td className="px-6 py-4 font-medium">{p.name}</td>
                                <td className="px-6 py-4 text-gray-500">{p.role || '-'}</td>
                                <td className="px-6 py-4 text-right">{p.standardRate} kr/t</td>
                                <td className="px-6 py-4 text-right">{p.ownershipShare}%</td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleDelete(p.id)}
                                        className="text-red-500 hover:text-red-700 p-1"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {participants.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                    Ingen deltakere registrert ennå.
                                </td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t">
                        <tr>
                            <td colSpan={3} className="px-6 py-3 text-right font-medium">Totalt Eierskap:</td>
                            <td className={`px-6 py-3 text-right font-bold ${totalOwnership !== 100 ? 'text-red-600' : 'text-green-600'}`}>
                                {totalOwnership}%
                            </td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {totalOwnership !== 100 && (
                <div className="mt-4 p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm border border-yellow-100 flex items-start gap-2">
                    <div className="font-bold">NB:</div>
                    <div>Eierandelene summerer ikke til 100%. Juster andelene for at oppgjøret skal bli korrekt.</div>
                </div>
            )}

            {isAdding && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">Ny Deltaker</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Navn</label>
                                <input
                                    className="w-full border rounded-lg p-2"
                                    value={newPart.name}
                                    onChange={e => setNewPart({ ...newPart, name: e.target.value })}
                                    placeholder="Navn Navnesen"
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1">Rolle</label>
                                    <input
                                        className="w-full border rounded-lg p-2"
                                        value={newPart.role}
                                        onChange={e => setNewPart({ ...newPart, role: e.target.value })}
                                        placeholder="Snekker / Investor"
                                    />
                                </div>
                                <div className="w-1/3">
                                    <label className="block text-sm font-medium mb-1">Eierandel (%)</label>
                                    <input
                                        type="number"
                                        className="w-full border rounded-lg p-2"
                                        value={newPart.ownershipShare}
                                        onChange={e => setNewPart({ ...newPart, ownershipShare: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Standard Timesats (kr)</label>
                                <input
                                    type="number"
                                    className="w-full border rounded-lg p-2"
                                    value={newPart.standardRate}
                                    onChange={e => setNewPart({ ...newPart, standardRate: Number(e.target.value) })}
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
