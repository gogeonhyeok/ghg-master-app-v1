import type { Metadata } from "next";
import Destination from "./Destination";
import { getDestination } from "./destinations";

type TravelPageProps = {
  searchParams: Promise<{ destination?: string | string[] }>;
};

export async function generateMetadata({ searchParams }: TravelPageProps): Promise<Metadata> {
  const destination = getDestination((await searchParams).destination);
  return {
    title: `${destination.name} | Elsewhere Travel`,
    description: destination.intro,
  };
}

export default async function TravelPage({ searchParams }: TravelPageProps) {
  const destination = getDestination((await searchParams).destination);
  return <Destination data={destination} />;
}
