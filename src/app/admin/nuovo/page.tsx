"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArticleCard, categoryLabels, categoryColors } from "@/data/articles";
import Editor from "@/app/components/Editor";
import RelatedArticlesPicker from "@/app/components/RelatedArticlesPicker";
import CoverPicker from "@/app/components/CoverPicker";

export default function AdminNewArticle() {
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [content, setContent] = useState<any>(null);
    const [coverUrl, setCoverUrl] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [relatedArticles, setRelatedArticles] = useState<ArticleCard[]>([]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); setError(null); setLoading(true);
        try {
            const form = new FormData(e.currentTarget);
            const res = await fetch("/api/articles", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: form.get("title"),
                    subtitle: form.get("subtitle"),
                    author: form.get("author"),
                    category: form.get("category"),
                    cover: coverUrl,
                    content,
                    relatedArticles: relatedArticles.map((a) => a.id),
                }),
            });
            if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
            router.push("/admin");
        } catch (err: any) { setError(err.message || "Errore"); }
        finally { setLoading(false); }
    };

    return (
        <main style={{ padding: "clamp(24px, 6vw, 48px)", maxWidth: 720, margin: "0 auto" }}>
            <h1 style={{ fontSize: "clamp(22px, 5vw, 28px)", marginBottom: 24 }}>Nuovo articolo</h1>
            {error && <p style={{ color: "red", marginBottom: 16 }}>{error}</p>}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <input name="title" placeholder="Titolo" required style={inp} />
                <input name="subtitle" placeholder="Sottotitolo" style={inp} />
                <input name="author" placeholder="Autore" required style={inp} />

                <select
                    name="category"
                    required
                    defaultValue=""
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={inp}
                >
                    <option value="" disabled>Seleziona categoria</option>
                    {Object.entries(categoryLabels).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                    ))}
                </select>

                {/* Copertina — upload o URL */}
                <CoverPicker
                    currentUrl={coverUrl}
                    overlayColor={categoryColors[selectedCategory]}
                    onChange={setCoverUrl}
                />

                {/* Articoli correlati */}
                <RelatedArticlesPicker
                    selected={relatedArticles}
                    onAdd={(a) => setRelatedArticles((prev) => [...prev, a])}
                    onRemove={(id) => setRelatedArticles((prev) => prev.filter((a) => a.id !== id))}
                />

                {/* Editor contenuto */}
                <div>
                    <p style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Contenuto</p>
                    <Editor onChange={setContent} />
                </div>

                <button
                    type="submit"
                    disabled={loading || !content}
                    style={{
                        padding: "12px 16px",
                        background: loading ? "#999" : "#111",
                        color: "#fff", border: "none", fontWeight: 600,
                        cursor: loading ? "not-allowed" : "pointer",
                    }}
                >
                    {loading ? "Creando..." : "Crea Articolo"}
                </button>
            </form>
        </main>
    );
}

const inp: React.CSSProperties = {
    width: "100%", padding: "10px 14px", border: "1px solid #ddd",
    fontSize: 16, outline: "none", boxSizing: "border-box", borderRadius: 0,
};