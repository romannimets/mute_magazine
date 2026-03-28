"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (res.ok) {
                router.push("/admin");
                router.refresh();
            } else {
                const data = await res.json();
                setError(data.error || "Credenziali non valide");
            }
        } catch {
            setError("Errore di rete, riprova");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#fff",
            padding: "2rem",
        }}>
            <div style={{ width: "100%", maxWidth: 360 }}>
                <h1 style={{
                    fontFamily: "var(--font-mattone), Arial, sans-serif",
                    fontSize: "clamp(22px, 5vw, 32px)",
                    fontWeight: 400,
                    letterSpacing: "-0.02em",
                    marginBottom: "2.5rem",
                    textAlign: "center",
                }}>
                    MUTE / admin
                </h1>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        <label style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                            autoComplete="username"
                            style={{
                                border: "1px solid #000",
                                padding: "0.75rem 1rem",
                                fontSize: 15,
                                fontFamily: "inherit",
                                outline: "none",
                                background: "#fff",
                            }}
                        />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        <label style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                            style={{
                                border: "1px solid #000",
                                padding: "0.75rem 1rem",
                                fontSize: 15,
                                fontFamily: "inherit",
                                outline: "none",
                                background: "#fff",
                            }}
                        />
                    </div>

                    {error && (
                        <p style={{ fontSize: 13, color: "#c00", margin: 0 }}>{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: "0.5rem",
                            background: "#000",
                            color: "#fff",
                            border: "none",
                            padding: "0.85rem",
                            fontSize: 13,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            cursor: loading ? "not-allowed" : "pointer",
                            opacity: loading ? 0.6 : 1,
                            fontFamily: "inherit",
                        }}
                    >
                        {loading ? "Accesso..." : "Accedi"}
                    </button>
                </form>

                <p style={{ marginTop: "2rem", fontSize: 12, color: "#888", textAlign: "center" }}>
                    Prima volta? Usa admin / admin e cambia subito le credenziali.
                </p>
            </div>
        </main>
    );
}
