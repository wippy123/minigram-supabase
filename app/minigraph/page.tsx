import { Metadata } from "next";
import MinigraphForm from "./minigraph-form";

export const metadata: Metadata = {
  title: "Minigraph",
  description: "Create your minigraph profile",
};

export default function MinigraphPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Create Your Minigraph</h1>
      <MinigraphForm />
    </div>
  );
}
