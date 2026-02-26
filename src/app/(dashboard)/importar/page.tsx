"use client"

import { useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import Papa from "papaparse"
import * as XLSX from "xlsx"
import { CheckCircle2, AlertTriangle, Upload, ArrowRight, ArrowLeft, Loader2, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

const APP_FIELDS = [
    { value: '__ignore', label: '[Ignorar columna]' },
    { value: 'nombre', label: '📌 Nombre *' },
    { value: 'tipo_comercio', label: '🏷️ Tipo de comercio *' },
    { value: 'barrio', label: '🏘️ Barrio *' },
    { value: 'codigo_postal', label: '📮 Código postal *' },
    { value: 'direccion', label: '📍 Dirección' },
    { value: 'telefono', label: '📞 Teléfono' },
    { value: 'email', label: '📧 Email' },
    { value: 'web', label: '🌐 Web' },
    { value: 'instagram', label: '📸 Instagram' },
    { value: 'facebook', label: '👥 Facebook' },
    { value: 'tiktok', label: '🎵 TikTok' },
    { value: 'maps_url', label: '🗺️ Google Maps URL' },
    { value: 'maps_lat', label: '🌐 Latitud' },
    { value: 'maps_lng', label: '🌐 Longitud' },
    { value: 'notas', label: '📝 Notas iniciales' },
    { value: 'estado_anuncio', label: '📊 Estado anuncio' },
    { value: 'visitado', label: '✅ Visitado' },
]

const AUTO_MAP: Record<string, string> = {
    nombre: 'nombre', name: 'nombre',
    tipo: 'tipo_comercio', 'tipo comercio': 'tipo_comercio', type: 'tipo_comercio',
    barrio: 'barrio', neighbourhood: 'barrio', neighborhood: 'barrio',
    'codigo postal': 'codigo_postal', 'código postal': 'codigo_postal', cp: 'codigo_postal', zip: 'codigo_postal',
    direccion: 'direccion', 'dirección': 'direccion', address: 'direccion',
    telefono: 'telefono', 'teléfono': 'telefono', phone: 'telefono', tel: 'telefono',
    email: 'email', correo: 'email',
    web: 'web', website: 'web', url: 'web',
    instagram: 'instagram', facebook: 'facebook', tiktok: 'tiktok',
    'maps url': 'maps_url', 'google maps': 'maps_url', maps: 'maps_url',
    latitud: 'maps_lat', lat: 'maps_lat', latitude: 'maps_lat',
    longitud: 'maps_lng', lng: 'maps_lng', longitude: 'maps_lng',
    notas: 'notas', notes: 'notas', comentario: 'notas',
    estado: 'estado_anuncio', 'estado anuncio': 'estado_anuncio',
    visitado: 'visitado', visited: 'visitado',
}

type Step = 1 | 2 | 3
type DuplicateMode = 'omitir' | 'actualizar' | 'importar'

export default function ImportarPage() {
    const [step, setStep] = useState<Step>(1)
    const { toast } = useToast()
    const router = useRouter()
    const dropRef = useRef<HTMLDivElement>(null)

    // Step 1
    const [isDragging, setIsDragging] = useState(false)
    const [rawRows, setRawRows] = useState<Record<string, string>[]>([])
    const [headers, setHeaders] = useState<string[]>([])
    const [fileName, setFileName] = useState('')

    // Step 2
    const [mapping, setMapping] = useState<Record<string, string>>({})

    // Step 3
    const [duplicateMode, setDuplicateMode] = useState<DuplicateMode>('omitir')
    const [importing, setImporting] = useState(false)
    const [progress, setProgress] = useState(0)
    const [result, setResult] = useState<{ importados: number, omitidos: number, errores: number } | null>(null)

    // Parsear archivo
    const parseFile = useCallback((file: File) => {
        setFileName(file.name)
        const ext = file.name.split('.').pop()?.toLowerCase()

        if (ext === 'csv') {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (res) => {
                    const h = res.meta.fields ?? []
                    setHeaders(h)
                    setRawRows(res.data as Record<string, string>[])
                    autoMap(h)
                    setStep(2)
                }
            })
        } else if (ext === 'xlsx' || ext === 'xls') {
            const reader = new FileReader()
            reader.onload = (e) => {
                const wb = XLSX.read(e.target?.result, { type: 'binary' })
                const ws = wb.Sheets[wb.SheetNames[0]]
                const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: '' })
                const h = Object.keys(jsonData[0] ?? {})
                setHeaders(h)
                setRawRows(jsonData)
                autoMap(h)
                setStep(2)
            }
            reader.readAsBinaryString(file)
        } else {
            toast({ variant: 'destructive', title: 'Formato no soportado', description: 'Usa .csv, .xlsx o .xls' })
        }
    }, [toast])

    const autoMap = (h: string[]) => {
        const m: Record<string, string> = {}
        h.forEach(col => {
            const key = col.toLowerCase().trim()
            m[col] = AUTO_MAP[key] ?? '__ignore'
        })
        setMapping(m)
    }

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files[0]
        if (file) parseFile(file)
    }, [parseFile])

    const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) parseFile(file)
    }

    // Construir filas mapeadas
    const mappedRows = rawRows.map(row => {
        const obj: Record<string, string> = {}
        Object.entries(mapping).forEach(([col, field]) => {
            if (field !== '__ignore') obj[field] = row[col] ?? ''
        })
        return obj
    })

    const validRows = mappedRows.filter(r => r.nombre && r.tipo_comercio && r.barrio && r.codigo_postal)
    const invalidRows = mappedRows.filter(r => !r.nombre || !r.tipo_comercio || !r.barrio || !r.codigo_postal)
    const mappedFields = Object.values(mapping).filter(v => v !== '__ignore').length

    // Importar
    const handleImport = async () => {
        setImporting(true)
        setProgress(0)
        const BATCH = 50
        let importados = 0, omitidos = 0, errores = 0

        for (let i = 0; i < validRows.length; i += BATCH) {
            const batch = validRows.slice(i, i + BATCH)
            const res = await fetch('/api/importar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ comercios: batch, duplicados: duplicateMode }),
            })
            const data = await res.json()
            importados += data.importados ?? 0
            omitidos += data.omitidos ?? 0
            errores += data.errores ?? 0
            setProgress(Math.round(((i + BATCH) / validRows.length) * 100))
        }

        setProgress(100)
        setResult({ importados, omitidos, errores })
        setImporting(false)
    }

    return (
        <div className="max-w-4xl mx-auto py-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Importar Comercios</h1>
                <p className="text-muted-foreground text-sm mt-1">Importa comercios desde un archivo CSV o Excel en 3 pasos</p>
            </div>

            {/* Indicador de pasos */}
            <div className="flex items-center gap-0">
                {[1, 2, 3].map((s, i) => (
                    <div key={s} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step === s ? 'bg-primary text-primary-foreground' :
                            step > s ? 'bg-primary/30 text-primary' :
                                'bg-muted text-muted-foreground'
                            }`}>{s}</div>
                        {i < 2 && <div className={`w-16 h-0.5 ${step > s ? 'bg-primary/50' : 'bg-border'}`} />}
                    </div>
                ))}
                <div className="ml-4 flex gap-8 text-sm">
                    <span className={step >= 1 ? 'text-foreground font-medium' : 'text-muted-foreground'}>Subir archivo</span>
                    <span className={step >= 2 ? 'text-foreground font-medium' : 'text-muted-foreground'}>Mapear columnas</span>
                    <span className={step >= 3 ? 'text-foreground font-medium' : 'text-muted-foreground'}>Confirmar</span>
                </div>
            </div>

            {/* PASO 1: Subir archivo */}
            {step === 1 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Selecciona el archivo</CardTitle>
                        <CardDescription>Acepta .csv, .xlsx o .xls. Máximo recomendado: 5.000 filas.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div
                            ref={dropRef}
                            onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={onDrop}
                            className={`border-2 border-dashed rounded-xl p-14 text-center transition-colors cursor-pointer ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                                }`}
                            onClick={() => document.getElementById('file-input')?.click()}
                        >
                            <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                            <p className="font-medium mb-1">Arrastra tu archivo aquí</p>
                            <p className="text-sm text-muted-foreground">o haz clic para seleccionar</p>
                            <p className="text-xs text-muted-foreground mt-3">.csv · .xlsx · .xls</p>
                        </div>
                        <input id="file-input" type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={onFileInput} />
                    </CardContent>
                </Card>
            )}

            {/* PASO 2: Mapear columnas */}
            {step === 2 && (
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Mapear columnas</CardTitle>
                            <CardDescription>
                                Asigna cada columna del archivo <strong>{fileName}</strong> a un campo de la aplicación.
                                {' '}<span className="text-primary">{mappedFields} mapeadas</span>
                                {' '}· {headers.length - mappedFields} ignoradas
                                {' '}· <span className="text-primary">{rawRows.length} filas</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-2">
                                {headers.map(col => (
                                    <div key={col} className="flex items-center gap-4">
                                        <span className="text-sm font-mono bg-muted px-3 py-1.5 rounded w-44 truncate">{col}</span>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <Select value={mapping[col] ?? '__ignore'} onValueChange={v => setMapping(m => ({ ...m, [col]: v }))}>
                                            <SelectTrigger className="w-52 h-8 text-sm"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {APP_FIELDS.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Preview 5 filas */}
                    <Card>
                        <CardHeader><CardTitle className="text-base">Previsualización (5 primeras filas)</CardTitle></CardHeader>
                        <CardContent className="overflow-x-auto">
                            <table className="text-xs w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        {headers.map(h => <th key={h} className="text-left px-2 py-1 font-medium text-muted-foreground">{h}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {rawRows.slice(0, 5).map((row, i) => (
                                        <tr key={i} className="border-b border-border/50">
                                            {headers.map(h => <td key={h} className="px-2 py-1 truncate max-w-[150px]">{row[h]}</td>)}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>

                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="h-4 w-4 mr-1" /> Volver</Button>
                        <Button onClick={() => setStep(3)} disabled={!mapping['nombre'] && !Object.values(mapping).includes('nombre')}>
                            Revisar datos <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}

            {/* PASO 3: Revisar y confirmar */}
            {step === 3 && !result && (
                <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <Card className="border-green-500/20 bg-green-500/5">
                            <CardContent className="pt-4 text-center">
                                <CheckCircle2 className="h-8 w-8 text-green-400 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-green-400">{validRows.length}</p>
                                <p className="text-sm text-muted-foreground">Filas válidas</p>
                            </CardContent>
                        </Card>
                        <Card className="border-destructive/20 bg-destructive/5">
                            <CardContent className="pt-4 text-center">
                                <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
                                <p className="text-2xl font-bold text-destructive">{invalidRows.length}</p>
                                <p className="text-sm text-muted-foreground">Sin campos requeridos</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4 text-center">
                                <Info className="h-8 w-8 text-accent mx-auto mb-2" />
                                <p className="text-2xl font-bold">{rawRows.length}</p>
                                <p className="text-sm text-muted-foreground">Total filas</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">¿Cómo gestionar duplicados?</CardTitle>
                            <CardDescription>Un duplicado es un comercio con el mismo nombre y barrio.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                            {[
                                { value: 'omitir', label: 'Omitir duplicados', desc: 'Los comercios duplicados se saltan' },
                                { value: 'actualizar', label: 'Actualizar existentes', desc: 'Se actualizan los datos del comercio existente' },
                                { value: 'importar', label: 'Importar igualmente', desc: 'Se crea un nuevo registro aunque haya duplicado' },
                            ].map(opt => (
                                <label key={opt.value} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${duplicateMode === opt.value ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80'
                                    }`}>
                                    <input
                                        type="radio"
                                        name="duplicados"
                                        value={opt.value}
                                        checked={duplicateMode === opt.value}
                                        onChange={() => setDuplicateMode(opt.value as DuplicateMode)}
                                        className="mt-0.5 accent-[hsl(var(--primary))]"
                                    />
                                    <div>
                                        <p className="font-medium text-sm">{opt.label}</p>
                                        <p className="text-xs text-muted-foreground">{opt.desc}</p>
                                    </div>
                                </label>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Tabla de previsualización paginada */}
                    <Card>
                        <CardHeader><CardTitle className="text-base">Datos a importar (primeras 20)</CardTitle></CardHeader>
                        <CardContent className="overflow-x-auto">
                            <table className="text-xs w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left px-2 py-1 text-muted-foreground font-medium">Nombre</th>
                                        <th className="text-left px-2 py-1 text-muted-foreground font-medium">Tipo</th>
                                        <th className="text-left px-2 py-1 text-muted-foreground font-medium">Barrio</th>
                                        <th className="text-left px-2 py-1 text-muted-foreground font-medium">C.P.</th>
                                        <th className="text-left px-2 py-1 text-muted-foreground font-medium">Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mappedRows.slice(0, 20).map((row, i) => {
                                        const isInvalid = !row.nombre || !row.tipo_comercio || !row.barrio || !row.codigo_postal
                                        return (
                                            <tr key={i} className={`border-b border-border/50 ${isInvalid ? 'bg-destructive/10' : ''}`}>
                                                <td className="px-2 py-1">{row.nombre || <span className="text-destructive">—</span>}</td>
                                                <td className="px-2 py-1">{row.tipo_comercio || <span className="text-destructive">—</span>}</td>
                                                <td className="px-2 py-1">{row.barrio || <span className="text-destructive">—</span>}</td>
                                                <td className="px-2 py-1">{row.codigo_postal || <span className="text-destructive">—</span>}</td>
                                                <td className="px-2 py-1">
                                                    {isInvalid
                                                        ? <Badge variant="destructive" className="text-xs">⚠ Error</Badge>
                                                        : <Badge variant="secondary" className="text-xs">✓ OK</Badge>
                                                    }
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>

                    {importing && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Importando...</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                                <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setStep(2)} disabled={importing}>
                            <ArrowLeft className="h-4 w-4 mr-1" /> Volver
                        </Button>
                        <Button onClick={handleImport} disabled={importing || validRows.length === 0} className="flex-1">
                            {importing
                                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Importando...</>
                                : `Confirmar importación (${validRows.length} registros)`
                            }
                        </Button>
                    </div>
                </div>
            )}

            {/* Resultado final */}
            {result && (
                <Card className="border-green-500/30 bg-green-500/5">
                    <CardContent className="pt-8 pb-8 text-center space-y-4">
                        <CheckCircle2 className="h-16 w-16 text-green-400 mx-auto" />
                        <h2 className="text-xl font-bold">¡Importación completada!</h2>
                        <div className="flex justify-center gap-6 text-sm">
                            <div><p className="text-2xl font-bold text-green-400">{result.importados}</p><p className="text-muted-foreground">importados</p></div>
                            <Separator orientation="vertical" className="h-12" />
                            <div><p className="text-2xl font-bold text-accent">{result.omitidos}</p><p className="text-muted-foreground">omitidos</p></div>
                            <Separator orientation="vertical" className="h-12" />
                            <div><p className="text-2xl font-bold text-destructive">{result.errores}</p><p className="text-muted-foreground">errores</p></div>
                        </div>
                        <Button onClick={() => router.push('/comercios')} className="mt-4">
                            Ver lista de comercios
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
