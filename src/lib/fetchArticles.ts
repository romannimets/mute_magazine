import { ArticleCard } from "@/data/articles";

/**
 * Builds an absolute base URL usable both in the browser and on the server.
 *
 * - Browser            → empty string  → relative URL works fine
 * - Server (Vercel)    → NEXT_PUBLIC_BASE_URL  (e.g. https://mute-magazine.vercel.app)
 * - Server (local dev) → http://localhost:3000
 *
 * NEXT_PUBLIC_BASE_URL must be set in Vercel env vars and in .env.local:
 *   NEXT_PUBLIC_BASE_URL=https://tuodominio.it
 */
function getBaseUrl(): string {
    if (typeof window !== "undefined") return ""; // browser → relative URL
    if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
    return "http://localhost:3000";
}

export async function fetchArticles(category?: string): Promise<ArticleCard[]> {
    const base = getBaseUrl();
    const url = category
        ? `${base}/api/articles?category=${category}`
        : `${base}/api/articles`;

    try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) return [];
        return res.json();
    } catch {
        return [];
    }
}