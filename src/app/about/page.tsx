"use client";

import { useRef, useState } from "react";

const MUTERS = [
  {
    name: "Luca Paggi",
    bio: "Sceso dai monti lecchesi tutte le strade portano a Nolo. Dopo mille peripezie diventa definitivamente un noler e decide di partecipare alla rivista perché fa parte dello starter pack di un noler.",
  },
  {
    name: "Marco Speroni",
    bio: "Usa il magazine come terapia personale per smettere di ammorbare la gente con aneddoti su tutti i film che vede, che sono più di quelli proiettati a Cannes. Ma ora sarà anche peggio: basterà inoltrare un link.",
  },
  {
    name: "Veronica Caiani",
    bio: "Stanca di pubblicare foto di libri su Instagram decide di partecipare al progetto portando le sue idee da copywriter indie. Chissà se un giorno anche Mute magazine sarà degno di essere pubblicato tra le citazioni dei libri alternativi che tanto la appassionano.",
  },
];

const COLLAB_TEXT =
  "Collaborano o hanno collaborato con MUTE: Asteriscollettivo, Roman Nimets, Tommaso Galloni";

const G: React.CSSProperties = {
  fontFamily: "'EB Garamond', 'Garamond', Georgia, serif",
  fontWeight: 500,
};
const M: React.CSSProperties = {
  fontFamily: "var(--font-mattone), Arial, sans-serif",
};

// px di padding orizzontale della sezione blu (specchiato per il bleed)
const SECTION_PAD = "clamp(20px, 6vw, 64px)";

function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  const toggleMute = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  return (
    <div style={{ position: "relative", width: "100%", border: "1px solid #333", background: "#000" }}>
      <video
        ref={videoRef}
        src="/about_us.mp4"
        autoPlay
        muted
        loop
        playsInline
        style={{ display: "block", width: "100%", height: "auto" }}
      />

      {/* Icona audio — angolo in basso a destra, quasi invisibile */}
      <button
        onClick={toggleMute}
        onTouchEnd={toggleMute}
        aria-label={muted ? "Attiva audio" : "Disattiva audio"}
        style={{
          position: "absolute",
          bottom: 12,
          right: 12,
          background: "rgba(255,255,255,0.08)",
          border: "none",
          borderRadius: 0,
          width: 28,
          height: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          padding: 0,
          opacity: 0.35,
          transition: "opacity 0.2s",
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
        onMouseLeave={e => (e.currentTarget.style.opacity = "0.35")}
      >
        {muted ? (
          /* speaker muted */
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        ) : (
          /* speaker on */
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
        )}
      </button>
    </div>
  );
}

export default function About() {
  return (
    <main style={{ background: "#fff" }}>

      {/* ── SEZIONE NERA ── */}
      <section
        style={{
          background: "#0a0a0a",
          color: "#fff",
          padding: `clamp(56px, 10vw, 100px) ${SECTION_PAD} clamp(48px, 8vw, 80px)`,
          display: "flex",
          flexDirection: "column",
          gap: "clamp(28px, 5vw, 48px)",
        }}
      >
        {/* Titolo */}
        <h1 style={{
          ...M,
          fontSize: "clamp(48px, 10vw, 100px)",
          fontWeight: 700,
          lineHeight: 0.95,
          margin: 0,
        }}>
          About Us
        </h1>

        {/* Video — subito sotto il titolo */}
        <VideoPlayer />

        {/* Paragrafo: solo "Mute Rivista" in grassetto */}
        <p style={{
          ...G,
          fontSize: "clamp(15px, 2.2vw, 20px)",
          lineHeight: 1.7,
          margin: 0,
          maxWidth: 820,
          color: "#fff",
          fontWeight: 400,
        }}>
          <strong style={{ fontWeight: 700 }}>Mute Rivista</strong>{" "}
          prende vita a Milano nel 2026 da tre pseudo-intellettuali con la voglia di raccontarsi.
          Amplifica le voci soffocate dal mainstream. Vuole raccontare le curiosità che squarciano
          lo scroll infinito e ti fanno dire "ma davvero?". I muti finalmente parlano: Mute dà voce
          a chi finora ha letto in silenzio, tra aneddoti culturali, riflessioni sentenziose e
          storie rimaste in sospeso.
        </p>
      </section>

      {/* ── SEZIONE BLU: I Muters ── */}
      <section
        style={{
          background: "#0051e8",
          color: "#fff",
          padding: `clamp(40px, 7vw, 72px) ${SECTION_PAD} clamp(40px, 7vw, 72px)`,
        }}
      >
        <h2 style={{
          ...M,
          fontSize: "clamp(28px, 5.5vw, 56px)",
          fontWeight: 700,
          margin: 0,
          marginBottom: "clamp(28px, 5vw, 48px)",
        }}>
          I muters
        </h2>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {MUTERS.map((muter, i) => (
            <div
              key={muter.name}
              style={{
                /* bleed orizzontale: i bordi arrivano ai margini pagina */
                marginLeft: `calc(-1 * ${SECTION_PAD})`,
                marginRight: `calc(-1 * ${SECTION_PAD})`,
                padding: `clamp(22px, 4vw, 40px) ${SECTION_PAD}`,
                borderTop: "2px solid rgba(255,255,255,0.6)",
                borderBottom: i === MUTERS.length - 1
                  ? "2px solid rgba(255,255,255,0.6)"
                  : "none",
                display: "flex",
                flexDirection: "column",
                gap: "clamp(10px, 2vw, 16px)",
              }}
            >
              <h3 style={{
                ...M,
                fontSize: "clamp(20px, 3.5vw, 32px)",
                fontWeight: 700,
                margin: 0,
              }}>
                {muter.name}
              </h3>
              <p style={{
                ...G,
                fontSize: "clamp(14px, 2vw, 18px)",
                lineHeight: 1.7,
                margin: 0,
                color: "rgba(255,255,255,0.88)",
                maxWidth: 680,
              }}>
                {muter.bio}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOTO FULL WIDTH ── */}
      <div style={{ lineHeight: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/about_us.jpg"
          alt="Mute team"
          style={{ display: "block", width: "100%", height: "auto" }}
        />
      </div>

      {/* ── SEZIONE ARANCIONE ── */}
      <section style={{
        background: "#e78d1a",
        display: "flex",
        justifyContent: "center",
        padding: `clamp(28px, 5vw, 48px) ${SECTION_PAD}`,
      }}>
        <p style={{
          ...G,
          fontSize: "clamp(14px, 2vw, 18px)",
          lineHeight: 1.75,
          color: "#fff",
          margin: 0,
          maxWidth: "min(680px, 80%)",
        }}>
          {COLLAB_TEXT}
        </p>
      </section>

    </main>
  );
}