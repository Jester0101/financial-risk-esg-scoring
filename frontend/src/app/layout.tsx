import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/layout/Navigation";

export const metadata: Metadata = {
  title: "Risk Scoring | Financial Risk & ESG Analysis",
  description: "Comprehensive financial risk assessment with ESG integration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}



