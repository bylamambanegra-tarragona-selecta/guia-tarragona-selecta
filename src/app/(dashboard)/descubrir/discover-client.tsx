"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Search, MapPin, Star, CheckCircle2, Loader2 } from "lucide-react"
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { TipoComercio } from "@prisma/client"
import { createComercio } from "@/actions/comercio"

// Schema para el formulario de importación
const importSchema = z.object({
    nombre: z.string().min(1, "Requerido"),
    tipo_comercio: z.nativeEnum(TipoComercio),
    barrio: z.string().min(1, "Requerido"),
    codigo_postal: z.string().min(5).max(10),
    direccion: z.string().optional(),
    telefono: z.string().optional(),
    web: z.string().optional(),
    maps_place_id: z.string(),
    maps_lat: z.number().optional(),
    maps_lng: z.number().optional(),
    maps_url: z.string().optional(),
    visitado: z.boolean(),
})

const TIPOS = [
    { value: 'RESTAURANTE', label: 'Restaurante' },
    { value: 'BAR', label: 'Bar' },
    { value: 'HOTEL', label: 'Hotel' },
    { value: 'TIENDA_REGALOS', label: 'Tienda/Regalos' },
    { value: 'SALUD_CUIDADO', label: 'Salud/Cuidado' },
    { value: 'SERVICIOS', label: 'Servicios' },
    { value: 'OTROS', label: 'Otros' },
]

const BARRIOS = [
    'Centre', 'Eixample', 'Part Alta', 'Serrallo', 'Sant Pere i Sant Pau',
    'Bonavista', 'Torreforta', 'Campclar', 'Zones Industrials', 'Riu Clar',
    'Llarga', 'Els Pallaresos', 'Altres'
]

const MAP_OPTIONS = {
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    styles: [
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        {
            featureType: "administrative.locality",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
        },
        {
            featureType: "poi",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
        },
        {
            featureType: "poi.park",
            elementType: "geometry",
            stylers: [{ color: "#263c3f" }],
        },
        {
            featureType: "poi.park",
            elementType: "labels.text.fill",
            stylers: [{ color: "#6b9a76" }],
        },
        {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#38414e" }],
        },
        {
            featureType: "road",
            elementType: "geometry.stroke",
            stylers: [{ color: "#212a37" }],
        },
        {
            featureType: "road",
            elementType: "labels.text.fill",
            stylers: [{ color: "#9ca5b3" }],
        },
        {
            featureType: "road.highway",
            elementType: "geometry",
            stylers: [{ color: "#746855" }],
        },
        {
            featureType: "road.highway",
            elementType: "geometry.stroke",
            stylers: [{ color: "#1f2835" }],
        },
        {
            featureType: "road.highway",
            elementType: "labels.text.fill",
            stylers: [{ color: "#f3d19c" }],
        },
        {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#17263c" }],
        },
        {
            featureType: "water",
            elementType: "labels.text.fill",
            stylers: [{ color: "#515c6d" }],
        },
        {
            featureType: "water",
            elementType: "labels.text.stroke",
            stylers: [{ color: "#17263c" }],
        },
    ],
}

type PlaceResult = {
    id: string;
    displayName: { text: string };
    formattedAddress: string;
    internationalPhoneNumber?: string;
    websiteUri?: string;
    location: { latitude: number; longitude: number };
    rating?: number;
    googleMapsUri?: string;
}

