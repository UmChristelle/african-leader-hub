import { RecordForm } from "@/components/admin/record-form";
import { programFields } from "@/components/admin/form-fields";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function EditProgramPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Edit program</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Work through one block at a time. Publishing, applications, and images stay in the column on the right.
        </p>
      </div>
      <Button asChild className="bg-[#8B4513] hover:bg-[#6B3410]"><Link href={`/admin/programs/${id}/content`}>Manage programme sections</Link></Button>
      <RecordForm collection="programs" id={id} fields={programFields} />
    </div>
  );
}
