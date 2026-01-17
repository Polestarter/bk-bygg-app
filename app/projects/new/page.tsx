import { getCustomers } from "@/lib/data";
import ProjectForm from "./ProjectForm";

export default async function NewProjectPage() {
    const customers = await getCustomers();

    return <ProjectForm customers={customers} />;
}
