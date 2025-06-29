import type { Metadata } from "next"
import HelpCenter from "@/components/help-center"

export const metadata: Metadata = {
  title: "Help Center - TrueTextAI",
  description:
    "Get help with TrueTextAI. Find answers to frequently asked questions and learn how to use our platform.",
}

export default function HelpPage() {
  return <HelpCenter />
}
