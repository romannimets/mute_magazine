"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArticleCard, categoryLabels } from "@/data/articles";
import Editor from "@/app/components/Editor";
import RelatedArticlesPicker from "@/app/components/RelatedArticlesPicker";
import CoverPicker from "@/app/components/CoverPicker";

function todayISO() {
    return new Date().toISOString().split("T")[0];
}

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
                    author: form.get("author"),
                    date: form.get("date"),
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
                <input name="author" placeholder="Autore" required style={inp} />

                <div>
                    <label style={lbl}>Data pubblicazione</label>
                    <input name="date" type="date" defaultValue={todayISO()} required style={inp} />
                </div>

                <div style={{ position: "relative" }}>
                    <select
                        name="category" required defaultValue=""
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        style={{ ...inp, appearance: "none", paddingRight: 36 }}
                    >
                        <option value="" disabled>Seleziona categoria</option>
                        {Object.entries(categoryLabels).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                        ))}
                    </select>
                    <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path fillRule="evenodd" clipRule="evenodd" d="M12.7071 14.7071C12.3166 15.0976 11.6834 15.0976 11.2929 14.7071L6.29289 9.70711C5.90237 9.31658 5.90237 8.68342 6.29289 8.29289C6.68342 7.90237 7.31658 7.90237 7.70711 8.29289L12 12.5858L16.2929 8.29289C16.6834 7.90237 17.3166 7.90237 17.7071 8.29289C18.0976 8.68342 18.0976 9.31658 17.7071 9.70711L12.7071 14.7071Z" fill="#111" />
                        </svg>
                    </span>
                </div>

                <CoverPicker currentUrl={coverUrl} onChange={setCoverUrl} />

                <RelatedArticlesPicker
                    selected={relatedArticles}
                    onAdd={(a) => setRelatedArticles((prev) => [...prev, a])}
                    onRemove={(id) => setRelatedArticles((prev) => prev.filter((a) => a.id !== id))}
                />

                <div>
                    <p style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Contenuto</p>
                    <Editor onChange={setContent} />
                </div>

                <button type="submit" disabled={loading || !content} style={{
                    padding: "12px 16px", background: loading ? "#999" : "#111",
                    color: "#fff", border: "none", fontWeight: 600,
                    cursor: loading ? "not-allowed" : "pointer",
                }}>
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
const lbl: React.CSSProperties = {
    display: "block", fontSize: 11, letterSpacing: "0.08em",
    textTransform: "uppercase", marginBottom: 6, color: "#666",
};