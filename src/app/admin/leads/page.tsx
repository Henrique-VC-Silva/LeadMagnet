import { getLeads } from "@/app/actions/admin";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";

export default async function LeadsPage() {
  const leads = await getLeads();

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin" className="text-sm text-primary flex items-center gap-1 mb-2 hover:underline">
            <ArrowLeft className="h-3 w-3" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Captured Leads</h1>
        </div>
        
        {/* Simplified export - in a real app this would be a separate endpoint or client action */}
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </header>

      <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-secondary/50 border-bottom border-border">
              <th className="px-6 py-4 text-sm font-semibold">Email</th>
              <th className="px-6 py-4 text-sm font-semibold">Name</th>
              <th className="px-6 py-4 text-sm font-semibold">Phone</th>
              <th className="px-6 py-4 text-sm font-semibold">Won Prize</th>
              <th className="px-6 py-4 text-sm font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-t border-border hover:bg-secondary/20 transition-colors">
                <td className="px-6 py-4 text-sm">{lead.email}</td>
                <td className="px-6 py-4 text-sm">{lead.name || "-"}</td>
                <td className="px-6 py-4 text-sm">{lead.phone || "-"}</td>
                <td className="px-6 py-4 text-sm">
                  {lead.wonPrize ? (
                    <span className="inline-block px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium">
                      {lead.wonPrize.name}
                    </span>
                  ) : "-"}
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
