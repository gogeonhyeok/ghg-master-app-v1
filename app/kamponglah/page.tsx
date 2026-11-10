import type { Metadata } from "next";
import Kamponglah from "./Kamponglah";
import { auth, isGoogleAuthConfigured } from "../../auth";

export const metadata: Metadata = {
  title: "Kamponglah | Your kampong. Your say.",
  description: "A friendly neighbourhood space for the everyday gripes of HDB and condo living in Singapore.",
};

export default async function KamponglahPage() {
  const session = isGoogleAuthConfigured() ? await auth() : null;
  return <Kamponglah userName={session?.user?.name ?? null} />;
}
