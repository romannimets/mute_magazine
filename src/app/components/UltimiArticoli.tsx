"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArticleCard } from "@/data/articles";
import { fetchArticles } from "@/lib/fetchArticles";

const CATEGORY_LABELS: Record<string, string> = {
  risonanze: "Risonanze",
  voci: "Voci",
  sottofondo: "Sottofondo",
};

const CATEGORY_ICONS: Record<string, string> = {
  risonanze: "/risonanze.png",
  voci: "/voci.png",
  sottofondo: "/sottofondo.png",
};

// Colore overlay sull'immagine di copertina
const CATEGORY_COLORS: Record<string, string> = {
  risonanze: "#FFFF00",
  voci: "#df1968",
  sottofondo: "#86DF2C",
};

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function UltimiArticoli() {
  const [articles, setArticles] = useState<ArticleCard[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchArticles()
      .then((data) => {
        const filtered = data.filter((a) => a.category !== "manifesto");
        const sorted = [...filtered].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setArticles(sorted.slice(0, 8));
      })
      .catch(console.error);
  }, []);

  const handleScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track || articles.length === 0) return;
    const cardEl = track.children[0] as HTMLElement | undefined;
    if (!cardEl) return;
    const gap = 16;
    const cardW = cardEl.offsetWidth + gap;
    const idx = Math.round(track.scrollLeft / cardW);
    setActiveIndex(Math.max(0, Math.min(idx, articles.length - 1)));
  }, [articles.length]);

  const scrollToCard = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const cardEl = track.children[0] as HTMLElement | undefined;
    if (!cardEl) return;
    const cardW = cardEl.offsetWidth + 16;
    track.scrollTo({ left: index * cardW, behavior: "smooth" });
  };

  if (articles.length === 0) return null;

  return (
    <section style={{ paddingTop: "clamp(48px, 8vw, 72px)", paddingBottom: "clamp(16px, 3vw, 24px)" }}>

      {/* Titolo */}
      <div style={{
        paddingLeft: "clamp(16px, 5vw, 48px)",
        paddingRight: "clamp(16px, 5vw, 48px)",
        marginBottom: "clamp(20px, 3.5vw, 32px)",
      }}>
        <h2 style={{ fontSize: "clamp(22px, 4.5vw, 40px)", fontWeight: 700, lineHeight: 1 }}>
          Ultimi Articoli
        </h2>
      </div>

      {/* Carousel track */}
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="ultimi-track"
        style={{
          display: "flex",
          gap: "16px",
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
          paddingLeft: "clamp(16px, 5vw, 48px)",
          paddingRight: "clamp(16px, 5vw, 48px)",
          paddingBottom: "clamp(8px, 2vw, 16px)",
        }}
      >
        {articles.map((article) => {
          const color = CATEGORY_COLORS[article.category];
          return (
            <Link
              key={article.id}
              href={`/articoli/${article.category}/${article.id}`}
              className="ultimi-card"
              style={{
                flex: "0 0 clamp(200px, 62vw, 280px)",
                scrollSnapAlign: "start",
                display: "flex",
                flexDirection: "column",
                textDecoration: "none",
                color: "#111",
              }}
            >
              {/* Immagine + overlay colore categoria */}
              <div style={{ position: "relative", width: "100%", paddingTop: "65%", overflow: "hidden", flexShrink: 0 }}>
                {article.cover ? (
                  <Image
                    src={article.cover}
                    alt={article.title}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="(max-width: 600px) 62vw, 280px"
                  />
                ) : (
                  <div style={{ position: "absolute", inset: 0, background: "#e8e8e8" }} />
                )}
                {/* Overlay colore */}
                {color && (
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    background: color,
                    opacity: 0.58,
                    
                    pointerEvents: "none",
                  }} />
                )}
              </div>

              {/* Body card */}
              <div style={{
                padding: "clamp(10px, 2vw, 14px)",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                flexGrow: 1,
                border: "1px solid #f0f0f0",
                borderTop: "none",
              }}>
                {/* Titolo articolo */}
                <span style={{
                  fontSize: "clamp(12px, 2.4vw, 14px)",
                  fontWeight: 700,
                  lineHeight: 1.3,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}>
                  {article.title}
                </span>

                {/* Autore */}
                <span style={{ fontSize: "clamp(10px, 1.8vw, 12px)", color: "#777" }}>
                  {article.author}
                </span>

                {/* Bottom row */}
                <div style={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  marginTop: "auto",
                  paddingTop: "10px",
                }}>
                  {/* Categoria + data a sinistra */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span style={{
                      fontSize: "clamp(10px, 2vw, 12px)",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}>
                      {CATEGORY_LABELS[article.category] ?? article.category}
                    </span>
                    <span style={{ fontSize: "clamp(9px, 1.8vw, 11px)", color: "#aaa" }}>
                      {formatDate(article.date)}
                    </span>
                  </div>

                  {/* Icona categoria a destra */}
                  {CATEGORY_ICONS[article.category] && (
                    <Image
                      src={CATEGORY_ICONS[article.category]}
                      alt={article.category}
                      width={28}
                      height={28}
                      style={{ objectFit: "contain", flexShrink: 0 }}
                    />
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Dots + Vedi tutto */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "clamp(20px, 5vw, 40px)",
        paddingTop: "clamp(14px, 3vw, 24px)",
        paddingLeft: "clamp(16px, 5vw, 48px)",
        paddingRight: "clamp(16px, 5vw, 48px)",
      }}>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          {articles.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToCard(i)}
              aria-label={`Vai all'articolo ${i + 1}`}
              style={{
                width: i === activeIndex ? 22 : 8,
                height: 8,
                borderRadius: 4,
                border: "none",
                background: i === activeIndex ? "#111" : "#ddd",
                padding: 0,
                cursor: "pointer",
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                flexShrink: 0,
              }}
            />
          ))}
        </div>
        <Link href="/ultimi-articoli" style={{
          fontSize: "clamp(11px, 2.2vw, 13px)",
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "#111",
          borderBottom: "1px solid #111",
          paddingBottom: "1px",
          whiteSpace: "nowrap",
        }}>
          Vedi tutto →
        </Link>
      </div>
    </section>
  );
}