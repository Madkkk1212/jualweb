import { notFound } from "next/navigation";

// This page exists only to trigger Next.js built-in 404 (not-found.tsx)
// when client-side router.replace("/not-found") is called
export default function NotFoundTrigger() {
  notFound();
}
