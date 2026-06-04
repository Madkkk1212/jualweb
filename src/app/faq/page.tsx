import type { Metadata } from "next";
import { FAQ } from "@/components/sections/FAQ";
import { faqs } from "@/data/faqs";
import { getBreadcrumbSchema, getFaqPageSchema, getHowToOrderSchema, getSpeakableSchema, siteConfig } from "@/lib/seo";

export const metadata: Metadata = {
  title: "FAQ — Tanya Jawab Jasa Website Jambi | LumaSpace",
  description:
    "Pertanyaan yang sering diajukan seputar jasa pembuatan website di Jambi: berapa lama pengerjaan, apa yang termasuk dalam paket, apakah ada domain dan hosting, garansi, dan cara order.",
  keywords: [
    "FAQ jasa website Jambi",
    "pertanyaan jasa website Jambi",
    "cara pesan website Jambi",
    "berapa lama buat website",
    "apakah termasuk domain hosting",
    "garansi website LumaSpace",
    "tanya jawab jasa web Jambi",
    "berapa harga website di Jambi",
    "cara order website Jambi",
    "jasa website Jambi terpercaya",
    "apakah dapat source code website",
    "revisi pembuatan website Jambi",
    "syarat pembuatan website Jambi",
    "apakah ada biaya perpanjangan web",
    "cara kelola website sendiri",
  ],
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    url: `${siteConfig.url}/faq`,
    title: "FAQ Jasa Website Jambi — LumaSpace",
    description:
      "Temukan jawaban atas pertanyaan umum seputar jasa pembuatan website di Jambi oleh LumaSpace.",
  },
};

export default function FAQPage() {
  const schemas = [
    getFaqPageSchema(faqs),
    getHowToOrderSchema(),
    getSpeakableSchema(`${siteConfig.url}/faq`, ["h1", ".faq-content", "h2"]),
    getBreadcrumbSchema([
      { name: "Beranda", path: "/" },
      { name: "FAQ", path: "/faq" },
    ]),
  ];

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <div className="pt-4 md:pt-20">
        <FAQ />
      </div>
    </>
  );
}

