"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArticleCard, categoryLabels, categoryColors } from "@/data/articles";
import Editor, { deleteCloudinaryMedia } from "@/app/components/Editor";
import RelatedArticlesPicker from "@/app/components/RelatedArticlesPicker";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export default function AdminEdit() {
    const { id } = useParams();
    const router = useRouter();

    const [article, setArticle] = useState<ArticleCard | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    const [content, setContent] = useState<any>(null);
    const [editorKey, setEditorKey] = useState(0);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [oldCoverUrl, setOldCoverUrl] = useState("");
    const [newCoverUrl, setNewCoverUrl] = useState("");
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
                setOldCoverUrl(data.cover || "");
                setSelectedCategory(data.category || "");

                // Carica articoli correlati salvati
                if (data.relatedArticles?.length) {
                    const loaded = await Promise.all(
                        data.relatedArticles.map((rid) =>
                            fetch(`/api/articles/${rid}`).then((r) => r.ok ? r.json() : null)
                        )
                    );
                    setRelatedArticles(loaded.filter(Boolean));
                }

                try {
                    const parsed = typeof data.content === "string" ? JSON.parse(data.content) : data.content;
                    setContent(parsed);
                } catch { setContent({ blocks: [] }); }
                setEditorKey((k) => k + 1);
            } catch { alert("Errore caricamento articolo"); }
            finally { setIsLoadingArticle(false); }
        })();
    }, [id]);

    const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith("image/") || file.size > MAX_IMAGE_SIZE) return;
        if (newCoverUrl) await deleteCloudinaryMedia(newCoverUrl);
        const reader = new FileReader();
        reader.onloadend = () => setCoverPreview(reader.result as string);
        reader.readAsDataURL(file);
        setUploadingCover(true);
        try {
            const fd = new FormData(); fd.append("file", file);
            const res = await fetch("/api/upload", { method: "POST", body: fd });
            const data = await res.json();
            setNewCoverUrl(data.url);
        } finally { setUploadingCover(false); }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        try {
            const form = new FormData(e.currentTarget);
            let finalCoverUrl = oldCoverUrl;
            if (newCoverUrl) {
                if (oldCoverUrl && oldCoverUrl !== newCoverUrl) await deleteCloudinaryMedia(oldCoverUrl);
                finalCoverUrl = newCoverUrl;
            }
            const res = await fetch(`/api/articles/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: form.get("title"),
                    subtitle: form.get("subtitle"),
                    author: form.get("author"),
                    category: form.get("category"),
                    cover: finalCoverUrl,
                    content,
                    relatedArticles: relatedArticles.map((a) => a.id),
                }),
            });
            if (!res.ok) throw new Error();
            router.push("/admin");
        } catch { alert("Errore salvataggio"); }
        finally { setLoading(false); }
    };

    if (isLoadingArticle) return <div style={{ padding: 64, textAlign: "center" }}>Caricamento...</div>;
    if (!article) return <p style={{ padding: 32 }}>Articolo non trovato</p>;

    const previewUrl = coverPreview || newCoverUrl || oldCoverUrl;
    const overlayColor = categoryColors[selectedCategory] ?? "#ccc";

    return (
        <main style={{ padding: "clamp(24px, 6vw, 48px)", maxWidth: 720, margin: "0 auto" }}>
            <h1 style={{ fontSize: "clamp(22px, 5vw, 28px)", marginBottom: 24 }}>Modifica articolo</h1>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <input name="title" defaultValue={article.title} placeholder="Titolo" required style={inp} />
                <input name="subtitle" defaultValue={article.subtitle} placeholder="Sottotitolo" style={inp} />
                <input name="author" defaultValue={article.author} placeholder="Autore" required style={inp} />

                <select name="category" required defaultValue={article.category}
                    onChange={(e) => setSelectedCategory(e.target.value)} style={inp}>
                    <option value="" disabled>Seleziona categoria</option>
                    {Object.entries(categoryLabels).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                    ))}
                </select>

                {/* Cover con overlay */}
                <div>
                    <label style={{ fontWeight: 600, display: "block", marginBottom: 8, fontSize: 14 }}>
                        Copertina (max 10MB)
                    </label>
                    {previewUrl && (
                        <div style={{ position: "relative", width: "100%", paddingTop: "52%", marginBottom: 10, overflow: "hidden" }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={previewUrl} alt="cover" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                            <div style={{ position: "absolute", inset: 0, background: overlayColor, opacity: 0.5, pointerEvents: "none" }} />
                        </div>
                    )}
                    {!coverPreview && (
                        <input type="file" accept="image/*" onChange={handleCoverChange} disabled={uploadingCover} style={inp} />
                    )}
                    {uploadingCover && <p style={{ fontSize: 13, color: "#666" }}>Upload in corso...</p>}
                    {coverPreview && !uploadingCover && (
                        <button type="button" onClick={() => { setCoverPreview(null); setNewCoverUrl(""); }}
                            style={{ marginTop: 6, padding: "5px 12px", background: "#dc3545", color: "#fff", border: "none", cursor: "pointer", fontSize: 13 }}>
                            Rimuovi nuova copertina
                        </button>
                    )}
                </div>

                {/* Articoli correlati */}
                <RelatedArticlesPicker
                    selected={relatedArticles}
                    onAdd={(a) => setRelatedArticles((prev) => [...prev, a])}
                    onRemove={(rid) => setRelatedArticles((prev) => prev.filter((a) => a.id !== rid))}
                />

                {/* Editor */}
                <div>
                    <p style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Contenuto</p>
                    {content !== null && (
                        <Editor key={editorKey} editorKey={editorKey} onChange={setContent} initialData={content} />
                    )}
                </div>

                <button type="submit" disabled={loading || uploadingCover || content === null}
                    style={{ padding: "12px 16px", background: loading ? "#999" : "#111", color: "#fff", border: "none", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
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