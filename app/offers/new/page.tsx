import { getCustomers } from "@/lib/db";
import OfferWizard from "@/app/projects/[id]/new-offer/OfferWizard";

export default async function NewOfferPage() {
    const customers = await getCustomers();

    return (
        <main className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
            <h1 style={{ marginBottom: "2rem" }}>Nytt Tilbud</h1>
            <OfferWizard customers={customers} />
        </main>
    );
}
