"use client"

import { format } from "date-fns"
import { es } from "date-fns/locale"
import { User, Clock } from "lucide-react"

type NoteItem = {
    texto: string
    fecha: string
    autor: string
}

export function NotesList({
    notas,
}: {
    notas: NoteItem[]
    comercioId?: string
}) {
    if (notas.length === 0) {
        return (
            <p className="text-sm text-muted-foreground text-center py-4">
                Sin notas aún. Añade la primera nota arriba.
            </p>
        )
    }

    return (
        <div className="space-y-3">
            {notas.map((nota, i) => (
                <NoteCard key={nota.fecha + i} nota={nota} />
            ))}
        </div>
    )
}

function NoteCard({ nota }: { nota: NoteItem }) {
    const fecha = (() => {
        try {
            return format(new Date(nota.fecha), "d MMM yyyy HH:mm", { locale: es })
        } catch {
            return nota.fecha
        }
    })()

    return (
        <div className="flex gap-3 p-3 rounded-lg bg-muted/40 border group">
            <div className="mt-0.5">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                    {nota.autor[0]?.toUpperCase() ?? "?"}
                </div>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {nota.autor}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {fecha}
                    </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{nota.texto}</p>
            </div>
        </div>
    )
}
