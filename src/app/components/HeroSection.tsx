"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

// px di scroll per far salire completamente il pannello rosa
const REVEAL_PX = 320;

const HERO_TEXT = "Silenzio editoriale per chi è all'ascolto";

export default function HeroSection() {
    const outerRef = useRef<HTMLDivElement>(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const update = () => {
            if (!outerRef.current) return;
            const top = outerRef.current.getBoundingClientRect().top;
            setProgress(Math.max(0, -top));
        };
        window.addEventListener("scroll", update, { passive: true });
        update();
        return () => window.removeEventListener("scroll", update);
    }, []);

    // 0 → 1: pannello sale da sotto (translateY 100% → 0%)
    const reveal = Math.min(1, progress / REVEAL_PX);

    // Altezza navbar — deve corrispondere al valore in globals.css
    // (clamp(56px, 12vw, 64px)). Usiamo CSS var se disponibile, altrimenti 64px.
    // Con top = navbarH il blocco sticky si attiva al primo pixel di scroll,
    // evitando il micro-movimento iniziale dell'immagine.
    const NAV_H = "clamp(56px, 12vw, 64px)";

    return (
        /*
          Outer: height = 100svh + REVEAL_PX
          top sticky = altezza navbar → sticky scatta subito, immagine ferma da subito.
        */
        <div
            ref={outerRef}
            style={{ height: `calc(100svh + ${REVEAL_PX}px)`, margin: 0, padding: 0 }}
        >
            <div
                style={{
                    position: "sticky",
                    top: NAV_H,                          // ← era 0, ora = navbar height
                    height: `calc(100svh - ${NAV_H})`,   // ← compensa per non uscire in basso
                    overflow: "hidden",
                }}
            >
                {/* Foto di sfondo — rimane ferma */}
                <Image
                    src="/homepage_top_bkg.jpg"
                    alt="Mute Magazine"
                    fill
                    priority
                    sizes="100vw"
                    style={{ objectFit: "cover", objectPosition: "center top", zIndex: 0 }}
                />

                {/* Pannello rosa — sale da sotto, testo statico */}
                <div
                    style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: "20svh",
                        minHeight: 120,
                        background: "#FC5EB9",
                        zIndex: 1,
                        display: "flex",
                        alignItems: "center",
                        transform: `translateY(${(1 - reveal) * 100}%)`,
                        willChange: "transform",
                    }}
                >
                    <p
                        style={{
                            color: "#fff",
                            fontSize: "clamp(13px, 2vw, 22px)",
                            lineHeight: 1.5,
                            fontWeight: 600,
                            fontFamily: "var(--font-mattone), Arial, sans-serif",
                            margin: 0,
                            padding: "0 clamp(20px, 6vw, 72px)",
                        }}
                    >
                        {HERO_TEXT}
                    </p>
                </div>
            </div>
        </div>
    );
}