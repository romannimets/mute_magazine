"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { ArticleCard } from "@/data/articles";

const buttonStyle = {
  color: "#fff",
  fontWeight: 500,
  fontFamily: "var(--font-mattone), Arial, Helvetica, sans-serif",
};

const categories = [
  { path: "/articoli/voci", label: "Risonanze" },
  { path: "/articoli/risonanze", label: "Risonanze" },
  { path: "/articoli/sottofondo", label: "Sottofondo" },
];

export default function Navbar() {
  const [drop, setDrop] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ArticleCard[]>([]);
  const [searching, setSearching] = useState(false);

  const dropRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(event.target as Node)) {
        setDrop(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (drop || menuOpen) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [drop, menuOpen]);

  useEffect(() => {
    if (searchOpen) {
      const timeout = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timeout);
    } else {
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [searchOpen]);

  // Ricerca in tempo reale
  useEffect(() => {
    const searchArticles = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setSearching(true);
      try {
        const res = await fetch("/api/articles");
        if (!res.ok) throw new Error("Errore ricerca");

        const allArticles: ArticleCard[] = await res.json();
        const query = searchQuery.toLowerCase().trim();

        console.log("Searching for:", query);
        console.log("Total articles:", allArticles.length);

        // Funzione helper per estrarre testo dal content EditorJS
        const extractTextFromContent = (content: any): string => {
          if (!content) return "";

          try {
            let contentObj = content;

            // Se è una stringa, prova a parsarla
            if (typeof content === "string") {
              try {
                contentObj = JSON.parse(content);
              } catch {
                // Se non è JSON valido, ritorna la stringa stessa
                return content.toLowerCase();
              }
            }

            // Estrai testo dai blocchi EditorJS
            if (contentObj.blocks && Array.isArray(contentObj.blocks)) {
              return contentObj.blocks
                .map((block: any) => {
                  if (block.type === "paragraph" && block.data?.text) {
                    return block.data.text;
                  }
                  if (block.type === "header" && block.data?.text) {
                    return block.data.text;
                  }
                  if (block.type === "list" && block.data?.items) {
                    return block.data.items.join(" ");
                  }
                  if (block.type === "quote" && block.data?.text) {
                    return block.data.text;
                  }
                  return "";
                })
                .join(" ")
                .toLowerCase();
            }

            return "";
          } catch (e) {
            console.error("Error extracting text from content:", e);
            return "";
          }
        };

        // Filtra articoli che contengono la query
        const filtered = allArticles.filter((article) => {
          // Salta il manifesto
          if (article.category === "manifesto") return false;

          const titleMatch = article.title?.toLowerCase().includes(query);
          const subtitleMatch = article.subtitle?.toLowerCase().includes(query);
          const authorMatch = article.author?.toLowerCase().includes(query);
          const categoryMatch = article.category?.toLowerCase().includes(query);

          // Cerca anche nel contenuto
          const contentText = extractTextFromContent(article.content);
          const contentMatch = contentText.includes(query);

          return titleMatch || subtitleMatch || authorMatch || categoryMatch || contentMatch;
        });

        console.log("Filtered results:", filtered.length);
        setSearchResults(filtered);
      } catch (err) {
        console.error("Search error:", err);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    };

    const debounce = setTimeout(searchArticles, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Funzione per evidenziare le occorrenze
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index} style={{ background: "#ffeb3b", padding: "0 2px" }}>
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <nav
      style={{
        width: "100%",
        height: "clamp(56px, 12vw, 64px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 clamp(16px, 4vw, 32px)",
        background: "#000",
        boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
        zIndex: 1000,
      }}
    >
      {/* Desktop Left Section */}
      <div
        className="desktop-nav-mute"
        style={{
          display: 'flex',
          alignItems: 'center',
          flex: 1,
          justifyContent: 'flex-start',
          gap: 'clamp(12px, 3vw, 24px)'
        }}
      >
        <Link href="/about" style={{ ...buttonStyle, fontSize: 'clamp(13px, 3.2vw, 16px)' }}>
          About Us
        </Link>
        <div style={{ position: "relative" }} ref={dropRef}>
          <span
            style={{ ...buttonStyle, cursor: "pointer", fontSize: 'clamp(13px, 3.2vw, 16px)' }}
            onClick={() => setDrop((d) => !d)}
            tabIndex={0}
          >
            Articoli ▼
          </span>
          {drop && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                left: 0,
                background: "#fff",
                border: "1px solid #eee",
                borderRadius: 6,
                boxShadow: "0 4px 16px rgba(20,20,20,0.09)",
                minWidth: 140,
                zIndex: 3000,
                padding: '4px 0'
              }}
            >
              {categories.map((cat) => (
                <Link
                  href={cat.path}
                  key={cat.path}
                  style={{
                    display: "block",
                    padding: "10px 18px",
                    textDecoration: "none",
                    ...buttonStyle,
                    whiteSpace: 'nowrap',
                    transition: 'background 0.2s',
                    fontSize: 'clamp(13px, 3.2vw, 16px)',
                    color: 'black'
                  }}
                  onClick={() => setDrop(false)}
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Logo (Center) */}
      <div style={{ flex: '0 0 auto', display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center" }}>
          <Image
            src="/LOGO-MU_TE-BIANCO.png"
            alt="Mute magazine logo"
            width={55}
            height={40}
            style={{ objectFit: "contain", maxHeight: "clamp(32px, 8vw, 40px)", width: "auto", display: "block" }}
            priority
          />
        </Link>
      </div>

      {/* Desktop Right Section */}
      <div
        className="desktop-nav-mute"
        style={{
          display: 'flex',
          alignItems: 'center',
          flex: 1,
          justifyContent: 'flex-end',
          gap: 'clamp(12px, 3vw, 24px)'
        }}
      >
        <a
          href="#contatti"
          style={{ ...buttonStyle, fontSize: 'clamp(13px, 3.2vw, 16px)' }}
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('contatti')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          Contatti
        </a>
        <button
          style={{
            ...buttonStyle,
            fontSize: 'clamp(13px, 3.2vw, 16px)',
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
          onClick={() => setSearchOpen(true)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </button>
        <Link href="/admin" style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: "#fff" }}
          >
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </Link>
      </div>

      {/* Mobile Left - Hamburger */}
      <div
        className="mobile-hamburger-mute"
        style={{
          display: 'none',
          flex: 1,
          justifyContent: 'flex-start'
        }}
      >
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 8,
            display: "flex",
            flexDirection: "column",
            gap: 5,
          }}
          aria-label="Menu"
        >
          <span style={{ width: 24, height: 2, background: "#fff", display: "block", transition: "0.3s" }}></span>
          <span style={{ width: 24, height: 2, background: "#fff", display: "block", transition: "0.3s" }}></span>
          <span style={{ width: 24, height: 2, background: "#fff", display: "block", transition: "0.3s" }}></span>
        </button>
      </div>

      {/* Mobile Right - Search Icon */}
      <div
        className="mobile-search-mute"
        style={{
          display: 'none',
          flex: 1,
          justifyContent: 'flex-end'
        }}
      >
        <button
          onClick={() => setSearchOpen(true)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 8,
            color: "#fff",
          }}
          aria-label="Cerca"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          ref={menuRef}
          style={{
            position: "fixed",
            top: "clamp(56px, 12vw, 64px)",
            right: 0,
            width: "min(280px, 80vw)",
            background: "#111",
            boxShadow: "-2px 0 16px rgba(0,0,0,0.2)",
            zIndex: 2000,
            padding: "24px 0",
          }}
        >
          <Link
            href="/about"
            style={{
              ...buttonStyle,
              display: "block",
              padding: "12px 24px",
              fontSize: 16,
              borderBottom: "1px solid #333"
            }}
            onClick={() => setMenuOpen(false)}
          >
            About Us
          </Link>

          <div style={{ borderBottom: "1px solid #333" }}>
            <div
              style={{
                ...buttonStyle,
                padding: "12px 24px",
                fontSize: 16,
                cursor: "pointer"
              }}
            >
              Articoli
            </div>
            {categories.map((cat) => (
              <Link
                key={cat.path}
                href={cat.path}
                style={{
                  ...buttonStyle,
                  display: "block",
                  padding: "10px 24px 10px 40px",
                  fontSize: 14,
                  color: "#bbb"
                }}
                onClick={() => setMenuOpen(false)}
              >
                {cat.label}
              </Link>
            ))}
          </div>

          <a
            href="#contatti"
            style={{
              ...buttonStyle,
              display: "block",
              padding: "12px 24px",
              fontSize: 16,
              borderBottom: "1px solid #333"
            }}
            onClick={(e) => {
              e.preventDefault();
              setMenuOpen(false);
              setTimeout(() => {
                document.getElementById('contatti')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
          >
            Contatti
          </a>

          <button
            style={{
              ...buttonStyle,
              width: "100%",
              textAlign: "left",
              padding: "12px 24px",
              fontSize: 16,
              background: "none",
              border: "none",
              borderBottom: "1px solid #333",
              cursor: "pointer",
            }}
            onClick={() => {
              setSearchOpen(true);
              setMenuOpen(false);
            }}
          >
            Cerca
          </button>

          <Link
            href="/admin"
            style={{
              ...buttonStyle,
              display: "block",
              padding: "12px 24px",
              fontSize: 16,
            }}
            onClick={() => setMenuOpen(false)}
          >
            Admin
          </Link>
        </div>
      )}

      {/* Search Modal */}
      {searchOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            zIndex: 4000,
            padding: "clamp(32px, 8vw, 64px) 16px",
            overflowY: "auto",
          }}
          onClick={() => setSearchOpen(false)}
        >
          <div
            style={{
              width: "min(680px, 95vw)",
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 18px 50px rgba(0,0,0,0.2)",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Header */}
            <div style={{ padding: 24, borderBottom: "1px solid #eee" }}>
              <button
                onClick={() => setSearchOpen(false)}
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  background: "none",
                  border: "none",
                  fontSize: 28,
                  cursor: "pointer",
                  color: "#555",
                  lineHeight: 1,
                }}
                aria-label="Chiudi ricerca"
              >
                ×
              </button>
              <h2 style={{ margin: "0 0 16px", fontSize: 22, color: "#111" }}>
                Cerca articoli
              </h2>
              <input
                ref={inputRef}
                type="text"
                placeholder="Digita per cercare..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: 8,
                  border: "1px solid #ddd",
                  fontSize: 16,
                  outline: "none",
                }}
              />
            </div>

            {/* Search Results */}
            <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
              {searching && (
                <div style={{ padding: 24, textAlign: "center", color: "#666" }}>
                  Ricerca in corso...
                </div>
              )}

              {!searching && searchQuery.trim().length >= 2 && searchResults.length === 0 && (
                <div style={{ padding: 24, textAlign: "center", color: "#666" }}>
                  Nessun risultato trovato per "{searchQuery}"
                </div>
              )}

              {!searching && searchQuery.trim().length < 2 && (
                <div style={{ padding: 24, textAlign: "center", color: "#999", fontSize: 14 }}>
                  Inserisci almeno 2 caratteri per cercare
                </div>
              )}

              {!searching && searchResults.length > 0 && (
                <div>
                  <div style={{ padding: "12px 24px", fontSize: 13, color: "#999", borderBottom: "1px solid #f5f5f5" }}>
                    {searchResults.length} {searchResults.length === 1 ? "risultato" : "risultati"}
                  </div>
                  {searchResults.map((article) => (
                    <Link
                      key={article._id}
                      href={`/articoli/${article.category}/${article.id}`}
                      style={{
                        display: "block",
                        padding: "16px 24px",
                        borderBottom: "1px solid #f5f5f5",
                        textDecoration: "none",
                        color: "inherit",
                        transition: "background 0.2s",
                      }}
                      onClick={() => setSearchOpen(false)}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#f9f9f9"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                        {article.cover && article.cover.trim() !== "" && (
                          <div style={{
                            width: 80,
                            height: 60,
                            flexShrink: 0,
                            borderRadius: 4,
                            overflow: "hidden",
                            background: "#f0f0f0"
                          }}>
                            <Image
                              src={article.cover}
                              alt={article.title}
                              width={80}
                              height={60}
                              style={{ objectFit: "cover", width: "100%", height: "100%" }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          </div>
                        )}
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: 11,
                            textTransform: "uppercase",
                            letterSpacing: 1,
                            color: "#999",
                            marginBottom: 4
                          }}>
                            {highlightText(article.category, searchQuery)}
                          </div>
                          <h3 style={{
                            fontSize: 16,
                            margin: "0 0 4px",
                            fontWeight: 600,
                            lineHeight: 1.3,
                            color: "#111"
                          }}>
                            {highlightText(article.title, searchQuery)}
                          </h3>
                          {article.subtitle && (
                            <p style={{
                              fontSize: 13,
                              margin: "0 0 4px",
                              color: "#666",
                              lineHeight: 1.4
                            }}>
                              {highlightText(article.subtitle, searchQuery)}
                            </p>
                          )}
                          <div style={{ fontSize: 12, color: "#999" }}>
                            {highlightText(article.author, searchQuery)} • {article.date}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        @media (max-width: 768px) {
          .desktop-nav-mute {
            display: none !important;
          }
          .mobile-hamburger-mute,
          .mobile-search-mute {
            display: flex !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-hamburger-mute,
          .mobile-search-mute {
            display: none !important;
          }
        }
      `}} />
    </nav>
  );
}