import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANTE: Evitar escribir lógica de negocio debajo de getUser()
    // Asegura que el token no ha expirado
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const isAuthRoute = request.nextUrl.pathname.startsWith('/login')

    /* if (!user && !isAuthRoute) {
        // Si no hay usuario y trata de ir a una ruta protegida (cualquiera que no sea /login)
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    } */

    if (user && isAuthRoute) {
        // Si hay usuario y trata de ir a /login, llevar a comercios (home page para prospección)
        const url = request.nextUrl.clone()
        url.pathname = '/comercios'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
