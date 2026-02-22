'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export type NoteItem = {
    texto: string
    fecha: string
    autor: string
}

export async function addNota(
    comercioId: string,
    nota: NoteItem
) {
    try {
        const comercio = await prisma.comercio.findUnique({
            where: { id: comercioId },
            select: { notas: true },
        })

        if (!comercio) return { success: false, error: 'Comercio no encontrado.' }

        const notasActuales: NoteItem[] = Array.isArray(comercio.notas)
            ? (comercio.notas as NoteItem[])
            : []

        // Insertar al principio (más reciente primero)
        const nuevasNotas: NoteItem[] = [nota, ...notasActuales]

        await prisma.comercio.update({
            where: { id: comercioId },
            data: { notas: nuevasNotas },
        })

        revalidatePath(`/comercios/${comercioId}`)
        return { success: true }
    } catch (error) {
        console.error('Error adding nota:', error)
        return { success: false, error: 'No se pudo añadir la nota.' }
    }
}

export async function deleteNota(comercioId: string, fecha: string) {
    try {
        const comercio = await prisma.comercio.findUnique({
            where: { id: comercioId },
            select: { notas: true },
        })

        if (!comercio) return { success: false, error: 'Comercio no encontrado.' }

        const notasFiltradas = (comercio.notas as NoteItem[]).filter(n => n.fecha !== fecha)

        await prisma.comercio.update({
            where: { id: comercioId },
            data: { notas: notasFiltradas },
        })

        revalidatePath(`/comercios/${comercioId}`)
        return { success: true }
    } catch (error) {
        console.error('Error deleting nota:', error)
        return { success: false, error: 'No se pudo eliminar la nota.' }
    }
}
