import type { Metadata } from "next";
import { AboutView } from "@/components/settings/about-view";

export const metadata: Metadata = { title: "About & Install" };

export default function Page() {
  return <AboutView />;
}
