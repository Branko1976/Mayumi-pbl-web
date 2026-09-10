import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mayumi PBL — Simulated Clinical Interview",
  description: "A PBL clinical-interview simulator: A Difficult Child (Mayumi)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  );
}
