'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { addFlipProject, getFlipProjects } from '@/lib/flip-db';
import { FlipProject } from '@/lib/flip-types';
import { Plus, Search, TrendingUp } from 'lucide-react';

export default function FlipListPage() {
    const [projects, setProjects] = useState<FlipProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [search, setSearch] = useState('');

    useEffect(() => {
        void loadProjects();
    }, []);

    const loadProjects = async () => {
        setLoading(true);
        const data = await getFlipProjects();
        setProjects(data);
        setLoading(false);
    };

    const handleCreate = async () => {
        const name = newProjectName.trim();
        if (!name) return;

        await addFlipProject({
            name,
            startDate: new Date().toISOString().split('T')[0],
            status: 'Planlagt',
            enableLaborPayout: true,
            laborDefaultRate: 500,
            treatCompanyPaymentsAsLoan: true,
            allowNegativeProfitSettlement: true,
            roundingMode: 'nearest',
            currency: 'NOK'
        });

        setNewProjectName('');
        setIsCreateOpen(false);
        await loadProjects();
    };

    const filteredProjects = useMemo(
        () => projects.filter((project) => {
            const query = search.toLowerCase();
            return project.name.toLowerCase().includes(query) || project.address?.toLowerCase().includes(query);
        }),
        [projects, search]
    );

    return (
        <main className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            <div className="flex-between" style={{ marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                    <h1 style={{ marginBottom: '0.35rem' }}>Flipoppgjor</h1>
                    <p style={{ color: 'var(--muted-foreground)' }}>
                        Oversikt over prosjekter for kjop, oppussing og salg.
                    </p>
                </div>

                <button className="btn btn-primary" style={{ gap: '0.5rem' }} onClick={() => setIsCreateOpen(true)}>
                    <Plus size={18} /> Nytt prosjekt
                </button>
            </div>

            <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                <input
                    type="text"
                    placeholder="Sok i flipprosjekter"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    style={{
                        width: '100%',
                        padding: '0.72rem 1rem 0.72rem 2.5rem',
                        borderRadius: 'var(--radius)',
                        border: '1px solid var(--border)',
                        backgroundColor: 'var(--card)',
                        color: 'var(--foreground)'
                    }}
                />
                <Search
                    size={17}
                    style={{
                        position: 'absolute',
                        left: '0.9rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--muted-foreground)'
                    }}
                />
            </div>

            {loading ? (
                <div className="card">
                    <p style={{ color: 'var(--muted-foreground)' }}>Laster prosjekter...</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '0.8rem' }}>
                    {filteredProjects.length === 0 ? (
                        <div className="card" style={{ textAlign: 'center' }}>
                            <p style={{ color: 'var(--muted-foreground)' }}>Ingen prosjekter funnet.</p>
                        </div>
                    ) : (
                        filteredProjects.map((project) => (
                            <Link key={project.id} href={`/flip/details?id=${project.id}`}>
                                <div className="card card-interactive flex-between" style={{ gap: '1rem', flexWrap: 'wrap' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                                        <div style={iconBox}>
                                            <TrendingUp size={21} />
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '1.1rem' }}>{project.name}</h3>
                                            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.88rem' }}>
                                                {project.address || 'Ingen adresse'}
                                            </p>
                                        </div>
                                    </div>

                                    <div style={{ textAlign: 'right' }}>
                                        <span style={project.status === 'Aktiv' ? activeBadge : badgeStyle}>{project.status}</span>
                                        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.82rem', marginTop: '0.4rem' }}>
                                            Start {project.startDate}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            )}

            {isCreateOpen && (
                <div style={modalOverlay}>
                    <div className="card" style={{ width: '100%', maxWidth: 460 }}>
                        <h2 style={{ marginBottom: '0.8rem' }}>Nytt flipprosjekt</h2>
                        <label style={labelStyle}>Prosjektnavn</label>
                        <input
                            type="text"
                            style={inputStyle}
                            value={newProjectName}
                            onChange={(event) => setNewProjectName(event.target.value)}
                            placeholder="F.eks. Gamleveien 12"
                        />

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                            <button className="btn btn-ghost" onClick={() => setIsCreateOpen(false)}>Avbryt</button>
                            <button className="btn btn-primary" onClick={handleCreate}>Opprett</button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

const iconBox: React.CSSProperties = {
    width: '46px',
    height: '46px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--muted-foreground)',
    backgroundColor: 'var(--background)'
};

const badgeStyle: React.CSSProperties = {
    padding: '0.18rem 0.6rem',
    borderRadius: 999,
    border: '1px solid var(--border)',
    backgroundColor: 'var(--secondary)',
    fontSize: '0.8rem',
    fontWeight: 600
};

const activeBadge: React.CSSProperties = {
    ...badgeStyle,
    borderColor: '#86efac',
    color: '#166534',
    backgroundColor: '#dcfce7'
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '0.35rem',
    fontSize: '0.85rem',
    color: 'var(--muted-foreground)'
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.62rem 0.75rem',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--background)',
    color: 'var(--foreground)'
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
