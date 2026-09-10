import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meth Psychosis PBL — Simulated Clinical Interview",
  description: "A PBL clinical-interview simulator: Acute Agitation in a Postpartum Woman (methamphetamine-induced psychosis)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  );
}
