"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminImpostazioni() {
    const router = useRouter();
    const [currentUsername, setCurrentUsername] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [newUsername, setNewUsername] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [logoutLoading, setLogoutLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);

    useEffect(() => {
        const fetchCredentials = async () => {
            try {
                const res = await fetch("/api/admin/password");
                const data = await res.json();

                if (res.ok) {
                    setCurrentUsername(data.username);
                    setCurrentPassword(data.password);
                    setNewUsername(data.username);
                } else {
                    setStatus({ type: "error", msg: data.error || "Errore caricamento credenziali" });
                }
            } catch {
                setStatus({ type: "error", msg: "Errore di rete" });
            } finally {
                setFetchLoading(false);
            }
        };

        fetchCredentials();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus(null);
        setLoading(true);

        try {
            const res = await fetch("/api/admin/password", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newUsername, newPassword }),
            });
            const data = await res.json();

            if (res.ok) {
                setStatus({ type: "success", msg: "Credenziali aggiornate. Reindirizzamento al login..." });
                setTimeout(async () => {
                    await fetch("/api/admin/logout", { method: "POST" });
                    router.push("/admin/login");
                }, 2000);
            } else {
                setStatus({ type: "error", msg: data.error || "Errore aggiornamento" });
            }
        } catch {
            setStatus({ type: "error", msg: "Errore di rete" });
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        setLogoutLoading(true);
        await fetch("/api/admin/logout", { method: "POST" });
        router.push("/admin/login");
    };

    const inputStyle: React.CSSProperties = {
        border: "1px solid #000",
        padding: "0.7rem 0.9rem",
        fontSize: 14,
        fontFamily: "inherit",
        outline: "none",
        background: "#fff",
        width: "100%",
        boxSizing: "border-box"
    };

    const readonlyInputStyle: React.CSSProperties = {
        ...inputStyle,
        background: "#f5f5f5",
        color: "#555",
        cursor: "not-allowed",
        display: "flex",
        alignItems: "center",
        minHeight: "44px"
    };

    const labelStyle: React.CSSProperties = {
        fontSize: 11,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        marginBottom: 4,
        display: "block",
    };

    const EyeIcon = ({ open }: { open: boolean }) => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
                <>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                </>
            ) : (
                <>
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                </>
            )}
        </svg>
    );

    if (fetchLoading) {
        return (
            <main style={{ maxWidth: 520, margin: "0 auto", padding: "3rem 1.5rem", textAlign: "center" }}>
                <p>Caricamento impostazioni...</p>
            </main>
        );
    }

    return (
        <main style={{ maxWidth: 520, margin: "0 auto", padding: "3rem 1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2.5rem" }}>
                <Link href="/admin" style={{ fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase", textDecoration: "underline" }}>
                    ← Dashboard
                </Link>
                <button
                    onClick={handleLogout}
                    disabled={logoutLoading}
                    style={{ background: "none", border: "1px solid #000", padding: "0.4rem 1rem", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit" }}
                >
                    {logoutLoading ? "..." : "Logout"}
                </button>
            </div>

            <h1 style={{ fontSize: "clamp(20px, 4vw, 28px)", fontWeight: 400, marginBottom: "2rem" }}>
                Impostazioni account
            </h1>

            {/* Credenziali attuali */}
            <div style={{
                background: "#f9f9f9",
                padding: "1.5rem",
                marginBottom: "2rem",
                border: "1px solid #eee",
                borderRadius: "4px"
            }}>
                <h2 style={{ fontSize: "14px", fontWeight: 500, marginBottom: "1rem", letterSpacing: "0.05em" }}>
                    Credenziali attuali
                </h2>

                <div style={{ marginBottom: "1rem" }}>
                    <label style={labelStyle}>Username</label>
                    <div style={readonlyInputStyle}>
                        {currentUsername}
                    </div>
                </div>

                <div>
                    <label style={labelStyle}>Password</label>
                    <div style={{ position: "relative" }}>
                        <div style={readonlyInputStyle}>
                            {showPassword ? currentPassword : "•".repeat(currentPassword.length || 8)}
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            style={{
                                position: "absolute",
                                right: 10,
                                top: "50%",
                                transform: "translateY(-50%)",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                padding: 4,
                                color: "#666",
                                display: "flex",
                                alignItems: "center",
                            }}
                        >
                            <EyeIcon open={showPassword} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modifica credenziali */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                <h2 style={{ fontSize: "14px", fontWeight: 500, marginBottom: "0.5rem", letterSpacing: "0.05em" }}>
                    Modifica credenziali
                </h2>

                <div>
                    <label style={labelStyle}>Nuovo username *</label>
                    <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        required
                        style={inputStyle}
                        autoComplete="username"
                    />
                </div>

                <div>
                    <label style={labelStyle}>Nuova password * (min. 6 caratteri)</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                        style={inputStyle}
                        autoComplete="new-password"
                        placeholder="Inserisci nuova password"
                    />
                </div>

                {status && (
                    <p style={{
                        fontSize: 13,
                        padding: "0.7rem 1rem",
                        background: status.type === "success" ? "#f0fff0" : "#fff0f0",
                        border: `1px solid ${status.type === "success" ? "#090" : "#c00"}`,
                        color: status.type === "success" ? "#060" : "#c00",
                        margin: 0,
                    }}>
                        {status.msg}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        background: "#000", color: "#fff", border: "none",
                        padding: "0.85rem", fontSize: 12, letterSpacing: "0.1em",
                        textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer",
                        opacity: loading ? 0.6 : 1, fontFamily: "inherit", marginTop: "0.5rem",
                    }}
                >
                    {loading ? "Salvataggio..." : "Aggiorna credenziali"}
                </button>
            </form>
        </main>
    );
}