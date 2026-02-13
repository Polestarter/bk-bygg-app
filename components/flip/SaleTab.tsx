'use client';

import { useEffect, useState } from 'react';
import { FlipSale } from '@/lib/flip-types';
import { upsertFlipSale } from '@/lib/flip-db';
import { Gavel, Save } from 'lucide-react';

interface Props {
    projectId: string;
    sale?: FlipSale;
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

export default function SaleTab({ projectId, sale, onUpdate }: Props) {
    const [form, setForm] = useState<Partial<FlipSale>>({
        grossSalePrice: 0,
        saleCosts: 0,
        saleDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (!sale) return;
        setForm({
            grossSalePrice: sale.grossSalePrice,
            saleCosts: sale.saleCosts,
            saleDate: sale.saleDate
        });
    }, [sale]);

    const handleSave = async () => {
        await upsertFlipSale({
            projectId,
            saleDate: form.saleDate || new Date().toISOString().split('T')[0],
            grossSalePrice: Number(form.grossSalePrice) || 0,
            saleCosts: Number(form.saleCosts) || 0
        });

        onUpdate();
    };

    const netProceeds = (Number(form.grossSalePrice) || 0) - (Number(form.saleCosts) || 0);

    return (
        <div style={{ display: 'grid', gap: '1rem' }}>
            <div className="flex-between" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Gavel size={20} /> Salg
                    </h2>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>
                        Registrer sluttall fra salget.
                    </p>
                </div>

                <button className="btn btn-primary" onClick={handleSave} style={{ gap: '0.5rem' }}>
                    <Save size={16} /> Lagre salgstall
                </button>
            </div>

            <div className="card" style={{ display: 'grid', gap: '0.9rem' }}>
                <div>
                    <label style={labelStyle}>Salgsdato</label>
                    <input
                        type="date"
                        style={inputStyle}
                        value={form.saleDate || ''}
                        onChange={(event) => setForm({ ...form, saleDate: event.target.value })}
                    />
                </div>

                <div>
                    <label style={labelStyle}>Brutto salgspris (NOK)</label>
                    <input
                        type="number"
                        min={0}
                        style={inputStyle}
                        value={form.grossSalePrice || 0}
                        onChange={(event) => setForm({ ...form, grossSalePrice: Number(event.target.value) })}
                    />
                </div>

                <div>
                    <label style={labelStyle}>Salgskostnader (NOK)</label>
                    <input
                        type="number"
                        min={0}
                        style={inputStyle}
                        value={form.saleCosts || 0}
                        onChange={(event) => setForm({ ...form, saleCosts: Number(event.target.value) })}
                    />
                    <p style={{ fontSize: '0.82rem', color: 'var(--muted-foreground)', marginTop: '0.35rem' }}>
                        Disse kostnadene trekkes fra brutto salgspris for a beregne nettoproveny.
                    </p>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.85rem' }}>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '0.85rem' }}>Estimert nettoproveny</p>
                    <p style={{ fontSize: '1.6rem', fontWeight: 700, color: netProceeds >= 0 ? '#166534' : 'var(--destructive)' }}>
                        {netProceeds.toLocaleString()} NOK
                    </p>
                </div>
            </div>
        </div>
    );
}

const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '0.35rem',
    fontSize: '0.85rem',
    color: 'var(--muted-foreground)'
};
