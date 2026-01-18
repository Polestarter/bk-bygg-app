"use client";

import ProjectForm from "../new/ProjectForm";
import { getProjects, getCustomers } from "@/lib/db";
import { Project, Customer } from "@/lib/types";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";

function EditProjectContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = searchParams.get("id");
    const [project, setProject] = useState<Project | undefined>(undefined);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            Promise.all([
                getProjects(),
                getCustomers()
            ]).then(([projects, customers]) => {
                const foundProject = projects.find(p => p.id === id);
                setProject(foundProject);
                setCustomers(customers);
                setLoading(false);
            });
        } else {
            setLoading(false);
            router.push("/projects");
        }
    }, [id, router]);

    if (loading) {
        return (
            <main className="container" style={{ paddingTop: "2rem" }}>
                <p>Laster prosjektdata...</p>
            </main>
        );
    }

    if (!project) {
        return (
            <main className="container" style={{ paddingTop: "2rem" }}>
                <h1>Prosjekt ikke funnet</h1>
                <Link href="/projects" className="btn btn-primary">Tilbake</Link>
            </main>
        );
    }

    return <ProjectForm customers={customers} initialData={project} />;
}

export default function EditProjectPage() {
    return (
        <Suspense fallback={<div className="container" style={{ paddingTop: "2rem" }}>Laster...</div>}>
            <EditProjectContent />
        </Suspense>
    );
}
