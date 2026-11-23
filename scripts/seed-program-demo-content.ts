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
      { key: "tailoring", name: `${demoPrefix} Fictional participant 1`, status: "ONGOING" as const, projectName: `${demoPrefix} Tailoring studio`, sector: "Tailoring and textiles", sortOrder: 9000 },
      { key: "food", name: `${demoPrefix} Fictional participant 2`, status: "ONGOING" as const, projectName: `${demoPrefix} Food enterprise`, sector: "Food and hospitality", sortOrder: 9001 },
      { key: "beauty", name: `${demoPrefix} Fictional participant 3`, status: "ONGOING" as const, projectName: `${demoPrefix} Beauty service`, sector: "Personal care", sortOrder: 9002 },
      { key: "craft", name: `${demoPrefix} Fictional participant 4`, status: "ALUMNI" as const, projectName: `${demoPrefix} Craft business`, sector: "Craft and design", sortOrder: 9003 },
      { key: "digital", name: `${demoPrefix} Fictional participant 5`, status: "ALUMNI" as const, projectName: `${demoPrefix} Digital service`, sector: "Digital services", sortOrder: 9004 },
    ];
    for (const sample of samplePeople) {
      let person = await prisma.programParticipant.findFirst({ where: { programId: program.id, name: sample.name } });
      if (!person && sample.key === "tailoring") person = await prisma.programParticipant.findFirst({ where: { programId: program.id, name: `${demoPrefix} Amina ${program.slug}` } });
      if (!person && sample.key === "craft") person = await prisma.programParticipant.findFirst({ where: { programId: program.id, name: `${demoPrefix} Chantal ${program.slug}` } });
      const personData = {
        name: sample.name, status: sample.status, projectName: sample.projectName, sector: sample.sector,
        biography: `${demoPrefix} Fictional profile used only to preview the programme dashboard and public cards. Replace with approved participant information before using as a real profile.`,
        businessDescription: `${demoPrefix} Fictional ${sample.sector.toLowerCase()} business profile for reviewing participant editing.`, location: "Rwanda (demo)",
        published: true, sortOrder: sample.sortOrder,
      };
      if (person) person = await prisma.programParticipant.update({ where: { id: person.id }, data: personData });
      else person = await prisma.programParticipant.create({ data: { programId: program.id, ...personData } });

      const storySlug = `demo-${program.slug}-${sample.key}`;
      const storyTitle = `${demoPrefix} Fictional ${sample.sector.toLowerCase()} participant story`;
      const storyData = {
        programId: program.id, participantId: person.id, name: person.name, role: sample.status === "ALUMNI" ? "Graduate (demo profile)" : "Participant (demo profile)",
        organization: sample.projectName, location: "Rwanda (demo)", storyTitle, slug: storySlug,
        excerpt: `${demoPrefix} A fictional story preview. No real participant quotation or outcome is represented.`,
        content: `${demoPrefix} This is fictional demonstration copy for reviewing story layout and programme-linked publishing. Replace it with an approved story and consented quotation before real publication.`,
        published: true, featured: true, sortOrder: sample.sortOrder,
      };
      let existingStory = await prisma.programTestimonial.findUnique({ where: { slug: storySlug } });
      if (!existingStory && sample.key === "tailoring") existingStory = await prisma.programTestimonial.findUnique({ where: { slug: `demo-${program.slug}-ongoing` } });
      if (!existingStory && sample.key === "craft") existingStory = await prisma.programTestimonial.findUnique({ where: { slug: `demo-${program.slug}-alumni` } });
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
    let phase = await prisma.programTimelinePhase.findFirst({ where: { programId: program.id, name: phaseName } });
    if (!phase) phase = await prisma.programTimelinePhase.create({ data: { programId: program.id, name: phaseName, description: `${demoPrefix} A clearly labelled sample stage for testing the schedule controls.`, published: true, sortOrder: 9000 } });
    const milestoneTitle = `${demoPrefix} Review the stage plan`;
    if (!(await prisma.programTimelineMilestone.findFirst({ where: { phaseId: phase.id, title: milestoneTitle } }))) {
      await prisma.programTimelineMilestone.create({ data: { phaseId: phase.id, title: milestoneTitle, description: `${demoPrefix} Example milestone. Replace with the approved programme schedule and dates.`, published: true, sortOrder: 9000 } });
    }

    const stakeholderSlug = `demo-${program.slug}-mentor-voice`;
    const stakeholderStory = {
      programId: program.id, participantId: null, name: `${demoPrefix} Fictional mentor`, role: "Mentor (demo profile)",
      organization: `${demoPrefix} Example partner organization`, location: "Rwanda (demo)", storyTitle: `${demoPrefix} Fictional mentor perspective`, slug: stakeholderSlug,
      excerpt: `${demoPrefix} A fictional stakeholder story used to preview the publishing flow.`,
      content: `${demoPrefix} This is invented demonstration copy, not an actual endorsement or quotation. Replace it with an approved statement before publication.`,
      published: true, featured: false, sortOrder: 9010,
    };
    const existingStakeholderStory = await prisma.programTestimonial.findUnique({ where: { slug: stakeholderSlug } });
    if (existingStakeholderStory) await prisma.programTestimonial.update({ where: { id: existingStakeholderStory.id }, data: stakeholderStory });
    else await prisma.programTestimonial.create({ data: stakeholderStory });
  }

  const participantCount = await prisma.programParticipant.count({ where: { programId: aheza.id, name: { startsWith: demoPrefix } } });
  const storyCount = await prisma.programTestimonial.count({ where: { programId: aheza.id, name: { startsWith: demoPrefix }, published: true } });
  console.log(`${aheza.title}: ${participantCount} demo participants and ${storyCount} published demo stories. ${second.title}: shared demo content is configured. Photos remain unassigned; upload consented images through the dashboard when ready.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => {
  const { prisma } = await import("@/lib/prisma");
  await prisma.$disconnect();
});
