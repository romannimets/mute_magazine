"use client";
import { useEffect, useState } from "react";

interface AnalyticsRow { dimensions: string[]; metrics: string[]; }
interface AnalyticsData { rows: AnalyticsRow[]; totals: string[]; }

type Tab = "overview" | "pages" | "sources";

// ─── Etichette sorgenti ────────────────────────────────────────────────────────
const CHANNEL_LABELS: Record<string, string> = {
    "Organic Search": "🔍 Ricerca organica",
    "Direct": "🔗 Diretto",
    "Referral": "↗️ Referral",
    "Organic Social": "📱 Social",
    "Email": "📧 Email",
    "Unassigned": "❓ Non assegnato",
    "Paid Search": "💰 Ricerca a pagamento",
    "Display": "🖼️ Display",
};

// ─── Tooltip metriche panoramica ──────────────────────────────────────────────
const METRIC_TOOLTIPS: Record<string, string> = {
    "Utenti attivi": "Persone distinte che hanno visitato il sito nel periodo. Se uno stesso utente torna più volte, conta comunque come 1.",
    "Sessioni": "Numero totale di visite. Uno stesso utente può fare più sessioni in giorni diversi. Sessioni > Utenti significa che qualcuno è tornato — ottimo segno.",
    "Pagine viste": "Quante pagine sono state aperte in totale. Un utente che legge 3 articoli genera 3 pagine viste. Più è alto rispetto alle sessioni, meglio è.",
    "Freq. rimbalzo": "Percentuale di visite in cui l'utente ha visto solo una pagina e non ha interagito. Per un blog, 60–80% è del tutto normale: chi trova l'articolo che cercava lo legge e va via soddisfatto.",
    "Durata media": "Tempo medio trascorso sul sito per sessione. Google Analytics tende a sottostimarla leggermente. Per contenuti editoriali, 1–3 minuti è nella norma.",
};

// ─── Tooltip sorgenti ─────────────────────────────────────────────────────────
const SOURCE_TOOLTIPS: Record<string, string> = {
    "🔍 Ricerca organica": "Utenti arrivati cliccando su Google (o altri motori) senza annunci a pagamento. È la fonte più preziosa a lungo termine.",
    "🔗 Diretto": "Chi ha digitato l'URL direttamente, usato un bookmark, o cliccato da WhatsApp/Telegram (che non trasmettono la fonte). Sono i tuoi lettori affezionati.",
    "↗️ Referral": "Utenti arrivati cliccando un link su un altro sito che punta al tuo. Indica che qualcuno vi ha citati.",
    "📱 Social": "Click da Facebook, Instagram, Twitter, LinkedIn ecc.",
    "📧 Email": "Click da campagne email o newsletter tracciate con parametri UTM.",
    "❓ Non assegnato": "Google Analytics non ha saputo determinare la fonte. Comune nelle prime settimane o quando mancano dati di sessione completi. Diminuirà col tempo.",
    "💰 Ricerca a pagamento": "Visite da annunci Google Ads o simili.",
    "🖼️ Display": "Visite da banner pubblicitari.",
};

// ─── Componente Tooltip ───────────────────────────────────────────────────────
function Tooltip({ text, dir = "up" }: { text: string; dir?: "up" | "down" }) {
    const [show, setShow] = useState(false);
    return (
        <span style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
            <span
                onMouseEnter={() => setShow(true)}
                onMouseLeave={() => setShow(false)}
                style={{ cursor: "help", color: "#bbb", fontSize: 11, userSelect: "none", lineHeight: 1 }}
            >
                ⓘ
            </span>
            {show && (
                <span style={{
                    position: "absolute",
                    ...(dir === "up"
                        ? { bottom: "calc(100% + 6px)" }
                        : { top: "calc(100% + 6px)" }),
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "#222", color: "#fff", fontSize: 12, lineHeight: 1.5,
                    padding: "8px 12px", borderRadius: 6, zIndex: 1000,
                    width: 220, boxShadow: "0 2px 10px rgba(0,0,0,0.25)",
                    pointerEvents: "none", whiteSpace: "normal",
                }}>
                    {text}
                </span>
            )}
        </span>
    );
}

