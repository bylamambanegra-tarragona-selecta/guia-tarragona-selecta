"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteComercio } from "@/actions/comercio"
import { useToast } from "@/hooks/use-toast"

export function DeleteComercioButton({ id, nombre }: { id: string; nombre: string }) {
    const [isPending, startTransition] = useTransition()
    const { toast } = useToast()
    const router = useRouter()

    function handleDelete() {
        startTransition(async () => {
            const result = await deleteComercio(id)
            if (result.success) {
                toast({ title: "Comercio eliminado", description: `${nombre} ha sido eliminado.` })
                router.push("/comercios")
            } else {
                toast({ variant: "destructive", title: "Error", description: result.error })
            }
        })
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isPending}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Eliminar
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar este comercio?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción eliminará <strong>{nombre}</strong> y todas sus notas de forma permanente. No se puede deshacer.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isPending ? "Eliminando..." : "Sí, eliminar"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
