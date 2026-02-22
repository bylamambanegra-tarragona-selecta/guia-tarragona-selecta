"use client"

import React, { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    // Clear any stale session on mount to ensure clean state
    React.useEffect(() => {
        const checkSession = async () => {
            const { data } = await supabase.auth.getSession()
            if (data.session) {
                await supabase.auth.signOut()
            }
        }
        checkSession()
    }, [supabase])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError("")

        const { error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) {
            setError("Credenciales incorrectas. Verifica tu email y contraseña.")
            setLoading(false)
            return
        }

        router.push("/comercios")
        router.refresh()
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            {/* Glow de fondo */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-sm relative">
                {/* Cabecera */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
                        <span className="text-2xl font-black text-primary">MN</span>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">La Mamba Negra</h1>
                    <p className="text-sm text-muted-foreground mt-1">Guía Tarragona · Gestión Interna</p>
                </div>

                {/* Card de login */}
                <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="tu@email.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                                className="h-11"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-sm font-medium">Contraseña</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                                className="h-11"
                            />
                        </div>

                        {error && (
                            <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-lg px-4 py-3">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full h-11 font-semibold" disabled={loading}>
                            {loading ? (
                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Entrando...</>
                            ) : (
                                'Entrar'
                            )}
                        </Button>
                    </form>
                </div>

                <p className="text-center text-xs text-muted-foreground mt-6">
                    Acceso restringido · Solo personal autorizado
                </p>
            </div>
        </div>
    )
}
