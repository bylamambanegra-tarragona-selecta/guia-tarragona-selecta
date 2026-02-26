import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { TipoComercio, EstadoAnuncio } from '@prisma/client'
import { z } from 'zod'

const optionalDecimal = z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return null;
    if (typeof val === "string") {
        const cleaned = val.replace(',', '.').trim();
        const num = parseFloat(cleaned);
        return isNaN(num) ? null : num;
    }
    return typeof val === "number" ? val : null;
}, z.number().nullable().optional());

const ComercioImportSchema = z.object({
    nombre: z.string().min(1),
    tipo_comercio: z.nativeEnum(TipoComercio),
    barrio: z.string().min(1),
    codigo_postal: z.string().min(1), // Más flexible para CP internacionales o formatos sucios
    direccion: z.string().optional().nullable(),
    telefono: z.string().optional().nullable(),
    email: z.string().optional().nullable().or(z.literal('')),
    web: z.string().optional().nullable().or(z.literal('')),
    instagram: z.string().optional().nullable(),
    facebook: z.string().optional().nullable(),
    tiktok: z.string().optional().nullable(),
    maps_url: z.string().optional().nullable().or(z.literal('')),
    maps_lat: optionalDecimal,
    maps_lng: optionalDecimal,
    estado_anuncio: z.nativeEnum(EstadoAnuncio).optional().nullable(),
    visitado: z.preprocess((val) => {
        if (typeof val === 'string') return val.toLowerCase() === 'true';
        return val;
    }, z.boolean().optional().default(false)),
    notas: z.string().optional().nullable(),
})

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { comercios, duplicados } = body
        // duplicados: 'omitir' | 'actualizar' | 'importar'

        let importados = 0
        let omitidos = 0
        let errores = 0

        // Transacción batch
        await prisma.$transaction(async (tx) => {
            for (const row of comercios) {
                const parsed = ComercioImportSchema.safeParse(row)
                if (!parsed.success) { errores++; continue }

                const data = parsed.data

                if (duplicados !== 'importar') {
                    // Detectar duplicado por nombre + barrio
                    const existing = await tx.comercio.findFirst({
                        where: {
                            nombre: { equals: data.nombre, mode: 'insensitive' },
                            barrio: { equals: data.barrio, mode: 'insensitive' },
                        }
                    })

                    if (existing) {
                        if (duplicados === 'omitir') { omitidos++; continue }
                        if (duplicados === 'actualizar') {
                            await tx.comercio.update({
                                where: { id: existing.id },
                                data: {
                                    tipo_comercio: data.tipo_comercio,
                                    codigo_postal: data.codigo_postal,
                                    direccion: data.direccion ?? undefined,
                                    telefono: data.telefono ?? undefined,
                                    email: data.email ?? undefined,
                                    web: data.web ?? undefined,
                                    instagram: data.instagram ?? undefined,
                                    facebook: data.facebook ?? undefined,
                                    tiktok: data.tiktok ?? undefined,
                                    maps_url: data.maps_url ?? undefined,
                                    maps_lat: data.maps_lat ?? undefined,
                                    maps_lng: data.maps_lng ?? undefined,
                                    estado_anuncio: data.estado_anuncio ?? null,
                                    visitado: data.visitado ?? false,
                                }
                            })
                            importados++
                            continue
                        }
                    }
                }

                await tx.comercio.create({
                    data: {
                        nombre: data.nombre,
                        tipo_comercio: data.tipo_comercio,
                        barrio: data.barrio,
                        codigo_postal: data.codigo_postal,
                        direccion: data.direccion ?? undefined,
                        telefono: data.telefono ?? undefined,
                        email: data.email ?? undefined,
                        web: data.web ?? undefined,
                        instagram: data.instagram ?? undefined,
                        facebook: data.facebook ?? undefined,
                        tiktok: data.tiktok ?? undefined,
                        maps_url: data.maps_url ?? undefined,
                        maps_lat: data.maps_lat ?? undefined,
                        maps_lng: data.maps_lng ?? undefined,
                        estado_anuncio: data.estado_anuncio ?? null,
                        visitado: data.visitado ?? false,
                        notas: data.notas ? [{
                            texto: data.notas,
                            fecha: new Date().toISOString(),
                            autor: 'Sistema (Importación)'
                        }] : [],
                    }
                })
                importados++
            }
        }, { timeout: 60000 })

        return NextResponse.json({ importados, omitidos, errores })
    } catch (error) {
        console.error('Import error:', error)
        return NextResponse.json({ error: 'Error durante la importación.' }, { status: 500 })
    }
}
