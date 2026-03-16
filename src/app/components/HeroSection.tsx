"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const DEFAULT_TEXT = `Questo non è il manifesto, ma frasi a caso per vedere come scorre il testo, 
Gisuto per vedere quanto ce ne sta,
E se ho fatto bene questa cosa dell'immagine come sfondo ceh scrolal fincheè non finisce, 
zioperazioperazioperaziopera.`;

export default function HeroSection({ text }: { text?: string }) {
    const outerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const [progress, setProgress] = useState(0);
    const [maxScroll, setMaxScroll] = useState(0); // px prima che il testo finisca
    const [panelH, setPanelH] = useState(0);

    // Ricalcola quanto testo può scorrere (textHeight - panelHeight)
    const recalc = () => {
        if (!textRef.current) return;
        const panel = textRef.current.parentElement as HTMLElement;
        const ph = panel.offsetHeight;
        const th = textRef.current.scrollHeight;
        const max = Math.max(0, th - ph);
        setPanelH(ph);
        setMaxScroll(max);
    };

    useEffect(() => {
        recalc();
        window.addEventListener("resize", recalc);
        return () => window.removeEventListener("resize", recalc);
    }, []);

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

    // Il testo si ferma esattamente quando arriva alla fine
    const textTranslate = Math.min(maxScroll, progress);

    // Altezza outer = budget di scroll = quanto testo c'è da scorrere
    // (se maxScroll è 0 al primo render usiamo 400 come placeholder)
    const budget = maxScroll > 0 ? maxScroll : 400;

    return (
        <div
            ref={outerRef}
            style={{ height: `calc(100svh + ${budget}px)`, margin: 0, padding: 0 }}
        >
            <div
                style={{
                    position: "sticky",
                    top: 0,
                    height: "100svh",
                    overflow: "hidden",
                }}
            >
                {/* Immagine di sfondo */}
                <Image
                    src="/homepage_top_bkg.jpg"
                    alt="Mute Magazine"
                    fill
                    priority
                    sizes="100vw"
                    style={{
                        objectFit: "cover",
                        objectPosition: "center top",
                        zIndex: 0,
                    }}
                />

                {/* Pannello fuchsia — ~1/5 dell'altezza viewport, bordi dritti, sempre visibile */}
                <div
                    style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: "20svh",       // un quinto dell'altezza visibile
                        minHeight: 120,        // floor su schermi molto bassi
                        background: "#FC5EB9",
                        zIndex: 1,
                        overflow: "hidden",
                    }}
                >
                    {/* Contenitore testo scroll-driven */}
                    <div
                        ref={textRef}
                        style={{
                            transform: `translateY(-${textTranslate}px)`,
                            willChange: "transform",
                            padding: "clamp(16px, 2.5vh, 32px) clamp(20px, 6vw, 72px) clamp(16px, 2.5vh, 32px)",
                        }}
                    >
                        <p
                            style={{
                                color: "#fff",
                                fontSize: "clamp(13px, 2vw, 22px)",
                                lineHeight: 1.7,
                                fontWeight: 600,
                                whiteSpace: "pre-line",
                                fontFamily: "var(--font-mattone), Arial, sans-serif",
                                margin: 0,
                            }}
                        >
                            {text || DEFAULT_TEXT}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}