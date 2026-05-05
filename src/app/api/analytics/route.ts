import { NextRequest, NextResponse } from "next/server";
import { GoogleAuth } from "google-auth-library";

export async function POST(req: NextRequest) {
    try {
        const { type = "overview", startDate = "30daysAgo", endDate = "today" } = await req.json();

        const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
        const propertyId = process.env.GA4_PROPERTY_ID;

        if (!credentialsJson) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON non configurato");
        if (!propertyId) throw new Error("GA4_PROPERTY_ID non configurato");

        let credentials;
        try {
            credentials = JSON.parse(credentialsJson);
            // Normalizza \n nella private key (sicurezza extra)
            if (credentials.private_key) {
                credentials.private_key = credentials.private_key.replace(/\\n/g, "\n");
            }
        } catch {
            throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON non è un JSON valido");
        }

        // Auth via REST (niente gRPC)
        const auth = new GoogleAuth({
            credentials,
            scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
        });
        const client = await auth.getClient();
        const tokenResponse = await client.getAccessToken();
        const accessToken = tokenResponse.token;

        if (!accessToken) throw new Error("Impossibile ottenere access token da Google");

        // Costruisci il body della richiesta
        let requestBody: any = {
            dateRanges: [{ startDate, endDate }],
        };

        switch (type) {
            case "overview":
                requestBody.metrics = [
                    { name: "activeUsers" },
                    { name: "sessions" },
                    { name: "screenPageViews" },
                    { name: "bounceRate" },
                    { name: "averageSessionDuration" },
                ];
                requestBody.metricAggregations = ["TOTAL"];
                break;

            case "pages":
                requestBody.dimensions = [{ name: "pagePath" }, { name: "pageTitle" }];
                requestBody.metrics = [{ name: "screenPageViews" }, { name: "activeUsers" }];
                requestBody.orderBys = [{ metric: { metricName: "screenPageViews" }, desc: true }];
                requestBody.limit = 10;
                requestBody.dimensionFilter = {   //togliamo gli /api paths, che non ha senso mostrare
                    notExpression: {
                        filter: {
                            fieldName: "pagePath",
                            stringFilter: {
                                matchType: "BEGINS_WITH",
                                value: "/api/",
                            }
                        }
                    }
                };
                break;

            case "sources":
                requestBody.dimensions = [{ name: "sessionDefaultChannelGroup" }];
                requestBody.metrics = [{ name: "sessions" }, { name: "activeUsers" }];
                requestBody.orderBys = [{ metric: { metricName: "sessions" }, desc: true }];
                requestBody.limit = 8;
                break;

            default:
                return NextResponse.json({ error: "Tipo non valido" }, { status: 400 });
        }

        // Chiamata REST diretta all'API GA4
        const gaResponse = await fetch(
            `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            }
        );

        if (!gaResponse.ok) {
            const errorBody = await gaResponse.json();
            console.error("❌ GA4 REST Error:", gaResponse.status, JSON.stringify(errorBody));
            throw new Error(
                errorBody?.error?.message || `GA4 API error: ${gaResponse.status}`
            );
        }

        const data = await gaResponse.json();

        return NextResponse.json({
            rows: data.rows?.map((row: any) => ({
                dimensions: row.dimensionValues?.map((d: any) => d.value) || [],
                metrics: row.metricValues?.map((m: any) => m.value) || [],
            })) || [],
            totals: data.totals?.[0]?.metricValues?.map((m: any) => m.value) || [],
        });

    } catch (error: any) {
        console.error("❌ Analytics Error:", error.message);
        return NextResponse.json(
            { error: error.message || "Errore sconosciuto" },
            { status: 500 }
        );
    }
}