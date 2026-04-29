import type { Metadata } from "next";
import "./globals.css";
import { PipelineProvider } from "@/lib/pipeline-context";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "ARGUS — AI-Enabled Threat Intelligence Reporting",
  description:
    "ARGUS is an AI-powered cyber threat intelligence reporting tool. Carnegie Mellon University.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <PipelineProvider>
          <AppShell>{children}</AppShell>
        </PipelineProvider>
      </body>
    </html>
  );
}
