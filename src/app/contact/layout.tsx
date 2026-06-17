import type { Metadata } from "next";
import { siteConfig } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Hubungi Kami — Konsultasi Gratis Jasa Website Jambi | LumaSpace",
  description:
    "Hubungi LumaSpace untuk konsultasi gratis pembuatan website di Jambi. Chat via WhatsApp, email, atau Instagram. Kami siap membantu bisnis Anda tampil profesional secara digital.",
  keywords: [
    "kontak jasa website Jambi",
    "konsultasi website Jambi gratis",
    "hubungi LumaSpace",
    "WhatsApp jasa website Jambi",
    "order website Jambi",
    "pesan website di Jambi",
    "nomor telepon LumaSpace Jambi",
    "alamat LumaSpace Jambi",
    "tanya jasa website Jambi",
    "email LumaSpace",
    "instagram LumaSpace website",
    "chat whatsapp developer web jambi",
  ],
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    url: `${siteConfig.url}/contact`,
    title: "Hubungi LumaSpace — Konsultasi Gratis Jasa Website Jambi",
    description:
      "Chat WhatsApp atau email kami untuk konsultasi gratis pembuatan website profesional di Jambi.",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
