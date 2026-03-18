"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArticleCard, categoryLabels, categoryColors } from "@/data/articles";
import Editor, { deleteCloudinaryMedia } from "@/app/components/Editor";
import RelatedArticlesPicker from "@/app/components/RelatedArticlesPicker";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export default function AdminNewArticle() {
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [content, setContent] = useState<any>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [coverUrl, setCoverUrl] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [relatedArticles, setRelatedArticles] = useState<ArticleCard[]>([]);

    const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith("image/") || file.size > MAX_IMAGE_SIZE) return;
        if (coverUrl) await deleteCloudinaryMedia(coverUrl);
        const reader = new FileReader();
        reader.onloadend = () => setCoverPreview(reader.result as string);
        reader.readAsDataURL(file);
        setUploadingCover(true);
        try {
            const fd = new FormData(); fd.append("file", file);
            const res = await fetch("/api/upload", { method: "POST", body: fd });
            const data = await res.json();
            setCoverUrl(data.url);
        } finally { setUploadingCover(false); }
    };

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

    const overlayColor = categoryColors[selectedCategory] ?? "#ccc";

    return (
        <main style={{ padding: "clamp(24px, 6vw, 48px)", maxWidth: 720, margin: "0 auto" }}>
            <h1 style={{ fontSize: "clamp(22px, 5vw, 28px)", marginBottom: 24 }}>Nuovo articolo</h1>
            {error && <p style={{ color: "red", marginBottom: 16 }}>{error}</p>}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <input name="title" placeholder="Titolo" required style={inp} />
                <input name="subtitle" placeholder="Sottotitolo" style={inp} />
                <input name="author" placeholder="Autore" required style={inp} />

                <select name="category" required defaultValue=""
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
                    {coverPreview && (
                        <div style={{ position: "relative", width: "100%", paddingTop: "52%", marginBottom: 10, overflow: "hidden" }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={coverPreview} alt="cover" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                            <div style={{ position: "absolute", inset: 0, background: overlayColor, opacity: 0.5, pointerEvents: "none" }} />
                        </div>
                    )}
                    {!coverPreview && (
                        <input type="file" accept="image/*" onChange={handleCoverChange} disabled={uploadingCover} style={inp} />
                    )}
                    {uploadingCover && <p style={{ fontSize: 13, color: "#666" }}>Upload in corso...</p>}
                    {coverPreview && !uploadingCover && (
                        <button type="button" onClick={() => { setCoverPreview(null); setCoverUrl(""); }}
                            style={{ marginTop: 6, padding: "5px 12px", background: "#dc3545", color: "#fff", border: "none", cursor: "pointer", fontSize: 13 }}>
                            Rimuovi copertina
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
                    <Editor onChange={setContent} />
                </div>

                <button type="submit" disabled={loading || !content || uploadingCover}
                    style={{ padding: "12px 16px", background: loading ? "#999" : "#111", color: "#fff", border: "none", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
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