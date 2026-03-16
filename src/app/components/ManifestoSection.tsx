import Image from "next/image";

interface ManifestoSectionProps {
    content: string;
}

function HighlightedText({ text }: { text: string }) {
    const paragraphs = text.split(/\n\s*\n/);

    return (
        <div
            style={{
                lineHeight: 1.5,
                fontFamily: "'Garamond', 'EB Garamond', 'Cormorant Garamond', Georgia, serif",
            }}
        >
            {paragraphs.map((para, i) => (
                <div key={i} style={{ marginBottom: i < paragraphs.length - 1 ? "1.6em" : 0 }}>
                    <span
                        style={{
                            background: "#86DF2C",
                            color: "#000",
                            fontWeight: 400,
                            /*
                              Mobile: 14px, cresce con il viewport.
                              Da 768px in su il clamp sale fino a 28px
                              grazie al valore intermedio più alto (3vw).
                            */
                            fontSize: "clamp(14px, 3vw, 28px)",
                            fontFamily: "'Garamond', 'EB Garamond', 'Cormorant Garamond', Georgia, serif",
                            /*
                              padding verticale leggermente aumentato su desktop
                              (usa em così scala col font)
                            */
                            padding: "0.38em 6px",
                            WebkitBoxDecorationBreak: "clone",
                            boxDecorationBreak: "clone",
                            whiteSpace: "pre-line",
                            /*
                              line-height 1 → righe verdi continue su mobile.
                              Su desktop lo aumentiamo via classe CSS (vedi globals).
                            */
                            lineHeight: 1,
                            display: "inline",
                        } as React.CSSProperties}
                        className="manifesto-highlight"
                    >
                        {para.trim()}
                    </span>
                </div>
            ))}
        </div>
    );
}

const DEFAULT_CONTENT = `Mute non urla, ma si fa sentire.
Nasce dalle frasi pensate in metro, 
dalle orecchie sui libri,
dalle sbronze che diventano idee, 
dal bisogno di non annegare nel chiasso. 
Inutile, ma necessario. Senza pretese.
O forse un po' sì.
Solo la presunzione di essere letto.

Far sentire la propria voce, immergersi 
nel sottofondo e ascoltare le risonanze. 
Fare la cultura, senza che nessuno
lo abbia mai chiesto.`;

export default function ManifestoSection({ content }: ManifestoSectionProps) {
    const text = content || DEFAULT_CONTENT;

    return (
        <section
            style={{
                position: "relative",
                width: "100%",
                marginTop: "clamp(48px, 8vw, 80px)",
            }}
        >
            <div className="manifesto-new__bg--mobile" style={{ position: "relative", width: "100%" }}>
                <Image
                    src="/manifesto_mobile.png"
                    alt="Manifesto Mute"
                    width={0}
                    height={0}
                    sizes="100vw"
                    style={{ width: "100%", height: "auto", display: "block" }}
                    priority
                />
            </div>

            <div className="manifesto-new__bg--desktop" style={{ position: "relative", width: "100%" }}>
                <Image
                    src="/manifesto_desktop.png"
                    alt="Manifesto Mute"
                    width={0}
                    height={0}
                    sizes="100vw"
                    style={{ width: "100%", height: "auto", display: "block" }}
                    priority
                />
            </div>

            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "clamp(24px, 5vw, 60px)",
                }}
            >
                <div style={{ maxWidth: "clamp(280px, 55%, 620px)" }}>
                    <HighlightedText text={text} />
                </div>
            </div>
        </section>
    );
}