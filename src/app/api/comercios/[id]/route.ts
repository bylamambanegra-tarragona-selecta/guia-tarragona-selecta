import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
    const comercio = await prisma.comercio.findUnique({ where: { id: params.id } })
    if (!comercio) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    return NextResponse.json(comercio)
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const body = await request.json()
        const comercio = await prisma.comercio.update({
            where: { id: params.id },
            data: {
                nombre: body.nombre,
                tipo_comercio: body.tipo_comercio,
                barrio: body.barrio,
                codigo_postal: body.codigo_postal,
                direccion: body.direccion,
                telefono: body.telefono,
                email: body.email,
                web: body.web,
                instagram: body.instagram,
                facebook: body.facebook,
                tiktok: body.tiktok,
                maps_url: body.maps_url,
                maps_place_id: body.maps_place_id || undefined,
                maps_lat: body.maps_lat,
                maps_lng: body.maps_lng,
                estado_anuncio: body.estado_anuncio ?? null,
                tipo_anuncio: body.tipo_anuncio,
                visitado: body.visitado ?? false,
            }
        })
        return NextResponse.json(comercio)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await prisma.comercio.delete({ where: { id: params.id } })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 })
    }
}
