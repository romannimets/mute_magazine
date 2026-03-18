"use client";

import React from "react";

interface EditorJSData {
    time?: number;
    blocks: Array<{ type: string; data: any }>;
    version?: string;
}

interface EditorRendererProps {
    data: EditorJSData | string;
}

export default function EditorRenderer({ data }: EditorRendererProps) {
    let blocks: EditorJSData["blocks"] = [];
    if (typeof data === "string") {
        try { blocks = JSON.parse(data).blocks || []; }
        catch { return <div dangerouslySetInnerHTML={{ __html: data }} />; }
    } else {
        blocks = data.blocks || [];
    }
    if (!blocks.length) return <p style={{ color: "#999" }}>Nessun contenuto</p>;
    return (
        <div style={containerStyle}>
            {blocks.map((block, i) => <Block key={i} block={block} />)}
        </div>
    );
}

function Block({ block }: { block: { type: string; data: any } }) {
    switch (block.type) {
        case "header": return <HeaderBlock data={block.data} />;
        case "paragraph": return <ParagraphBlock data={block.data} />;
        case "list": return <ListBlock data={block.data} />;
        case "checklist": return <ChecklistBlock data={block.data} />;
        case "image": return <ImageBlock data={block.data} />;
        default: return null;
    }
}

function HeaderBlock({ data }: { data: { text: string; level: number } }) {
    const sz = data.level === 2 ? 32 : data.level === 3 ? 24 : 20;
    const Tag = (["h1", "h2", "h3", "h4"] as const)[data.level - 1] ?? "h4";
    return React.createElement(Tag, {
        style: {
            fontSize: `clamp(${sz - 8}px, ${sz / 4}vw, ${sz}px)`,
            fontFamily: "'EB Garamond', 'Garamond', Georgia, serif",
            marginTop: "clamp(24px, 6vw, 32px)",
            marginBottom: "clamp(12px, 3vw, 16px)",
            lineHeight: 1.3, fontWeight: 700,
            wordWrap: "break-word", overflowWrap: "break-word",
        },
        dangerouslySetInnerHTML: { __html: data.text },
    });
}

function ParagraphBlock({ data }: { data: { text: string } }) {
    if (!data.text || data.text === "<br>") return null;
    return (
        <p style={{
            fontSize: "clamp(15px, 4vw, 18px)", lineHeight: 1.8,
            marginBottom: "clamp(16px, 4vw, 20px)", color: "#333",
            wordWrap: "break-word", overflowWrap: "break-word",
            fontFamily: "'EB Garamond', 'Garamond', Georgia, serif",
        }} dangerouslySetInnerHTML={{ __html: data.text }} />
    );
}

function ListBlock({ data }: { data: { style: "ordered" | "unordered"; items: any[] } }) {
    const Tag = data.style === "ordered" ? "ol" : "ul";
    return (
        <Tag style={{
            fontSize: "clamp(15px, 4vw, 18px)", lineHeight: 1.7,
            fontFamily: "'EB Garamond', 'Garamond', Georgia, serif",
            marginBottom: "clamp(16px, 4vw, 20px)", paddingLeft: "clamp(24px, 6vw, 32px)",
        }}>
            {data.items.map((item, i) => {
                const content = typeof item === "string" ? item : (item.content || item.text || "");
                return <li key={i} style={{ marginBottom: 8 }} dangerouslySetInnerHTML={{ __html: content }} />;
            })}
        </Tag>
    );
}

function ChecklistBlock({ data }: { data: { items: Array<{ text: string; checked: boolean }> } }) {
    return (
        <div style={{
            fontSize: "clamp(15px, 4vw, 18px)",
            fontFamily: "'EB Garamond', 'Garamond', Georgia, serif",
            lineHeight: 1.7, marginBottom: "clamp(16px, 4vw, 20px)"
        }}>
            {data.items.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", marginBottom: 8, gap: 10 }}>
                    <input type="checkbox" checked={item.checked} readOnly style={{ marginTop: 4, cursor: "default", flexShrink: 0 }} />
                    <span style={{ textDecoration: item.checked ? "line-through" : "none", color: item.checked ? "#999" : "#333" }}
                        dangerouslySetInnerHTML={{ __html: item.text }} />
                </div>
            ))}
        </div>
    );
}

function ImageBlock({ data }: { data: { file: { url: string; type?: string; mime?: string }; caption?: string } }) {
    const isVideo = data.file.type === "video" || data.file.mime?.startsWith("video/");
    return (
        <figure style={{ margin: "clamp(24px, 6vw, 32px) 0" }}>
            {isVideo ? (
                <video src={data.file.url} controls style={{ maxWidth: "100%", height: "auto", borderRadius: 0, display: "block" }} />
            ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={data.file.url} alt={data.caption || ""} style={{ maxWidth: "100%", height: "auto", borderRadius: 0, display: "block" }} />
            )}
            {data.caption && (
                <figcaption style={{
                    marginTop: 10, fontSize: "clamp(12px, 3vw, 14px)", color: "#888", fontStyle: "italic", fontFamily: "'EB Garamond', 'Garamond', Georgia, serif",
                }}>
                    {data.caption}
                </figcaption>
            )}
        </figure>
    );
}

const containerStyle: React.CSSProperties = {
    maxWidth: 700,
    margin: "0 auto",
    padding: "clamp(20px, 5vw, 40px) clamp(16px, 4vw, 24px)",
    wordWrap: "break-word",
    overflowWrap: "break-word",
};