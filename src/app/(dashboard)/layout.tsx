import { Sidebar } from "@/components/layout/sidebar"
import { HeaderUserMenu } from "@/components/layout/header-user-menu"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    /* if (!user) {
        redirect('/login')
    } */

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <div className="hidden border-r border-border md:block">
                <Sidebar />
            </div>
            <div className="flex flex-col">
                <header className="flex h-14 items-center gap-4 border-b border-border bg-card/50 px-4 lg:h-[60px] lg:px-6">
                    <div className="flex items-center gap-2 flex-1">
                        <span className="font-bold text-base text-foreground">
                            La <span className="text-primary">Mamba</span> Negra
                        </span>
                        <span className="text-muted-foreground text-sm hidden sm:block">· Guía Tarragona</span>
                    </div>
                    <HeaderUserMenu email={user?.email ?? 'admin@guia.com'} />
                </header>
                <main className="flex-1 overflow-auto bg-background">
                    {children}
                </main>
            </div>
        </div>
    )
}
