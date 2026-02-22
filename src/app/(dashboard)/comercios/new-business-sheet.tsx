"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus } from "lucide-react"
import { TipoComercio, EstadoAnuncio } from "@prisma/client"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { createComercio } from "@/actions/comercio"
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
    nombre: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
    tipo_comercio: z.nativeEnum(TipoComercio),
    barrio: z.string().min(1, { message: "El barrio es obligatorio." }),
    codigo_postal: z.string().min(5, { message: "El código postal debe tener 5 dígitos." }).max(5),
    direccion: z.string().optional(),
    telefono: z.string().optional(),
    email: z.string().email({ message: "Email inválido" }).or(z.literal("")).optional(),
    web: z.string().url({ message: "URL inválida" }).or(z.literal("")).optional(),
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    tiktok: z.string().optional(),
    estado_anuncio: z.nativeEnum(EstadoAnuncio).optional(),
    tipo_anuncio: z.string().optional(),
    visitado: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

export function NewBusinessSheet({ onCreated }: { onCreated?: () => void }) {
    const [open, setOpen] = useState(false)
    const [isPending, setIsPending] = useState(false)
    const { toast } = useToast()

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nombre: "",
            barrio: "",
            codigo_postal: "",
            direccion: "",
            telefono: "",
            email: "",
            web: "",
            instagram: "",
            facebook: "",
            tiktok: "",
            tipo_anuncio: "",
            visitado: false,
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
            toast({ title: "Comercio añadido", description: `${values.nombre} guardado correctamente.` })
            form.reset()
            setOpen(false)
            if (onCreated) onCreated()
        } else {
            toast({ variant: "destructive", title: "Error", description: result.error })
        }
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Añadir Comercio
                </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto w-full sm:max-w-lg">
                <SheetHeader>
                    <SheetTitle>Añadir Nuevo Comercio</SheetTitle>
                    <SheetDescription>Introduce los datos básicos del negocio.</SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                            {/* Nombre */}
                            <FormField control={form.control} name="nombre"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre *</FormLabel>
                                        <FormControl><Input placeholder="Ej. Restaurante Sol" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Tipo de comercio */}
                            <FormField control={form.control} name="tipo_comercio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de comercio *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger><SelectValue placeholder="Selecciona un tipo" /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {TIPO_OPCIONES.map(o => (
                                                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Barrio y Código Postal */}
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="barrio"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Barrio *</FormLabel>
                                            <FormControl><Input placeholder="Part Alta" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField control={form.control} name="codigo_postal"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Código Postal *</FormLabel>
                                            <FormControl><Input placeholder="43001" maxLength={5} {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Dirección */}
                            <FormField control={form.control} name="direccion"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Dirección</FormLabel>
                                        <FormControl><Input placeholder="Carrer Major, 12" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Teléfono y Email */}
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="telefono"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Teléfono</FormLabel>
                                            <FormControl><Input placeholder="977 000 000" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField control={form.control} name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl><Input placeholder="hola@comercio.com" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Web */}
                            <FormField control={form.control} name="web"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Web</FormLabel>
                                        <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Redes sociales */}
                            <div className="grid grid-cols-3 gap-3">
                                <FormField control={form.control} name="instagram"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Instagram</FormLabel>
                                            <FormControl><Input placeholder="@usuario" {...field} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField control={form.control} name="facebook"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Facebook</FormLabel>
                                            <FormControl><Input placeholder="página" {...field} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField control={form.control} name="tiktok"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>TikTok</FormLabel>
                                            <FormControl><Input placeholder="@usuario" {...field} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Estado del anuncio */}
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="estado_anuncio"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Estado anuncio</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger><SelectValue placeholder="Sin estado" /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {ESTADO_OPCIONES.map(o => (
                                                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                                <FormField control={form.control} name="tipo_anuncio"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tipo anuncio</FormLabel>
                                            <FormControl><Input placeholder="Portada, Interior..." {...field} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Visitado */}
                            <FormField control={form.control} name="visitado"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Comercio Visitado</FormLabel>
                                            <p className="text-sm text-muted-foreground">Marca si ya se ha visitado presencialmente.</p>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full mt-4" disabled={isPending}>
                                {isPending ? "Guardando..." : "Guardar Comercio"}
                            </Button>
                        </form>
                    </Form>
                </div>
            </SheetContent>
        </Sheet>
    )
}
