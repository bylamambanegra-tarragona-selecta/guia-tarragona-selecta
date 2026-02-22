"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { TipoComercio, EstadoAnuncio } from "@prisma/client"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createComercio } from "@/actions/comercio"
import { useToast } from "@/hooks/use-toast"

const TIPO_OPTS: { value: TipoComercio; label: string }[] = [
    { value: 'RESTAURANTE', label: 'Restaurante' }, { value: 'BAR', label: 'Bar' },
    { value: 'HOTEL', label: 'Hotel' }, { value: 'TIENDA_REGALOS', label: 'Tienda / Regalos' },
    { value: 'SALUD_CUIDADO', label: 'Salud y cuidado' }, { value: 'REPARACIONES', label: 'Reparaciones' },
    { value: 'SERVICIOS', label: 'Servicios' }, { value: 'OCIO_DIURNO', label: 'Ocio diurno' },
    { value: 'OCIO_NOCTURNO', label: 'Ocio nocturno' }, { value: 'ANUNCIO_ESPECIAL', label: 'Anuncio especial' },
    { value: 'OTROS', label: 'Otros' },
]

const ESTADO_OPTS: { value: EstadoAnuncio; label: string }[] = [
    { value: 'SE_ANUNCIA', label: 'Se anuncia' }, { value: 'NO_SE_ANUNCIA', label: 'No se anuncia' },
    { value: 'INTERESA', label: 'Interesa' }, { value: 'TAL_VEZ', label: 'Tal vez' },
]

const schema = z.object({
    nombre: z.string().min(2),
    tipo_comercio: z.nativeEnum(TipoComercio),
    barrio: z.string().min(1),
    codigo_postal: z.string().min(5).max(5),
    direccion: z.string().optional(),
    telefono: z.string().optional(),
    email: z.string().email().or(z.literal('')).optional(),
    web: z.string().url().or(z.literal('')).optional(),
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    tiktok: z.string().optional(),
    maps_url: z.string().url().or(z.literal('')).optional(),
    estado_anuncio: z.nativeEnum(EstadoAnuncio).optional(),
    tipo_anuncio: z.string().optional(),
    visitado: z.boolean(),
})

type FormValues = z.infer<typeof schema>

export default function NuevoComercioPage() {
    const [isPending, setIsPending] = useState(false)
    const router = useRouter()
    const { toast } = useToast()

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            nombre: '', barrio: '', codigo_postal: '', direccion: '', telefono: '',
            email: '', web: '', instagram: '', facebook: '', tiktok: '', maps_url: '',
            tipo_anuncio: '', visitado: false,
        },
    })

    async function onSubmit(values: FormValues) {
        setIsPending(true)
        const result = await createComercio({
            ...values,
            estado_anuncio: values.estado_anuncio ?? null,
        })
        setIsPending(false)

        if (result.success) {
            toast({ title: 'Comercio creado correctamente' })
            router.push('/comercios')
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error })
        }
    }

    return (
        <div className="max-w-2xl mx-auto py-6">
            <h1 className="text-2xl font-bold mb-6">Nuevo Comercio</h1>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle className="text-base">Identificación</CardTitle></CardHeader>
                        <CardContent className="grid gap-4">
                            <FormField control={form.control} name="nombre" render={({ field }) => (
                                <FormItem><FormLabel>Nombre *</FormLabel><FormControl><Input placeholder="Ej. Restaurante Sol" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2">
                                    <FormField control={form.control} name="tipo_comercio" render={({ field }) => (
                                        <FormItem><FormLabel>Tipo *</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger></FormControl>
                                                <SelectContent>{TIPO_OPTS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                                            </Select><FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                                <FormField control={form.control} name="codigo_postal" render={({ field }) => (
                                    <FormItem><FormLabel>C.P. *</FormLabel><FormControl><Input placeholder="43001" maxLength={5} {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                            <FormField control={form.control} name="barrio" render={({ field }) => (
                                <FormItem><FormLabel>Barrio *</FormLabel><FormControl><Input placeholder="Part Alta" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="direccion" render={({ field }) => (
                                <FormItem><FormLabel>Dirección</FormLabel><FormControl><Input placeholder="Carrer Major, 12" {...field} /></FormControl></FormItem>
                            )} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="text-base">Contacto</CardTitle></CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="telefono" render={({ field }) => (
                                    <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input placeholder="977 000 000" {...field} /></FormControl></FormItem>
                                )} />
                                <FormField control={form.control} name="email" render={({ field }) => (
                                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="hola@..." {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                            <FormField control={form.control} name="web" render={({ field }) => (
                                <FormItem><FormLabel>Web</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="text-base">Redes Sociales</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-3 gap-3">
                            <FormField control={form.control} name="instagram" render={({ field }) => (
                                <FormItem><FormLabel>Instagram</FormLabel><FormControl><Input placeholder="@usuario" {...field} /></FormControl></FormItem>
                            )} />
                            <FormField control={form.control} name="facebook" render={({ field }) => (
                                <FormItem><FormLabel>Facebook</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                            )} />
                            <FormField control={form.control} name="tiktok" render={({ field }) => (
                                <FormItem><FormLabel>TikTok</FormLabel><FormControl><Input placeholder="@usuario" {...field} /></FormControl></FormItem>
                            )} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="text-base">Prospección</CardTitle></CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="estado_anuncio" render={({ field }) => (
                                    <FormItem><FormLabel>Estado anuncio</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Sin estado" /></SelectTrigger></FormControl>
                                            <SelectContent>{ESTADO_OPTS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="tipo_anuncio" render={({ field }) => (
                                    <FormItem><FormLabel>Tipo anuncio</FormLabel><FormControl><Input placeholder="Portada, Interior..." {...field} /></FormControl></FormItem>
                                )} />
                            </div>
                            <FormField control={form.control} name="visitado" render={({ field }) => (
                                <FormItem className="flex items-center gap-3 rounded-lg border p-4">
                                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    <FormLabel className="cursor-pointer">Comercio ya visitado</FormLabel>
                                </FormItem>
                            )} />
                        </CardContent>
                    </Card>

                    <div className="flex gap-3">
                        <Button type="submit" disabled={isPending} className="flex-1">
                            {isPending ? 'Guardando...' : 'Crear Comercio'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => router.push('/comercios')}>Cancelar</Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
