import { ParticipantProfileManager } from "@/components/admin/participant-profile-manager";

export default async function AhezaParticipantPage({ params }: { params: Promise<{ participantId: string }> }) {
  const { participantId } = await params;
  return <ParticipantProfileManager participantId={participantId} />;
}
