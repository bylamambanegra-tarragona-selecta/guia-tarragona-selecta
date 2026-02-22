import { DiscoverClient } from "./discover-client"
import prisma from "@/lib/prisma"

export default async function DescubrirPage() {
    // Fetch all existing places IDs to show "Ya registrado"
    const comercios = await prisma.comercio.findMany({
        where: { maps_place_id: { not: null } },
        select: { maps_place_id: true }
    })

    // We filter out nulls just in case, though the where query handles it
    const existingIds = comercios.map(c => c.maps_place_id as string)

    return (
        <div className="h-full w-full overflow-hidden">
            <DiscoverClient existingPlaceIds={existingIds} />
        </div>
    )
}
