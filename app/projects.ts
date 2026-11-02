export type Project = {
  href: string;
  label: string;
  description: string;
  accent: string;
};

export const projects: Project[] = [
  { href: "/frogchat", label: "Frogchat", description: "Hop into a shared pond and chat with other frogs", accent: "#8fb96a" },
  { href: "/inventories", label: "Inventories", description: "Create and browse MongoDB inventory records", accent: "#93c46e" },
  { href: "/jobs", label: "Jobs", description: "Find Singapore IT roles from selected tech employers", accent: "#b9e3c8" },
  { href: "/warehouse", label: "Warehouse", description: "Browse WMS inventories, products, locations, centers, and SKUs", accent: "#85b7c2" },
  { href: "/favicon", label: "Favicon", description: "Generate, preview, copy, and download website icons", accent: "#c6b6ff" },
  { href: "/softwares", label: "Softwares", description: "Explore software options", accent: "#22c55e" },
  { href: "/camel", label: "Camel", description: "Explore Apache Camel", accent: "#22c55e" },
  { href: "/coffee", label: "Coffee", description: "Explore a coffee shop concept", accent: "#f59e0b" },
  { href: "/finance", label: "Finance", description: "Explore a personal finance dashboard", accent: "#06b6d4" },
  { href: "/iphone", label: "iPhone", description: "View an iPhone product showcase", accent: "#ec4899" },
  { href: "/netflix", label: "Netflix", description: "Explore a streaming interface concept", accent: "#ef4444" },
  { href: "/payment", label: "Payment", description: "Browse payment methods and providers", accent: "#10b981" },
  { href: "/segar", label: "Segar", description: "Explore a Singapore neighborhood", accent: "#a78bfa" },
  { href: "/travel", label: "Travel", description: "Explore Korea, Taiwan, and Singapore", accent: "#22c55e" },
  { href: "/soonok", label: "Soonok", description: "Read a personal diary timeline", accent: "#f97316" },
  { href: "/test", label: "Test", description: "A simple development test page", accent: "#38bdf8" },
];
