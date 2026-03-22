import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'blokus-auth';

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ログインページ・APIは認証不要
  if (pathname.startsWith('/login') || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  const authed = req.cookies.get(COOKIE_NAME)?.value === '1';
  if (!authed) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 静的ファイル・_next を除くすべてのパスに適用
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
