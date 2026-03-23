import { NextRequest, NextResponse } from "next/server"

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function fetchPage(query: string, apiKey: string, pageToken?: string): Promise<{ places: any[], nextPageToken?: string }> {
    const url = "https://places.googleapis.com/v1/places:searchText"
    const payload: any = pageToken
        ? { pageToken }
        : {
            textQuery: query,
            maxResultCount: 20,
            languageCode: "es",
            locationBias: {
                circle: {
                    center: { latitude: 41.1189, longitude: 1.2445 },
                    radius: 20000.0,
                },
            },
        }

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.internationalPhoneNumber,places.websiteUri,places.location,places.rating,places.userRatingCount,places.googleMapsUri",
        },
        body: JSON.stringify(payload),
    })

    if (!res.ok) {
        const err = await res.text()
        console.error(`Google API Error for query "${query}":`, err)
        return { places: [] }
    }
    const data = await res.json()
    return { places: data.places || [], nextPageToken: data.nextPageToken }
}

async function deepSearch(query: string, apiKey: string): Promise<any[]> {
    const allPlaces = new Map<string, any>()

    // Fetch first page
    let { places, nextPageToken } = await fetchPage(query, apiKey)
    places.forEach(p => { if (p.id) allPlaces.set(p.id, p) })

    // Paginate up to 2 more pages (60 results max from single query)
    let pageCount = 1
    while (nextPageToken && pageCount < 3) {
        await delay(2000) // Google requires a delay before using nextPageToken
        const res = await fetchPage(query, apiKey, nextPageToken)
        res.places.forEach(p => { if (p.id) allPlaces.set(p.id, p) })
        nextPageToken = res.nextPageToken
        pageCount++
    }

    return Array.from(allPlaces.values())
}

export async function POST(req: NextRequest) {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY
    if (!apiKey) {
        return NextResponse.json({ error: "GOOGLE_PLACES_API_KEY no configurada" }, { status: 500 })
    }

    const { categoria, zona } = await req.json()
    if (!categoria || !zona) {
        return NextResponse.json({ error: "Se requieren 'categoria' y 'zona'" }, { status: 400 })
    }

    // Multiple query variations to break the 60-result barrier
    const queries = [
        `${categoria} en ${zona}`,
        `Mejores ${categoria} ${zona}`,
        `${categoria} cerca de ${zona}`,
    ]

    const globalMap = new Map<string, any>()

    for (const query of queries) {
        const places = await deepSearch(query, apiKey)
        places.forEach(p => { if (p.id && !globalMap.has(p.id)) globalMap.set(p.id, p) })
        if (globalMap.size >= 150) break
    }

    // Filter to only those with a rating, sort best to worst
    const sorted = Array.from(globalMap.values())
        .filter(p => p.rating != null)
        .sort((a, b) => {
            if (b.rating !== a.rating) return b.rating - a.rating
            return (b.userRatingCount || 0) - (a.userRatingCount || 0)
        })
        .slice(0, 100)

    return NextResponse.json({ places: sorted, total: sorted.length })
}
