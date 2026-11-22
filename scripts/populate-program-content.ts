import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

function extractSection(html: string, heading: string): string {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = html.match(new RegExp(`<h2[^>]*>\\s*${escaped}\\s*</h2>([\\s\\S]*?)(?=<h2[^>]*>|$)`, "i"));
  return match?.[1]?.trim() || "";
}

function extractListItems(html: string): string[] {
  const items: string[] = [];
  const regex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    const text = match[1].replace(/<[^>]+>/g, "").trim();
    if (text) items.push(text);
  }
  return items;
}

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  const programs = await prisma.program.findMany({
    select: { id: true, detailsHtml: true, objectives: true, keyActivities: true, expectedOutcomes: true },
  });

  for (const program of programs) {
    const html = program.detailsHtml || "";
    await prisma.program.update({
      where: { id: program.id },
      data: {
        backgroundHtml: extractSection(html, "Background"),
        goalHtml: extractSection(html, "Goal"),
        whoServesHtml: extractSection(html, "Who the Program Serves") || extractSection(html, "Target groups"),
        objectives: program.objectives.length ? program.objectives : extractListItems(extractSection(html, "Objectives")),
        keyActivities: program.keyActivities.length
          ? program.keyActivities
          : extractListItems(extractSection(html, "Key activities") || extractSection(html, "Key Activities")),
        expectedOutcomes: program.expectedOutcomes.length
          ? program.expectedOutcomes
          : extractListItems(extractSection(html, "Expected outcomes") || extractSection(html, "Expected Outcomes")),
      },
    });
  }

  console.log(`Updated ${programs.length} program records`);
  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
