import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

const DB = "mute_magazine";
const COLL = "newsletter_subscribers";

// POST /api/newsletter — iscrizione
export async function POST(req: NextRequest) {
    try {
        const { email, consent } = await req.json();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            return NextResponse.json({ error: "Email non valida" }, { status: 400 });
        if (!consent)
            return NextResponse.json({ error: "Consenso obbligatorio" }, { status: 400 });

        const col = (await clientPromise).db(DB).collection(COLL);
        if (await col.findOne({ email: email.toLowerCase().trim() }))
            return NextResponse.json({ alreadySubscribed: true });

        await col.insertOne({
            email: email.toLowerCase().trim(),
            subscribedAt: new Date().toISOString(),
            consent: true,
            consentDate: new Date().toISOString(),
        });
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Errore server" }, { status: 500 });
    }
}

// GET /api/newsletter — lista iscritti (admin)
export async function GET() {
    try {
        const docs = await (await clientPromise)
            .db(DB).collection(COLL)
            .find({}).sort({ subscribedAt: -1 }).toArray();
        return NextResponse.json(docs.map(({ _id, ...rest }) => rest));
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Errore server" }, { status: 500 });
    }
}

// DELETE /api/newsletter — svuota TUTTA la lista
export async function DELETE() {
    try {
        const result = await (await clientPromise)
            .db(DB).collection(COLL).deleteMany({});
        return NextResponse.json({ deleted: result.deletedCount });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Errore server" }, { status: 500 });
    }
}