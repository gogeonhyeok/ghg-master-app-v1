import type { Metadata } from "next";
import PhysicsLab from "./PhysicsLab";

export const metadata: Metadata = {
  title: "Physics Lab | Go Gun Hyuk",
  description: "Explore mechanics, electromagnetism, relativity and statistical physics through interactive experiments.",
};

export default function PhysicsPage() {
  return <PhysicsLab />;
}
