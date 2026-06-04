import type { Metadata } from "next";
import { siteConfig, getBreadcrumbSchema } from "@/lib/seo";
import { Mail, MessageCircle, MapPin, Instagram } from "lucide-react";
import Link from "next/link";

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

export default function ContactPage() {
  const breadcrumb = getBreadcrumbSchema([
    { name: "Beranda", path: "/" },
    { name: "Hubungi Kami", path: "/contact" },
  ]);

  const contactInfo = [
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: "0895-1461-8737",
      href: siteConfig.whatsapp,
      color: "text-accent-green",
      bg: "bg-accent-green/10",
    },
    {
      icon: Mail,
      label: "Email",
      value: "lumaspace@gmail.com",
      href: "mailto:lumaspace@gmail.com",
      color: "text-accent-blue",
      bg: "bg-accent-blue/10",
    },
    {
      icon: Instagram,
      label: "Instagram",
      value: "@lumaspace.web",
      href: "https://www.instagram.com/lumaspace.web/",
      color: "text-purple-400",
      bg: "bg-purple-400/10",
    },
    {
      icon: MapPin,
      label: "Lokasi",
      value: "Jambi, Indonesia",
      href: "#",
      color: "text-red-400",
      bg: "bg-red-400/10",
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <div className="pt-16 md:pt-32 min-h-screen bg-transparent relative overflow-hidden">
        {/* Subtle atmospheric glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/[0.03] rounded-full blur-[100px] -z-10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h1 className="text-4xl md:text-8xl font-black text-foreground mb-8 tracking-tighter leading-[0.9]">
              Mari Kita <br />
              <span className="text-gradient-blue text-glow-blue underline decoration-accent-blue/10 italic">Bicara.</span>
            </h1>
            <p className="text-lg md:text-2xl text-foreground/50 max-w-2xl mx-auto font-medium leading-relaxed">
              Kami siap membantu menjawab semua keraguan Anda. Pilih jalur komunikasi yang paling nyaman bagi Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-32">
            {contactInfo.map((info) => (
              <Link
                key={info.label}
                href={info.href}
                target={info.href.startsWith("http") ? "_blank" : undefined}
                rel={info.href.startsWith("http") ? "noreferrer" : undefined}
                className="group bg-card p-10 rounded-[2.5rem] border border-border/50 shadow-premium hover:shadow-hover hover:-translate-y-2 transition-all duration-500"
              >
                <div className={`w-16 h-16 rounded-2xl ${info.bg} ${info.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                  <info.icon className="h-8 w-8" />
                </div>
                <h3 className="text-sm font-black text-foreground/40 uppercase tracking-[0.2em] mb-2">{info.label}</h3>
                <p className="text-xl font-bold text-foreground break-words">{info.value}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
