'use client';

import { useState, useEffect } from 'react';
import { FlipSale } from '@/lib/flip-types';
import { upsertFlipSale } from '@/lib/flip-db';
import { Gavel, Save } from 'lucide-react';

interface Props {
    projectId: string;
    sale?: FlipSale;
    onUpdate: () => void;
}

export default function SaleTab({ projectId, sale, onUpdate }: Props) {
    const [formData, setFormData] = useState<Partial<FlipSale>>({
        grossSalePrice: 0,
        saleCosts: 0, // Manual override or additional costs?
        saleDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (sale) {
            setFormData({
                grossSalePrice: sale.grossSalePrice,
                saleCosts: sale.saleCosts,
                saleDate: sale.saleDate
            });
        }
    }, [sale]);

    const handleSave = async () => {
        await upsertFlipSale({
            projectId,
            grossSalePrice: Number(formData.grossSalePrice),
            saleCosts: Number(formData.saleCosts),
            saleDate: formData.saleDate!
        });
        alert('Salgsinfo lagret!');
        onUpdate();
    };

    const netProceeds = (formData.grossSalePrice || 0) - (formData.saleCosts || 0);

    return (
        <div className="max-w-2xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Gavel size={24} /> Salgsdetaljer
                </h2>
                <button
                    onClick={handleSave}
                    className="bg-black text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-800"
                >
                    <Save size={16} /> Lagre detaljer
                </button>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-1">Salgsdato</label>
                    <input
                        type="date"
                        className="w-full border rounded-lg p-2"
                        value={formData.saleDate}
                        onChange={e => setFormData({ ...formData, saleDate: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Brutto Salgspris (Salgsdokument)</label>
                    <div className="relative">
                        <input
                            type="number"
                            className="w-full border rounded-lg p-2 pr-12 text-lg font-bold"
                            value={formData.grossSalePrice}
                            onChange={e => setFormData({ ...formData, grossSalePrice: Number(e.target.value) })}
                        />
                        <span className="absolute right-4 top-3 text-gray-500 text-sm">NOK</span>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Salgsomkostninger (Megler, etc.)</label>
                    <div className="relative">
                        <input
                            type="number"
                            className="w-full border rounded-lg p-2 pr-12"
                            value={formData.saleCosts}
                            onChange={e => setFormData({ ...formData, saleCosts: Number(e.target.value) })}
                        />
                        <span className="absolute right-4 top-3 text-gray-500 text-sm">NOK</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Dette beløpet trekkes fra bruttosummen før nettoproveny beregnes.
                        Du kan også registrere dette som "Utlegg" med taggen "SaleCost" i Utlegg-fanen, men her kan du legge inn sluttsummen direkte fra oppgjørsskjemaet.
                    </p>
                </div>

                <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">Estimert Nettoproveny</span>
                        <span className={`text-2xl font-bold ${netProceeds >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {netProceeds.toLocaleString()} NOK
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
