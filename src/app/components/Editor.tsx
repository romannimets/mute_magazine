"use client";

import { useEffect, useRef, useState } from "react";

interface EditorProps {
    onChange: (data: any) => void;
    initialData?: any;
    editorKey?: number;
}

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

export default function Editor({ onChange, initialData, editorKey }: EditorProps) {
    const editorRef = useRef<any>(null);
    const holderRef = useRef<HTMLDivElement>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const uploadedMediaRef = useRef<Set<string>>(new Set());
    const isInitializedRef = useRef(false);

    useEffect(() => { setIsMounted(true); }, []);

    useEffect(() => {
        if (!isMounted || !holderRef.current) return;

        let isSubscribed = true;
        isInitializedRef.current = false;
        setIsReady(false);

        const initEditor = async () => {
            const EditorJS = (await import("@editorjs/editorjs")).default;
            const Header = (await import("@editorjs/header")).default;
            const List = (await import("@editorjs/list")).default;
            const Paragraph = (await import("@editorjs/paragraph")).default;
            const ImageTool = (await import("@editorjs/image")).default;

            if (editorRef.current) {
                try {
                    await editorRef.current.isReady;
                    editorRef.current.destroy();
                    editorRef.current = null;
                } catch (e) { console.error("Error destroying editor:", e); }
            }

            if (!isSubscribed) return;
            await new Promise(resolve => setTimeout(resolve, 50));
            if (!isSubscribed || !holderRef.current) return;

            // ── Custom block: inserisce immagine da URL senza upload ──
            class ImageFromUrl {
                static get toolbox() {
                    return {
                        title: "Img da URL",
                        icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>`,
                    };
                }
                data: { url: string; caption: string };
                wrapper: HTMLDivElement;

                constructor({ data }: { data: any }) {
                    this.data = { url: data?.url || "", caption: data?.caption || "" };
                    this.wrapper = document.createElement("div");
                }

                render() {
                    this.wrapper.style.cssText = "border:1px solid #ddd;padding:12px;background:#fafafa;";

                    const urlRow = document.createElement("div");
                    urlRow.style.cssText = "display:flex;gap:8px;margin-bottom:8px;";

                    const input = document.createElement("input");
                    input.type = "url";
                    input.placeholder = "https://esempio.com/immagine.jpg";
                    input.value = this.data.url;
                    input.style.cssText = "flex:1;padding:8px 10px;border:1px solid #ddd;font-size:14px;outline:none;";
                    input.addEventListener("change", () => { this.data.url = input.value.trim(); this._refresh(); });

                    const btn = document.createElement("button");
                    btn.type = "button";
                    btn.textContent = "Carica";
                    btn.style.cssText = "padding:8px 14px;background:#111;color:#fff;border:none;font-size:13px;cursor:pointer;font-weight:700;";
                    btn.addEventListener("click", () => { this.data.url = input.value.trim(); this._refresh(); });

                    urlRow.appendChild(input);
                    urlRow.appendChild(btn);

                    const caption = document.createElement("input");
                    caption.type = "text";
                    caption.placeholder = "Didascalia (opzionale)";
                    caption.value = this.data.caption;
                    caption.style.cssText = "width:100%;padding:6px 10px;border:1px solid #ddd;font-size:13px;outline:none;box-sizing:border-box;";
                    caption.addEventListener("input", () => { this.data.caption = caption.value; });

                    this.wrapper.appendChild(urlRow);
                    if (this.data.url) this._refresh();
                    this.wrapper.appendChild(caption);
                    return this.wrapper;
                }

                _refresh() {
                    const existing = this.wrapper.querySelector("img, video");
                    if (existing) existing.remove();

                    const url = this.data.url;
                    if (!url) return;

                    const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(url);
                    const el = isVideo
                        ? Object.assign(document.createElement("video"), { src: url, controls: true })
                        : Object.assign(document.createElement("img"), { src: url, alt: "" });
                    (el as HTMLElement).style.cssText = "max-width:100%;display:block;margin:8px 0;";
                    this.wrapper.insertBefore(el, this.wrapper.lastChild!);
                }

                save() {
                    return { url: this.data.url, caption: this.data.caption };
                }

                validate(data: any) { return !!data.url?.trim(); }
            }

            const editor = new EditorJS({
                holder: holderRef.current!,
                placeholder: "Inizia a scrivere il tuo articolo...",
                data: initialData || undefined,
                tools: {
                    header: {
                        // @ts-ignore
                        class: Header,
                        config: { placeholder: "Inserisci titolo", levels: [2, 3, 4], defaultLevel: 2 },
                    },
                    paragraph: {
                        // @ts-ignore
                        class: Paragraph,
                        inlineToolbar: true,
                    },
                    list: {
                        // @ts-ignore
                        class: List,
                        inlineToolbar: true,
                        config: { defaultStyle: "unordered" },
                        // Sovrascrive il toolbox del plugin: espone solo
                        // le due voci che vogliamo, escludendo checklist
                        toolbox: [
                            {
                                title: "Lista puntata",
                                icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="9" x2="19" y1="7" y2="7"/><line x1="9" x2="19" y1="12" y2="12"/><line x1="9" x2="19" y1="17" y2="17"/><path d="M5 7H4.99M5 12H4.99M5 17H4.99"/></svg>`,
                                data: { style: "unordered" },
                            },
                            {
                                title: "Lista numerata",
                                icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" x2="19" y1="7" y2="7"/><line x1="12" x2="19" y1="12" y2="12"/><line x1="12" x2="19" y1="17" y2="17"/><path d="M7.8 14V7.21c0-.08-.1-.13-.16-.08L5 9.5"/></svg>`,
                                data: { style: "ordered" },
                            },
                        ],
                    },
                    // Tool 1: upload file (Cloudinary)
                    image: {
                        // @ts-ignore
                        class: ImageTool,
                        toolbox: {
                            title: "Img/Video/GIF (upload)",
                            icon: `<svg width="18" height="18" viewBox="0 0 24 24"><path d="M4 4h16v16H4z" fill="none"/><path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>`,
                        },
                        config: {
                            uploader: {
                                uploadByFile(file: File) { return uploadFile(file, uploadedMediaRef); },
                                uploadByUrl(url: string) {
                                    return Promise.resolve({ success: 1, file: { url } });
                                },
                            },
                            types: "image/*, video/*, .gif",
                        },
                    },
                    // Tool 2: URL diretta senza upload
                    imageFromUrl: {
                        // @ts-ignore
                        class: ImageFromUrl,
                    },
                },
                onChange: async () => {
                    if (editorRef.current && isInitializedRef.current) {
                        const data = await editorRef.current.save();
                        onChange(data);
                    }
                },
                onReady: () => {
                    if (isSubscribed) {
                        setIsReady(true);
                        setTimeout(() => { isInitializedRef.current = true; }, 100);
                    }
                },
            });

            if (isSubscribed) editorRef.current = editor;
        };

        initEditor().catch(err => console.error("Failed to initialize editor:", err));

        return () => {
            isSubscribed = false;
            if (editorRef.current) {
                editorRef.current.isReady
                    .then(() => { editorRef.current?.destroy(); editorRef.current = null; })
                    .catch((e: any) => console.error("Editor cleanup error", e));
            }
        };
    }, [isMounted, editorKey]);

    if (!isMounted) {
        return (
            <div style={{ border: "1px solid #ddd", padding: 16, minHeight: 300, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>
                Caricamento editor...
            </div>
        );
    }

    return (
        <div>
            <div
                ref={holderRef}
                style={{ border: "1px solid #ddd", padding: 16, minHeight: 300, background: "#fff", opacity: isReady ? 1 : 0.5, transition: "opacity 0.3s", fontFamily: "'EB Garamond', 'Garamond', Georgia, serif", fontSize: 18 }}
            />
            {!isReady && (
                <p style={{ fontSize: 13, color: "#666", marginTop: 8, textAlign: "center" }}>Caricamento contenuto...</p>
            )}
        </div>
    );
}

async function uploadFile(file: File, uploadedMediaRef: React.MutableRefObject<Set<string>>) {
    const isVideo = file.type.startsWith("video/");
    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (file.size > maxSize) {
        alert(`Max ${(maxSize / 1024 / 1024).toFixed(0)}MB per ${isVideo ? "video" : "immagini"}.`);
        return { success: 0, error: "File troppo grande" };
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (data.publicId) uploadedMediaRef.current.add(data.publicId);
        return {
            success: 1,
            file: {
                url: data.url,
                publicId: data.publicId,
                resourceType: data.resourceType,
                ...(file.type.startsWith("video/") && { type: "video", mime: file.type }),
                ...(file.type === "image/gif" && { type: "gif" }),
            },
        };
    } catch {
        return { success: 0, error: "Upload fallito" };
    }
}

export async function deleteCloudinaryMedia(url: string): Promise<boolean> {
    if (!url || !url.includes("cloudinary")) return false;
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
    const publicId = match ? match[1] : null;
    if (!publicId) return false;
    try {
        const resourceType = url.includes("/video/") ? "video" : "image";
        const res = await fetch("/api/media", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ publicId, resourceType }),
        });
        return res.ok;
    } catch { return false; }
}