'use client';

import { useState } from 'react';
import { FlipLaborEntry, FlipParticipant } from '@/lib/flip-types';
import { addFlipLabor, deleteFlipLabor } from '@/lib/flip-db';
import { Plus, Trash2, Clock } from 'lucide-react';

interface Props {
    projectId: string;
    labor: FlipLaborEntry[];
    participants: FlipParticipant[];
    onUpdate: () => void;
}

export default function LaborTab({ projectId, labor, participants, onUpdate }: Props) {
    const [isAdding, setIsAdding] = useState(false);

    // Default rate logic
    const getDefaultRate = (pid?: string) => {
        if (!pid && participants.length > 0) return participants[0].standardRate;
        const p = participants.find(part => part.id === pid);
        return p ? p.standardRate : 500;
    };

    const [newEntry, setNewEntry] = useState<Partial<FlipLaborEntry>>({
        date: new Date().toISOString().split('T')[0],
        participantId: participants[0]?.id || '',
        hours: 0,
        rate: getDefaultRate(participants[0]?.id),
        description: '',
        isBillable: true
    });

    const handleParticipantChange = (pid: string) => {
        setNewEntry({
            ...newEntry,
            participantId: pid,
            rate: getDefaultRate(pid) // Auto-update rate when user changes
        });
    };

    const handleAdd = async () => {
        if (!newEntry.participantId || !newEntry.hours) return;

        await addFlipLabor({
            projectId,
            participantId: newEntry.participantId,
            date: newEntry.date!,
            hours: Number(newEntry.hours),
            rate: Number(newEntry.rate),
            description: newEntry.description,
            isBillable: newEntry.isBillable !== false
        });

        setIsAdding(false);
        // Reset but keep date
        setNewEntry({
            ...newEntry,
            hours: 0,
            description: ''
        });
        onUpdate();
    };

    const handleDelete = async (id: string) => {
        if (confirm('Slett timeføring?')) {
            await deleteFlipLabor(id);
            onUpdate();
        }
    };

    const getParticipantName = (id: string) => participants.find(p => p.id === id)?.name || 'Ukjent';

    const totalHours = labor.reduce((sum, l) => sum + l.hours, 0);
    const totalValue = labor.reduce((sum, l) => sum + (l.isBillable ? l.hours * l.rate : 0), 0);

    return (
        <div className="max-w-4xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Clock size={24} /> Timeliste
                </h2>
                <button
                    onClick={() => setIsAdding(true)}
                    className="bg-black text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-800"
                >
                    <Plus size={16} /> Registrer Timer
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 font-medium">
                        <tr>
                            <th className="px-6 py-4 text-left">Dato</th>
                            <th className="px-6 py-4 text-left">Navn</th>
                            <th className="px-6 py-4 text-left">Beskrivelse</th>
                            <th className="px-6 py-4 text-right">Timer</th>
                            <th className="px-6 py-4 text-right">Sats</th>
                            <th className="px-6 py-4 text-right">Totalt</th>
                            <th className="px-6 py-4 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {labor.map(l => (
                            <tr key={l.id} className={!l.isBillable ? 'bg-gray-50 opacity-60' : ''}>
                                <td className="px-6 py-4 text-gray-500">{l.date}</td>
                                <td className="px-6 py-4 font-medium">{getParticipantName(l.participantId)}</td>
                                <td className="px-6 py-4 text-gray-500">
                                    {l.description}
                                    {!l.isBillable && <span className="ml-2 text-xs border border-gray-300 px-1 rounded">Ikke fakturerbar</span>}
                                </td>
                                <td className="px-6 py-4 text-right">{l.hours}</td>
                                <td className="px-6 py-4 text-right">{l.rate}</td>
                                <td className="px-6 py-4 text-right font-medium">
                                    {(l.hours * l.rate).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleDelete(l.id)} className="text-red-500 hover:text-red-700">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t font-medium">
                        <tr>
                            <td colSpan={3} className="px-6 py-3 text-right">Totalt:</td>
                            <td className="px-6 py-3 text-right">{totalHours} t</td>
                            <td></td>
                            <td className="px-6 py-3 text-right">{totalValue.toLocaleString()} kr</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {isAdding && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">Registrer Timer</h3>

                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1">Dato</label>
                                    <input
                                        type="date"
                                        className="w-full border rounded-lg p-2"
                                        value={newEntry.date}
                                        onChange={e => setNewEntry({ ...newEntry, date: e.target.value })}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1">Deltaker</label>
                                    <select
                                        className="w-full border rounded-lg p-2"
                                        value={newEntry.participantId}
                                        onChange={e => handleParticipantChange(e.target.value)}
                                    >
                                        {participants.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-1/2">
                                    <label className="block text-sm font-medium mb-1">Antall Timer</label>
                                    <input
                                        type="number"
                                        className="w-full border rounded-lg p-2"
                                        value={newEntry.hours}
                                        onChange={e => setNewEntry({ ...newEntry, hours: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="w-1/2">
                                    <label className="block text-sm font-medium mb-1">Timesats</label>
                                    <input
                                        type="number"
                                        className="w-full border rounded-lg p-2"
                                        value={newEntry.rate}
                                        onChange={e => setNewEntry({ ...newEntry, rate: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Beskrivelse</label>
                                <input
                                    className="w-full border rounded-lg p-2"
                                    value={newEntry.description}
                                    onChange={e => setNewEntry({ ...newEntry, description: e.target.value })}
                                    placeholder="Maling, riving, administrasjon..."
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isBillable"
                                    checked={newEntry.isBillable}
                                    onChange={e => setNewEntry({ ...newEntry, isBillable: e.target.checked })}
                                />
                                <label htmlFor="isBillable" className="text-sm">Fakturerbar (skal utbetales i oppgjøret)</label>
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
