"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArticleCard, categoryIcons, categoryLabels } from "@/data/articles";
import EditorRenderer from "@/app/components/EditorRenderer";
import { readingTime } from "@/lib/readingTime";

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });
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

  if (loading) return (
    <div style={{ padding: "clamp(48px, 12vw, 96px)", textAlign: "center", color: "#aaa" }}>
      Caricamento...
    </div>
  );

  if (!article) return (
    <div style={{ padding: "clamp(48px, 12vw, 96px)", textAlign: "center" }}>
      <h1 style={{ fontSize: "clamp(24px, 6vw, 32px)" }}>Articolo non trovato</h1>
    </div>
  );

  const color = "#ccc";
  const icon = categoryIcons[article.category];
  const label = categoryLabels[article.category] ?? article.category;
  const rt = readingTime(article.content);

  return (
    <main style={{ background: "#fff" }}>

      {/* ── Header: titolo grandissimo, centrato, larghezza piena ── */}
      <div style={{
        padding: "clamp(28px, 6vw, 52px) clamp(16px, 5vw, 48px) 0",
        textAlign: "center",
      }}>
        <h1 style={{
          fontSize: "clamp(40px, 10vw, 120px)",
          fontWeight: 700,
          lineHeight: 1.0,
          margin: "0 0 clamp(16px, 3vw, 28px)",
          color: "#111",
          fontFamily: "var(--font-mattone), Arial, sans-serif",
          wordBreak: "break-word",
        }}>
          {article.title}
        </h1>

        {/* Meta: categoria, autore, data, lettura — centrati, nessun bordo */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "clamp(4px, 1vw, 6px)",
          marginBottom: "clamp(20px, 4vw, 32px)",
        }}>
          <span style={{
            fontSize: "clamp(13px, 2.5vw, 16px)",
            fontFamily: "'EB Garamond', 'Garamond', Georgia, serif",
            fontWeight: 600,
            color: "#111",
          }}>
            {article.author}
          </span>
          <span style={{
            fontSize: "clamp(12px, 2vw, 14px)",
            fontFamily: "'EB Garamond', 'Garamond', Georgia, serif",
            color: "#aaa",
          }}>
            {formatDate(article.date)}{rt ? ` · ${rt}` : ""}
          </span>
        </div>
      </div>

      {/* ── Copertina edge-to-edge — nessun overlay ── */}
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
        </div>
      )}

      {/* ── Corpo articolo ── */}
      <EditorRenderer data={article.content} />

      {/* ── Footer articolo: categoria (Mattone sx) + icona (dx) ── */}
      <div style={{
        maxWidth: 700,
        margin: "0 auto",
        padding: "0 clamp(16px, 4vw, 24px) clamp(32px, 6vw, 56px)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
      }}>
        {/* Categoria allineata a sinistra in basso */}
        <span style={{
          fontSize: "clamp(11px, 2vw, 14px)",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "#111",
          fontFamily: "var(--font-mattone), Arial, sans-serif",
        }}>
          {label}
        </span>

        {/* Mascotte — nera, senza opacity/filtro grigio */}
        {icon && (
          <Image
            src={icon}
            alt={label}
            width={48}
            height={48}
            style={{ objectFit: "contain" }} /* rimosso opacity: 0.65 */
          />
        )}
      </div>

      {/* ── Articoli correlati ── */}
      {related.length > 0 && (
        <section style={{
          borderTop: `3px solid ${color}`, /* linea colore categoria invece di grigio */
          padding: "clamp(32px, 6vw, 56px) 0 0",
        }}>
          <h2 style={{
            fontFamily: "var(--font-mattone), Arial, sans-serif",
            fontSize: "clamp(20px, 4vw, 32px)",
            fontWeight: 700,
            margin: "0 0 clamp(20px, 4vw, 32px)",
            padding: "0 clamp(16px, 5vw, 48px)",
            color: "#111",
          }}>
            Ti possono piacere anche
          </h2>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {related.map((rel) => {
              const rColor = "#ccc";
              const rIcon = categoryIcons[rel.category];
              const rLabel = categoryLabels[rel.category] ?? rel.category;
              const rRt = readingTime(rel.content);
              return (
                <Link
                  key={rel.id}
                  href={`/articoli/${rel.category}/${rel.id}`}
                  style={{ display: "flex", textDecoration: "none", color: "inherit", borderBottom: "1px solid #f0f0f0" }}
                >
                  {/* 1/3 — copertina senza overlay */}
                  <div style={{ flex: "0 0 33.33%", position: "relative", aspectRatio: "4/3", overflow: "hidden" }}>
                    {rel.cover ? (
                      <Image src={rel.cover} alt={rel.title} fill sizes="33vw" style={{ objectFit: "cover" }} />
                    ) : (
                      <div style={{ position: "absolute", inset: 0, background: "#eee" }} />
                    )}
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
                        color: rColor,
                        fontFamily: "var(--font-mattone), Arial, sans-serif",
                      }}>
                        {rLabel}
                      </span>
                      <h3 style={{
                        fontSize: "clamp(13px, 2.5vw, 18px)",
                        fontWeight: 700,
                        lineHeight: 1.25,
                        margin: 0,
                        color: "#111",
                        fontFamily: "var(--font-mattone), Arial, sans-serif",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      } as React.CSSProperties}>
                        {rel.title}
                      </h3>

                    </div>

                    {/* Bottom: autore / data / lettura + icona */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <span style={{ fontSize: "clamp(10px, 1.8vw, 12px)", color: "#888", fontFamily: "'EB Garamond', Georgia, serif" }}>
                          {rel.author}
                        </span>
                        <span style={{ fontSize: "clamp(9px, 1.6vw, 11px)", color: "#bbb", fontFamily: "'EB Garamond', Georgia, serif" }}>
                          {new Date(rel.date).toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" })}
                          {rRt ? ` · ${rRt}` : ""}
                        </span>
                      </div>
                      {rIcon && (
                        <Image src={rIcon} alt={rLabel} width={24} height={24} style={{ objectFit: "contain", flexShrink: 0 }} />
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