// ─── MetricCard ───────────────────────────────────────────────────────────────
function MetricCard({ label, value, color }: { label: string; value: string; color: string }) {
    const tip = METRIC_TOOLTIPS[label];
    return (
        <div style={{ background: "#fafafa", borderRadius: 8, padding: "14px 16px", borderLeft: `4px solid ${color}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {label}
                </span>
                {tip && <Tooltip text={tip} />}
            </div>
            <span style={{ fontSize: 22, fontWeight: 700, color: "#111", lineHeight: 1.2, display: "block" }}>
                {value}
            </span>
        </div>
    );
}

// ─── Widget principale ────────────────────────────────────────────────────────
export default function AnalyticsWidget() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [period, setPeriod] = useState("30daysAgo");
    const [tab, setTab] = useState<Tab>("overview");

    const fetchData = async (selectedPeriod: string, selectedTab: Tab) => {
        setLoading(true);
        setError(null);
        setData(null);
        try {
            const res = await fetch("/api/analytics", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: selectedTab, startDate: selectedPeriod }),
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Errore sconosciuto");
            }
            setData(await res.json());
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(period, tab); }, [period, tab]);

    const fmt = (n: string) => {
        const num = parseFloat(n);
        if (isNaN(num)) return "—";
        if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
        if (num >= 1_000) return (num / 1_000).toFixed(1) + "k";
        return num.toFixed(0);
    };
    const fmtDuration = (s: string) => {
        const n = parseFloat(s);
        if (isNaN(n)) return "—";
        return `${Math.floor(n / 60)}m ${Math.floor(n % 60)}s`;
    };
    const fmtPct = (n: string) => {
        const num = parseFloat(n);
        return isNaN(num) ? "—" : num.toFixed(1) + "%";
    };

    const pagesPerSession = (data && data.totals[1] && data.totals[2])
        ? (parseFloat(data.totals[2]) / parseFloat(data.totals[1])).toFixed(1)
        : null;

    return (
        <div style={{ padding: 20, background: "#fff", border: "1px solid #ddd", borderRadius: 8, maxWidth: "100%", boxSizing: "border-box" }}>

            {/* ── Header ── */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 18 }}>📊 Google Analytics</h3>
                <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    style={{ padding: "6px 10px", border: "1px solid #ddd", borderRadius: 6, fontSize: 13 }}
                >
                    <option value="7daysAgo">Ultimi 7 giorni</option>
                    <option value="30daysAgo">Ultimi 30 giorni</option>
                    <option value="90daysAgo">Ultimi 90 giorni</option>
                </select>
            </div>

            {/* ── Tab ── */}
            <div style={{ display: "flex", gap: 4, marginBottom: 16, borderBottom: "1px solid #eee", paddingBottom: 12 }}>
                {(["overview", "pages", "sources"] as Tab[]).map((t) => (
                    <button key={t} onClick={() => setTab(t)} style={{
                        padding: "6px 14px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 13,
                        background: tab === t ? "#111" : "#f3f3f3",
                        color: tab === t ? "#fff" : "#555",
                        fontWeight: tab === t ? 600 : 400,
                    }}>
                        {t === "overview" ? "Panoramica" : t === "pages" ? "Pagine" : "Sorgenti"}
                    </button>
                ))}
            </div>

            {/* ── Descrizione tab corrente ── */}
            <div style={{ fontSize: 12, color: "#888", marginBottom: 14, lineHeight: 1.5 }}>
                {tab === "overview" && "Riepilogo generale del traffico nel periodo selezionato. Passa il mouse su ⓘ per spiegazioni."}
                {tab === "pages" && "Le pagine più visitate del sito, ordinate per numero di visualizzazioni. Le righe in grigio (/admin) sono visite tue, non dei lettori."}
                {tab === "sources" && "Da dove arrivano i tuoi lettori. Più sorgenti diversificate = sito più robusto e meno dipendente da un solo canale."}
            </div>

            {/* ── Loading ── */}
            {loading && (
                <div style={{ padding: 32, textAlign: "center" }}>
                    <div style={{
                        width: 28, height: 28, border: "3px solid #f3f3f3",
                        borderTop: "3px solid #111", borderRadius: "50%",
                        animation: "spin 1s linear infinite", margin: "0 auto",
                    }} />
                    <p style={{ marginTop: 10, color: "#999", fontSize: 13 }}>Caricamento...</p>
                </div>
            )}

            {/* ── Errore ── */}
            {error && !loading && (
                <div style={{ padding: 14, background: "#fff0f0", border: "1px solid #fcc", borderRadius: 6, color: "#c00", fontSize: 13 }}>
                    ⚠️ {error}
                </div>
            )}

            {/* ── Tab: Panoramica ── */}
            {data && !loading && tab === "overview" && (
                <div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 16 }}>
                        <MetricCard label="Utenti attivi" value={fmt(data.totals[0] || "0")} color="#0066cc" />
                        <MetricCard label="Sessioni" value={fmt(data.totals[1] || "0")} color="#009688" />
                        <MetricCard label="Pagine viste" value={fmt(data.totals[2] || "0")} color="#e65100" />
                        <MetricCard label="Freq. rimbalzo" value={fmtPct(data.totals[3] || "0")} color="#7b1fa2" />
                        <MetricCard label="Durata media" value={fmtDuration(data.totals[4] || "0")} color="#00695c" />
                    </div>

                    {/* Pagine per sessione */}
                    {pagesPerSession && (
                        <div style={{ background: "#f9fafb", borderRadius: 8, padding: "12px 16px", fontSize: 13, color: "#555", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                            <span>
                                📄 Pagine per sessione: <strong style={{ color: "#111" }}>{pagesPerSession}</strong>
                            </span>
                            <Tooltip text="Quante pagine visita in media ogni utente per sessione. Più è alto, più i lettori esplorano il sito oltre al primo articolo." />
                        </div>
                    )}

                    {/* Nota interpretativa bounce rate */}
                    {data.totals[3] && (
                        <div style={{ fontSize: 12, color: "#888", padding: "10px 14px", background: "#fffbe6", borderRadius: 6, borderLeft: "3px solid #f5c518" }}>
                            💡 <strong>Frequenza di rimbalzo al {fmtPct(data.totals[3])}:</strong>{" "}
                            {parseFloat(data.totals[3]) > 80
                                ? "Alta, ma per un blog è normale. Chi legge un articolo e va via soddisfatto \"rimbalza\" comunque."
                                : parseFloat(data.totals[3]) > 55
                                    ? "Nella media per un sito editoriale. Buon equilibrio tra lettori occasionali e chi esplora."
                                    : "Ottima! Molti lettori navigano più pagine dopo la prima."}
                        </div>
                    )}
                </div>
            )}

            {/* ── Tab: Pagine ── */}
            {data && !loading && tab === "pages" && (
                <div style={{ width: "100%", overflow: "visible" }}>
                    {data.rows.filter(row => row.dimensions?.[0] && !row.dimensions[0].startsWith("/api/")).length === 0 ? (
                        <p style={{ color: "#999", fontSize: 13, textAlign: "center", padding: 24 }}>Nessun dato disponibile per questo periodo.</p>
                    ) : (
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, tableLayout: "fixed" }}>
                            <colgroup>
                                <col style={{ width: "62%" }} />
                                <col style={{ width: "19%" }} />
                                <col style={{ width: "19%" }} />
                            </colgroup>
                            <thead>
                                <tr style={{ borderBottom: "2px solid #eee" }}>
                                    <th style={{ textAlign: "left", padding: "6px 8px", color: "#666", fontWeight: 600 }}>
                                        Pagina
                                    </th>
                                    <th style={{ textAlign: "right", padding: "6px 8px", color: "#666", fontWeight: 600 }}>
                                        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                                            Visite <Tooltip text="Visualizzazioni totali della pagina, incluse le rivisitazioni dello stesso utente." dir="down" />
                                        </span>
                                    </th>
                                    <th style={{ textAlign: "right", padding: "6px 8px", color: "#666", fontWeight: 600 }}>
                                        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                                            Utenti <Tooltip text="Persone distinte che hanno visitato questa pagina. Se visite >> utenti, la pagina viene riletta più volte." dir="down" />
                                        </span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.rows
                                    .filter(row => row.dimensions?.[0] && !row.dimensions[0].startsWith("/api/"))
                                    .map((row, i) => {
                                        const isAdmin = row.dimensions[0].startsWith("/admin");
                                        return (
                                            <tr key={i} style={{ borderBottom: "1px solid #f3f3f3", opacity: isAdmin ? 0.45 : 1 }}>
                                                <td style={{ padding: "8px 8px", overflow: "hidden" }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                                        <div style={{ fontWeight: 500, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                            {row.dimensions[1] || row.dimensions[0]}
                                                        </div>
                                                        {isAdmin && (
                                                            <span style={{ fontSize: 10, background: "#f3f3f3", color: "#999", padding: "1px 5px", borderRadius: 4, whiteSpace: "nowrap", flexShrink: 0 }}>
                                                                admin
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div style={{ fontSize: 11, color: "#aaa", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                        {row.dimensions[0]}
                                                    </div>
                                                </td>
                                                <td style={{ textAlign: "right", padding: "8px 8px", fontWeight: 600, color: "#111" }}>
                                                    {fmt(row.metrics[0])}
                                                </td>
                                                <td style={{ textAlign: "right", padding: "8px 8px", color: "#555" }}>
                                                    {fmt(row.metrics[1])}
                                                </td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* ── Tab: Sorgenti ── */}
            {data && !loading && tab === "sources" && (
                <div>
                    {data.rows.length === 0 ? (
                        <p style={{ color: "#999", fontSize: 13, textAlign: "center", padding: 24 }}>Nessun dato disponibile per questo periodo.</p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {data.rows.map((row, i) => {
                                const rawLabel = row.dimensions[0];
                                const label = CHANNEL_LABELS[rawLabel] || rawLabel;
                                const tip = SOURCE_TOOLTIPS[label];
                                const sessions = parseInt(row.metrics[0]) || 0;
                                const maxSessions = parseInt(data.rows[0]?.metrics[0]) || 1;
                                const pct = Math.round((sessions / maxSessions) * 100);
                                return (
                                    <div key={i}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, marginBottom: 5 }}>
                                            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontWeight: 500 }}>
                                                {label}
                                                {tip && <Tooltip text={tip} />}
                                            </span>
                                            <span style={{ color: "#555", fontSize: 12 }}>
                                                <strong style={{ color: "#111" }}>{fmt(row.metrics[0])}</strong> sessioni
                                                <span style={{ color: "#bbb", marginLeft: 6 }}>· {fmt(row.metrics[1])} utenti</span>
                                            </span>
                                        </div>
                                        <div style={{ background: "#f3f3f3", borderRadius: 4, height: 6 }}>
                                            <div style={{
                                                background: i === 0 ? "#111" : "#aaa",
                                                borderRadius: 4, height: 6,
                                                width: `${pct}%`,
                                                transition: "width 0.4s",
                                            }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div style={{ marginTop: 16, fontSize: 12, color: "#888", padding: "10px 14px", background: "#f0f7ff", borderRadius: 6, borderLeft: "3px solid #0066cc" }}>
                        💡 <strong>Come leggere questo grafico:</strong> le barre sono proporzionali alla sorgente principale.
                        Avere "Ricerca organica" come prima fonte è il segnale più positivo per la crescita organica del sito.
                        "Diretto" alto indica un pubblico fedele che torna autonomamente.
                    </div>
                </div>
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}