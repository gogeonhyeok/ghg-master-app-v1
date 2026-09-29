import type { Metadata } from "next";
import type { ReactNode } from "react";
export const metadata: Metadata = { title: "Favicon generator | Icon lab", description: "Generate random geometric favicons. Copy SVG code or download SVG and PNG files." };
export default function FaviconLayout({ children }: { children: ReactNode }) { return children; }
