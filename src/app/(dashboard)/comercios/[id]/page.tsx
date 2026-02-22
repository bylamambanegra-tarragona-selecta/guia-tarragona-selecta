import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ArrowLeft, Globe, Instagram, Facebook, MapPin, Phone, Mail, Check, X } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { EditComercioSheet } from "./edit-comercio-sheet"
import { DeleteComercioButton } from "./delete-comercio-button"
import { NotesList } from "./notes-list"
import { AddNoteForm } from "./add-note-form"
import type { EstadoAnuncio, TipoComercio } from "@prisma/client"

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

export default async function ComercioDetailPage({ params }: { params: { id: string } }) {
    const comercio = await prisma.comercio.findUnique({
        where: { id: params.id }
    })

    if (!comercio) notFound()

    const notas: Array<{ texto: string; fecha: string; autor: string }> =
        Array.isArray(comercio.notas) ? (comercio.notas as Array<{ texto: string; fecha: string; autor: string }>) : []

    return (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
            {/* Cabecera */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/comercios">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Volver
                    </Link>
                </Button>
            </div>

            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-3xl font-bold">{comercio.nombre}</h1>
                        {comercio.visitado
                            ? <Badge variant="default" className="gap-1"><Check className="h-3 w-3" /> Visitado</Badge>
                            : <Badge variant="outline" className="gap-1"><X className="h-3 w-3" /> No visitado</Badge>
                        }
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary">{TIPO_LABELS[comercio.tipo_comercio]}</Badge>
                        {comercio.estado_anuncio && (
                            <Badge variant={ESTADO_VARIANT[comercio.estado_anuncio]}>
                                {ESTADO_LABELS[comercio.estado_anuncio]}
                            </Badge>
                        )}
                        <span className="text-muted-foreground text-sm">
                            {comercio.barrio} · {comercio.codigo_postal}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <EditComercioSheet comercio={comercio} />
                    <DeleteComercioButton id={comercio.id} nombre={comercio.nombre} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contacto */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Contacto</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        {comercio.direccion && (
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span>{comercio.direccion}</span>
                            </div>
                        )}
                        {comercio.telefono && (
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                                <a href={`tel:${comercio.telefono}`} className="hover:underline">{comercio.telefono}</a>
                            </div>
                        )}
                        {comercio.email && (
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                                <a href={`mailto:${comercio.email}`} className="hover:underline">{comercio.email}</a>
                            </div>
                        )}
                        {comercio.web && (
                            <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                                <a href={comercio.web} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">{comercio.web}</a>
                            </div>
                        )}
                        {!comercio.direccion && !comercio.telefono && !comercio.email && !comercio.web && (
                            <p className="text-muted-foreground">Sin datos de contacto</p>
                        )}
                    </CardContent>
                </Card>

                {/* Redes + Maps + Anuncio */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Redes y Prospección</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        {comercio.instagram && (
                            <div className="flex items-center gap-2">
                                <Instagram className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span>{comercio.instagram}</span>
                            </div>
                        )}
                        {comercio.facebook && (
                            <div className="flex items-center gap-2">
                                <Facebook className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span>{comercio.facebook}</span>
                            </div>
                        )}
                        {comercio.maps_url && (
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                                <a href={comercio.maps_url} target="_blank" rel="noopener noreferrer" className="hover:underline">Ver en Google Maps</a>
                            </div>
                        )}
                        <Separator className="my-2" />
                        {comercio.tipo_anuncio && (
                            <div>
                                <span className="text-muted-foreground">Tipo anuncio: </span>
                                <span className="font-medium">{comercio.tipo_anuncio}</span>
                            </div>
                        )}
                        <p className="text-muted-foreground text-xs">
                            Creado: {format(comercio.created_at, "d MMM yyyy", { locale: es })}
                            {" · "}
                            Actualizado: {format(comercio.updated_at, "d MMM yyyy", { locale: es })}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Sistema de Notas */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Notas ({notas.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <AddNoteForm comercioId={comercio.id} />
                    <Separator />
                    <NotesList notas={notas} />
                </CardContent>
            </Card>
        </div>
    )
}
