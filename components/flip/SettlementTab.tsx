'use client';

import { SettlementResult } from '@/lib/flip-types';
import { ArrowDown } from 'lucide-react';

interface Props {
    result: SettlementResult | null;
}

export default function SettlementTab({ result }: Props) {
    if (!result) return <div className="p-4">Ingen beregning tilgjengelig.</div>;

    const { netProceeds, waterfall, participants, externalCreditors } = result;

    return (
        <div className="max-w-4xl space-y-8">
            <h2 className="text-2xl font-bold">Endelig Oppgjør (Waterfall)</h2>

            {/* Waterfall Steps Visual */}
            <div className="space-y-4">
                {/* Step 0: Net Proceeds */}
                <div className="bg-green-50 border border-green-200 p-4 rounded-xl flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-green-800">Start: Nettoproveny</h3>
                        <p className="text-sm text-green-600">Tilgjengelig for fordeling etter salgskostnader</p>
                    </div>
                    <div className="text-xl font-bold text-green-800">{netProceeds.toLocaleString()} NOK</div>
                </div>

                <div className="flex justify-center"><ArrowDown className="text-gray-300" /></div>

                {/* Step 1: Prio 1 */}
                <div className="bg-white border p-4 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold">1. Private Lån & Innskudd (Prio 1)</h3>
                        <div className="text-sm font-medium">
                            <span className="text-gray-500">Krav: {waterfall.step1_privateLoans.total.toLocaleString()}</span>
                            <span className="mx-2">→</span>
                            <span className="text-black">Betalt: {waterfall.step1_privateLoans.paid.toLocaleString()}</span>
                        </div>
                    </div>
                    {waterfall.step1_privateLoans.remaining > 0 && (
                        <div className="text-xs text-red-500 font-medium bg-red-50 px-2 py-1 rounded inline-block">
                            Manglende dekning: {waterfall.step1_privateLoans.remaining.toLocaleString()}
                        </div>
                    )}
                </div>

                <div className="flex justify-center"><ArrowDown className="text-gray-300" /></div>

                {/* Step 2: Prio 2 */}
                <div className="bg-white border p-4 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold">2. Andre Lån / Eksterne (Prio 2)</h3>
                        <div className="text-sm font-medium">
                            <span className="text-gray-500">Krav: {waterfall.step2_otherLoans.total.toLocaleString()}</span>
                            <span className="mx-2">→</span>
                            <span className="text-black">Betalt: {waterfall.step2_otherLoans.paid.toLocaleString()}</span>
                        </div>
                    </div>
                    {externalCreditors.map((c, i) => (
                        <div key={i} className="text-sm flex justify-between text-gray-600 border-t pt-1 mt-1">
                            <span>{c.name} ({c.type})</span>
                            <span>{c.amountPaid.toLocaleString()} / {c.amountOwed.toLocaleString()}</span>
                        </div>
                    ))}
                    {waterfall.step2_otherLoans.remaining > 0 && (
                        <div className="text-xs text-red-500 mt-2">
                            Prio 2 ikke fullt dekket! Eierne må dekke {waterfall.step2_otherLoans.remaining.toLocaleString()}.
                        </div>
                    )}
                </div>

                <div className="flex justify-center"><ArrowDown className="text-gray-300" /></div>

                {/* Step 3: Labor */}
                <div className="bg-white border p-4 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold">3. Arbeidstimer (Prio 3)</h3>
                        <div className="text-sm font-medium">
                            <span className="text-gray-500">Krav: {waterfall.step3_labor.total.toLocaleString()}</span>
                            <span className="mx-2">→</span>
                            <span className="text-black">Betalt: {waterfall.step3_labor.paid.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center"><ArrowDown className="text-gray-300" /></div>

                {/* Step 4: Equity */}
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-blue-900">4. Resterende Overskudd (Equity)</h3>
                        <p className="text-sm text-blue-700">Fordeles etter eierbrøk</p>
                    </div>
                    <div className="text-xl font-bold text-blue-900">{waterfall.step4_equity.pool.toLocaleString()} NOK</div>
                </div>
            </div>

            {/* Final Report Table */}
            <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">Utbetalingsoversikt</h3>
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-800 text-white">
                            <tr>
                                <th className="px-6 py-4 text-left">Deltaker</th>
                                <th className="px-6 py-4 text-right">Utlegg (Refusjon)</th>
                                <th className="px-6 py-4 text-right">Lån (Tilbakebetaling)</th>
                                <th className="px-6 py-4 text-right">Timer (Lønn)</th>
                                <th className="px-6 py-4 text-right">Overskudd (Andel)</th>
                                <th className="px-6 py-4 text-right bg-black text-white font-bold">TOTALT UT</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {participants.map(p => (
                                <tr key={p.participantId}>
                                    <td className="px-6 py-4 font-bold">{p.name} ({p.ownershipShare}%)</td>
                                    <td className="px-6 py-4 text-right">{Math.round(p.reimbursementExpenses).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right">{Math.round(p.reimbursementLoans).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right">{Math.round(p.payoutLabor).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right">{Math.round(p.payoutEquity).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right font-bold bg-gray-50">{Math.round(p.totalPayout).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Net Position */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {participants.map(p => (
                        <div key={p.participantId} className={`p-4 rounded-xl border ${p.balance >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            <h4 className="font-bold mb-2">{p.name} - Netto Resultat</h4>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Totalt Mottatt:</span>
                                <span>{Math.round(p.totalPayout).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm mb-1 text-gray-500">
                                <span>Investert (Utlegg + Lån):</span>
                                <span>- {(p.totalExpensesPaid + p.totalLoansProvided).toLocaleString()}</span>
                            </div>
                            <div className={`mt-2 pt-2 border-t font-bold text-lg ${p.balance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                {p.balance >= 0 ? 'Gevinst: ' : 'Tap/Utlegg: '}
                                {Math.round(p.balance).toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
