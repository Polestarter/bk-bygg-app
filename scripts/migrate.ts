
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv'; // We might need dotenv to load environment variables from .env.local if running as script

// Load env vars
const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = dotenv.config({ path: envPath }).parsed || {};

// If dotenv fails or is not installed, we fallback to process.env assuming user ran with env vars
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || envConfig.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing Supabase credentials. Ensure .env.local exists.");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const DB_PATH = path.join(process.cwd(), "db.json");

async function migrate() {
    console.log("Reading db.json...");
    let db;
    try {
        const data = fs.readFileSync(DB_PATH, "utf-8");
        db = JSON.parse(data);
    } catch (e) {
        console.error("Could not read db.json", e);
        return;
    }

    // Helper to insert data
    const insert = async (table: string, items: any[]) => {
        if (!items || items.length === 0) return;
        console.log(`Migrating ${items.length} items to ${table}...`);

        // Clean items (remove undefined)
        const cleanItems = JSON.parse(JSON.stringify(items));

        // Remove legacy 'progress' field from projects if present
        if (table === 'projects') {
            cleanItems.forEach((item: any) => {
                delete item.progress;
            });
        }

        const { error } = await supabase.from(table).upsert(cleanItems);
        if (error) {
            console.error(`Error migrating ${table}:`, error);
        } else {
            console.log(`Success ${table}`);
        }
    };

    await insert('projects', db.projects);
    await insert('customers', db.customers);
    await insert('checklists', db.checklists);
    await insert('checklistTemplates', db.checklistTemplates);
    await insert('offers', db.offers);

    console.log("Migration complete!");
}

migrate();
