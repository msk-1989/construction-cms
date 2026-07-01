/**
 * Seed script: Update existing user roles & create new users for all 16 CBOS roles.
 *
 * Usage: DATABASE_URL="..." bun run scripts/seed-roles.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== CBOS Role Seed Script ===\n");

  // ── Step 1: Update existing users ──────────────────────────────────────
  console.log("Step 1: Updating existing users' roles...\n");

  const updates = [
    { email: "priya@cms.com", role: "PROJECT_MANAGER", position: "Senior Project Manager" },
    { email: "amit@cms.com", role: "SITE_ENGINEER", position: "Site Engineer" },
    { email: "vikram@cms.com", role: "SITE_MANAGER", position: "Site Supervisor" },
    { email: "anita@cms.com", role: "SAFETY_OFFICER", position: "Safety Officer" },
  ];

  for (const u of updates) {
    const user = await prisma.user.update({
      where: { email: u.email },
      data: { role: u.role, position: u.position },
    });
    console.log(`  ✅ Updated ${user.email} → role: ${user.role}, position: ${user.position}`);
  }

  // raj@cms.com stays ADMIN, sneha@cms.com stays MEMBER (no change needed)
  console.log("  ℹ️  raj@cms.com remains ADMIN (no change)");
  console.log("  ℹ️  sneha@cms.com remains MEMBER / Quantity Surveyor (no change)\n");

  // ── Step 2: Create new users ───────────────────────────────────────────
  console.log("Step 2: Creating new users...\n");

  const newUsers = [
    {
      email: "superadmin@cbos.com",
      name: "Super Admin",
      role: "SUPER_ADMIN",
      position: "System Administrator",
      company: "BuildRight Constructions",
      employeeId: "EMP000",
    },
    {
      email: "ceo@cbos.com",
      name: "Arun Mehta",
      role: "CEO",
      position: "Chief Executive Officer",
      company: "BuildRight Constructions",
      employeeId: "EMP010",
    },
    {
      email: "cfo@cbos.com",
      name: "Deepa Nair",
      role: "CFO",
      position: "Chief Financial Officer",
      company: "BuildRight Constructions",
      employeeId: "EMP011",
    },
    {
      email: "coo@cbos.com",
      name: "Suresh Rao",
      role: "COO",
      position: "Chief Operating Officer",
      company: "BuildRight Constructions",
      employeeId: "EMP012",
    },
    {
      email: "hr@cbos.com",
      name: "Kavitha Menon",
      role: "HR_MANAGER",
      position: "HR Manager",
      company: "BuildRight Constructions",
      employeeId: "EMP013",
    },
    {
      email: "procurement@cbos.com",
      name: "Ramesh Gupta",
      role: "PROCUREMENT_HEAD",
      position: "Procurement Head",
      company: "BuildRight Constructions",
      employeeId: "EMP014",
    },
    {
      email: "director@cbos.com",
      name: "Sunil Verma",
      role: "PROJECT_DIRECTOR",
      position: "Project Director",
      company: "BuildRight Constructions",
      employeeId: "EMP015",
    },
    {
      email: "qa@cbos.com",
      name: "Meera Joshi",
      role: "QA_QC_ENGINEER",
      position: "QA/QC Engineer",
      company: "BuildRight Constructions",
      employeeId: "EMP016",
    },
    {
      email: "store@cbos.com",
      name: "Kiran Das",
      role: "STORE_KEEPER",
      position: "Store Keeper",
      company: "BuildRight Constructions",
      employeeId: "EMP017",
    },
    {
      email: "client@cbos.com",
      name: "Ramesh Client",
      role: "CLIENT",
      position: "Client Representative",
      company: "Client Corp",
      employeeId: "EXT001",
    },
    {
      email: "consultant@cbos.com",
      name: "Dr. Patel",
      role: "CONSULTANT",
      position: "Consultant Engineer",
      company: "Patel Consulting",
      employeeId: "EXT002",
    },
    {
      email: "architect@cbos.com",
      name: "Zara Khan",
      role: "ARCHITECT",
      position: "Architect",
      company: "Design Studio",
      employeeId: "EXT003",
    },
    {
      email: "sub@cbos.com",
      name: "Mohan Sub",
      role: "SUBCONTRACTOR",
      position: "Subcontractor",
      company: "Mohan Constructions",
      employeeId: "EXT004",
    },
  ];

  for (const u of newUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        role: u.role,
        position: u.position,
        company: u.company,
        employeeId: u.employeeId,
      },
      create: {
        email: u.email,
        name: u.name,
        password: "password",
        role: u.role,
        position: u.position,
        company: u.company,
        employeeId: u.employeeId,
        status: "ACTIVE",
      },
    });
    console.log(`  ✅ ${user.email.padEnd(28)} ${user.role.padEnd(20)} ${user.position}`);
  }

  // ── Step 3: Print summary ─────────────────────────────────────────────
  console.log("\n=== All Users in Database ===\n");

  const allUsers = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { email: "asc" }],
  });

  console.log(
    `${"Email".padEnd(28)} ${"Name".padEnd(20)} ${"Role".padEnd(20)} ${"Position".padEnd(30)} ${"Company".padEnd(25)} ${"EmpId"}`
  );
  console.log("-".repeat(145));

  for (const u of allUsers) {
    console.log(
      `${u.email.padEnd(28)} ${(u.name || "").padEnd(20)} ${u.role.padEnd(20)} ${(u.position || "").padEnd(30)} ${(u.company || "").padEnd(25)} ${u.employeeId || ""}`
    );
  }

  console.log(`\n✅ Total users: ${allUsers.length}`);
  console.log("=== Seed Complete ===");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });