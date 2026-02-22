import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { TipoComercio, EstadoAnuncio } from '@prisma/client'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)

    const q = searchParams.get('q') || ''
    const barrio = searchParams.getAll('barrio')
    const tipo = searchParams.getAll('tipo')
    const cp = searchParams.get('cp') || ''
    const visitado = searchParams.get('visitado') // 'true' | 'false' | ''
    const estado = searchParams.getAll('estado')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '25')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
        AND: [
            // Búsqueda de texto libre
            q ? {
                OR: [
                    { nombre: { contains: q, mode: 'insensitive' } },
                    { direccion: { contains: q, mode: 'insensitive' } },
                    { telefono: { contains: q, mode: 'insensitive' } },
                    { email: { contains: q, mode: 'insensitive' } },
                ],
            } : {},
            // Barrios (OR entre los seleccionados)
            barrio.length > 0 ? { barrio: { in: barrio } } : {},
            // Tipos de comercio (OR entre los seleccionados)
            tipo.length > 0 ? { tipo_comercio: { in: tipo as TipoComercio[] } } : {},
            // Código postal
            cp ? { codigo_postal: { startsWith: cp } } : {},
            // Visitado
            visitado === 'true' ? { visitado: true } : {},
            visitado === 'false' ? { visitado: false } : {},
            // Estado del anuncio (incluye null para 'sin definir')
            estado.length > 0 ? {
                OR: [
                    ...(estado.filter(e => e !== 'null').length > 0 ? [{
                        estado_anuncio: { in: estado.filter(e => e !== 'null') as EstadoAnuncio[] }
                    }] : []),
                    ...(estado.includes('null') ? [{ estado_anuncio: null }] : []),
                ],
            } : {},
        ],
    }

    const [total, comercios] = await Promise.all([
        prisma.comercio.count({ where }),
        prisma.comercio.findMany({
            where,
            orderBy: { created_at: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
    ])

    return NextResponse.json({
        data: comercios,
        total,
        page,
        totalPages: Math.ceil(total / limit),
    })
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const comercio = await prisma.comercio.create({
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
                notas: [],
            }
        })
        return NextResponse.json(comercio, { status: 201 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Error al crear el comercio.' }, { status: 500 })
    }
}
