import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const isAdminDeploy = process.env.NEXT_PUBLIC_DEPLOY_TARGET === 'admin';
  const isAdminPath = request.nextUrl.pathname.startsWith('/admin');

  // user 배포에서 /admin 접근 차단
  if (!isAdminDeploy && isAdminPath) {
    return NextResponse.rewrite(new URL('/404', request.url));
  }

  // admin 배포에서 비밀번호 확인
  if (isAdminDeploy && isAdminPath) {
    const authHeader = request.headers.get('authorization');
    const password = process.env.ADMIN_PASSWORD;
    if (!authHeader || authHeader !== `Basic ${btoa(`admin:${password}`)}`) {
      return new NextResponse('Unauthorized', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Admin"' },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/:path*'],
};