import { redirect } from "next/navigation";

export default function AhezaParticipantsShortcut() {
  redirect("/admin/aheza?section=participants");
}
