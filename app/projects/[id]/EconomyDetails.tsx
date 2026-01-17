"use client";

import { useState } from "react";
import { Project, Expense, Extra } from "@/lib/types";
import { addExpense, addExtra } from "@/lib/actions";
import { Plus, Receipt, TrendingUp, AlertCircle } from "lucide-react";

export default function EconomyDetails({ project }: { project: Project }) {
    const [showAddExpense, setShowAddExpense] = useState(false);
    const [showAddExtra, setShowAddExtra] = useState(false);

    const expenses = project.expenses || [];
    const extras = project.extras || [];

    const totalExtras = extras.reduce((sum, e) => sum + e.amount, 0);

    return (
        <div style={{ marginTop: "3rem" }}>
            <h2 style={{ marginBottom: "1.5rem" }}>Økonomi & Tillegg</h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>

                {/* Expenses Section */}
                <div className="card">
                    <div className="flex-between" style={{ marginBottom: "1rem" }}>
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                            <Receipt size={20} color="var(--primary)" />
                            <h3 style={{ fontSize: "1.1rem" }}>Utgifter</h3>
                        </div>
                        <button onClick={() => setShowAddExpense(!showAddExpense)} className="btn btn-secondary" style={{ padding: "0.25rem 0.5rem", fontSize: "0.875rem" }}>
                            <Plus size={14} /> Legg til
                        </button>
                    </div>

                    {showAddExpense && (
                        <form action={async (formData) => {
                            await addExpense(formData);
                            setShowAddExpense(false);
                        }} style={{ backgroundColor: "var(--background)", padding: "1rem", borderRadius: "var(--radius)", marginBottom: "1rem", border: "1px solid var(--border)" }}>
                            <input type="hidden" name="projectId" value={project.id} />
                            <div style={{ display: "grid", gap: "0.5rem" }}>
                                <input name="description" placeholder="Beskrivelse" required className="input" style={{ width: "100%", padding: "0.5rem" }} />
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                                    <input name="amount" type="number" placeholder="Beløp (eks mva)" required className="input" style={{ width: "100%", padding: "0.5rem" }} />
                                    <input name="date" type="date" className="input" style={{ width: "100%", padding: "0.5rem" }} />
                                </div>
                                <select name="category" className="input" style={{ width: "100%", padding: "0.5rem" }}>
                                    <option value="Materialer">Materialer</option>
                                    <option value="Underleverandør">Underleverandør</option>
                                    <option value="Annet">Annet</option>
                                </select>
                                <button type="submit" className="btn btn-primary" style={{ marginTop: "0.5rem", width: "100%" }}>Lagre Utgift</button>
                            </div>
                        </form>
                    )}

                    <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                        {expenses.length === 0 ? (
                            <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem", fontStyle: "italic" }}>Ingen utgifter registrert.</p>
                        ) : (
                            <table style={{ width: "100%", fontSize: "0.875rem", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ borderBottom: "1px solid var(--border)", textAlign: "left" }}>
                                        <th style={{ padding: "0.5rem 0" }}>Dato</th>
                                        <th style={{ padding: "0.5rem 0" }}>Beskrivelse</th>
                                        <th style={{ padding: "0.5rem 0", textAlign: "right" }}>Beløp</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenses.map(e => (
                                        <tr key={e.id} style={{ borderBottom: "1px solid var(--secondary)" }}>
                                            <td style={{ padding: "0.5rem 0" }}>{e.date}</td>
                                            <td style={{ padding: "0.5rem 0" }}>{e.description}</td>
                                            <td style={{ padding: "0.5rem 0", textAlign: "right" }}>{e.amount.toLocaleString()} kr</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                    <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
                        <span>Totalt (eks. mva)</span>
                        <span>{expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()} kr</span>
                    </div>
                </div>

                {/* Extras Section */}
                <div className="card">
                    <div className="flex-between" style={{ marginBottom: "1rem" }}>
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                            <AlertCircle size={20} color="var(--destructive)" />
                            <h3 style={{ fontSize: "1.1rem" }}>Uforutsette Tillegg</h3>
                        </div>
                        <button onClick={() => setShowAddExtra(!showAddExtra)} className="btn btn-secondary" style={{ padding: "0.25rem 0.5rem", fontSize: "0.875rem" }}>
                            <Plus size={14} /> Legg til
                        </button>
                    </div>

                    {showAddExtra && (
                        <form action={async (formData) => {
                            await addExtra(formData);
                            setShowAddExtra(false);
                        }} style={{ backgroundColor: "var(--background)", padding: "1rem", borderRadius: "var(--radius)", marginBottom: "1rem", border: "1px solid var(--border)" }}>
                            <input type="hidden" name="projectId" value={project.id} />
                            <div style={{ display: "grid", gap: "0.5rem" }}>
                                <input name="description" placeholder="Beskrivelse av tillegg" required className="input" style={{ width: "100%", padding: "0.5rem" }} />
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                                    <input name="amount" type="number" placeholder="Pris (eks mva)" required className="input" style={{ width: "100%", padding: "0.5rem" }} />
                                    <input name="date" type="date" className="input" style={{ width: "100%", padding: "0.5rem" }} />
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ marginTop: "0.5rem", width: "100%" }}>Lagre Tillegg</button>
                            </div>
                        </form>
                    )}

                    <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                        {extras.length === 0 ? (
                            <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem", fontStyle: "italic" }}>Ingen tillegg registrert.</p>
                        ) : (
                            <table style={{ width: "100%", fontSize: "0.875rem", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ borderBottom: "1px solid var(--border)", textAlign: "left" }}>
                                        <th style={{ padding: "0.5rem 0" }}>Dato</th>
                                        <th style={{ padding: "0.5rem 0" }}>Beskrivelse</th>
                                        <th style={{ padding: "0.5rem 0", textAlign: "right" }}>Pris</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {extras.map(e => (
                                        <tr key={e.id} style={{ borderBottom: "1px solid var(--secondary)" }}>
                                            <td style={{ padding: "0.5rem 0" }}>{e.date}</td>
                                            <td style={{ padding: "0.5rem 0" }}>{e.description}</td>
                                            <td style={{ padding: "0.5rem 0", textAlign: "right", color: "var(--destructive)" }}>+ {e.amount.toLocaleString()} kr</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                    <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", fontWeight: "bold", color: "var(--destructive)" }}>
                        <span>Totalt Tillegg</span>
                        <span>+ {totalExtras.toLocaleString()} kr</span>
                    </div>
                </div>

            </div>
        </div>
    );
}
