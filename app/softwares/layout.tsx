import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Software Library | Glossaries",
  description: "Browse the software catalog, recorded prices, and licensing notes.",
};

export default function SoftwareLayout({ children }: { children: ReactNode }) {
  return children;
}
