"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const REVEAL_PX = 400;
const HERO_TEXT = "Silenzio editoriale per chi è all'ascolto";

export default function HeroSection() {
    const outerRef = useRef<HTMLDivElement>(null);
    const [progress, setProgress] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const update = () => {
            if (!outerRef.current) return;
            const rect = outerRef.current.getBoundingClientRect();
            const scrollY = -rect.top;
            setProgress(Math.max(0, scrollY));
            setIsVisible(rect.bottom > 0);
        };
        window.addEventListener("scroll", update, { passive: true });
        update();
        return () => window.removeEventListener("scroll", update);
    }, []);

    const reveal = Math.min(1, progress / REVEAL_PX);
    const NAV_H = "clamp(56px, 12vw, 64px)";
    const repeated = Array(6).fill(HERO_TEXT);

    return (
        <div
            ref={outerRef}
            style={{
                height: `calc(100svh + ${REVEAL_PX}px)`,
                position: "relative",
                zIndex: 1
            }}
        >
            <div
                style={{
                    position: "sticky",
                    top: NAV_H,
                    height: `calc(100svh - ${NAV_H})`,
                    overflow: "hidden",
                }}
            >
                {/* CONTENITORE FISSO PER L'IMMAGINE */}
                {isVisible && (
                    <div style={{
                        position: "fixed", // Spostato qui il fixed
                        top: NAV_H,
                        left: 0,
                        width: "100%",
                        height: `calc(100svh - ${NAV_H})`,
                        zIndex: 0
                    }}>
                        <Image
                            src="/homepage_top_bkg.jpg"
                            alt="Mute Magazine"
                            fill
                            priority
                            sizes="100vw"
                            style={{ objectFit: "cover", objectPosition: "center center" }}
                        />
                    </div>
                )}

                {/* PANNELLO FUCSIA */}
                <div
                    style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: "22svh",
                        minHeight: 120,
                        background: "#DF1968",
                        zIndex: 10,
                        display: "flex",
                        alignItems: "center",
                        overflow: "hidden",
                        transform: `translateY(${(1 - reveal) * 100}%)`,
                        willChange: "transform",
                    }}
                >
                    <div className="hero-marquee" style={{ lineHeight: 1, whiteSpace: "nowrap" }}>
                        {repeated.map((t, i) => (
                            <span
                                key={i}
                                style={{
                                    fontFamily: "var(--font-mattone), Arial, sans-serif",
                                    fontWeight: 700,
                                    fontSize: "clamp(48px, 15svh, 110px)",
                                    color: "#fff",
                                    paddingRight: "clamp(40px, 8vw, 100px)",
                                    display: "inline-block",
                                    letterSpacing: "-0.01em",
                                }}
                            >
                                {t}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}