"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArticleCard } from "@/data/articles";
import { fetchArticles } from "@/lib/fetchArticles";

const CATEGORY_COLORS: Record<string, string> = {
  risonanze: "#FFFF00",
  voci: "#df1968",
  sottofondo: "#86DF2C",
};

const CATEGORY_LABELS: Record<string, string> = {
  risonanze: "Risonanze",
  voci: "Voci",
  sottofondo: "Sottofondo",
};

const OVERLAY_OPACITY = 0.58;

type Props = { category: string };

export default function ArticleGrid({ category }: Props) {
  const [articles, setArticles] = useState<ArticleCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles(category)
      .then(setArticles)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category]);

  const bgColor = CATEGORY_COLORS[category] ?? "#111";
  // testo nero se colore chiaro (giallo/verde), bianco se scuro (fucsia)
  const titleColor = category === "voci" ? "#fff" : "#000";
  const label = CATEGORY_LABELS[category] ?? category;

  return (
    <section style={{ background: "#fff", minHeight: "100vh" }}>

      {/* ── Header: sfondo pieno del colore categoria, tutta larghezza ── */}
      <div style={{
        background: bgColor,
        padding: "clamp(40px, 8vw, 72px) clamp(16px, 5vw, 48px) clamp(28px, 5vw, 44px)",
      }}>
        <h1 style={{
          fontFamily: "var(--font-mattone), Arial, sans-serif",
          fontSize: "clamp(40px, 10vw, 88px)",
          fontWeight: 700,
          lineHeight: 0.95,
          margin: 0,
          color: titleColor,
        }}>
          {label}
        </h1>
      </div>

      {/* ── Griglia articoli: nessun bordo, edge-to-edge ── */}
      {loading && <p style={{ padding: "32px clamp(16px,5vw,48px)", color: "#aaa" }}>Caricamento...</p>}
      {!loading && articles.length === 0 && (
        <p style={{ padding: "32px clamp(16px,5vw,48px)", color: "#aaa" }}>Nessun articolo.</p>
      )}

      <div
        className="article-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(1, 1fr)",
          gap: 0,
        }}
      >
        {articles.map((article) => (
          <Link
            key={article._id}
            href={`/articoli/${article.category}/${article.id}`}
            style={{ textDecoration: "none", color: "inherit", display: "block" }}
          >
            <article style={{ display: "flex", flexDirection: "column", borderBottom: "1px solid #f0f0f0" }}>

              {/* Immagine + overlay */}
              <div style={{ position: "relative", width: "100%", aspectRatio: "4 / 3", overflow: "hidden" }}>
                <Image
                  src={article.cover}
                  alt={article.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ objectFit: "cover" }}
                />
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: bgColor,
                  opacity: OVERLAY_OPACITY,
                  pointerEvents: "none",
                }} />
              </div>

              {/* Testo */}
              <div style={{
                padding: "clamp(14px, 3.5vw, 20px) clamp(16px, 4.5vw, 28px) clamp(12px, 3vw, 18px)",
              }}>
                <h2 style={{
                  fontSize: "clamp(18px, 4.5vw, 24px)",
                  fontWeight: 700,
                  lineHeight: 1.25,
                  margin: "0 0 clamp(4px,1vw,6px)",
                  color: "#111",
                }}>
                  {article.title}
                </h2>
                <p style={{
                  margin: "0 0 clamp(8px,2vw,12px)",
                  color: "#555",
                  fontSize: "clamp(13px, 3.2vw, 15px)",
                  lineHeight: 1.5,
                }}>
                  {article.subtitle}
                </p>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "clamp(11px, 2.5vw, 13px)",
                  color: "#999",
                }}>
                  <span>{article.author}</span>
                  <span>{article.date}</span>
                </div>
              </div>

            </article>
          </Link>
        ))}
      </div>

    </section>
  );
}