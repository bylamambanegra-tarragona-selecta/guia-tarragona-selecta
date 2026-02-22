'use server'

import prisma from '@/lib/prisma'
import { TipoComercio, EstadoAnuncio } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export type CreateComercioInput = {
    nombre: string
    tipo_comercio: TipoComercio
    barrio: string
    codigo_postal: string
    direccion?: string
    telefono?: string
    email?: string
    web?: string
    instagram?: string
    facebook?: string
    tiktok?: string
    maps_url?: string
    maps_place_id?: string
    maps_lat?: number
    maps_lng?: number
    estado_anuncio?: EstadoAnuncio | null
    tipo_anuncio?: string
    visitado?: boolean
}

export async function createComercio(data: CreateComercioInput) {
    try {
        await prisma.comercio.create({
            data: {
                nombre: data.nombre,
                tipo_comercio: data.tipo_comercio,
                barrio: data.barrio,
                codigo_postal: data.codigo_postal,
                direccion: data.direccion,
                telefono: data.telefono,
                email: data.email,
                web: data.web,
                instagram: data.instagram,
                facebook: data.facebook,
                tiktok: data.tiktok,
                maps_url: data.maps_url,
                maps_place_id: data.maps_place_id || undefined,
                maps_lat: data.maps_lat,
                maps_lng: data.maps_lng,
                estado_anuncio: data.estado_anuncio ?? null,
                tipo_anuncio: data.tipo_anuncio,
                visitado: data.visitado ?? false,
                notas: [],
            }
        })

        revalidatePath('/comercios')
        return { success: true }
    } catch (error) {
        console.error('Error creating comercio:', error)
        return { success: false, error: 'No se ha podido crear el comercio.' }
    }
}

export async function deleteComercio(id: string) {
    try {
        await prisma.comercio.delete({ where: { id } })
        revalidatePath('/comercios')
        return { success: true }
    } catch (error) {
        console.error('Error deleting comercio:', error)
        return { success: false, error: 'No se ha podido eliminar el comercio.' }
    }
}

export async function updateComercio(id: string, data: Partial<CreateComercioInput>) {
    try {
        await prisma.comercio.update({
            where: { id },
            data: {
                ...data,
                maps_place_id: data.maps_place_id || undefined,
            },
        })
        revalidatePath('/comercios')
        return { success: true }
    } catch (error) {
        console.error('Error updating comercio:', error)
        return { success: false, error: 'No se ha podido actualizar el comercio.' }
    }
}

export async function toggleVisitado(id: string, visitado: boolean) {
    try {
        await prisma.comercio.update({
            where: { id },
            data: { visitado },
        })
        revalidatePath('/comercios')
        return { success: true }
    } catch (error) {
        console.error('Error updating visitado:', error)
        return { success: false, error: 'No se ha podido actualizar el estado.' }
    }
}
