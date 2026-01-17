import { getOffers, getCustomers } from "@/lib/db";
import OfferWizard from "@/app/projects/[id]/new-offer/OfferWizard";

export default async function EditOfferPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const offers = await getOffers();
    const offer = offers.find(o => o.id === id);
    const customers = await getCustomers();

    if (!offer) return <div>Ikke funnet</div>;

    return (
        <main className="container" style={{ paddingTop: "2rem" }}>
            <h1 style={{ marginBottom: "2rem" }}>Revider Tilbud</h1>
            <OfferWizard customers={customers} initialData={offer} />
        </main>
    );
}