export function DiscoverClient({ existingPlaceIds: initialIds }: { existingPlaceIds: string[] }) {
    const { toast } = useToast()
    const [existingIds, setExistingIds] = useState<Set<string>>(new Set(initialIds))

    // Formulario de búsqueda
    const [searchTipo, setSearchTipo] = useState('')
    const [searchZona, setSearchZona] = useState('')
    const [searchText, setSearchText] = useState('')
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState<PlaceResult[]>([])
    const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null)

    // Formulario de importación
    const [importOpen, setImportOpen] = useState(false)
    const [importing, setImporting] = useState(false)
    const [placeToImport, setPlaceToImport] = useState<PlaceResult | null>(null)

    const mapCenter = { lat: 41.1189, lng: 1.2445 } // Tarragona centro

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!searchTipo && !searchText && !searchZona) return

        setLoading(true)
        setSelectedPlace(null)
        try {
            const query = [searchTipo, searchZona, searchText].filter(Boolean).join(' ')
            const res = await fetch(`/api/google-places/search?query=${encodeURIComponent(query)}`)
            const data = await res.json()

            if (!res.ok) throw new Error(data.error || 'Error en la búsqueda')

            setResults(data.places || [])
            if (data.places?.length === 0) {
                toast({ title: "Sin resultados", description: "Prueba con otros términos de búsqueda." })
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: (error as Error).message })
        }
        setLoading(false)
    }

    const startImport = (place: PlaceResult) => {
        setPlaceToImport(place)
        form.reset({
            nombre: place.displayName.text,
            direccion: place.formattedAddress,
            telefono: place.internationalPhoneNumber || "",
            web: place.websiteUri || "",
            maps_place_id: place.id,
            maps_lat: place.location?.latitude,
            maps_lng: place.location?.longitude,
            maps_url: place.googleMapsUri || "",
            codigo_postal: "4300", // Placeholder común para Tarragona empezar
            barrio: "",
            visitado: false,
        })
        setImportOpen(true)
    }

    const form = useForm<z.infer<typeof importSchema>>({
        resolver: zodResolver(importSchema),
        defaultValues: { visitado: false }
    })

    const onImportSubmit = async (values: z.infer<typeof importSchema>) => {
        setImporting(true)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = await createComercio({ ...values, estado_anuncio: null } as any)
        setImporting(false)

        if (res.success) {
            toast({ title: "Importado", description: `${values.nombre} guardado en la guía.` })
            setExistingIds(prev => new Set(prev).add(values.maps_place_id))
            setImportOpen(false)
        } else {
            toast({ variant: "destructive", title: "Error", description: res.error })
        }
    }

    return (
        <div className="flex flex-col md:flex-row h-full">
            {/* PANEL IZQUIERDO (40%) */}
            <div className="w-full md:w-[40%] flex flex-col h-full border-r border-border bg-background z-10">
                <div className="p-4 border-b border-border bg-card/50">
                    <h1 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Search className="h-5 w-5 text-primary" /> Descubrir Comercios
                    </h1>
                    <form onSubmit={handleSearch} className="space-y-3">
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Tipo de Comercio</Label>
                            <Select value={searchTipo} onValueChange={setSearchTipo}>
                                <SelectTrigger className="h-9"><SelectValue placeholder="Ej. Restaurante" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Restaurante">Restaurante</SelectItem>
                                    <SelectItem value="Bar">Bar</SelectItem>
                                    <SelectItem value="Hotel">Hotel</SelectItem>
                                    <SelectItem value="Tienda">Tienda</SelectItem>
                                    <SelectItem value="Clínica">Clínica</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Zona / Barrio (Tarragona)</Label>
                            <Input placeholder="Ej. Part Alta, Eixample..." value={searchZona} onChange={e => setSearchZona(e.target.value)} className="h-9" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Texto libre (Opcional)</Label>
                            <Input placeholder="Ej. comida vegana, dental..." value={searchText} onChange={e => setSearchText(e.target.value)} className="h-9" />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading || (!searchTipo && !searchZona && !searchText)}>
                            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Buscando...</> : 'Buscar en Google Places'}
                        </Button>
                    </form>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/10">
                    {results.length > 0 && <p className="text-sm text-muted-foreground font-medium mb-2">{results.length} resultados encontrados</p>}

                    {results.map(place => {
                        const isExisting = existingIds.has(place.id)
                        const isSelected = selectedPlace?.id === place.id

                        return (
                            <Card
                                key={place.id}
                                className={`cursor-pointer transition-colors hover:border-primary/50 ${isSelected ? 'border-primary ring-1 ring-primary/50 bg-primary/5' : ''}`}
                                onClick={() => setSelectedPlace(place)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-semibold text-base leading-tight break-words pr-2">{place.displayName.text}</h3>
                                        {isExisting && <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 whitespace-nowrap shrink-0"><CheckCircle2 className="h-3 w-3 mr-1" />Registrado</Badge>}
                                    </div>
                                    <div className="space-y-1.5 text-sm text-muted-foreground">
                                        <p className="flex items-start gap-1.5"><MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" /> <span className="line-clamp-2">{place.formattedAddress}</span></p>
                                        {place.rating != null && <p className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" /> {place.rating}</p>}
                                    </div>
                                    <div className="mt-4 flex gap-2">
                                        <Button
                                            size="sm"
                                            variant={isExisting ? "secondary" : "default"}
                                            className="w-full h-8"
                                            disabled={isExisting}
                                            onClick={(e) => { e.stopPropagation(); startImport(place); }}
                                        >
                                            {isExisting ? 'Ya en la guía' : 'Añadir a la guía'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                    {!loading && results.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            <MapPin className="h-8 w-8 mx-auto mb-3 opacity-20" />
                            <p>Usa los filtros superiores para comenzar la prospección</p>
                        </div>
                    )}
                </div>
            </div>

            {/* PANEL DERECHO (60%) - MAPA */}
            <div className="hidden md:block md:w-[60%] h-full bg-slate-900 relative">
                <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
                    <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '100%' }}
                        center={selectedPlace ? { lat: selectedPlace.location.latitude, lng: selectedPlace.location.longitude } : mapCenter}
                        zoom={selectedPlace ? 17 : 13}
                        options={MAP_OPTIONS}
                    >
                        {results.map(place => (
                            <Marker
                                key={place.id}
                                position={{ lat: place.location.latitude, lng: place.location.longitude }}
                                onClick={() => setSelectedPlace(place)}
                                icon={{
                                    url: existingIds.has(place.id) ? "http://maps.google.com/mapfiles/ms/icons/green-dot.png" : "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
                                }}
                            />
                        ))}
                        {selectedPlace && (
                            <InfoWindow
                                position={{ lat: selectedPlace.location.latitude, lng: selectedPlace.location.longitude }}
                                onCloseClick={() => setSelectedPlace(null)}
                            >
                                <div className="p-1 max-w-[200px] text-zinc-900">
                                    <h4 className="font-bold text-sm mb-1">{selectedPlace.displayName.text}</h4>
                                    <p className="text-xs mb-2 line-clamp-2">{selectedPlace.formattedAddress}</p>
                                    <Button
                                        size="sm"
                                        className="w-full h-7 text-xs"
                                        disabled={existingIds.has(selectedPlace.id)}
                                        onClick={() => startImport(selectedPlace)}
                                    >
                                        {existingIds.has(selectedPlace.id) ? 'Registrado' : 'Añadir'}
                                    </Button>
                                </div>
                            </InfoWindow>
                        )}
                    </GoogleMap>
                </LoadScript>
            </div>

            {/* MODAL / SHEET DE IMPORTACIÓN */}
            <Sheet open={importOpen} onOpenChange={setImportOpen}>
                <SheetContent className="overflow-y-auto w-full sm:max-w-md border-l border-border bg-card">
                    <SheetHeader className="mb-6">
                        <SheetTitle>Añadir a la Guía</SheetTitle>
                        <SheetDescription>Completa los datos extra para {placeToImport?.displayName.text}</SheetDescription>
                    </SheetHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onImportSubmit)} className="space-y-4">
                            <FormField control={form.control} name="nombre" render={({ field }) => (
                                <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="tipo_comercio" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo de comercio *</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger></FormControl>
                                        <SelectContent>{TIPOS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <div className="grid grid-cols-2 gap-3">
                                <FormField control={form.control} name="barrio" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Barrio *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Barrio" /></SelectTrigger></FormControl>
                                            <SelectContent>{BARRIOS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="codigo_postal" render={({ field }) => (
                                    <FormItem><FormLabel>C.P. *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                            <FormField control={form.control} name="direccion" render={({ field }) => (
                                <FormItem><FormLabel>Dirección</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <div className="grid grid-cols-2 gap-3">
                                <FormField control={form.control} name="telefono" render={({ field }) => (
                                    <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="web" render={({ field }) => (
                                    <FormItem><FormLabel>Web</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                            <Button type="submit" className="w-full mt-6" disabled={importing}>
                                {importing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Guardando...</> : 'Guardar en la guía'}
                            </Button>
                        </form>
                    </Form>
                </SheetContent>
            </Sheet>
        </div>
    )
}
