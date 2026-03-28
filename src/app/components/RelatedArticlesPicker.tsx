"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ArticleCard } from "@/data/articles";

interface Props {
    selected: ArticleCard[];
    onAdd: (a: ArticleCard) => void;
    onRemove: (id: string) => void;
}

export default function RelatedArticlesPicker({ selected, onAdd, onRemove }: Props) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<ArticleCard[]>([]);
    const [searching, setSearching] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (query.trim().length < 2) { setResults([]); return; }
        const timer = setTimeout(async () => {
            setSearching(true);
            try {
                const res = await fetch("/api/articles");
                const all: ArticleCard[] = await res.json();
                const q = query.toLowerCase();
                const selectedIds = new Set(selected.map((a) => a.id));
                setResults(
                    all.filter(
                        (a) =>
                            a.category !== "manifesto" &&
                            !selectedIds.has(a.id) &&
                            (a.title?.toLowerCase().includes(q) ||
                                a.author?.toLowerCase().includes(q) ||
                                a.category?.toLowerCase().includes(q))
                    ).slice(0, 8)
                );
            } finally {
                setSearching(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [query, selected]);

    return (
        <div>
            <label style={{ fontWeight: 600, display: "block", marginBottom: 8, fontSize: 14 }}>
                Articoli correlati (max 3)
            </label>

            {/* Selezionati */}
            {selected.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
                    {selected.map((a) => (
                        <div key={a.id} style={{
                            display: "flex", alignItems: "center", gap: 10,
                            background: "#f5f5f5", padding: "8px 12px", border: "1px solid #e0e0e0",
                        }}>
                            {a.cover && (
                                <div style={{ position: "relative", width: 48, height: 36, flexShrink: 0, overflow: "hidden" }}>
                                    <Image src={a.cover} alt={a.title} fill style={{ objectFit: "cover" }} sizes="48px" />
                                    <div style={{
                                        position: "absolute", inset: 0,
                                        background: "#ccc",
                                        opacity: 0.5, pointerEvents: "none",
                                    }} />
                                </div>
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {a.title}
                                </div>
                                <div style={{ fontSize: 11, color: "#888" }}>{a.category} · {a.author}</div>
                            </div>
                            <button
                                type="button"
                                onClick={() => onRemove(a.id)}
                                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#999", padding: "0 4px" }}
                            >×</button>
                        </div>
                    ))}
                </div>
            )}

            {/* Ricerca — visibile solo se < 3 selezionati */}
            {selected.length < 3 && (
                <div style={{ position: "relative" }}>
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Cerca articolo da collegare..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        style={{
                            width: "100%", padding: "9px 12px",
                            border: "1px solid #ddd", fontSize: 14, outline: "none",
                            boxSizing: "border-box",
                        }}
                    />
                    {(searching || results.length > 0) && (
                        <div style={{
                            position: "absolute", top: "100%", left: 0, right: 0,
                            background: "#fff", border: "1px solid #ddd", borderTop: "none",
                            zIndex: 100, maxHeight: 280, overflowY: "auto",
                        }}>
                            {searching && <div style={{ padding: 12, fontSize: 13, color: "#999" }}>Ricerca...</div>}
                            {!searching && results.map((a) => (
                                <button
                                    key={a.id}
                                    type="button"
                                    onClick={() => { onAdd(a); setQuery(""); setResults([]); }}
                                    style={{
                                        width: "100%", display: "flex", alignItems: "center", gap: 10,
                                        padding: "9px 12px", background: "none", border: "none",
                                        cursor: "pointer", textAlign: "left",
                                        borderBottom: "1px solid #f5f5f5",
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = "#f9f9f9"}
                                    onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                                >
                                    {a.cover && (
                                        <div style={{ position: "relative", width: 44, height: 33, flexShrink: 0, overflow: "hidden" }}>
                                            <Image src={a.cover} alt="" fill style={{ objectFit: "cover" }} sizes="44px" />
                                            <div style={{
                                                position: "absolute", inset: 0,
                                                background: "#ccc", opacity: 0.5,
                                            }} />
                                        </div>
                                    )}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {a.title}
                                        </div>
                                        <div style={{ fontSize: 11, color: "#888" }}>{a.category} · {a.author}</div>
                                    </div>
                                </button>
                            ))}
                            {!searching && results.length === 0 && query.trim().length >= 2 && (
                                <div style={{ padding: 12, fontSize: 13, color: "#999" }}>Nessun risultato</div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}