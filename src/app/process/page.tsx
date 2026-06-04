import type { Metadata } from "next";
import { Process } from "@/components/sections/Process";
import { getBreadcrumbSchema, siteConfig } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Alur Kerja Pembuatan Website — Dari Konsultasi hingga Tayang | LumaSpace",
  description:
    "Pelajari cara kerja LumaSpace dalam membangun website di Jambi: konsultasi gratis → desain mockup → pengembangan → revisi → tayang. Proses transparan, selesai 3-7 hari.",
  keywords: [
    "proses pembuatan website Jambi",
    "cara kerja jasa website Jambi",
    "alur order website Jambi",
    "berapa lama buat website Jambi",
    "proses bikin website profesional",
    "LumaSpace alur kerja",
  ],
  alternates: {
    canonical: "/process",
  },
  openGraph: {
    url: `${siteConfig.url}/process`,
    title: "Alur Kerja Pembuatan Website LumaSpace — Konsultasi hingga Tayang",
    description:
      "Proses transparan pembuatan website di Jambi oleh LumaSpace: konsultasi, desain, pengembangan, revisi, dan tayang dalam 3–7 hari kerja.",
  },
};

export default function ProcessPage() {
  const breadcrumb = getBreadcrumbSchema([
    { name: "Beranda", path: "/" },
    { name: "Alur Kerja", path: "/process" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <div className="pt-4 md:pt-20">
        <Process />
      </div>
    </>
  );
}
