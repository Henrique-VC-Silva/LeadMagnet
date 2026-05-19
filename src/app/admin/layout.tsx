import React from "react";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="admin-dashboard min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
