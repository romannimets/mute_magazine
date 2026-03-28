/**
 * Calcola il tempo di lettura stimato da un blocco EditorJS.
 * Ritorna una stringa tipo "3 min" oppure "< 1 min".
 */
export function readingTime(content: any): string {
    const WORDS_PER_MINUTE = 200;

    let text = "";

    try {
        let parsed = content;
        if (typeof content === "string") {
            parsed = JSON.parse(content);
        }

        const blocks: any[] = parsed?.blocks ?? [];
        for (const block of blocks) {
            const d = block.data;
            if (!d) continue;
            if (typeof d.text === "string") {
                // paragraph, header
                text += " " + d.text.replace(/<[^>]+>/g, " ");
            }
            if (Array.isArray(d.items)) {
                // list
                for (const item of d.items) {
                    const raw = typeof item === "string" ? item : (item.content ?? item.text ?? "");
                    text += " " + raw.replace(/<[^>]+>/g, " ");
                }
            }
        }
    } catch {
        return "";
    }

    const words = text.trim().split(/\s+/).filter(Boolean).length;
    if (words === 0) return "";

    const minutes = Math.round(words / WORDS_PER_MINUTE);
    if (minutes < 1) return "< 1 min";
    return `${minutes} min`;
}