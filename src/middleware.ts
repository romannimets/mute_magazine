import { NextRequest, NextResponse } from 'next/server'

const ADMIN_SECRET = process.env.ADMIN_SECRET!

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl
    const method = req.method

    // Rotte login/logout sempre pubbliche
    if (
        pathname === '/admin/login' ||
        pathname === '/api/admin/login' ||
        pathname === '/api/admin/logout'
    ) {
        return NextResponse.next()
    }

    // Iscrizione newsletter (POST) pubblica
    if (pathname === '/api/newsletter' && method === 'POST') {
        return NextResponse.next()
    }

    // GET articoli pubblica
    if (pathname.startsWith('/api/articles') && method === 'GET') {
        return NextResponse.next()
    }

    const isAdminPage = pathname.startsWith('/admin')
    const isProtectedApi =
        (pathname.startsWith('/api/articles') && method !== 'GET') ||
        (pathname.startsWith('/api/newsletter') && method !== 'POST') ||
        pathname.startsWith('/api/upload') ||
        pathname.startsWith('/api/media') ||
        pathname.startsWith('/api/admin') ||
        pathname.startsWith('/api/db-stats')

    if (!isAdminPage && !isProtectedApi) return NextResponse.next()

    const cookie = req.cookies.get('admin_session')?.value
    if (cookie === ADMIN_SECRET) return NextResponse.next()

    if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    return NextResponse.redirect(new URL('/admin/login', req.url))
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/api/articles/:path*',
        '/api/newsletter/:path*',
        '/api/upload/:path*',
        '/api/media/:path*',
        '/api/admin/:path*',
        '/api/db-stats',
    ],
}