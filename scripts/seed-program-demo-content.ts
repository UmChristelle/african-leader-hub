import { config } from "dotenv";

config({ path: ".env.local" });

const demoPrefix = "DEMO CONTENT —";

async function main() {
  const { prisma } = await import("@/lib/prisma");
  const programs = await prisma.program.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, slug: true, title: true },
  });
  const aheza = programs.find((program) => program.slug === "aheza");
  const second = programs.find((program) => program.slug !== "aheza" && /teen mothers/i.test(program.title)) || programs.find((program) => program.slug !== "aheza");
  if (!aheza || !second) throw new Error("Published AHEZA and a second published programme are required for demo content.");

  for (const program of [aheza, second]) {
    await prisma.program.update({ where: { id: program.id }, data: { showParticipants: true, showAlumni: true, showTestimonials: true, showTimeline: true, showObjectives: true, showKeyActivities: true } });
    const samplePeople = [
      { name: `${demoPrefix} Amina ${program.slug}`, status: "ONGOING" as const, projectName: `${demoPrefix} Small business sample`, sortOrder: 9000 },
      { name: `${demoPrefix} Chantal ${program.slug}`, status: "ALUMNI" as const, projectName: `${demoPrefix} Graduate profile sample`, sortOrder: 9001 },
    ];
    for (const sample of samplePeople) {
      let person = await prisma.programParticipant.findFirst({ where: { programId: program.id, name: sample.name } });
      if (!person) person = await prisma.programParticipant.create({ data: {
        programId: program.id, name: sample.name, status: sample.status, projectName: sample.projectName,
        biography: `${demoPrefix} Fictional profile used only to preview the programme dashboard and public cards. Replace with approved participant information before using as a real profile.`,
        businessDescription: `${demoPrefix} Example business description.`, sector: "Demonstration", location: "Rwanda (demo)",
        published: true, sortOrder: sample.sortOrder,
      } });

      const storySlug = `demo-${program.slug}-${sample.status.toLowerCase()}`;
      const storyTitle = `${demoPrefix} A sample programme journey`;
      const storyData = {
        programId: program.id, participantId: person.id, name: person.name, role: sample.status === "ALUMNI" ? "Graduate (demo profile)" : "Participant (demo profile)",
        organization: sample.projectName, location: "Rwanda (demo)", storyTitle, slug: storySlug,
        excerpt: `${demoPrefix} A fictional story preview. No real participant quotation or outcome is represented.`,
        content: `${demoPrefix} This is fictional demonstration copy for reviewing story layout and programme-linked publishing. Replace it with an approved story and consented quotation before real publication.`,
        published: true, featured: true, sortOrder: sample.sortOrder,
      };
      const existingStory = await prisma.programTestimonial.findUnique({ where: { slug: storySlug } });
      if (existingStory) await prisma.programTestimonial.update({ where: { id: existingStory.id }, data: { ...storyData, programId: program.id, participantId: person.id } });
      else await prisma.programTestimonial.create({ data: storyData });
    }

    const objectiveName = `${demoPrefix} Sample programme objective`;
    if (!(await prisma.programObjective.findFirst({ where: { programId: program.id, title: objectiveName } }))) {
      await prisma.programObjective.create({ data: { programId: program.id, title: objectiveName, theme: `${demoPrefix} Programme focus`, description: `${demoPrefix} Example objective displayed to demonstrate editable programme content.`, published: true, sortOrder: 9000 } });
    }
    const activityName = `${demoPrefix} Sample programme stage`;
    if (!(await prisma.programActivity.findFirst({ where: { programId: program.id, title: activityName } }))) {
      await prisma.programActivity.create({ data: { programId: program.id, title: activityName, theme: `${demoPrefix} Demonstration stage`, description: `${demoPrefix} Replace this example with the approved programme schedule.`, published: true, sortOrder: 9000 } });
    }
    const phaseName = `${demoPrefix} Sample schedule stage`;
    if (!(await prisma.programTimelinePhase.findFirst({ where: { programId: program.id, name: phaseName } }))) {
      await prisma.programTimelinePhase.create({ data: { programId: program.id, name: phaseName, description: `${demoPrefix} A clearly labelled sample stage for testing the schedule controls.`, published: true, sortOrder: 9000 } });
    }
  }

  console.log(`Demo content is ready for: ${aheza.title} and ${second.title}. Photos remain unassigned until temporary portraits are generated or approved images are uploaded.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => {
  const { prisma } = await import("@/lib/prisma");
  await prisma.$disconnect();
});
