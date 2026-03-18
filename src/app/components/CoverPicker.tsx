"use client";

import { useState } from "react";
import { deleteCloudinaryMedia } from "@/app/components/Editor";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

interface CoverPickerProps {
    /** URL corrente della copertina (esistente o appena caricata) */
    currentUrl: string;
    /** Colore overlay da applicare all'anteprima */
    overlayColor?: string;
    /** Callback: notifica il parent del nuovo URL (stringa vuota = rimossa) */
    onChange: (url: string) => void;
}

type Mode = "upload" | "url";

export default function CoverPicker({ currentUrl, overlayColor, onChange }: CoverPickerProps) {
    const [mode, setMode] = useState<Mode>("upload");
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [urlInput, setUrlInput] = useState("");
    const [urlConfirmed, setUrlConfirmed] = useState(false);

    // --- Helpers ---

    const displayUrl = preview || (urlConfirmed ? urlInput : "") || currentUrl;

    const clear = async () => {
        // Se c'era un upload su Cloudinary, eliminalo
        if (preview && currentUrl && currentUrl.includes("cloudinary")) {
            await deleteCloudinaryMedia(currentUrl);
        }
        setPreview(null);
        setUrlInput("");
        setUrlConfirmed(false);
        onChange("");
    };

    // --- Upload file ---

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) { alert("Solo immagini."); return; }
        if (file.size > MAX_IMAGE_SIZE) { alert("Max 10MB."); return; }

        // Anteprima locale immediata
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);

        setUploading(true);
        try {
            const fd = new FormData();
            fd.append("file", file);
            const res = await fetch("/api/upload", { method: "POST", body: fd });
            const data = await res.json();
            onChange(data.url);
        } catch { alert("Errore upload."); setPreview(null); onChange(""); }
        finally { setUploading(false); }
    };

    // --- URL pubblico ---

    const handleUrlConfirm = () => {
        const trimmed = urlInput.trim();
        if (!trimmed) return;
        setUrlConfirmed(true);
        onChange(trimmed);
    };

    // --- Render ---

    return (
        <div>
            <label style={{ fontWeight: 600, display: "block", marginBottom: 8, fontSize: 14 }}>
                Copertina (max 10MB)
            </label>

            {/* Anteprima — visibile se c'è un url da mostrare */}
            {displayUrl && (
                <div style={{ position: "relative", width: "100%", paddingTop: "52%", marginBottom: 10, overflow: "hidden" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={displayUrl}
                        alt="cover"
                        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    {overlayColor && (
                        <div style={{ position: "absolute", inset: 0, background: overlayColor, opacity: 0.5, pointerEvents: "none" }} />
                    )}
                    <button
                        type="button"
                        onClick={clear}
                        style={{
                            position: "absolute", top: 8, right: 8,
                            background: "rgba(0,0,0,0.55)", color: "#fff",
                            border: "none", borderRadius: 0, padding: "4px 10px",
                            fontSize: 12, cursor: "pointer", fontWeight: 700,
                        }}
                    >
                        ✕ Rimuovi
                    </button>
                </div>
            )}

            {/* Tab switcher — visibile solo se non c'è ancora un'immagine confermata */}
            {!displayUrl && (
                <>
                    {/* Tab bar */}
                    <div style={{ display: "flex", marginBottom: 10, borderBottom: "1px solid #ddd" }}>
                        {(["upload", "url"] as Mode[]).map((m) => (
                            <button
                                key={m}
                                type="button"
                                onClick={() => setMode(m)}
                                style={{
                                    padding: "7px 16px",
                                    background: "none",
                                    border: "none",
                                    borderBottom: mode === m ? "2px solid #111" : "2px solid transparent",
                                    fontWeight: mode === m ? 700 : 400,
                                    fontSize: 13,
                                    cursor: "pointer",
                                    color: mode === m ? "#111" : "#888",
                                    marginBottom: -1,
                                }}
                            >
                                {m === "upload" ? "Carica file" : "URL pubblico"}
                            </button>
                        ))}
                    </div>

                    {/* Pannello upload */}
                    {mode === "upload" && (
                        <div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFile}
                                disabled={uploading}
                                style={{ ...inp, cursor: uploading ? "not-allowed" : "pointer" }}
                            />
                            {uploading && (
                                <p style={{ fontSize: 13, color: "#666", marginTop: 6 }}>Upload in corso...</p>
                            )}
                        </div>
                    )}

                    {/* Pannello URL */}
                    {mode === "url" && (
                        <div style={{ display: "flex", gap: 8 }}>
                            <input
                                type="url"
                                placeholder="https://esempio.com/immagine.jpg"
                                value={urlInput}
                                onChange={(e) => { setUrlInput(e.target.value); setUrlConfirmed(false); }}
                                style={{ ...inp, flex: 1 }}
                            />
                            <button
                                type="button"
                                onClick={handleUrlConfirm}
                                disabled={!urlInput.trim()}
                                style={{
                                    padding: "10px 16px", background: urlInput.trim() ? "#111" : "#ccc",
                                    color: "#fff", border: "none", fontWeight: 700, fontSize: 13,
                                    cursor: urlInput.trim() ? "pointer" : "not-allowed", flexShrink: 0,
                                }}
                            >
                                Usa URL
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

const inp: React.CSSProperties = {
    width: "100%", padding: "10px 14px", border: "1px solid #ddd",
    fontSize: 14, outline: "none", boxSizing: "border-box", borderRadius: 0,
};