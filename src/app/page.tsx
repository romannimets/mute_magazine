import { ArticleCard } from "@/data/articles";
import clientPromise from "@/lib/mongodb";
import HeroSection from "./components/HeroSection";
import UltimiArticoli from "./components/UltimiArticoli";
import LucertolineGrid from "./components/LucertolineGrid";
import ManifestoSection from "./components/ManifestoSection";

// Legge il manifesto direttamente dal DB — senza HTTP interno (romperebbe su Vercel)
async function getManifesto(): Promise<ArticleCard | null> {
  try {
    const client = await clientPromise;
    const doc = await client
      .db("mute_magazine")
      .collection("articles")
      .findOne({ category: "manifesto" });
    if (!doc) return null;
    const { _id, ...rest } = doc;
    return { _id: _id.toString(), ...rest } as ArticleCard;
  } catch (err) {
    console.error("Manifesto fetch error:", err);
    return null;
  }
}

export default async function Home() {
  const manifesto = await getManifesto();

  return (
    <main style={{ background: "#fff", position: "relative" }}>
      <HeroSection />

      <div style={{
        position: "relative",
        zIndex: 20,
        background: "#fff",
        boxShadow: "0 -20px 40px rgba(0,0,0,0.05)"
      }}>
        <div style={{ paddingTop: "clamp(56px, 10vw, 88px)" }}>
          <UltimiArticoli />
        </div>

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
          <LucertolineGrid />
        </section>

        <ManifestoSection
          content={manifesto?.content ?? "Manifesto non disponibile"}
        />
      </div>
    </main>
  );
}