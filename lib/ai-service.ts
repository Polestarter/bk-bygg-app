import { SJARisk, RiskProbability, RiskSeverity } from "./types";

export interface AIAnalysisResult {
    file: File;
    suggestedRisks: Omit<SJARisk, "id">[];
}

export async function analyzeImage(file: File): Promise<AIAnalysisResult> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const filename = file.name.toLowerCase();
    const suggestions: Omit<SJARisk, "id">[] = [];

    // Simple heuristic-based mock "AI"
    if (filename.includes("tak") || filename.includes("roof") || filename.includes("hoyde") || filename.includes("høyde")) {
        suggestions.push({
            activity: "Arbeid på tak/høyde",
            description: "AI-detektert: Fare for fall fra takkant. Manglende sikring observert.",
            probability: "Høy",
            severity: "Høy",
            measures: [
                { id: "ai-m1", description: "Montere stillas eller rekkverk rundt taket", responsible: "Leder", completed: false },
                { id: "ai-m2", description: "Bruke fallsikringsele ved arbeid nær kant", responsible: "Alle", completed: false }
            ]
        });
    }

    if (filename.includes("stillas") || filename.includes("scaffold")) {
        suggestions.push({
            activity: "Arbeid på stillas",
            description: "AI-detektert: Potensiell mangel på fotlist eller løse lemmer.",
            probability: "Middels",
            severity: "Høy",
            measures: [
                { id: "ai-m3", description: "Sjekke stillasgodkjenning (grønt kort)", responsible: "Leder", completed: false },
                { id: "ai-m4", description: "Ettermontere fotlister", responsible: "UE", completed: false }
            ]
        });
    }

    if (filename.includes("kabel") || filename.includes("strøm") || filename.includes("el") || filename.includes("wire")) {
        suggestions.push({
            activity: "Elektrisk arbeid",
            description: "AI-detektert: Løse kabler på gulv – snublefare.",
            probability: "Høy",
            severity: "Lav",
            measures: [
                { id: "ai-m5", description: "Henge opp kabler", responsible: "Alle", completed: false }
            ]
        });
    }

    // Default suggestion if no keywords found (simulation of "generic construction site")
    if (suggestions.length === 0) {
        suggestions.push({
            activity: "Generell byggeplass",
            description: "AI-detektert: Rot på byggeplass. Generell risiko for snubling/fall.",
            probability: "Middels",
            severity: "Lav",
            measures: [
                { id: "ai-m6", description: "Rydde arbeidsstedet", responsible: "Alle", completed: false }
            ]
        });
    }

    return {
        file,
        suggestedRisks: suggestions
    };
}
