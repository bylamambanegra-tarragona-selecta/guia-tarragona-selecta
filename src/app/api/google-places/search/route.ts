import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams
    const query = searchParams.get('query')

    if (!query) {
        return NextResponse.json({ error: 'Falta un parámetro query de búsqueda' }, { status: 400 })
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY
    if (!apiKey) {
        console.error("GOOGLE_PLACES_API_KEY no configurada")
        return NextResponse.json({ error: 'Configuración del servidor incompleta (Falta API Key)' }, { status: 500 })
    }

    try {
        const payload = {
            textQuery: query,
            locationBias: {
                circle: {
                    center: { latitude: 41.1189, longitude: 1.2445 },
                    radius: 15000.0 // 15km
                }
            }
        }

        const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": apiKey,
                "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.internationalPhoneNumber,places.websiteUri,places.location,places.rating,places.googleMapsUri"
            },
            body: JSON.stringify(payload)
        })

        if (!res.ok) {
            const errorText = await res.text()
            console.error("Google API Error:", errorText)
            return NextResponse.json({ error: 'Error consultando Google Places' }, { status: res.status })
        }

        const data = await res.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error("Fetch Error:", error)
        return NextResponse.json({ error: 'Error interno del servidor intentando contactar a Google' }, { status: 500 })
    }
}
