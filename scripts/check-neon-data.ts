import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("=== Checking Neon Database ===\n");
  
  // Check if AHEZA program exists
  const aheza = await prisma.program.findUnique({ where: { slug: "aheza" } });
  if (!aheza) {
    console.log("❌ AHEZA program NOT found in Neon");
    return;
  }
  console.log("✅ AHEZA program found:", aheza.title, "| ID:", aheza.id, "| Status:", aheza.status);
  console.log("   showObjectives:", aheza.showObjectives, "| showTimeline:", aheza.showTimeline, "| showTestimonials:", aheza.showTestimonials);
  console.log("   showParticipants:", aheza.showParticipants, "| showGallery:", aheza.showGallery);

  // Check content tables
  const objectives = await prisma.programObjective.count({ where: { programId: aheza.id } });
  const outcomes = await prisma.programOutcome.count({ where: { programId: aheza.id } });
  const activities = await prisma.programActivity.count({ where: { programId: aheza.id } });
  const phases = await prisma.programTimelinePhase.count({ where: { programId: aheza.id } });
  const testimonials = await prisma.programTestimonial.count({ where: { programId: aheza.id } });
  const participants = await prisma.programParticipant.count({ where: { programId: aheza.id } });
  const gallery = await prisma.programGalleryImage.count({ where: { programId: aheza.id } });

  console.log("\n=== Content Counts ===");
  console.log("Objectives:", objectives);
  console.log("Outcomes:", outcomes);
  console.log("Activities:", activities);
  console.log("Timeline Phases:", phases);
  const milestoneCount = await prisma.programTimelineMilestone.count({ where: { phase: { programId: aheza.id } } });
  console.log("Milestones:", milestoneCount);
  console.log("Testimonials:", testimonials);
  console.log("Participants:", participants);
  console.log("Gallery Images:", gallery);

  // Check admin user
  const admin = await prisma.user.findUnique({ where: { email: "umutonichristella17@gmail.com" } });
  console.log("\n=== Admin User ===");
  if (admin) {
    console.log("✅ Admin found:", admin.email, "| Role:", admin.role, "| Active:", admin.active);
  } else {
    console.log("❌ Admin user NOT found in Neon");
  }

  await prisma.$disconnect();
  await pool.end();
}

main()
  .catch((error) => {
    console.error("❌ ERROR:", error.message);
    process.exit(1);
  });