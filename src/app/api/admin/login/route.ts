import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import CryptoJS from "crypto-js";

const DB = "mute_magazine";
const COLL = "admin_credentials";

// Assicurati che ADMIN_SECRET sia definito nel tuo .env
const SECRET_KEY = process.env.ADMIN_SECRET || "missing_secret_key";

export async function POST(req: NextRequest) {
    try {
        const { username, password } = await req.json();

        if (!username || !password) {
            return NextResponse.json({ error: "Credenziali mancanti" }, { status: 400 });
        }

        const col = (await clientPromise).db(DB).collection(COLL);
        let admin = await col.findOne({ username });

        // Prima volta: nessun utente nel DB -> crea admin/admin in automatico
        if (!admin && username === "admin" && password === "admin") {
            const encryptedPassword = CryptoJS.AES.encrypt("admin", SECRET_KEY).toString();
            await col.insertOne({
                username: "admin",
                password: encryptedPassword,
                createdAt: new Date()
            });
            admin = await col.findOne({ username: "admin" });
        }

        if (!admin) {
            return NextResponse.json({ error: "Credenziali non valide" }, { status: 401 });
        }

        // Decriptiamo la password salvata nel DB per fare il confronto
        let decryptedPassword = "";
        try {
            const bytes = CryptoJS.AES.decrypt(admin.password, SECRET_KEY);
            decryptedPassword = bytes.toString(CryptoJS.enc.Utf8);
        } catch (err) {
            console.error("Errore decodifica:", err);
            return NextResponse.json({ error: "Errore interno (chiave errata?)" }, { status: 500 });
        }

        // Se le password in chiaro non combaciano, errore
        if (password !== decryptedPassword) {
            return NextResponse.json({ error: "Credenziali non valide" }, { status: 401 });
        }

        // Tutto ok, setta il cookie
        const res = NextResponse.json({ success: true });
        res.cookies.set("admin_session", SECRET_KEY, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7 giorni
        });
        return res;

    } catch (err) {
        console.error("Login error:", err);
        return NextResponse.json({ error: "Errore server" }, { status: 500 });
    }
}