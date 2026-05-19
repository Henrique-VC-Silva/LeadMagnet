import { describe, it, expect, vi } from "vitest";
import React from "react";
import AdminLayout from "../admin/layout";
import { renderToStaticMarkup } from "react-dom/server";

describe("Admin Layout - Dark Theme Context", () => {
  it("should render admin layout wrapping children with admin-dashboard class", async () => {
    // Render the Server Component directly
    const result = await AdminLayout({ children: <div className="child-content">Test Admin Child</div> });

    // Render component to html
    const html = renderToStaticMarkup(result);

    // Expect HTML to contain container with 'admin-dashboard' class
    expect(html).toContain("admin-dashboard");
    
    // Expect body background classes to fit dark theme styles
    expect(html).toContain("bg-slate-950");
  });
});
