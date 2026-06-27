"use client";

import React from "react";
import { motion } from "framer-motion";
import { ExternalLink, Github, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { projects } from "@/data/projects";
import { useLanguage } from "@/contexts/LanguageContext";

export const Portfolio = () => {
  const displayProjects = projects.slice(0, 10);
  const { t } = useLanguage();
  const tr = t("portfolio");
  const trPage = t("portfolioPage");

  const getProjectUrlLabel = (link?: string) => {
    if (!link) return null;
    try {
      return new URL(link).hostname.replace(/^www\./, "");
    } catch {
      return link;
    }
  };

  return (
    <section id="portfolio" className="py-12 md:py-32 px-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #cfd9df 0%, #e2ebf0 100%)" }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-24 gap-8">
          <div className="max-w-2xl text-left">
            <h2 className="text-4xl md:text-7xl font-black text-foreground mb-8 tracking-tighter">
              {tr.heading} <span className="text-gradient-blue text-glow-blue underline decoration-accent-blue/10">{tr.headingHighlight}</span>
            </h2>
            <p className="text-lg md:text-xl text-foreground/60 font-medium">
              {tr.subtitle}
            </p>
          </div>
          <Link href="/portfolio" passHref>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 text-foreground font-bold border-b-2 border-accent-blue pb-1 cursor-pointer w-fit"
            >
              {tr.viewAll} <ArrowUpRight className="h-5 w-5" />
            </motion.button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {displayProjects.map((project, i) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group"
            >
              <div className="aspect-[16/11] rounded-2.5xl overflow-hidden bg-card border border-border shadow-soft relative mb-8 group-hover:shadow-premium group-hover:-translate-y-2 transition-all duration-300">
                <div className={`w-full h-full ${project.img.includes("gradient") ? project.img : "bg-card"} flex items-center justify-center relative overflow-hidden`}>
                  {project.img.includes("gradient") ? (
                    <motion.div
                      initial={{ y: 60 }}
                      whileInView={{ y: 40 }}
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
                  <a href={project.link || "#"} target={project.link ? "_blank" : "_self"} rel={project.link ? "noreferrer" : undefined} className="p-4 bg-background rounded-full text-foreground shadow-premium hover:scale-110 active:scale-95 transition-all">
                    <ExternalLink className="h-6 w-6" />
                  </a>
                  <a href={project.github || "#"} target={project.github ? "_blank" : "_self"} rel={project.github ? "noreferrer" : undefined} className="p-4 bg-foreground/10 backdrop-blur-md rounded-full text-background hover:scale-110 active:scale-95 transition-all border border-background/20">
                    <Github className="h-6 w-6" />
                  </a>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-foreground group-hover:text-accent-blue transition-colors">
                    {project.title}
                  </h3>
                </div>
                {(() => {
                  const translatedProj = trPage.projects[project.title];
                  const tag = translatedProj ? translatedProj.tag : project.tag;
                  const desc = translatedProj ? translatedProj.desc : project.desc;
                  return (
                    <>
                      <div className="text-xs font-bold text-accent-blue uppercase tracking-widest bg-accent-blue/5 w-fit px-3 py-1 rounded-full">
                        {tag}
                      </div>
                      <p className="text-base text-foreground/60 font-medium leading-relaxed">
                        {desc}
                      </p>
                    </>
                  );
                })()}
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
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
