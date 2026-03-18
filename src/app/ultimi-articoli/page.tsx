"use client";

import { useEffect, useState } from "react";
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

const CATEGORY_COLORS: Record<string, string> = {
  risonanze: "#FFFF00",
  voci: "#df1968",
  sottofondo: "#86DF2C",
};

const PAGE_SIZE = 12;

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

export default function UltimiArticoliPage() {
  const [articles, setArticles] = useState<ArticleCard[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles()
      .then((data) => {
        const filtered = data.filter((a) => a.category !== "manifesto");
        const sorted = [...filtered].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setArticles(sorted);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const visible = articles.slice(0, page * PAGE_SIZE);
  const hasMore = page * PAGE_SIZE < articles.length;

  return (
    <main style={{ background: "#fff", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{
        padding: "clamp(48px, 10vw, 80px) clamp(16px, 5vw, 48px) clamp(24px, 5vw, 40px)",
        borderBottom: "2px solid #111",
      }}>
        <h1 style={{ fontSize: "clamp(32px, 7vw, 64px)", fontWeight: 700, lineHeight: 1, margin: 0 }}>
          Tutti gli articoli
        </h1>
      </div>

      {/* Lista articoli — full width, angoli vivi, separatore orizzontale */}
      <div style={{ display: "flex", flexDirection: "column" }}>

        {loading && (
          <p style={{ color: "#aaa", padding: "40px clamp(16px,5vw,48px)" }}>Caricamento...</p>
        )}

        {!loading && visible.length === 0 && (
          <p style={{ color: "#aaa", padding: "40px clamp(16px,5vw,48px)" }}>Nessun articolo trovato.</p>
        )}

        {visible.map((article, idx) => {
          const color = CATEGORY_COLORS[article.category];
          return (
            <Link
              key={article.id}
              href={`/articoli/${article.category}/${article.id}`}
              style={{
                textDecoration: "none",
                color: "inherit",
                display: "block",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <article style={{ display: "flex", flexDirection: "column" }}>

                {/* Immagine copertina full-width + overlay */}
                <div style={{
                  position: "relative",
                  width: "100%",
                  paddingTop: "45%",
                  overflow: "hidden",
                }}>
                  {article.cover ? (
                    <Image
                      src={article.cover}
                      alt={article.title}
                      fill
                      sizes="100vw"
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{ position: "absolute", inset: 0, background: "#e8e8e8" }} />
                  )}
                  {/* Overlay colore piatto */}
                  {color && (
                    <div style={{
                      position: "absolute",
                      inset: 0,
                      background: color,
                      opacity: 0.48,
                      pointerEvents: "none",
                    }} />
                  )}
                </div>

                {/* Testo — padding laterale ma niente max-width */}
                <div style={{
                  padding: "clamp(14px, 3vw, 28px) clamp(16px, 5vw, 48px) clamp(16px, 3.5vw, 28px)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "clamp(6px, 1.5vw, 10px)",
                }}>
                  <h2 style={{
                    margin: 0,
                    fontSize: "clamp(20px, 4.5vw, 36px)",
                    fontWeight: 700,
                    lineHeight: 1.2,
                  }}>
                    {article.title}
                  </h2>

                  {article.subtitle && (
                    <p style={{
                      margin: 0,
                      fontSize: "clamp(13px, 2.5vw, 16px)",
                      color: "#555",
                      lineHeight: 1.5,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    } as React.CSSProperties}>
                      {article.subtitle}
                    </p>
                  )}

                  <span style={{ fontSize: "clamp(11px, 2vw, 13px)", color: "#777" }}>
                    {article.author}
                  </span>

                  {/* Bottom row: categoria+data sx — icona dx */}
                  <div style={{
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                    marginTop: "clamp(4px, 1vw, 8px)",
                  }}>
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

                    {CATEGORY_ICONS[article.category] && (
                      <Image
                        src={CATEGORY_ICONS[article.category]}
                        alt={article.category}
                        width={36}
                        height={36}
                        style={{ objectFit: "contain", flexShrink: 0 }}
                      />
                    )}
                  </div>
                </div>

              </article>
            </Link>
          );
        })}
      </div>

      {/* Carica altri / Fine */}
      <div style={{
        padding: "clamp(24px, 5vw, 48px) clamp(16px, 5vw, 48px)",
        display: "flex",
        justifyContent: "center",
      }}>
        {hasMore ? (
          <button
            onClick={() => setPage((p) => p + 1)}
            style={{
              padding: "clamp(12px, 2.5vw, 16px) clamp(32px, 6vw, 56px)",
              background: "#111",
              color: "#fff",
              border: "none",
              fontSize: "clamp(12px, 2.2vw, 14px)",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "pointer",
              fontFamily: "var(--font-mattone), Arial, sans-serif",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#333")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#111")}
          >
            Carica altri ({articles.length - page * PAGE_SIZE} rimanenti)
          </button>
        ) : (
          articles.length > 0 && (
            <p style={{
              color: "#ccc",
              fontSize: "clamp(11px, 2vw, 13px)",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}>
              — Fine —
            </p>
          )
        )}
      </div>

    </main>
  );
}