import { NextRequest, NextResponse } from "next/server";
import { getProjects } from "@/lib/db";
import archiver from "archiver";
import fs from "fs";
import path from "path";
import { PassThrough } from "stream";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> } // Correct type for App Router params
) {
    const { id } = await params;
    const projects = await getProjects();
    const project = projects.find(p => p.id === id);

    if (!project) {
        return new NextResponse("Project not found", { status: 404 });
    }

    const archive = archiver("zip", {
        zlib: { level: 9 } // Sets the compression level.
    });

    const stream = new PassThrough();
    archive.pipe(stream);

    // Add files
    if (project.files) {
        for (const file of project.files) {
            const filePath = path.join(process.cwd(), "uploads", file.path);
            if (fs.existsSync(filePath)) {
                archive.file(filePath, { name: file.name });
            }
        }
    }

    // Finalize the archive (this will finish the stream)
    archive.finalize();

    return new NextResponse(stream as any, {
        headers: {
            "Content-Type": "application/zip",
            "Content-Disposition": `attachment; filename="prosjekt-${project.name.replace(/\s+/g, "_")}.zip"`
        }
    });
}
