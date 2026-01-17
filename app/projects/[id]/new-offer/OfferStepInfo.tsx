"use client";
import { Offer, Project } from "@/lib/types";

export default function OfferStepInfo({ offer, updateOffer, project }: { offer: Partial<Offer>, updateOffer: (d: Partial<Offer>) => void, project: Project }) {
    return (
        <div style={{ display: "grid", gap: "1.5rem" }}>
            <h2>Prosjektinformasjon</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                    <label className="label">Kunde</label>
                    <div className="input" style={{ backgroundColor: "var(--secondary)", opacity: 0.7 }}>
                        {/* We don't have customer name directly in project prop here usually, but assuming passed project has customerId */}
                        Kunde ID: {project.customerId} (Hentes automatisk)
                    </div>
                </div>
                <div>
                    <label className="label">Adresse</label>
                    <input type="text" className="input" value={project.address} disabled style={{ backgroundColor: "var(--secondary)", opacity: 0.7 }} />
                </div>
            </div>

            <div>
                <label className="label">Dato for tilbud</label>
                <input
                    type="date"
                    className="input"
                    value={offer.date}
                    onChange={e => updateOffer({ date: e.target.value })}
                />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                    <label className="label">Kundetype</label>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        {(["Privat", "Bedrift"] as const).map(type => (
                            <button
                                key={type}
                                onClick={() => updateOffer({ customerType: type })}
                                className={`btn ${offer.customerType === type ? "btn-primary" : "btn-outline"}`}
                                style={{ flex: 1 }}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="label">Jobbtype (Filter for forbehold)</label>
                    <select
                        className="input"
                        value={offer.projectType}
                        onChange={e => updateOffer({ projectType: e.target.value })}
                        style={{ width: "100%", padding: "0.75rem" }}
                    >
                        <option value="Rehab">Rehab</option>
                        <option value="Nybygg">Nybygg</option>
                        <option value="Dør">Dør/Vindu</option>
                        <option value="Montering">Montering</option>
                        <option value="Bad">Bad/Våtrom</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="label">Kort prosjektbeskrivelse</label>
                <textarea
                    className="input"
                    rows={5}
                    placeholder="Beskriv hva som skal gjøres..."
                    value={offer.projectDescription}
                    onChange={e => updateOffer({ projectDescription: e.target.value })}
                    style={{ width: "100%", padding: "0.75rem" }}
                />
            </div>
        </div>
    );
}
