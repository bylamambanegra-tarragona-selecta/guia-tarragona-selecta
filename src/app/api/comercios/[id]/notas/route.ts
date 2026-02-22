import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const body = await request.json()
        const { texto, autor } = body

        const comercio = await prisma.comercio.findUnique({
            where: { id: params.id },
            select: { notas: true },
        })

        if (!comercio) {
            return NextResponse.json({ error: 'Comercio no encontrado.' }, { status: 404 })
        }

        type NoteItem = { texto: string; fecha: string; autor: string }
        const notasActuales = (comercio.notas as NoteItem[]) || []
        const nuevasNotas: NoteItem[] = [
            { texto, fecha: new Date().toISOString(), autor },
            ...notasActuales,
        ]

        await prisma.comercio.update({
            where: { id: params.id },
            data: { notas: nuevasNotas },
        })

        return NextResponse.json({ success: true, notas: nuevasNotas })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Error al añadir la nota.' }, { status: 500 })
    }
}
