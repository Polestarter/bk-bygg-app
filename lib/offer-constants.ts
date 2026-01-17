import { OfferCondition } from "./types";

export const OFFER_CONDITIONS: OfferCondition[] = [
    // A. Omfang, endringer og tillegg
    {
        id: "A1",
        category: "A. Omfang, endringer og tillegg",
        title: "Endringer og tillegg",
        tooltip: "Hindrer 'kan du bare...' gratis",
        text: "Endringer eller tillegg utover beskrevet omfang utføres kun etter avtale, og faktureres som tilleggsarbeid etter medgått tid og materialer, eller som avtalt fastpris før utførelse.",
        defaultOn: true,
        severity: "medium"
    },
    {
        id: "A2",
        category: "A. Omfang, endringer og tillegg",
        title: "Uforutsette forhold",
        tooltip: "Dekker skjulte skader/avvik",
        text: "Ved uforutsette forhold (skjulte skader, avvik i underlag/konstruksjon, skjulte installasjoner mv.) varsles kunden så snart som mulig. Nødvendige tiltak prises og faktureres som tilleggsarbeid.",
        defaultOn: true,
        severity: "high"
    },
    {
        id: "A3",
        category: "A. Omfang, endringer og tillegg",
        title: "Avgrensning (ikke inkludert)",
        tooltip: "Maling, el, rør osv",
        text: "Følgende er ikke inkludert med mindre annet er spesifisert: maling/overflatebehandling, elektriker- og rørleggerarbeid, asbestsanering, prosjektering/ingeniørberegning, og bortkjøring av spesialavfall.",
        defaultOn: true,
        severity: "medium"
    },
    {
        id: "A4",
        category: "A. Omfang, endringer og tillegg",
        title: "Stop-go ved avvik",
        tooltip: "Kunden må godkjenne før videre arbeid",
        text: "Dersom forhold oppstår som kan påvirke pris eller fremdrift vesentlig, stoppes arbeid på berørt del til kunden har godkjent foreslått løsning og pris.",
        defaultOn: false,
        severity: "medium"
    },

    // B. Tekniske forutsetninger
    {
        id: "B1",
        category: "B. Tekniske forutsetninger",
        title: "Eksisterende konstruksjon egnet",
        text: "Tilbudet forutsetter at eksisterende konstruksjon/underlag er egnet for planlagt montering/tiltak, uten behov for ekstra forsterkning eller ombygging.",
        defaultOn: true,
        severity: "high",
        tags: ["rehab", "montering"]
    },
    {
        id: "B2",
        category: "B. Tekniske forutsetninger",
        title: "Ingen skjulte skader",
        text: "Pris forutsetter at det ikke avdekkes skjulte skader (råte, fukt, sopp, setningsskader, skjulte brudd) som krever utbedring.",
        defaultOn: true,
        severity: "high",
        tags: ["rehab"]
    },
    {
        id: "B3",
        category: "B. Tekniske forutsetninger",
        title: "Skjulte installasjoner",
        text: "Kunden plikter å opplyse om og/eller dokumentere skjulte installasjoner i området (strøm, vann, avløp, varme, alarm). Skader som følge av manglende informasjon håndteres som uforutsett forhold.",
        defaultOn: true,
        severity: "medium"
    },
    {
        id: "B4",
        category: "B. Tekniske forutsetninger",
        title: "Fukt/temperaturkrav",
        text: "Arbeid forutsetter normale forhold for utførelse (tørr byggfukt, tilstrekkelig temperatur/uttørking). Tiltak knyttet til ekstra uttørking/byggvarme inngår ikke med mindre avtalt.",
        defaultOn: false,
        severity: "low"
    },

    // C. Underlag, pigging, boring
    {
        id: "C1",
        category: "C. Underlag og boring",
        title: "Ingen støpt/armert vegg",
        text: "Tilbudet forutsetter at vegger/underlag i arbeidsområdet ikke er støpt/armert på en måte som krever ekstra pigging, kapping eller spesialboring utover normal montasje.",
        defaultOn: false,
        severity: "medium",
        tags: ["dør", "montering"]
    },
    {
        id: "C2",
        category: "C. Underlag og boring",
        title: "Begrenset pigging/tilpasning",
        text: "Tilbud inkluderer kun normal tilpasning. Om det kreves omfattende pigging, utforing, avretting eller forsterkning, behandles dette som tilleggsarbeid.",
        defaultOn: false,
        severity: "medium",
        tags: ["dør", "rehab"]
    },
    {
        id: "C3",
        category: "C. Underlag og boring",
        title: "Ansvar demons. eksisterende",
        text: "Ved demontering i eksisterende bygningsdeler kan skjulte svakheter gi følgeskader. Vi kan ikke holdes ansvarlig for skader som skyldes underliggende forhold utenfor vår kontroll.",
        defaultOn: true,
        severity: "medium",
        tags: ["rehab", "dør"]
    },
    {
        id: "C4",
        category: "C. Underlag og boring",
        title: "Innmurt karm/dør",
        text: "Dersom eksisterende dør/karm er innmurt eller faststøpt og må pigges ut, kan dette medføre skader i omkringliggende vegg/overflater. Slikt arbeid og eventuelle reparasjoner prises og faktureres som tilleggsarbeid.",
        defaultOn: false,
        severity: "high",
        tags: ["dør"]
    },

    // D. Tid og tilgang
    {
        id: "D1",
        category: "D. Tid og tilgang",
        title: "Arbeidstid og tilgang",
        text: "Tilbudet forutsetter arbeid i normal arbeidstid og fri tilgang til arbeidsområdet. Eventuell ventetid, begrenset adgang, eller arbeid utenom normal arbeidstid kan medføre tillegg.",
        defaultOn: true,
        severity: "low"
    },
    {
        id: "D2",
        category: "D. Tid og tilgang",
        title: "Andre fag / koordinering",
        text: "Fremdrift forutsetter at andre fag (elektriker/rørlegger mv.) leverer i henhold til avtalt plan. Ventetid eller omarbeid som følge av andre fag faktureres som tillegg.",
        defaultOn: true,
        severity: "medium"
    },
    {
        id: "D3",
        category: "D. Tid og tilgang",
        title: "Kunden rydder",
        text: "Kunden sørger for at arbeidsområdet er ryddet og klargjort før oppstart. Ekstra tid til rydding/flytting faktureres som medgått tid.",
        defaultOn: true,
        severity: "low"
    },
    {
        id: "D4",
        category: "D. Tid og tilgang",
        title: "Parkering/bærehjelp",
        text: "Tilbudet forutsetter tilgjengelig parkering i rimelig nærhet og normal adkomst. Lang bæring, bom/avgifter eller særskilte logistikkutfordringer kan medføre tillegg.",
        defaultOn: false,
        severity: "low"
    },

    // E. Materialer
    {
        id: "E1",
        category: "E. Materialer",
        title: "Prisregulering",
        text: "Materialpriser er basert på dagens leverandørpriser. Ved prisendringer før bestilling/levering kan tilbudssummen justeres tilsvarende etter dokumenterte innkjøpspriser.",
        defaultOn: true,
        severity: "medium"
    },
    {
        id: "E2",
        category: "E. Materialer",
        title: "Forsinkelser leverandør",
        text: "Leveringstid og tilgjengelighet på materialer/produkter er avhengig av leverandør. Eventuelle forsinkelser fra leverandør kan påvirke fremdrift uten at dette gir grunnlag for prisavslag.",
        defaultOn: true,
        severity: "low"
    },
    {
        id: "E3",
        category: "E. Materialer",
        title: "Kunden leverer",
        text: "Hvis kunden leverer materialer/produkter selv, tar vi ikke ansvar for feil bestilling, mangler, kvalitet eller forsinkelser. Ekstraarbeid som følge av dette faktureres.",
        defaultOn: false,
        severity: "medium"
    },

    // F. Kvalitet
    {
        id: "F1",
        category: "F. Kvalitet",
        title: "Håndverksmessig standard",
        text: "Arbeidet leveres i henhold til normal god håndverksmessig standard. Mindre toleranser/overgangsskjøter kan forekomme i eksisterende bygg.",
        defaultOn: true,
        severity: "low"
    },
    {
        id: "F2",
        category: "F. Kvalitet",
        title: "Farge/strukturavvik",
        text: "Ved tilpasninger mot eksisterende overflater kan det forekomme farge- eller strukturavvik (f.eks. lister, fug, sparklede flater). Slike avvik regnes som normalt i rehabiliteringsarbeid.",
        defaultOn: true,
        severity: "low",
        tags: ["rehab"]
    },
    {
        id: "F3",
        category: "F. Kvalitet",
        title: "Støv og støy",
        text: "Arbeidet kan medføre støv og støy. Vi tilstreber tildekking og ryddighet, men kan ikke garantere støvfri utførelse i eksisterende bolig.",
        defaultOn: true,
        severity: "low",
        tags: ["rehab"]
    },

    // G. Betaling
    {
        id: "G1",
        category: "G. Betaling",
        title: "Delbetaling/milepæler",
        text: "Betaling skjer etter avtalt betalingsplan. Ved fastpris anbefales delbetaling (f.eks. ved bestilling, ved levering av materialer og ved ferdigstillelse).",
        defaultOn: true,
        severity: "medium"
    },
    {
        id: "G2",
        category: "G. Betaling",
        title: "Fakturering bestillingsvarer",
        text: "Spesialbestilte materialer/produkter faktureres ved bestilling og kan ikke returneres uten kostnad.",
        defaultOn: false,
        severity: "medium"
    },
    {
        id: "G3",
        category: "G. Betaling",
        title: "Forsinket betaling",
        text: "Ved forsinket betaling påløper forsinkelsesrenter og purregebyr i henhold til gjeldende regler.",
        defaultOn: true,
        severity: "medium"
    },
    {
        id: "G4",
        category: "G. Betaling",
        title: "Stans ved manglende betaling",
        text: "Ved manglende betaling i henhold til betalingsplan kan arbeidet stanses til utestående er gjort opp.",
        defaultOn: true,
        severity: "medium"
    },

    // H. Garanti
    {
        id: "H1",
        category: "H. Garanti",
        title: "Reklamasjon skriftlig",
        text: "Eventuelle mangler meldes skriftlig innen rimelig tid etter at de er oppdaget, slik at utbedring kan planlegges og gjennomføres.",
        defaultOn: true,
        severity: "low"
    },
    {
        id: "H2",
        category: "H. Garanti",
        title: "Indirekte tap",
        text: "Vi er ikke ansvarlig for indirekte tap som følge av forsinkelse eller mangler (f.eks. tapt inntekt, driftsstans), med mindre annet følger av ufravikelig lov.",
        defaultOn: true,
        severity: "medium"
    },
    {
        id: "H3",
        category: "H. Garanti",
        title: "Kundens ansvar",
        text: "Kunden er ansvarlig for forhold utenfor vår leveranse, herunder eksisterende byggtilstand og tidligere utført arbeid.",
        defaultOn: true,
        severity: "medium"
    }
];
