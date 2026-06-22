"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Github, MonitorPlay } from "lucide-react";
import { projects, type Project } from "@/data/projects";
import { supabase } from "@/lib/supabase";

export default function PortfolioPageClient() {
  const [activeCategory, setActiveCategory] = useState<string>("Semua");
  const [dbProjects, setDbProjects] = useState<Project[]>([]);

  useEffect(() => {
    async function fetchCustomPortfolios() {
      try {
        const { data, error } = await supabase
          .from("portfolios")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching portfolios from Supabase:", error);
          return;
        }

        if (data) {
          const mapped: Project[] = data.map((p) => ({
            title: p.title,
            tag: p.tag || p.category,
            category: p.category,
            desc: p.description,
            img: p.img,
            link: p.link || undefined,
            github: p.github || undefined,
          }));
          setDbProjects(mapped);
        }
      } catch (err) {
        console.error("Exception fetching portfolios:", err);
      }
    }

    fetchCustomPortfolios();
  }, []);

  const allProjects = useMemo(() => {
    return [...projects, ...dbProjects];
  }, [dbProjects]);

  const getProjectUrlLabel = (link?: string) => {
    if (!link) return null;

    try {
      return new URL(link).hostname.replace(/^www\./, "");
    } catch {
      return link;
    }
  };

  const categories = useMemo(() => {
    const cats = new Set(allProjects.map((p) => p.category));
    return ["Semua", ...Array.from(cats)];
  }, [allProjects]);

  const filteredProjects = useMemo(() => {
    if (activeCategory === "Semua") return allProjects;
    return allProjects.filter((p) => p.category === activeCategory);
  }, [activeCategory, allProjects]);

  return (
    <div className="min-h-screen pt-16 md:pt-32 pb-12 md:pb-24 px-6 bg-transparent relative overflow-hidden">
      {/* Subtle atmospheric glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/[0.03] rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-rose-500/[0.02] rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-20 mt-8 flex flex-col items-center text-center pb-16 border-b border-border"
        >
          <div className="max-w-[700px] flex flex-col items-center">
            <span className="inline-block py-1.5 px-4 mb-6 rounded-full bg-accent-blue/5 border border-accent-blue/10 text-accent-blue text-xs font-bold uppercase tracking-widest">
              Template Website
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-foreground mb-8 tracking-tighter leading-[1.1]">
              Template Pilihan.
            </h1>
            <p className="text-lg md:text-xl text-foreground/50 font-medium leading-relaxed">
              Jelajahi koleksi template website untuk berbagai jenis bisnis. Setiap template dapat dikustomisasi mulai dari warna, konten, fitur, hingga identitas visual agar sesuai dengan kebutuhan brand Anda. Ini hanya sebuah contoh jika mau lebih custom bisa langsung ke admin.
            </p>
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-12">
          <div className="lg:w-1/4 shrink-0">
            <div className="sticky top-32 bg-card border border-border rounded-2xl p-6 shadow-soft">
              <h2 className="text-lg font-bold text-foreground mb-6">Kategori Filter</h2>
              <div className="flex flex-col gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`text-left px-4 py-3 rounded-xl font-medium transition-all ${activeCategory === category
                        ? "bg-accent-blue/10 text-accent-blue border border-accent-blue/20"
                        : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground border border-transparent"
                      }`}
                  >
                    {category}
                    <span className="float-right text-xs opacity-50 relative top-1">
                      {category === "Semua" ? allProjects.length : allProjects.filter((p) => p.category === category).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:w-3/4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredProjects.map((project, i) => (
                <motion.article
                  key={project.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, ease: "easeOut" }}
                  className="group"
                >
                  <div className="aspect-[16/11] rounded-2.5xl overflow-hidden bg-card border border-border shadow-soft relative mb-8 group-hover:shadow-premium group-hover:-translate-y-2 transition-all duration-300">
                    <div className={`w-full h-full ${project.img.includes("gradient") ? project.img : "bg-card"} flex items-center justify-center relative overflow-hidden`}>
                      {project.img.includes("gradient") ? (
                        <motion.div
                          initial={{ scale: 0.95 }}
                          whileInView={{ scale: 1 }}
                          className="w-[85%] h-5/6 bg-white rounded-2xl shadow-premium border border-border/50 p-6 flex flex-col gap-4"
                        >
                          <div className="w-1/3 h-4 bg-foreground/5 rounded-full" />
                          <div className="w-full h-32 bg-foreground/3 shadow-inner rounded-xl" />
                          <div className="grid grid-cols-3 gap-3">
                            <div className="h-10 bg-foreground/3 rounded-lg" />
                            <div className="h-10 bg-foreground/3 rounded-lg" />
                            <div className="h-10 bg-foreground/3 rounded-lg" />
                          </div>
                        </motion.div>
                      ) : (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={project.img} alt={project.title} className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                      )}
                    </div>

                    <div className="absolute inset-0 bg-foreground/80 dark:bg-foreground/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-6">
                      <a href={project.link || "#"} target={project.link ? "_blank" : "_self"} rel={project.link ? "noreferrer" : undefined} className="p-4 bg-background rounded-full text-foreground shadow-premium hover:scale-110 active:scale-95 transition-all" aria-label="Visit Website">
                        <ExternalLink className="h-6 w-6" />
                      </a>
                      {project.github && (
                        <a href={project.github} target="_blank" rel="noreferrer" className="p-4 bg-foreground/10 backdrop-blur-md rounded-full text-background hover:scale-110 active:scale-95 transition-all border border-background/20" aria-label="Repositori Github">
                          <Github className="h-6 w-6" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <h3 className="text-2xl font-bold text-foreground group-hover:text-accent-blue transition-colors">
                        {project.title}
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs font-bold text-accent-blue uppercase tracking-widest bg-accent-blue/5 border border-accent-blue/10 w-fit px-3 py-1 rounded-full">{project.tag}</span>
                    </div>
                    <p className="text-base text-foreground/60 font-medium leading-relaxed mt-2">{project.desc}</p>
                    {project.link && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-semibold text-accent-blue hover:text-accent-cyan transition-colors break-all w-fit"
                      >
                        {getProjectUrlLabel(project.link)}
                      </a>
                    )}
                  </div>
                </motion.article>
              ))}
              {filteredProjects.length === 0 && (
                <div className="col-span-full py-24 text-center">
                  <div className="w-20 h-20 bg-foreground/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MonitorPlay className="w-10 h-10 text-foreground/30" />
                  </div>
                  <p className="text-xl text-foreground/50 font-medium">Belum ada portofolio di kategori ini.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
