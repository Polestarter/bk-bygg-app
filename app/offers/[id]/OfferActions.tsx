"use client";

import { Offer, Customer } from "@/lib/types";
import { Mail, Printer, Download } from "lucide-react";

export default function OfferActions({ offer, customer }: { offer: Offer, customer?: Customer }) {

    const handlePrint = () => {
        window.print();
    };

    const handleEmail = () => {
        const subject = encodeURIComponent(`Tilbud: ${offer.projectType} - ${offer.projectAddress}`);
        const body = encodeURIComponent(`Hei ${customer?.name || "Kunde"},\n\nHer er tilbudet du ba om angående ${offer.projectType}.\n\nSe vedlegg eller detaljer under.\n\nMvh\nBK Bygg AS`);
        const email = customer?.email || "";

        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    };

    return (
        <div style={{ display: "flex", gap: "0.5rem" }} className="hide-on-print">
            <button onClick={handlePrint} className="btn btn-outline" title="Last ned som PDF / Skriv ut">
                <Printer size={16} style={{ marginRight: "0.5rem" }} /> PDF / Print
            </button>
            <button onClick={handleEmail} className="btn btn-outline" title="Send e-post">
                <Mail size={16} style={{ marginRight: "0.5rem" }} /> Send E-post
            </button>
        </div>
    );
}
