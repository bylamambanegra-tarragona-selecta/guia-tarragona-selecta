import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"

// Renderizamos el sheet de edición directamente en una página dedicada
export default async function EditarComercioPage({ params }: { params: { id: string } }) {
    const comercio = await prisma.comercio.findUnique({ where: { id: params.id } })
    if (!comercio) notFound()

    return (
        <div className="max-w-2xl mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">Editar: {comercio.nombre}</h1>
            {/* El EditComercioSheet abre automáticamente en modo página */}
            <EditarFormWrapper comercio={comercio} />
        </div>
    )
}

// Wrapper client que abre el sheet inmediatamente al entrar en esta ruta
import { EditarFormInline } from "./editar-form-inline"
import type { Comercio } from "@prisma/client"

function EditarFormWrapper({ comercio }: { comercio: Comercio }) {
    return <EditarFormInline comercio={comercio} />
}
