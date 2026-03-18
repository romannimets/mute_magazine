"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArticleCard, categoryColors, categoryIcons, categoryLabels } from "@/data/articles";
import EditorRenderer from "@/app/components/EditorRenderer";

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString("it-IT", {
      day: "2-digit", month: "long", year: "numeric",
    });
  } catch { return d; }
}

export default function ArticoloDettaglio() {
  const { articleId } = useParams();
  const [article, setArticle] = useState<ArticleCard | null>(null);
  const [related, setRelated] = useState<ArticleCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!articleId) return;
    (async () => {
      try {
        const res = await fetch(`/api/articles/${articleId}`);
        if (!res.ok) throw new Error();
        const data: ArticleCard = await res.json();
        setArticle(data);

        // Carica correlati
        if (data.relatedArticles?.length) {
          const loaded = await Promise.all(
            data.relatedArticles.map((id) =>
              fetch(`/api/articles/${id}`).then((r) => r.ok ? r.json() : null)
            )
          );
          setRelated(loaded.filter(Boolean));
        }
      } catch { setArticle(null); }
      finally { setLoading(false); }
    })();
  }, [articleId]);

  if (loading) {
    return (
      <div style={{ padding: "clamp(48px, 12vw, 96px)", textAlign: "center", color: "#aaa" }}>
        Caricamento...
      </div>
    );
  }

  if (!article) {
    return (
      <div style={{ padding: "clamp(48px, 12vw, 96px)", textAlign: "center" }}>
        <h1 style={{ fontSize: "clamp(24px, 6vw, 32px)" }}>Articolo non trovato</h1>
      </div>
    );
  }

  const color = categoryColors[article.category] ?? "#ccc";
  const icon = categoryIcons[article.category];
  const label = categoryLabels[article.category] ?? article.category;

  return (
    <main style={{ background: "#fff" }}>

      {/* ── Header ── */}
      <div style={{
        maxWidth: 700,
        margin: "0 auto",
        padding: "clamp(28px, 6vw, 52px) clamp(16px, 4vw, 24px) 0",
      }}>

        <h1 style={{
          fontSize: "clamp(26px, 6vw, 48px)",
          fontWeight: 700,
          lineHeight: 1.15,
          margin: "0 0 clamp(10px, 2vw, 14px)",
          color: "#111",
        }}>
          {article.title}
        </h1>

        {article.subtitle && (
          <p style={{
            fontSize: "clamp(15px, 3vw, 20px)",
            color: "#555",
            lineHeight: 1.5,
            margin: "0 0 clamp(14px, 3vw, 20px)",
          }}>
            {article.subtitle}
          </p>
        )}

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid #f0f0f0",
          borderBottom: "1px solid #f0f0f0",
          padding: "clamp(10px, 2vw, 14px) 0",
          marginBottom: "clamp(8px, 2vw, 12px)",
        }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <span style={{
              fontSize: "clamp(12px, 2.5vw, 14px)", fontFamily: "'EB Garamond', 'Garamond', Georgia, serif",
              fontWeight: 600, color: "#111"
            }}>
              {article.author}
            </span>
            <span style={{
              fontSize: "clamp(11px, 2vw, 13px)", fontFamily: "'EB Garamond', 'Garamond', Georgia, serif",
              color: "#aaa"
            }}>
              {formatDate(article.date)}
            </span>
          </div>

        </div>
      </div>

      {/* ── Copertina edge-to-edge con overlay ── */}
      {article.cover && (
        <div style={{ position: "relative", width: "100%", paddingTop: "52%", overflow: "hidden" }}>
          <Image
            src={article.cover}
            alt={article.title}
            fill
            priority
            sizes="100vw"
            style={{ objectFit: "cover" }}
          />
          <div style={{
            position: "absolute", inset: 0,
            background: color, opacity: 0.55,
            pointerEvents: "none",
          }} />
        </div>
      )}


      {/* ── Corpo articolo ── */}
      <EditorRenderer data={article.content} />

      {/* ── Icona categoria bottom-right ── */}
      {icon && (
        <div style={{
          maxWidth: 700,
          margin: "0 auto",
          padding: "0 clamp(16px, 4vw, 24px) clamp(32px, 6vw, 56px)",
          display: "flex",
          justifyContent: "flex-end",
        }}>
          <Image src={icon} alt={label} width={48} height={48} style={{ objectFit: "contain", opacity: 0.65 }} />
        </div>
      )}

      {/* ── Articoli correlati ── */}
      {related.length > 0 && (
        <section style={{
          borderTop: "1px solid #f0f0f0",
          padding: "clamp(32px, 6vw, 56px) 0 clamp(40px, 8vw, 72px)",
        }}>
          <h2 style={{
            fontFamily: "var(--font-mattone), Arial, sans-serif",
            fontSize: "clamp(20px, 4vw, 32px)",
            fontWeight: 700,
            margin: "0 0 clamp(20px, 4vw, 32px)",
            padding: "0 clamp(16px, 5vw, 48px)",
          }}>
            Ti possono piacere anche
          </h2>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {related.map((rel) => {
              const rColor = categoryColors[rel.category] ?? "#ccc";
              const rIcon = categoryIcons[rel.category];
              const rLabel = categoryLabels[rel.category] ?? rel.category;
              return (
                <Link
                  key={rel.id}
                  href={`/articoli/${rel.category}/${rel.id}`}
                  style={{
                    display: "flex",
                    textDecoration: "none",
                    color: "inherit",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  {/* 1/3 — copertina con overlay */}
                  <div style={{
                    flex: "0 0 33.33%",
                    position: "relative",
                    aspectRatio: "4/3",
                    overflow: "hidden",
                  }}>
                    {rel.cover ? (
                      <Image src={rel.cover} alt={rel.title} fill sizes="33vw"
                        style={{ objectFit: "cover" }} />
                    ) : (
                      <div style={{ position: "absolute", inset: 0, background: "#eee" }} />
                    )}
                    <div style={{
                      position: "absolute", inset: 0,
                      background: rColor, opacity: 0.55, pointerEvents: "none",
                    }} />
                  </div>

                  {/* 2/3 — testo */}
                  <div style={{
                    flex: 1,
                    padding: "clamp(12px, 3vw, 20px) clamp(14px, 3.5vw, 24px)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "clamp(6px, 1.5vw, 10px)",
                  }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "clamp(4px, 1vw, 6px)" }}>
                      <span style={{
                        fontSize: "clamp(9px, 1.8vw, 11px)",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.12em",
                        color: "#aaa",
                      }}>
                        {rLabel}
                      </span>
                      <h3 style={{
                        fontSize: "clamp(13px, 2.5vw, 18px)",
                        fontWeight: 700,
                        lineHeight: 1.25,
                        margin: 0,
                        color: "#111",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      } as React.CSSProperties}>
                        {rel.title}
                      </h3>
                      {rel.subtitle && (
                        <p style={{
                          fontSize: "clamp(11px, 2vw, 14px)",
                          color: "#666",
                          lineHeight: 1.4,
                          margin: 0,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        } as React.CSSProperties}>
                          {rel.subtitle}
                        </p>
                      )}
                    </div>

                    {/* Bottom: autore/data + icona */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <span style={{ fontSize: "clamp(10px, 1.8vw, 12px)", color: "#888" }}>
                          {rel.author}
                        </span>
                        <span style={{ fontSize: "clamp(9px, 1.6vw, 11px)", color: "#bbb" }}>
                          {new Date(rel.date).toLocaleDateString("it-IT", {
                            day: "2-digit", month: "2-digit", year: "numeric",
                          })}
                        </span>
                      </div>
                      {rIcon && (
                        <Image src={rIcon} alt={rLabel} width={24} height={24}
                          style={{ objectFit: "contain", flexShrink: 0 }} />
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

    </main>
  );
}