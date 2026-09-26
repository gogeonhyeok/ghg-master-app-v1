import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Segar | Singapore",
  description:
    "Explore Segar and find local food and medical options in Segar, Fajar, and Senja.",
};

export default function SegarLayout({ children }: { children: ReactNode }) {
  return children;
}
