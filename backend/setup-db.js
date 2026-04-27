/**
 * CalmMind — Database Setup Script
 * Run this once to push the Prisma schema changes to your Supabase database.
 * 
 * Usage:
 *   node setup-db.js
 * 
 * Make sure your .env file exists in this (backend/) folder before running.
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ENV_PATH = path.join(__dirname, ".env");

// ── Check .env exists ─────────────────────────────────────────────────────────
if (!fs.existsSync(ENV_PATH)) {
  console.error("\n❌  No .env file found in the backend/ folder.");
  console.error("\n    Create a file called .env in backend/ with these two lines:");
  console.error('\n    DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres?pgbouncer=true"');
  console.error('    DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"');
  console.error("\n    You can find both strings in: Supabase → Settings → Database → Connection String\n");
  process.exit(1);
}

// ── Check DATABASE_URL is set ─────────────────────────────────────────────────
const envContent = fs.readFileSync(ENV_PATH, "utf8");
if (!envContent.includes("DATABASE_URL") || envContent.includes("YOUR-PASSWORD")) {
  console.error("\n❌  DATABASE_URL is missing or still has placeholder values in your .env file.");
  console.error("    Fill in your real Supabase credentials first.\n");
  process.exit(1);
}

console.log("\n🌿  CalmMind — Database Setup");
console.log("─────────────────────────────────────────");

// ── Step 1: Generate Prisma client ────────────────────────────────────────────
console.log("\n⏳  Step 1/2 — Generating Prisma client...");
try {
  execSync("npx prisma generate", { stdio: "inherit", cwd: __dirname });
  console.log("✅  Prisma client generated.");
} catch (err) {
  console.error("❌  Failed to generate Prisma client. Make sure you ran `npm install` first.");
  process.exit(1);
}

// ── Step 2: Push schema to database ──────────────────────────────────────────
console.log("\n⏳  Step 2/2 — Pushing schema to Supabase database...");
console.log("    (This adds the bio, timezone, language columns to your User table)");
try {
  execSync("npx prisma db push", { stdio: "inherit", cwd: __dirname });
  console.log("\n✅  Database is now in sync with the Prisma schema.");
} catch (err) {
  console.error("\n❌  Failed to push schema. Check your DATABASE_URL and DIRECT_URL in .env");
  process.exit(1);
}

console.log("\n🎉  All done! Profile changes (bio, timezone, language) will now");
console.log("    save directly to your Supabase database.");
console.log("\n    You can now start your backend normally:  node server.js\n");
