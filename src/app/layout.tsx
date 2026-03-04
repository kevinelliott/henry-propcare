import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PropCare — Property Maintenance for Independent Landlords",
  description:
    "Manage maintenance requests, vendors, and work orders for your rental properties. Starting at $19/mo vs AppFolio's $280/mo.",
  keywords: ["property maintenance", "landlord software", "work orders", "rental management"],
  openGraph: {
    title: "PropCare — Property Maintenance Made Simple",
    description: "Track maintenance requests, assign vendors, and keep tenants in the loop. Built for independent landlords.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>{children}</body>
    </html>
  );
}
