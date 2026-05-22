import { getSettings } from "@/app/actions/settings";
import SettingsForm from "@/components/admin/SettingsForm";
import Link from "next/link";
import { ArrowLeft as ArrowLeftIcon } from "lucide-react";

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <Link href="/admin" className="text-sm text-primary flex items-center gap-1 mb-2 hover:underline">
          <ArrowLeftIcon className="h-3 w-3" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold">System Configuration</h1>
        <p className="text-muted-foreground text-sm">Manage GDPR data retention and application preferences.</p>
      </header>

      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
        <SettingsForm initialSettings={settings} />
      </div>
    </div>
  );
}
