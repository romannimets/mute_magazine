"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const categories = [
    { slug: "risonanze", label: "Risonanze", image: "/risonanze.png" },
    { slug: "voci", label: "Voci", image: "/voci.png" },
    { slug: "sottofondo", label: "Sottofondo", image: "/sottofondo.png" },
];

export default function PapereGrid() {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <section
            style={{
                paddingLeft: "clamp(16px, 6vw, 64px)",
                paddingRight: "clamp(16px, 6vw, 64px)",
                paddingBottom: "clamp(40px, 7vw, 72px)",
            }}
        >
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "clamp(16px, 3.5vw, 40px)",
                    width: "100%",
                    maxWidth: 900,
                    margin: "0 auto",
                }}
            >
                {categories.map((category, index) => (
                    <Link
                        key={category.slug}
                        href={`/articoli/${category.slug}`}
                        style={{
                            textAlign: "center",
                            textDecoration: "none",
                            color: "#111",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "clamp(8px, 1.5vw, 12px)",
                            transform: hoveredIndex === index ? "scale(1.04)" : "scale(1)",
                            transition: "transform 0.2s ease",
                        }}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        {/* Immagine quadrata, angoli al vivo, no bordi, no sfondo */}
                        <div
                            style={{
                                position: "relative",
                                width: "100%",
                                aspectRatio: "1 / 1",
                                overflow: "hidden",
                            }}
                        >
                            <Image
                                src={category.image}
                                alt={category.label}
                                fill
                                sizes="(max-width: 600px) 30vw, (max-width: 1200px) 22vw, 280px"
                                style={{ objectFit: "contain" }}
                                priority
                            />
                        </div>

                        {/* Nome categoria */}
                        <span
                            style={{
                                fontSize: "clamp(13px, 2.2vw, 18px)",
                                fontWeight: 700,
                                color: "#111",
                                fontFamily: "var(--font-mattone), Arial, sans-serif",
                                letterSpacing: "-0.01em",
                            }}
                        >
                            {category.label}
                        </span>
                    </Link>
                ))}
            </div>
        </section>
    );
}