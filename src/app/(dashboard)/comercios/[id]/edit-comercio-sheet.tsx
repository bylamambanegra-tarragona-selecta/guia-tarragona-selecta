"use client"

import { useState } from "react"
import { Pencil } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { TipoComercio, EstadoAnuncio, type Comercio } from "@prisma/client"

import { Button } from "@/components/ui/button"
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription,
} from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { updateComercio } from "@/actions/comercio"
import { useToast } from "@/hooks/use-toast"

const TIPO_OPCIONES: { value: TipoComercio; label: string }[] = [
    { value: "RESTAURANTE", label: "Restaurante" },
    { value: "BAR", label: "Bar" },
    { value: "HOTEL", label: "Hotel" },
    { value: "TIENDA_REGALOS", label: "Tienda / Regalos" },
    { value: "SALUD_CUIDADO", label: "Salud y cuidado" },
    { value: "REPARACIONES", label: "Reparaciones" },
    { value: "SERVICIOS", label: "Servicios" },
    { value: "OCIO_DIURNO", label: "Ocio diurno" },
    { value: "OCIO_NOCTURNO", label: "Ocio nocturno" },
    { value: "ANUNCIO_ESPECIAL", label: "Anuncio especial" },
    { value: "OTROS", label: "Otros" },
]

const ESTADO_OPCIONES: { value: EstadoAnuncio; label: string }[] = [
    { value: "SE_ANUNCIA", label: "Se anuncia" },
    { value: "NO_SE_ANUNCIA", label: "No se anuncia" },
    { value: "INTERESA", label: "Interesa" },
    { value: "TAL_VEZ", label: "Tal vez" },
]

const formSchema = z.object({
    nombre: z.string().min(2),
    tipo_comercio: z.nativeEnum(TipoComercio),
    barrio: z.string().min(1),
    codigo_postal: z.string().min(5).max(5),
    direccion: z.string().optional(),
    telefono: z.string().optional(),
    email: z.string().email().or(z.literal("")).optional(),
    web: z.string().url().or(z.literal("")).optional(),
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    tiktok: z.string().optional(),
    maps_url: z.string().url().or(z.literal("")).optional(),
    estado_anuncio: z.nativeEnum(EstadoAnuncio).optional(),
    tipo_anuncio: z.string().optional(),
    visitado: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

export function EditComercioSheet({ comercio }: { comercio: Comercio }) {
    const [open, setOpen] = useState(false)
    const [isPending, setIsPending] = useState(false)
    const { toast } = useToast()

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nombre: comercio.nombre,
            tipo_comercio: comercio.tipo_comercio,
            barrio: comercio.barrio,
            codigo_postal: comercio.codigo_postal,
            direccion: comercio.direccion ?? "",
            telefono: comercio.telefono ?? "",
            email: comercio.email ?? "",
            web: comercio.web ?? "",
            instagram: comercio.instagram ?? "",
            facebook: comercio.facebook ?? "",
            tiktok: comercio.tiktok ?? "",
            maps_url: comercio.maps_url ?? "",
            estado_anuncio: comercio.estado_anuncio ?? undefined,
            tipo_anuncio: comercio.tipo_anuncio ?? "",
            visitado: comercio.visitado,
        },
    })

    async function onSubmit(values: FormValues) {
        setIsPending(true)
        const result = await updateComercio(comercio.id, {
            ...values,
            estado_anuncio: values.estado_anuncio ?? null,
        })
        setIsPending(false)

        if (result.success) {
            toast({ title: "Comercio actualizado" })
            setOpen(false)
        } else {
            toast({ variant: "destructive", title: "Error", description: result.error })
        }
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                    <Pencil className="h-4 w-4 mr-1" />
                    Editar
                </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto w-full sm:max-w-lg">
                <SheetHeader>
                    <SheetTitle>Editar Comercio</SheetTitle>
                    <SheetDescription>Modifica los datos de {comercio.nombre}.</SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField control={form.control} name="nombre"
                                render={({ field }) => (
                                    <FormItem><FormLabel>Nombre *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )}
                            />
                            <FormField control={form.control} name="tipo_comercio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {TIPO_OPCIONES.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="barrio"
                                    render={({ field }) => (<FormItem><FormLabel>Barrio *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}
                                />
                                <FormField control={form.control} name="codigo_postal"
                                    render={({ field }) => (<FormItem><FormLabel>C.P. *</FormLabel><FormControl><Input maxLength={5} {...field} /></FormControl><FormMessage /></FormItem>)}
                                />
                            </div>
                            <FormField control={form.control} name="direccion"
                                render={({ field }) => (<FormItem><FormLabel>Dirección</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="telefono"
                                    render={({ field }) => (<FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)}
                                />
                                <FormField control={form.control} name="email"
                                    render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}
                                />
                            </div>
                            <FormField control={form.control} name="web"
                                render={({ field }) => (<FormItem><FormLabel>Web</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}
                            />
                            <div className="grid grid-cols-3 gap-3">
                                <FormField control={form.control} name="instagram"
                                    render={({ field }) => (<FormItem><FormLabel>Instagram</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)}
                                />
                                <FormField control={form.control} name="facebook"
                                    render={({ field }) => (<FormItem><FormLabel>Facebook</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)}
                                />
                                <FormField control={form.control} name="tiktok"
                                    render={({ field }) => (<FormItem><FormLabel>TikTok</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)}
                                />
                            </div>
                            <FormField control={form.control} name="maps_url"
                                render={({ field }) => (<FormItem><FormLabel>URL Google Maps</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="estado_anuncio"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Estado anuncio</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Sin estado" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {ESTADO_OPCIONES.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                                <FormField control={form.control} name="tipo_anuncio"
                                    render={({ field }) => (<FormItem><FormLabel>Tipo anuncio</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)}
                                />
                            </div>
                            <FormField control={form.control} name="visitado"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        <FormLabel>Comercio visitado</FormLabel>
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isPending}>
                                {isPending ? "Guardando..." : "Guardar cambios"}
                            </Button>
                        </form>
                    </Form>
                </div>
            </SheetContent>
        </Sheet>
    )
}
