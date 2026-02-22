"use client"

import { Comercio, EstadoAnuncio, TipoComercio } from "@prisma/client"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, ArrowUpDown, ExternalLink } from "lucide-react"
import Link from "next/link"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Labels en español para los enums
const TIPO_LABELS: Record<TipoComercio, string> = {
    RESTAURANTE: "Restaurante", BAR: "Bar", HOTEL: "Hotel",
    TIENDA_REGALOS: "Tienda / Regalos", SALUD_CUIDADO: "Salud y cuidado",
    REPARACIONES: "Reparaciones", SERVICIOS: "Servicios",
    OCIO_DIURNO: "Ocio diurno", OCIO_NOCTURNO: "Ocio nocturno",
    ANUNCIO_ESPECIAL: "Anuncio especial", OTROS: "Otros",
}

const ESTADO_LABELS: Record<EstadoAnuncio, string> = {
    SE_ANUNCIA: "Se anuncia", NO_SE_ANUNCIA: "No se anuncia",
    INTERESA: "Interesa", TAL_VEZ: "Tal vez",
}

const ESTADO_VARIANT: Record<EstadoAnuncio, "default" | "secondary" | "destructive" | "outline"> = {
    SE_ANUNCIA: "default", NO_SE_ANUNCIA: "destructive", INTERESA: "secondary", TAL_VEZ: "outline",
}

export const columns: ColumnDef<Comercio>[] = [
    {
        accessorKey: "nombre",
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                Nombre <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => (
            <Link href={`/comercios/${row.original.id}`} className="font-medium px-4 hover:underline flex items-center gap-1">
                {row.getValue("nombre")}
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
            </Link>
        ),
    },
    {
        accessorKey: "tipo_comercio",
        header: "Tipo",
        cell: ({ row }) => {
            const tipo = row.getValue("tipo_comercio") as TipoComercio
            return tipo ? <Badge variant="secondary">{TIPO_LABELS[tipo]}</Badge> : <span className="text-muted-foreground">-</span>
        },
    },
    {
        accessorKey: "barrio",
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                Barrio <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => row.getValue("barrio") || "-",
    },
    {
        accessorKey: "codigo_postal",
        header: "C.P.",
        cell: ({ row }) => row.getValue("codigo_postal") || "-",
    },
    {
        accessorKey: "telefono",
        header: "Teléfono",
        cell: ({ row }) => row.getValue("telefono") || <span className="text-muted-foreground">-</span>,
    },
    {
        accessorKey: "visitado",
        header: "Visitado",
        cell: ({ row }) => (
            <Checkbox
                checked={row.getValue("visitado")}
                disabled
                aria-label="Visitado"
            />
        ),
    },
    {
        accessorKey: "estado_anuncio",
        header: "Estado anuncio",
        cell: ({ row }) => {
            const estado = row.getValue("estado_anuncio") as EstadoAnuncio | null
            if (!estado) return <span className="text-muted-foreground">-</span>
            return <Badge variant={ESTADO_VARIANT[estado]}>{ESTADO_LABELS[estado]}</Badge>
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const comercio = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(comercio.id)}
                        >
                            Copiar ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                        <DropdownMenuItem>Editar comercio</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">Eliminar</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
