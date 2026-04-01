"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { updateEstadoPago } from "@/actions/comercio"
import { EstadoPago } from "@prisma/client"

export function PagoStatusButtons({ comercioId, estadoPagoBase }: { comercioId: string, estadoPagoBase: EstadoPago }) {
    const { toast } = useToast()
    const [updating, setUpdating] = useState(false)

    // Usamos el estado optimista local para que la UI se sienta instantánea
    const [current, setCurrent] = useState<EstadoPago>(estadoPagoBase)

    const handleUpdate = async (nuevo: EstadoPago) => {
        setUpdating(true)
        const res = await updateEstadoPago(comercioId, nuevo)
        if (res.success) {
            setCurrent(nuevo)
            toast({ title: "Actualizado", description: "Estado de pago actualizado." })
        } else {
            toast({ variant: "destructive", title: "Error", description: res.error || "No se ha podido actualizar el pago." })
        }
        setUpdating(false)
    }

    return (
        <div className="flex gap-3">
            <Button
                variant={current === 'NO_PAGADO' ? 'default' : 'outline'}
                size="sm"
                className={`flex-1 h-10 text-xs sm:text-sm font-semibold transition-all ${current === 'NO_PAGADO' ? 'bg-red-500 hover:bg-red-600 text-white border-transparent shadow-md shadow-red-500/20' : 'hover:bg-red-500/10 hover:border-red-500/40 text-muted-foreground'}`}
                onClick={() => handleUpdate('NO_PAGADO')}
                disabled={updating}
            >
                NO PAGADO
            </Button>
            <Button
                variant={current === 'PAGADO_50' ? 'default' : 'outline'}
                size="sm"
                className={`flex-1 h-10 text-xs sm:text-sm font-semibold transition-all ${current === 'PAGADO_50' ? 'bg-amber-500 hover:bg-amber-600 text-white border-transparent shadow-md shadow-amber-500/20' : 'hover:bg-amber-500/10 hover:border-amber-500/40 text-muted-foreground'}`}
                onClick={() => handleUpdate('PAGADO_50')}
                disabled={updating}
            >
                PAGADO 50%
            </Button>
            <Button
                variant={current === 'PAGADO_100' ? 'default' : 'outline'}
                size="sm"
                className={`flex-1 h-10 text-xs sm:text-sm font-semibold transition-all ${current === 'PAGADO_100' ? 'bg-green-500 hover:bg-green-600 text-white border-transparent shadow-md shadow-green-500/20' : 'hover:bg-green-500/10 hover:border-green-500/40 text-muted-foreground'}`}
                onClick={() => handleUpdate('PAGADO_100')}
                disabled={updating}
            >
                PAGADO 100%
            </Button>
        </div>
    )
}
