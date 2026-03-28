import { NextResponse, NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";
import { v4 as uuidv4 } from "uuid";

/**
 * GET /api/articles
 * Recupera articoli (opzionale filtro per categoria)
 * Query params: ?category=societa
 */
export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("mute_magazine");
    const collection = db.collection("articles");

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const query = category ? { category } : {};
    const articles = await collection.find(query).toArray();

    return NextResponse.json(articles);
  } catch (err) {
    console.error("GET /api/articles error:", err);
    return NextResponse.json(
      { error: "Errore fetching articles" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/articles
 * Crea nuovo articolo
 * Body: { title, subtitle?, author, category, cover, content }
 */
export async function POST(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("mute_magazine");

    const data = await req.json();

    // Validazione base
    if (!data.title || !data.author || !data.category) {
      return NextResponse.json(
        { error: "Campi obbligatori: title, author, category" },
        { status: 400 }
      );
    }

    const newArticle = {
      id: uuidv4(),
      title: data.title,
      subtitle: data.subtitle ?? "",
      author: data.author,
      date: data.date ?? new Date().toISOString().split("T")[0],
      cover: data.cover ?? "", // URL da Cloudinary
      category: data.category,
      content: data.content ?? "", // JSON di EditorJS
    };

    const result = await db.collection("articles").insertOne(newArticle);

    return NextResponse.json({
      success: true,
      insertedId: result.insertedId,
      articleId: newArticle.id,
    });
  } catch (err) {
    console.error("POST /api/articles error:", err);
    return NextResponse.json(
      { error: "Errore durante la creazione dell'articolo" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/articles
 * Aggiorna articolo esistente
 * Body: { id, ...campi da aggiornare }
 */
export async function PUT(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("mute_magazine");

    const data = await req.json();

    if (!data.id) {
      return NextResponse.json(
        { error: "ID articolo mancante" },
        { status: 400 }
      );
    }

    const { id, ...updateData } = data;

    const result = await db.collection("articles").updateOne(
      { id },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Articolo non trovato" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    console.error("PUT /api/articles error:", err);
    return NextResponse.json(
      { error: "Errore durante l'aggiornamento" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/articles
 * Elimina articolo
 * Query params: ?id=xxx
 */
export async function DELETE(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("mute_magazine");

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID articolo mancante" },
        { status: 400 }
      );
    }

    const result = await db.collection("articles").deleteOne({ id });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Articolo non trovato" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.error("DELETE /api/articles error:", err);
    return NextResponse.json(
      { error: "Errore durante l'eliminazione" },
      { status: 500 }
    );
  }
}