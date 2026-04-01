"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import {
    Search, Filter, X, ChevronLeft, ChevronRight, SlidersHorizontal
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { updateEstadoPago } from "@/actions/comercio"
import type { Comercio, TipoComercio, EstadoPago } from "@prisma/client"

const BARRIOS = [
    'Centre', 'Eixample', 'Part Alta', 'Serrallo', 'Sant Pere i Sant Pau',
    'Bonavista', 'Torreforta', 'Campclar', 'Zones Industrials', 'Riu Clar',
    'Llarga', 'Els Pallaresos', 'Altres'
]

const TIPO_OPTS: { value: TipoComercio; label: string; color: string }[] = [
    { value: 'RESTAURANTE', label: 'Restaurante', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
    { value: 'BAR', label: 'Bar', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    { value: 'HOTEL', label: 'Hotel', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    { value: 'TIENDA_REGALOS', label: 'Tienda/Regalos', color: 'bg-pink-500/20 text-pink-300 border-pink-500/30' },
    { value: 'SALUD_CUIDADO', label: 'Salud/Cuidado', color: 'bg-green-500/20 text-green-300 border-green-500/30' },
    { value: 'REPARACIONES', label: 'Reparaciones', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
    { value: 'SERVICIOS', label: 'Servicios', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
    { value: 'OCIO_DIURNO', label: 'Ocio Diurno', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
    { value: 'OCIO_NOCTURNO', label: 'Ocio Nocturno', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
    { value: 'ANUNCIO_ESPECIAL', label: 'Anuncio Especial', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
    { value: 'OTROS', label: 'Otros', color: 'bg-gray-500/20 text-gray-300 border-gray-500/30' },
]

const ESTADO_PAGO_OPTS: { value: EstadoPago; label: string; color: string }[] = [
    { value: 'NO_PAGADO', label: 'No Pagado', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    { value: 'PAGADO_50', label: 'Pagado 50%', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    { value: 'PAGADO_100', label: 'Pagado 100%', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
]

type ApiResponse = { data: Comercio[]; total: number; page: number; totalPages: number }

function TipoBadge({ tipo }: { tipo: TipoComercio }) {
    const opt = TIPO_OPTS.find(o => o.value === tipo)
    if (!opt) return null
    return (
        <span className={`text-xs px-2 py-0.5 rounded border font-medium whitespace-nowrap ${opt.color}`}>
            {opt.label}
        </span>
    )
}

function PagoBadge({ pago }: { pago: EstadoPago }) {
    const opt = ESTADO_PAGO_OPTS.find(o => o.value === pago)
    if (!opt) return null
    return (
        <span className={`text-xs px-2 py-0.5 rounded border font-medium whitespace-nowrap ${opt.color}`}>
            {opt.label}
        </span>
    )
}

export default function PagosClientPage() {
    const { toast } = useToast()

    // Filtros
    const [q, setQ] = useState('')
    const [barrios, setBarrios] = useState<string[]>([])
    const [tipos, setTipos] = useState<string[]>([])
    const [estadosPago, setEstadosPago] = useState<string[]>([])
    const [page, setPage] = useState(1)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    // Datos
    const [result, setResult] = useState<ApiResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [updatingPago, setUpdatingPago] = useState<string | null>(null)

    const buildQueryParams = useCallback((limit: number, p: number) => {
        const params = new URLSearchParams()
        if (q) params.set('q', q)
        barrios.forEach(b => params.append('barrio', b))
        tipos.forEach(t => params.append('tipo', t))
        estadosPago.forEach(e => params.append('estado_pago', e))
        params.set('page', String(p))
        params.set('limit', String(limit))
        return params.toString()
    }, [q, barrios, tipos, estadosPago])

    const fetchData = useCallback(async () => {
        setLoading(true)
        const res = await fetch(`/api/comercios?${buildQueryParams(25, page)}`)
        const data = await res.json()
        setResult(data)
        setLoading(false)
    }, [page, buildQueryParams])

    useEffect(() => {
        const timer = setTimeout(fetchData, 300)
        return () => clearTimeout(timer)
    }, [fetchData])

    // Reset page when filters change
    useEffect(() => { setPage(1) }, [q, barrios, tipos, estadosPago])

    const clearAll = () => {
        setQ(''); setBarrios([]); setTipos([]); setEstadosPago([]); setPage(1)
    }

    const toggleArr = (arr: string[], val: string, set: (v: string[]) => void) => {
        set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])
    }

    const handlePagoUpdate = async (id: string, estadoPago: EstadoPago) => {
        setUpdatingPago(id)
        const res = await updateEstadoPago(id, estadoPago)
        if (res.success) {
            toast({ title: 'Actualizado', description: 'Estado de pago marcado correctamente.' })
            fetchData()
        } else {
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo actualizar.' })
        }
        setUpdatingPago(null)
    }

    const hasFilters = q || barrios.length || tipos.length || estadosPago.length

    // Sidebar de filtros (reutilizable en desktop y mobile)
    const FiltersPanel = () => (
        <div className="flex flex-col gap-5 p-4">
            {/* Estado Pago */}
            <div>
                <Label className="text-xs uppercase tracking-wide text-primary font-bold mb-2 block">Estado del Pago</Label>
                <div className="space-y-1.5">
                    {ESTADO_PAGO_OPTS.map(o => (
                        <div key={o.value} className="flex items-center gap-2">
                            <Checkbox
                                id={`pago-${o.value}`}
                                checked={estadosPago.includes(o.value)}
                                onCheckedChange={() => toggleArr(estadosPago, o.value, setEstadosPago)}
                            />
                            <label htmlFor={`pago-${o.value}`} className="text-sm cursor-pointer select-none">{o.label}</label>
                        </div>
                    ))}
                </div>
            </div>

            <Separator />

            {/* Barrio */}
            <div>
                <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">Barrio</Label>
                <div className="space-y-1.5">
                    {BARRIOS.map(b => (
                        <div key={b} className="flex items-center gap-2">
                            <Checkbox
                                id={`barrio-${b}`}
                                checked={barrios.includes(b)}
                                onCheckedChange={() => toggleArr(barrios, b, setBarrios)}
                            />
                            <label htmlFor={`barrio-${b}`} className="text-sm cursor-pointer select-none">{b}</label>
                        </div>
                    ))}
                </div>
            </div>

            <Separator />

            {/* Tipo */}
            <div>
                <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">Tipo de Comercio</Label>
                <div className="space-y-1.5">
                    {TIPO_OPTS.map(o => (
                        <div key={o.value} className="flex items-center gap-2">
                            <Checkbox
                                id={`tipo-${o.value}`}
                                checked={tipos.includes(o.value)}
                                onCheckedChange={() => toggleArr(tipos, o.value, setTipos)}
                            />
                            <label htmlFor={`tipo-${o.value}`} className="text-sm cursor-pointer select-none">{o.label}</label>
                        </div>
                    ))}
                </div>
            </div>

            {hasFilters && (
                <Button variant="ghost" size="sm" className="w-full text-muted-foreground mt-4" onClick={clearAll}>
                    <X className="h-3 w-3 mr-1" /> Limpiar filtros
                </Button>
            )}
        </div>
    )

    return (
        <div className="flex h-full">
            {/* Sidebar desktop */}
            <aside className="hidden lg:flex w-[260px] flex-col border-r border-border shrink-0 overflow-y-auto">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-card">
                    <SlidersHorizontal className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-sm">Filtros de Pagos</span>
                    {hasFilters && (
                        <Badge variant="secondary" className="ml-auto text-xs">{
                            [barrios.length, tipos.length, estadosPago.length]
                                .reduce((a, b) => a + b, 0)
                        } activos</Badge>
                    )}
                </div>
                <FiltersPanel />
            </aside>

            {/* Contenido principal */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Barra superior */}
                <div className="flex items-center gap-3 p-4 border-b border-border">
                    {/* Búsqueda texto libre */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nombre..."
                            className="pl-9 h-9"
                            value={q}
                            onChange={e => setQ(e.target.value)}
                        />
                        {q && (
                            <button onClick={() => setQ('')} className="absolute right-2 top-1/2 -translate-y-1/2">
                                <X className="h-3 w-3 text-muted-foreground" />
                            </button>
                        )}
                    </div>

                    {/* Filtros mobile */}
                    <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="sm" className="lg:hidden gap-1">
                                <Filter className="h-4 w-4" />
                                Filtros
                                {hasFilters && <Badge variant="secondary" className="ml-1">•</Badge>}
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[300px] p-0 overflow-y-auto">
                            <SheetHeader className="px-4 py-3 border-b">
                                <SheetTitle>Filtros de Pagos</SheetTitle>
                            </SheetHeader>
                            <FiltersPanel />
                        </SheetContent>
                    </Sheet>

                    {/* Contador */}
                    {result && (
                        <span className="text-sm text-muted-foreground whitespace-nowrap hidden sm:block">
                            Mostrando <span className="text-foreground font-medium">{result.data.length}</span> comercios
                        </span>
                    )}
                </div>

                {/* Tabla */}
                <div className="flex-1 overflow-auto bg-muted/10">
                    {loading ? (
                        <div className="flex items-center justify-center h-40 text-muted-foreground">
                            Cargando comercios...
                        </div>
                    ) : !result || result.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground">
                            <Filter className="h-8 w-8 opacity-30" />
                            <p>No hay comercios con los filtros actuales</p>
                            {hasFilters && <Button variant="ghost" size="sm" onClick={clearAll}>Limpiar filtros</Button>}
                        </div>
                    ) : (
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {result.data.map(c => (
                                <div key={c.id} className="border border-border rounded-lg bg-card p-4 flex flex-col hover:border-primary/30 transition-colors">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <Link href={`/comercios/${c.id}`} className="font-semibold text-base hover:text-primary transition-colors line-clamp-1">
                                                {c.nombre}
                                            </Link>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                <TipoBadge tipo={c.tipo_comercio} />
                                                <span className="text-xs text-muted-foreground flex items-center">{c.barrio}</span>
                                            </div>
                                        </div>
                                        <PagoBadge pago={c.estado_pago || 'NO_PAGADO'} />
                                    </div>
                                    
                                    <div className="mt-auto pt-4 flex gap-2">
                                        <Button
                                            variant={c.estado_pago === 'NO_PAGADO' ? 'default' : 'outline'}
                                            size="sm"
                                            className={`flex-1 h-8 text-[10px] sm:text-xs font-semibold ${c.estado_pago === 'NO_PAGADO' ? 'bg-red-500 hover:bg-red-600 text-white border-transparent' : 'hover:bg-red-500/10 hover:border-red-500/30'}`}
                                            onClick={() => handlePagoUpdate(c.id, 'NO_PAGADO')}
                                            disabled={updatingPago === c.id}
                                        >
                                            NO PAGADO
                                        </Button>
                                        <Button
                                            variant={c.estado_pago === 'PAGADO_50' ? 'default' : 'outline'}
                                            size="sm"
                                            className={`flex-1 h-8 text-[10px] sm:text-xs font-semibold ${c.estado_pago === 'PAGADO_50' ? 'bg-amber-500 hover:bg-amber-600 text-white border-transparent' : 'hover:bg-amber-500/10 hover:border-amber-500/30'}`}
                                            onClick={() => handlePagoUpdate(c.id, 'PAGADO_50')}
                                            disabled={updatingPago === c.id}
                                        >
                                            50%
                                        </Button>
                                        <Button
                                            variant={c.estado_pago === 'PAGADO_100' ? 'default' : 'outline'}
                                            size="sm"
                                            className={`flex-1 h-8 text-[10px] sm:text-xs font-semibold ${c.estado_pago === 'PAGADO_100' ? 'bg-green-500 hover:bg-green-600 text-white border-transparent' : 'hover:bg-green-500/10 hover:border-green-500/30'}`}
                                            onClick={() => handlePagoUpdate(c.id, 'PAGADO_100')}
                                            disabled={updatingPago === c.id}
                                        >
                                            100%
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Paginación */}
                {result && result.totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-border bg-card">
                        <span className="text-sm text-muted-foreground">
                            Página {result.page} de {result.totalPages}
                        </span>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" disabled={page >= result.totalPages} onClick={() => setPage(p => p + 1)}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
