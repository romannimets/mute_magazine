import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import CryptoJS from "crypto-js";

const DB = "mute_magazine";
const COLL = "admin_credentials";
const SECRET_KEY = process.env.ADMIN_SECRET || "missing_secret_key";

// GET - Ottieni credenziali attuali decriptate
export async function GET(req: NextRequest) {
    try {
        const col = (await clientPromise).db(DB).collection(COLL);
        const admin = await col.findOne({});

        if (!admin) {
            return NextResponse.json({ error: "Nessun admin trovato" }, { status: 404 });
        }

        // Decodifica la password per mostrarla in chiaro
        let decryptedPassword = "";
        try {
            const bytes = CryptoJS.AES.decrypt(admin.password, SECRET_KEY);
            decryptedPassword = bytes.toString(CryptoJS.enc.Utf8);
        } catch (err) {
            console.error("Decryption error:", err);
            return NextResponse.json({ error: "Errore decodifica password" }, { status: 500 });
        }

        return NextResponse.json({
            username: admin.username,
            password: decryptedPassword
        });

    } catch (err) {
        console.error("Get settings error:", err);
        return NextResponse.json({ error: "Errore server" }, { status: 500 });
    }
}

// PUT - Aggiorna credenziali
export async function PUT(req: NextRequest) {
    try {
        const { newUsername, newPassword } = await req.json();

        if (!newPassword || !newUsername) {
            return NextResponse.json({ error: "Tutti i campi sono obbligatori" }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ error: "La password deve essere di almeno 6 caratteri" }, { status: 400 });
        }

        const col = (await clientPromise).db(DB).collection(COLL);
        const admin = await col.findOne({});

        if (!admin) {
            return NextResponse.json({ error: "Nessun admin trovato" }, { status: 404 });
        }

        // Cripta la nuova password
        const encryptedPassword = CryptoJS.AES.encrypt(newPassword, SECRET_KEY).toString();

        // Aggiorna sul DB
        await col.updateOne(
            { _id: admin._id },
            { $set: { username: newUsername, password: encryptedPassword, updatedAt: new Date() } }
        );

        return NextResponse.json({ success: true });

    } catch (err) {
        console.error("Update settings error:", err);
        return NextResponse.json({ error: "Errore server" }, { status: 500 });
    }
}