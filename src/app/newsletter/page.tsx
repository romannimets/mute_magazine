"use client";

import { useState } from "react";
import Link from "next/link";

export default function NewsletterPage() {
    const [email, setEmail] = useState("");
    const [consent, setConsent] = useState(false);
    const [status, setStatus] = useState<"idle" | "loading" | "ok" | "exists" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setErrorMsg("");

        try {
            const res = await fetch("/api/newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, consent }),
            });
            const data = await res.json();

            if (!res.ok) { setErrorMsg(data.error || "Errore"); setStatus("error"); return; }
            if (data.alreadySubscribed) { setStatus("exists"); return; }
            setStatus("ok");
        } catch {
            setErrorMsg("Errore di connessione.");
            setStatus("error");
        }
    };

    return (
        <main style={{ background: "#fff", minHeight: "100vh" }}>

            {/* ── Header nero ── */}
            <div style={{
                background: "#000",
                padding: "clamp(56px, 10vw, 96px) clamp(20px, 6vw, 64px) clamp(40px, 7vw, 72px)",
            }}>
                <p style={{
                    fontFamily: "var(--font-mattone), Arial, sans-serif",
                    fontSize: "clamp(10px, 2vw, 12px)",
                    fontWeight: 700,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "#666",
                    marginBottom: 16,
                }}>
                    Resta in ascolto
                </p>
                <h1 style={{
                    fontFamily: "var(--font-mattone), Arial, sans-serif",
                    fontSize: "clamp(40px, 9vw, 88px)",
                    fontWeight: 700,
                    lineHeight: 0.95,
                    color: "#fff",
                    margin: 0,
                }}>
                    Newsletter
                </h1>
            </div>

            {/* ── Form ── */}
            <div style={{
                maxWidth: 560,
                margin: "0 auto",
                padding: "clamp(48px, 9vw, 80px) clamp(20px, 5vw, 40px)",
            }}>

                {status === "ok" ? (
                    /* ── Stato: iscritto ── */
                    <div style={{ textAlign: "center" }}>
                        <div style={{
                            fontSize: "clamp(32px, 8vw, 56px)",
                            marginBottom: 20,
                        }}>
                            ✓
                        </div>
                        <p style={{
                            fontFamily: "'EB Garamond', Georgia, serif",
                            fontSize: "clamp(16px, 3vw, 22px)",
                            lineHeight: 1.6,
                            color: "#111",
                            marginBottom: 32,
                        }}>
                            Sei dentro. Ti scriveremo quando c'è qualcosa che vale la pena leggere.
                        </p>
                        <Link href="/" style={{
                            fontFamily: "var(--font-mattone), Arial, sans-serif",
                            fontSize: "clamp(12px, 2.2vw, 14px)",
                            fontWeight: 700,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            borderBottom: "1px solid #111",
                            paddingBottom: 2,
                        }}>
                            Torna alla home
                        </Link>
                    </div>
                ) : status === "exists" ? (
                    /* ── Stato: già iscritto ── */
                    <div style={{ textAlign: "center" }}>
                        <p style={{
                            fontFamily: "'EB Garamond', Georgia, serif",
                            fontSize: "clamp(16px, 3vw, 20px)",
                            lineHeight: 1.6,
                            color: "#555",
                            marginBottom: 32,
                        }}>
                            Questa email è già iscritta. Ci sei già, non ti perdere niente.
                        </p>
                        <Link href="/" style={{
                            fontFamily: "var(--font-mattone), Arial, sans-serif",
                            fontSize: "clamp(12px, 2.2vw, 14px)",
                            fontWeight: 700,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            borderBottom: "1px solid #111",
                            paddingBottom: 2,
                        }}>
                            Torna alla home
                        </Link>
                    </div>
                ) : (
                    /* ── Form iscrizione ── */
                    <>
                        <p style={{
                            fontFamily: "'EB Garamond', Georgia, serif",
                            fontSize: "clamp(16px, 3vw, 20px)",
                            lineHeight: 1.7,
                            color: "#333",
                            marginBottom: "clamp(32px, 6vw, 48px)",
                        }}>
                            Niente spam. Solo i pezzi che vale la pena leggere,
                            quando sono pronti.
                        </p>

                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                            {/* Email */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                <label style={{
                                    fontFamily: "var(--font-mattone), Arial, sans-serif",
                                    fontSize: "clamp(11px, 2vw, 13px)",
                                    fontWeight: 700,
                                    letterSpacing: "0.12em",
                                    textTransform: "uppercase",
                                    color: "#111",
                                }}>
                                    La tua email
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="tuaemail@esempio.com"
                                    style={{
                                        padding: "clamp(12px, 2.5vw, 16px) clamp(14px, 3vw, 18px)",
                                        border: "1px solid #ddd",
                                        borderRadius: 0,
                                        fontSize: "clamp(15px, 3vw, 17px)",
                                        outline: "none",
                                        fontFamily: "'EB Garamond', Georgia, serif",
                                        width: "100%",
                                        boxSizing: "border-box",
                                        transition: "border-color 0.15s",
                                    }}
                                    onFocus={(e) => e.currentTarget.style.borderColor = "#111"}
                                    onBlur={(e) => e.currentTarget.style.borderColor = "#ddd"}
                                />
                            </div>

                            {/* Consenso GDPR */}
                            <label style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 12,
                                cursor: "pointer",
                            }}>
                                <input
                                    type="checkbox"
                                    required
                                    checked={consent}
                                    onChange={(e) => setConsent(e.target.checked)}
                                    style={{ marginTop: 3, flexShrink: 0, width: 16, height: 16, cursor: "pointer" }}
                                />
                                <span style={{
                                    fontFamily: "'EB Garamond', Georgia, serif",
                                    fontSize: "clamp(12px, 2.2vw, 14px)",
                                    lineHeight: 1.6,
                                    color: "#666",
                                }}>
                                    Acconsento al trattamento dei miei dati personali per ricevere la newsletter di Mute Rivista,
                                    in conformità al GDPR (Reg. UE 2016/679). Potrò disiscrivermi in qualsiasi momento.
                                </span>
                            </label>

                            {/* Errore */}
                            {status === "error" && (
                                <p style={{ color: "#dc2626", fontSize: 14, margin: 0 }}>{errorMsg}</p>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={status === "loading"}
                                style={{
                                    padding: "clamp(13px, 2.5vw, 17px)",
                                    background: status === "loading" ? "#999" : "#000",
                                    color: "#fff",
                                    border: "none",
                                    fontFamily: "var(--font-mattone), Arial, sans-serif",
                                    fontWeight: 700,
                                    fontSize: "clamp(13px, 2.2vw, 15px)",
                                    letterSpacing: "0.1em",
                                    textTransform: "uppercase",
                                    cursor: status === "loading" ? "not-allowed" : "pointer",
                                    transition: "background 0.15s",
                                }}
                                onMouseEnter={(e) => { if (status !== "loading") e.currentTarget.style.background = "#333"; }}
                                onMouseLeave={(e) => { if (status !== "loading") e.currentTarget.style.background = "#000"; }}
                            >
                                {status === "loading" ? "Invio..." : "Iscriviti"}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </main>
    );
}