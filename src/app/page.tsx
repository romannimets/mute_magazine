import { ArticleCard } from "@/data/articles";
import { headers } from "next/headers";
import HeroSection from "./components/HeroSection";
import UltimiArticoli from "./components/UltimiArticoli";
import PapereGrid from "./components/PapereGrid";
import ManifestoSection from "./components/ManifestoSection";

async function getManifesto(): Promise<ArticleCard | null> {
  try {
    const h = await headers();
    const host = h.get("host");
    if (!host) return null;
    const res = await fetch(`http://${host}/api/articles/manifesto`, { cache: "no-store" });
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
      {/* 1. Hero */}
      <HeroSection />

      {/* 2. Ultimi articoli — padding top aumentato per più aria dopo l'hero */}
      <div style={{ paddingTop: "clamp(56px, 10vw, 88px)" }}>
        <UltimiArticoli />
      </div>

      {/* 3. Categorie — stile titolo uguale a Ultimi Articoli */}
      <section style={{ paddingTop: "clamp(48px, 8vw, 72px)" }}>
        <div style={{
          paddingLeft: "clamp(16px, 5vw, 48px)",
          paddingRight: "clamp(16px, 5vw, 48px)",
          marginBottom: "clamp(20px, 3.5vw, 32px)",
        }}>
          <h2 style={{ fontSize: "clamp(22px, 4.5vw, 40px)", fontWeight: 700, lineHeight: 1 }}>
            Categorie
          </h2>
        </div>
        <PapereGrid />
      </section>

      {/* 4. Manifesto */}
      <ManifestoSection
        content={manifesto?.content ?? "Manifesto non disponibile"}
      />
    </main>
  );
}