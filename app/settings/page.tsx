import { Settings } from "lucide-react";

export default function SettingsPage() {
    return (
        <main className="container flex-center" style={{ minHeight: "80vh", flexDirection: "column", gap: "1rem" }}>
            <Settings size={64} color="var(--muted-foreground)" />
            <h1>Innstillinger</h1>
            <p style={{ color: "var(--muted-foreground)" }}>Denne funksjonen kommer snart.</p>
        </main>
    );
}
