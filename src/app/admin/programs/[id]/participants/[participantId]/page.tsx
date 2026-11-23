import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ParticipantProfileManager } from "@/components/admin/participant-profile-manager";

export default async function ProgramParticipantPage({ params }: { params: Promise<{ id: string; participantId: string }> }) {
  const { id, participantId } = await params;
  const participant = await prisma.programParticipant.findFirst({ where: { id: participantId, programId: id }, select: { id: true } });
  if (!participant) notFound();
  return <ParticipantProfileManager participantId={participant.id} />;
}
