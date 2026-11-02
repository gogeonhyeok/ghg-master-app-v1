import type { Metadata } from "next";
import FrogChat from "./FrogChat";

export const metadata: Metadata = {
  title: "Frogchat · A little room to just be",
  description: "A quiet white room, a few little frogs, and a conversation. Move, jump, and say hello.",
};

export default function FrogChatPage() {
  return <FrogChat />;
}
