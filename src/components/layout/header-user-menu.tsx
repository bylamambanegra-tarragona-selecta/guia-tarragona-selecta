"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { LogOut, Circle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeaderUserMenu({ email }: { email: string }) {
    const router = useRouter()
    const supabase = createClient()

    async function handleLogout() {
        await supabase.auth.signOut()
        router.push("/login")
        router.refresh()
    }

    return (
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Circle className="h-2 w-2 fill-green-400 text-green-400" />
                <span className="hidden sm:block">Conectado</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm">
                {(email || 'U')[0].toUpperCase()}
            </div>
            <span className="text-sm hidden md:block truncate max-w-[140px] text-muted-foreground">{email}</span>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={handleLogout} title="Cerrar sesión">
                <LogOut className="h-4 w-4" />
            </Button>
        </div>
    )
}
