"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function NotFound() {
  const [floatY, setFloatY] = useState(0);
  const [particles, setParticles] = useState<
    { id: number; x: number; y: number; size: number; delay: number; duration: number }[]
  >([]);

  // Floating animation for robot
  useEffect(() => {
    let frame: number;
    let start: number | null = null;
    const animate = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      setFloatY(Math.sin(elapsed / 1200) * 14);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  // Generate floating particles on client only
  useEffect(() => {
    setParticles(
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        delay: Math.random() * 5,
        duration: Math.random() * 8 + 6,
      }))
    );
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .nf-root {
          min-height: 100vh;
          background: #080c14;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', sans-serif;
          overflow: hidden;
          position: relative;
        }

        /* Radial glow background */
        .nf-glow-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 50% at 50% 0%, rgba(99,102,241,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 40% 40% at 20% 80%, rgba(168,85,247,0.10) 0%, transparent 50%),
            radial-gradient(ellipse 40% 40% at 80% 70%, rgba(59,130,246,0.08) 0%, transparent 50%);
          pointer-events: none;
        }

        /* Grid pattern */
        .nf-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
        }

        /* Particle */
        @keyframes particleFloat {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { transform: translateY(-30px) scale(1.2); opacity: 0.7; }
        }
        .nf-particle {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139,92,246,0.8), rgba(59,130,246,0.3));
          animation: particleFloat linear infinite;
          pointer-events: none;
        }

        /* Glitch effect on 404 */
        @keyframes glitch1 {
          0%, 100% { clip-path: inset(0 0 90% 0); transform: translateX(0); }
          20% { clip-path: inset(15% 0 70% 0); transform: translateX(-4px); }
          40% { clip-path: inset(45% 0 40% 0); transform: translateX(4px); }
          60% { clip-path: inset(70% 0 15% 0); transform: translateX(-2px); }
          80% { clip-path: inset(90% 0 0 0); transform: translateX(2px); }
        }
        @keyframes glitch2 {
          0%, 100% { clip-path: inset(90% 0 0 0); transform: translateX(0); }
          20% { clip-path: inset(70% 0 15% 0); transform: translateX(4px); }
          40% { clip-path: inset(40% 0 45% 0); transform: translateX(-3px); }
          60% { clip-path: inset(15% 0 70% 0); transform: translateX(3px); }
          80% { clip-path: inset(0 0 90% 0); transform: translateX(-4px); }
        }
        .nf-404-text {
          position: relative;
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(100px, 20vw, 200px);
          font-weight: 800;
          line-height: 1;
          background: linear-gradient(135deg, #6366f1 0%, #a78bfa 40%, #38bdf8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.04em;
          user-select: none;
        }
        .nf-404-text::before,
        .nf-404-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0; left: 0;
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(100px, 20vw, 200px);
          font-weight: 800;
          letter-spacing: -0.04em;
          user-select: none;
        }
        .nf-404-text::before {
          background: linear-gradient(135deg, #f43f5e, #fb923c);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: glitch1 3.5s infinite steps(1);
          opacity: 0.6;
        }
        .nf-404-text::after {
          background: linear-gradient(135deg, #22d3ee, #34d399);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: glitch2 3.5s infinite steps(1);
          opacity: 0.5;
        }

        /* Card */
        .nf-card {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          max-width: 520px;
          width: 100%;
          padding: 0 24px;
          text-align: center;
        }

        /* Robot wrapper */
        .nf-robot-wrap {
          width: 220px;
          height: 220px;
          position: relative;
          flex-shrink: 0;
        }

        /* Logo */
        .nf-logo-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
        }
        .nf-logo-img {
          width: 36px;
          height: 36px;
          object-fit: contain;
          filter: drop-shadow(0 0 8px rgba(99,102,241,0.5));
        }
        .nf-logo-text {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 20px;
          font-weight: 700;
          background: linear-gradient(90deg, #a78bfa, #38bdf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: 0.04em;
        }

        /* Subtitle */
        .nf-subtitle {
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.18em;
          color: #6366f1;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .nf-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(20px, 4vw, 28px);
          font-weight: 700;
          color: #f1f5f9;
          margin-bottom: 12px;
          line-height: 1.3;
        }
        .nf-desc {
          font-size: 15px;
          color: #94a3b8;
          line-height: 1.7;
          margin-bottom: 32px;
        }

        /* Button */
        .nf-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 32px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          font-weight: 600;
          border-radius: 16px;
          text-decoration: none;
          transition: all 0.25s ease;
          box-shadow: 0 0 24px rgba(99,102,241,0.4), 0 4px 16px rgba(0,0,0,0.3);
          border: 1px solid rgba(139,92,246,0.3);
          letter-spacing: 0.01em;
        }
        .nf-btn:hover {
          background: linear-gradient(135deg, #818cf8, #a78bfa);
          box-shadow: 0 0 40px rgba(99,102,241,0.6), 0 8px 24px rgba(0,0,0,0.4);
          transform: translateY(-2px) scale(1.03);
        }
        .nf-btn:active {
          transform: translateY(0) scale(0.98);
        }

        /* Divider line */
        .nf-divider {
          width: 60px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #6366f1, transparent);
          border-radius: 4px;
          margin: 0 auto 24px;
        }

        /* Badge */
        .nf-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(99,102,241,0.1);
          border: 1px solid rgba(99,102,241,0.2);
          border-radius: 100px;
          padding: 5px 14px;
          font-size: 12px;
          color: #818cf8;
          font-weight: 500;
          margin-bottom: 24px;
          letter-spacing: 0.04em;
        }
        .nf-badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #6366f1;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
      `}</style>

      <div className="nf-root">
        {/* Background layers */}
        <div className="nf-glow-bg" />
        <div className="nf-grid" />

        {/* Floating particles */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="nf-particle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}

        <div className="nf-card">
          {/* Logo */}
          <div className="nf-logo-wrap">
            <Image
              src="/img/logo luma.png"
              alt="Luma Logo"
              width={36}
              height={36}
              className="nf-logo-img"
            />
            <span className="nf-logo-text">LUMA SPACE</span>
          </div>

          {/* 404 Glitch Number */}
          <div
            className="nf-404-text"
            data-text="404"
            style={{ marginBottom: -20 }}
          >
            404
          </div>

          {/* Robot floating */}
          <div
            className="nf-robot-wrap"
            style={{ transform: `translateY(${floatY}px)`, transition: "transform 0.05s linear" }}
          >
            <Image
              src="/img/robotnya.png"
              alt="Lost Robot"
              fill
              style={{ objectFit: "contain" }}
              priority
            />
          </div>

          {/* Badge */}
          <div className="nf-badge">
            <span className="nf-badge-dot" />
            HALAMAN TIDAK DITEMUKAN
          </div>

          {/* Divider */}
          <div className="nf-divider" />

          {/* Text */}
          <p className="nf-subtitle">Error 404</p>
          <h1 className="nf-title">Oops! Kamu Nyasar, Nih 🤖</h1>
          <p className="nf-desc">
            Halaman yang kamu cari tidak ada atau sudah dipindahkan.<br />
            Robot kami sudah mencari ke mana-mana, tapi tidak ketemu juga.
          </p>

          {/* Back button — only goes to homepage */}
          <Link href="/" className="nf-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </>
  );
}
