"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { addNota } from "@/actions/notas"
import { useToast } from "@/hooks/use-toast"

const schema = z.object({
    texto: z.string().min(3, { message: "La nota debe tener al menos 3 caracteres." }),
    autor: z.string().min(2, { message: "Indica tu nombre." }),
})

type FormValues = z.infer<typeof schema>

export function AddNoteForm({ comercioId }: { comercioId: string }) {
    const [isPending, setIsPending] = useState(false)
    const { toast } = useToast()

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { texto: "", autor: "" },
    })

    async function onSubmit(values: FormValues) {
        setIsPending(true)
        const result = await addNota(comercioId, {
            texto: values.texto,
            fecha: new Date().toISOString(),
            autor: values.autor,
        })
        setIsPending(false)

        if (result.success) {
            toast({ title: "Nota añadida" })
            form.reset()
        } else {
            toast({ variant: "destructive", title: "Error", description: result.error })
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                <FormField control={form.control} name="texto"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Textarea
                                    placeholder="Escribe una nota sobre este comercio..."
                                    className="resize-none min-h-[80px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex items-end gap-2">
                    <FormField control={form.control} name="autor"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel className="text-xs text-muted-foreground">Tu nombre</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ej. Maria" className="h-8" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" size="sm" disabled={isPending}>
                        <Send className="h-4 w-4 mr-1" />
                        {isPending ? "Guardando..." : "Añadir nota"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
