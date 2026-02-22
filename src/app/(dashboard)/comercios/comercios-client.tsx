"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import {
    Search, Filter, X, ChevronLeft, ChevronRight, Download, Loader2,
    CheckCircle2, Circle, Eye, Pencil, Trash2, SlidersHorizontal
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet"
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { NewBusinessSheet } from "./new-business-sheet"
import type { Comercio, EstadoAnuncio, TipoComercio } from "@prisma/client"

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

const ESTADO_OPTS: { value: EstadoAnuncio | 'null'; label: string; color: string }[] = [
    { value: 'SE_ANUNCIA', label: 'Se anuncia', color: 'bg-green-500/20 text-green-300 border-green-500/30' },
    { value: 'NO_SE_ANUNCIA', label: 'No se anuncia', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
    { value: 'INTERESA', label: 'Interesa', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
    { value: 'TAL_VEZ', label: 'Tal vez', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
    { value: 'null', label: 'Sin definir', color: 'bg-muted/50 text-muted-foreground border-border' },
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

function EstadoBadge({ estado }: { estado: EstadoAnuncio | null }) {
    if (!estado) return <span className="text-xs text-muted-foreground">—</span>
    const opt = ESTADO_OPTS.find(o => o.value === estado)
    if (!opt) return null
    return (
        <span className={`text-xs px-2 py-0.5 rounded border font-medium ${opt.color}`}>
            {opt.label}
        </span>
    )
}

export default function ComerciosClientPage() {
    const { toast } = useToast()

    // Filtros
    const [q, setQ] = useState('')
    const [barrios, setBarrios] = useState<string[]>([])
    const [tipos, setTipos] = useState<string[]>([])
    const [cp, setCp] = useState('')
    const [visitado, setVisitado] = useState<string>('all')
    const [estados, setEstados] = useState<string[]>([])
    const [page, setPage] = useState(1)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    // Datos
    const [result, setResult] = useState<ApiResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState<string | null>(null)
    const [loadingExport, setLoadingExport] = useState(false)

    const buildQueryParams = useCallback((limit: number, p: number) => {
        const params = new URLSearchParams()
        if (q) params.set('q', q)
        if (cp) params.set('cp', cp)
        if (visitado && visitado !== 'all') params.set('visitado', visitado)
        barrios.forEach(b => params.append('barrio', b))
        tipos.forEach(t => params.append('tipo', t))
        estados.forEach(e => params.append('estado', e))
        params.set('page', String(p))
        params.set('limit', String(limit))
        return params.toString()
    }, [q, cp, visitado, barrios, tipos, estados])

    const fetchData = useCallback(async () => {
        setLoading(true)
        const res = await fetch(`/api/comercios?${buildQueryParams(25, page)}`)
        const data = await res.json()
        setResult(data)
        setLoading(false)
    }, [page, buildQueryParams])

    const handleExport = async (format: 'xlsx' | 'csv' = 'xlsx') => {
        setLoadingExport(true)
        try {
            toast({ title: "Iniciando descarga", description: "Recopilando datos..." })
            const res = await fetch(`/api/comercios?${buildQueryParams(5000, 1)}`)
            const data = await res.json()
            if (!data.data || data.data.length === 0) {
                toast({ variant: 'destructive', title: "Error", description: "No hay datos para exportar" })
                setLoadingExport(false)
                return
            }

            const { utils, writeFile } = await import('xlsx')

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const rows = data.data.map((c: any) => ({
                Nombre: c.nombre,
                Tipo: c.tipo_comercio,
                Barrio: c.barrio,
                'Código Postal': c.codigo_postal,
                Dirección: c.direccion || '',
                Teléfono: c.telefono || '',
                Email: c.email || '',
                Web: c.web || '',
                Instagram: c.instagram || '',
                Facebook: c.facebook || '',
                TikTok: c.tiktok || '',
                'Estado Anuncio': c.estado_anuncio || '',
                'Tipo Anuncio': c.tipo_anuncio || '',
                Visitado: c.visitado ? 'Sí' : 'No',
                'Google Maps URL': c.maps_url || '',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                Notas: Array.isArray(c.notas) ? c.notas.map((n: any) => n.texto).join(' | ') : '',
                'Fecha creación': new Date(c.created_at).toLocaleString('es-ES')
            }))

            const ws = utils.json_to_sheet(rows)
            const wb = utils.book_new()
            utils.book_append_sheet(wb, ws, "Comercios")

            // Format styling explicitly requested by user (white text on dark background)
            // Note: SheetJS CE doesn't preserve advanced cell styles easily without pro/other packages,
            // but we can at least adjust column sizes
            const colWidths = [
                { wch: 30 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 35 }, { wch: 15 },
                { wch: 25 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
                { wch: 15 }, { wch: 10 }, { wch: 40 }, { wch: 60 }, { wch: 20 }
            ]
            ws['!cols'] = colWidths

            const dateStr = new Date().toISOString().slice(0, 16).replace('T', '_').replace(':', '-')
            const fileName = `GuiaTarragona_${dateStr}.${format}`
            writeFile(wb, fileName)
            toast({ title: "Completado", description: `Se descargó ${fileName}` })

        } catch (error) {
            console.error(error)
            toast({ variant: 'destructive', title: "Error", description: "Ocurrió un error al exportar" })
        }
        setLoadingExport(false)
    }

    useEffect(() => {
        const timer = setTimeout(fetchData, 300)
        return () => clearTimeout(timer)
    }, [fetchData])

    // Reset page when filters change
    useEffect(() => { setPage(1) }, [q, cp, visitado, barrios, tipos, estados])

    const clearAll = () => {
        setQ(''); setBarrios([]); setTipos([]); setCp(''); setVisitado(''); setEstados([]); setPage(1)
    }

    const toggleArr = (arr: string[], val: string, set: (v: string[]) => void) => {
        set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])
    }

    const handleDelete = async (id: string, nombre: string) => {
        setDeleting(id)
        try {
            await fetch(`/api/comercios/${id}`, { method: 'DELETE' })
            toast({ title: 'Eliminado', description: `${nombre} eliminado correctamente.` })
            fetchData()
        } catch {
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo eliminar.' })
        }
        setDeleting(null)
    }

    const hasFilters = q || barrios.length || tipos.length || cp || visitado || estados.length

    // Sidebar de filtros (reutilizable en desktop y mobile)
    const FiltersPanel = () => (
        <div className="flex flex-col gap-5 p-4">
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

            <Separator />

            {/* CP */}
            <div>
                <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">Código Postal</Label>
                <Input placeholder="430..." value={cp} onChange={e => setCp(e.target.value)} className="h-8 text-sm" />
            </div>

            <Separator />

            {/* Visitado */}
            <div>
                <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">Visitado</Label>
                <Select value={visitado} onValueChange={setVisitado}>
                    <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Todos" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="true">Solo visitados</SelectItem>
                        <SelectItem value="false">Solo no visitados</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Separator />

            {/* Estado anuncio */}
            <div>
                <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">Estado Anuncio</Label>
                <div className="space-y-1.5">
                    {ESTADO_OPTS.map(o => (
                        <div key={o.value} className="flex items-center gap-2">
                            <Checkbox
                                id={`estado-${o.value}`}
                                checked={estados.includes(o.value)}
                                onCheckedChange={() => toggleArr(estados, o.value, setEstados)}
                            />
                            <label htmlFor={`estado-${o.value}`} className="text-sm cursor-pointer select-none">{o.label}</label>
                        </div>
                    ))}
                </div>
            </div>

            {hasFilters && (
                <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={clearAll}>
                    <X className="h-3 w-3 mr-1" /> Limpiar filtros
                </Button>
            )}
        </div>
    )

    return (
        <div className="flex h-full">
            {/* Sidebar desktop */}
            <aside className="hidden lg:flex w-[260px] flex-col border-r border-border shrink-0 overflow-y-auto">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                    <SlidersHorizontal className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-sm">Filtros</span>
                    {hasFilters && (
                        <Badge variant="secondary" className="ml-auto text-xs">{
                            [barrios.length, tipos.length, cp ? 1 : 0, visitado ? 1 : 0, estados.length]
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
                            placeholder="Buscar por nombre, teléfono, email..."
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
                                <SheetTitle>Filtros</SheetTitle>
                            </SheetHeader>
                            <FiltersPanel />
                        </SheetContent>
                    </Sheet>

                    {/* Contador */}
                    {result && (
                        <span className="text-sm text-muted-foreground whitespace-nowrap hidden sm:block">
                            Mostrando <span className="text-foreground font-medium">{result.data.length}</span>
                            {' '}de <span className="text-foreground font-medium">{result.total}</span> comercios
                        </span>
                    )}

                    <div className="ml-auto flex gap-2 overflow-x-auto">
                        <Button variant="outline" size="sm" onClick={() => handleExport('xlsx')} disabled={loadingExport}>
                            {loadingExport ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                            Exportar Excel
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleExport('csv')} disabled={loadingExport}>
                            CSV
                        </Button>
                        <Button variant="outline" size="sm" asChild className="hidden sm:flex">
                            <Link href="/importar">Importar</Link>
                        </Button>
                        <NewBusinessSheet onCreated={fetchData} />
                    </div>
                </div>

                {/* Tabla */}
                <div className="flex-1 overflow-auto">
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
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-card border-b border-border">
                                <tr>
                                    <th className="text-left font-medium text-muted-foreground px-4 py-3">Nombre</th>
                                    <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Tipo</th>
                                    <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Barrio</th>
                                    <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden xl:table-cell">Teléfono</th>
                                    <th className="text-left font-medium text-muted-foreground px-4 py-3">Estado</th>
                                    <th className="text-center font-medium text-muted-foreground px-4 py-3">Visitado</th>
                                    <th className="text-right font-medium text-muted-foreground px-4 py-3">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {result.data.map(c => (
                                    <tr key={c.id} className="hover:bg-secondary/30 transition-colors group">
                                        <td className="px-4 py-3">
                                            <Link href={`/comercios/${c.id}`} className="font-medium hover:text-primary transition-colors">
                                                {c.nombre}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            <TipoBadge tipo={c.tipo_comercio} />
                                        </td>
                                        <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                                            {c.barrio}
                                        </td>
                                        <td className="px-4 py-3 hidden xl:table-cell text-muted-foreground">
                                            {c.telefono || '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <EstadoBadge estado={c.estado_anuncio} />
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {c.visitado
                                                ? <CheckCircle2 className="h-4 w-4 text-green-400 inline-block" />
                                                : <Circle className="h-4 w-4 text-muted-foreground/40 inline-block" />
                                            }
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                                                    <Link href={`/comercios/${c.id}`}><Eye className="h-3.5 w-3.5" /></Link>
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                                                    <Link href={`/comercios/${c.id}/editar`}><Pencil className="h-3.5 w-3.5" /></Link>
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>¿Eliminar {c.nombre}?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Esta acción es permanente y eliminará también todas las notas del comercio.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                className="bg-destructive hover:bg-destructive/90"
                                                                onClick={() => handleDelete(c.id, c.nombre)}
                                                                disabled={deleting === c.id}
                                                            >
                                                                {deleting === c.id ? 'Eliminando...' : 'Eliminar'}
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Paginación */}
                {result && result.totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-border">
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
