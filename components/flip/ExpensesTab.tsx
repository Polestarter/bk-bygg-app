'use client';

import { useState } from 'react';
import { FlipExpense, FlipParticipant } from '@/lib/flip-types';
import { addFlipExpense, deleteFlipExpense } from '@/lib/flip-db';
import { Plus, Trash2, Receipt, Filter } from 'lucide-react';

interface Props {
    projectId: string;
    expenses: FlipExpense[];
    participants: FlipParticipant[];
    onUpdate: () => void;
}

export default function ExpensesTab({ projectId, expenses, participants, onUpdate }: Props) {
    const [isAdding, setIsAdding] = useState(false);
    const [newExpense, setNewExpense] = useState<Partial<FlipExpense>>({
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: 0,
        category: 'Materialer',
        paidByParticipantId: participants[0]?.id || '', // Default to first participant
        distributionRule: 'ownership',
        tags: []
    });

    const handleAdd = async () => {
        if (!newExpense.description || !newExpense.amount) return;

        await addFlipExpense({
            projectId,
            date: newExpense.date!,
            description: newExpense.description!,
            amount: Number(newExpense.amount),
            category: newExpense.category,
            paidByParticipantId: newExpense.paidByParticipantId,
            paidByExternal: newExpense.paidByExternal,
            distributionRule: newExpense.distributionRule || 'ownership',
            tags: newExpense.tags
        });

        setIsAdding(false);
        setNewExpense({
            date: new Date().toISOString().split('T')[0],
            description: '',
            amount: 0,
            category: 'Materialer',
            paidByParticipantId: participants[0]?.id || '',
            distributionRule: 'ownership',
            tags: []
        });
        onUpdate();
    };

    const handleDelete = async (id: string) => {
        if (confirm('Slett utlegg?')) {
            await deleteFlipExpense(id);
            onUpdate();
        }
    };

    const getPayerName = (e: FlipExpense) => {
        if (e.paidByParticipantId) {
            return participants.find(p => p.id === e.paidByParticipantId)?.name || 'Ukjent';
        }
        return e.paidByExternal || 'Ekstern';
    };

    return (
        <div className="max-w-4xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Receipt size={24} /> Utlegg
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsAdding(true)}
                        className="bg-black text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-800"
                    >
                        <Plus size={16} /> Nytt Utlegg
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 font-medium">
                        <tr>
                            <th className="px-6 py-4 text-left">Dato</th>
                            <th className="px-6 py-4 text-left">Beskrivelse</th>
                            <th className="px-6 py-4 text-left">Betalt av</th>
                            <th className="px-6 py-4 text-left">Kategori</th>
                            <th className="px-6 py-4 text-right">Beløp</th>
                            <th className="px-6 py-4 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {expenses.map(e => (
                            <tr key={e.id}>
                                <td className="px-6 py-4 text-gray-500">{e.date}</td>
                                <td className="px-6 py-4 font-medium">
                                    {e.description}
                                    {e.tags?.includes('SaleCost') && (
                                        <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">Salgskost</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">{getPayerName(e)}</td>
                                <td className="px-6 py-4 text-gray-500">{e.category}</td>
                                <td className="px-6 py-4 text-right font-medium">{e.amount.toLocaleString()}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleDelete(e.id)} className="text-red-500 hover:text-red-700">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t font-medium">
                        <tr>
                            <td colSpan={4} className="px-6 py-3 text-right">Totalt:</td>
                            <td className="px-6 py-3 text-right">{expenses.reduce((s, e) => s + e.amount, 0).toLocaleString()}</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {isAdding && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">Registrer Ltlegg</h3>

                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1">Dato</label>
                                    <input
                                        type="date"
                                        className="w-full border rounded-lg p-2"
                                        value={newExpense.date}
                                        onChange={e => setNewExpense({ ...newExpense, date: e.target.value })}
                                    />
                                </div>
                                <div className="w-1/2">
                                    <label className="block text-sm font-medium mb-1">Beløp</label>
                                    <input
                                        type="number"
                                        className="w-full border rounded-lg p-2"
                                        value={newExpense.amount}
                                        onChange={e => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Beskrivelse</label>
                                <input
                                    className="w-full border rounded-lg p-2"
                                    value={newExpense.description}
                                    onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
                                    placeholder="F.eks. Maling til stue"
                                />
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1">Betalt av</label>
                                    <select
                                        className="w-full border rounded-lg p-2"
                                        value={newExpense.paidByParticipantId || 'external'}
                                        onChange={(e) => {
                                            if (e.target.value === 'external') {
                                                setNewExpense({ ...newExpense, paidByParticipantId: undefined, paidByExternal: 'Firma/Annet' });
                                            } else {
                                                setNewExpense({ ...newExpense, paidByParticipantId: e.target.value, paidByExternal: undefined });
                                            }
                                        }}
                                    >
                                        {participants.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                        <option value="external">Ekstern / Firma</option>
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1">Kategori</label>
                                    <select
                                        className="w-full border rounded-lg p-2"
                                        value={newExpense.category}
                                        onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}
                                    >
                                        <option>Materialer</option>
                                        <option>Verktøy</option>
                                        <option>Tjenester</option>
                                        <option>Salgskostnad</option>
                                        <option>Annet</option>
                                    </select>
                                </div>
                            </div>

                            {/* Tag toggle for SaleCost if category matches or manual override */}
                            <div className="flex items-center gap-2 mt-2">
                                <input
                                    type="checkbox"
                                    id="saleCost"
                                    checked={newExpense.tags?.includes('SaleCost')}
                                    onChange={(e) => {
                                        const tags = newExpense.tags || [];
                                        if (e.target.checked) {
                                            setNewExpense({ ...newExpense, tags: [...tags, 'SaleCost'] });
                                        } else {
                                            setNewExpense({ ...newExpense, tags: tags.filter(t => t !== 'SaleCost') });
                                        }
                                    }}
                                />
                                <label htmlFor="saleCost" className="text-sm text-gray-700">Dette er en salgskostnad (trekkes fra før overskudd)</label>
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
