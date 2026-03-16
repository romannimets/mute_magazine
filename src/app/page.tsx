import { ArticleCard } from "@/data/articles";
import { headers } from "next/headers";
import Link from "next/link";
import HeroSection from "./components/HeroSection";
import UltimiArticoli from "./components/UltimiArticoli";
import PapereGrid from "./components/PapereGrid";
import ManifestoSection from "./components/ManifestoSection";

async function getManifesto(): Promise<ArticleCard | null> {
  try {
    const h = await headers();
    const host = h.get("host");
    if (!host) return null;
    const res = await fetch(`http://${host}/api/articles/manifesto`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    console.error("Manifesto fetch error:", err);
    return null;
  }
}

export default async function Home() {
  const manifesto = await getManifesto();

  return (
    <main style={{ background: "#fff" }}>
      {/* 1. Hero: immagine fissa + fuchsia con testo scroll-driven */}
      <HeroSection />

      {/* 2. Ultimi articoli carousel */}
      <UltimiArticoli />

      {/* 3. link a tutti gli articoli */}
      <Link
        href="/ultimi-articoli"
        style={{ display: "block", textDecoration: "none" }}
      >
      </Link>

      {/* 4. Categorie */}
      <section style={{ paddingTop: "clamp(40px, 7vw, 64px)" }}>
        <h2
          style={{
            textAlign: "center",
            fontSize: "clamp(11px, 2vw, 13px)",
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#aaa",
            marginBottom: "clamp(24px, 4vw, 40px)",
          }}
        >
          Categorie
        </h2>
        <PapereGrid />
      </section>

      {/* 5. Manifesto */}
      <ManifestoSection
        content={manifesto?.content ?? "Manifesto non disponibile"}
      />
    </main>
  );
}