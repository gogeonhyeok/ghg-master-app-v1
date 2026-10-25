import type { Metadata } from "next";
import FrogChat from "./FrogChat";

export const metadata: Metadata = {
  title: "Frogchat · A little pond, a little conversation",
  description: "Hop into a sunny shared pond. Meet other frogs, send a croak, and watch your conversations come to life.",
};

export default function FrogChatPage() {
  return <FrogChat />;
}
