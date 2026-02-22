import Link from "next/link"
import { LayoutDashboard, Store, Search, LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"

export function Sidebar() {
    return (
        <div className="flex flex-col h-full border-r bg-muted/20 w-64 lg:w-72">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <Store className="h-6 w-6" />
                    <span className="">La Mamba Negra</span>
                </Link>
            </div>
            <div className="flex-1 overflow-auto py-2">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4 space-y-1">
                    <Link
                        href="/comercios"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary active:bg-muted"
                    >
                        <LayoutDashboard className="h-4 w-4" />
                        Directorio de Comercios
                    </Link>
                    <Link
                        href="/descubrir"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted/50"
                    >
                        <Search className="h-4 w-4" />
                        Descubrir (Google Places)
                    </Link>
                </nav>
            </div>
            <div className="mt-auto p-4">
                <form action="/auth/signout" method="post">
                    <Button variant="outline" className="w-full flex gap-2" type="submit">
                        <LogOut className="h-4 w-4" />
                        Cerrar sesión
                    </Button>
                </form>
            </div>
        </div>
    )
}
