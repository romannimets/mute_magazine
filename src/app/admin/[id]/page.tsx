"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArticleCard, categoryLabels, categoryColors } from "@/data/articles";
import Editor from "@/app/components/Editor";
import RelatedArticlesPicker from "@/app/components/RelatedArticlesPicker";
import CoverPicker from "@/app/components/CoverPicker";

export default function AdminEdit() {
    const { id } = useParams();
    const router = useRouter();

    const [article, setArticle] = useState<ArticleCard | null>(null);
    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState<any>(null);
    const [editorKey, setEditorKey] = useState(0);
    const [coverUrl, setCoverUrl] = useState("");
    const [isLoadingArticle, setIsLoadingArticle] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [relatedArticles, setRelatedArticles] = useState<ArticleCard[]>([]);

    useEffect(() => {
        if (!id) return;
        (async () => {
            setIsLoadingArticle(true);
            try {
                const res = await fetch(`/api/articles/${id}`);
                if (!res.ok) throw new Error();
                const data: ArticleCard = await res.json();

                setArticle(data);
                setCoverUrl(data.cover || "");
                setSelectedCategory(data.category || "");

                if (data.relatedArticles?.length) {
                    const loaded = await Promise.all(
                        data.relatedArticles.map((rid) =>
                            fetch(`/api/articles/${rid}`).then((r) => r.ok ? r.json() : null)
                        )
                    );
                    setRelatedArticles(loaded.filter(Boolean));
                }

                try {
                    const parsed = typeof data.content === "string"
                        ? JSON.parse(data.content)
                        : data.content;
                    setContent(parsed);
                } catch { setContent({ blocks: [] }); }

                setEditorKey((k) => k + 1);
            } catch { alert("Errore caricamento articolo"); }
            finally { setIsLoadingArticle(false); }
        })();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        try {
            const form = new FormData(e.currentTarget);
            const res = await fetch(`/api/articles/${id}`, {
                method: "PUT",
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
            if (!res.ok) throw new Error();
            router.push("/admin");
        } catch { alert("Errore salvataggio"); }
        finally { setLoading(false); }
    };

    if (isLoadingArticle) {
        return <div style={{ padding: 64, textAlign: "center", color: "#aaa" }}>Caricamento...</div>;
    }
    if (!article) {
        return <p style={{ padding: 32 }}>Articolo non trovato</p>;
    }

    return (
        <main style={{ padding: "clamp(24px, 6vw, 48px)", maxWidth: 720, margin: "0 auto" }}>
            <h1 style={{ fontSize: "clamp(22px, 5vw, 28px)", marginBottom: 24 }}>Modifica articolo</h1>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <input name="title" defaultValue={article.title} placeholder="Titolo" required style={inp} />
                <input name="subtitle" defaultValue={article.subtitle} placeholder="Sottotitolo" style={inp} />
                <input name="author" defaultValue={article.author} placeholder="Autore" required style={inp} />

                <select
                    name="category"
                    required
                    defaultValue={article.category}
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
                    onRemove={(rid) => setRelatedArticles((prev) => prev.filter((a) => a.id !== rid))}
                />

                {/* Editor contenuto */}
                <div>
                    <p style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Contenuto</p>
                    {content !== null && (
                        <Editor key={editorKey} editorKey={editorKey} onChange={setContent} initialData={content} />
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading || content === null}
                    style={{
                        padding: "12px 16px",
                        background: loading ? "#999" : "#111",
                        color: "#fff", border: "none", fontWeight: 600,
                        cursor: loading ? "not-allowed" : "pointer",
                    }}
                >
                    {loading ? "Salvando..." : "Salva Modifiche"}
                </button>
            </form>
        </main>
    );
}

const inp: React.CSSProperties = {
    width: "100%", padding: "10px 14px", border: "1px solid #ddd",
    fontSize: 16, outline: "none", boxSizing: "border-box", borderRadius: 0,
};