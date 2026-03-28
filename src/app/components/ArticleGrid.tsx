"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArticleCard } from "@/data/articles";
import { fetchArticles } from "@/lib/fetchArticles";
import { readingTime } from "@/lib/readingTime";

const CATEGORY_LABELS: Record<string, string> = {
  risonanze: "Risonanze",
  voci: "Voci",
  sottofondo: "Sottofondo",
};

type Props = { category: string };

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch { return d; }
}

export default function ArticleGrid({ category }: Props) {
  const [articles, setArticles] = useState<ArticleCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles(category)
      .then(setArticles)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category]);

  const titleColor = "#000";
  const label = CATEGORY_LABELS[category] ?? category;

  return (
    <section style={{ background: "#fff", minHeight: "100vh" }}>

      {/* Header categoria */}
      <div style={{
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

      {loading && <p style={{ padding: "32px clamp(16px,5vw,48px)", color: "#aaa" }}>Caricamento...</p>}
      {!loading && articles.length === 0 && (
        <p style={{ padding: "32px clamp(16px,5vw,48px)", color: "#aaa" }}>Nessun articolo.</p>
      )}

      <div
        className="article-grid"
        style={{ display: "grid", gridTemplateColumns: "repeat(1, 1fr)", gap: 0 }}
      >
        {articles.map((article) => {
          const rt = readingTime(article.content);
          return (
            <Link
              key={article._id}
              href={`/articoli/${article.category}/${article.id}`}
              style={{ textDecoration: "none", color: "inherit", display: "block" }}
            >
              <article style={{ display: "flex", flexDirection: "column", borderBottom: "1px solid #f0f0f0" }}>

                {/* Immagine — nessun overlay colore */}
                <div style={{ position: "relative", width: "100%", aspectRatio: "4 / 3", overflow: "hidden" }}>
                  <Image
                    src={article.cover}
                    alt={article.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    style={{ objectFit: "cover" }}
                  />
                </div>

                {/* Testo — più aria */}
                <div style={{
                  padding: "clamp(18px, 4vw, 28px) clamp(16px, 4.5vw, 28px) clamp(20px, 4vw, 32px)",
                }}>
                  <h2 style={{
                    fontSize: "clamp(20px, 5vw, 28px)",
                    fontWeight: 700,
                    lineHeight: 1.2,
                    margin: "0 0 clamp(8px, 1.5vw, 12px)",
                    color: "#111",
                    fontFamily: "var(--font-mattone), Arial, sans-serif",
                  }}>
                    {article.title}
                  </h2>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "clamp(11px, 2.5vw, 13px)",
                    color: "#999",
                    fontFamily: "'EB Garamond', 'Garamond', Georgia, serif",
                    lineHeight: 1.6,
                  }}>
                    <span>{article.author}</span>
                    <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span>{formatDate(article.date)}</span>
                      {rt && <><span>·</span><span>{rt}</span></>}
                    </span>
                  </div>
                </div>

              </article>
            </Link>
          );
        })}
      </div>

    </section>
  );
}