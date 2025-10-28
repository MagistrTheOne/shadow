import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Защищенные маршруты (требуют аутентификации)
  const protectedRoutes = [
    "/dashboard",
    "/meetings",
    "/agents",
    "/upgrade",
  ];

  // Публичные маршруты (доступны всем)
  const publicRoutes = [
    "/",
    "/sign-in",
    "/sign-up",
    "/pricing",
    "/features",
    "/product",
    "/demo",
    "/company",
    "/support",
  ];

  // API маршруты (всегда публичные)
  const apiRoutes = ["/api"];

  // Проверяем, является ли маршрут защищенным
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Проверяем, является ли маршрут публичным
  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith(route + "/")
  ) || apiRoutes.some(route => pathname.startsWith(route));

  // Проверяем, является ли маршрут для аутентификации
  const isAuthRoute = ["/sign-in", "/sign-up"].includes(pathname);

  try {
    // Получаем сессию
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // Если пользователь авторизован и пытается зайти на страницу аутентификации
    if (session && isAuthRoute) {
      // Редиректим на dashboard
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Если маршрут защищенный и пользователь не авторизован
    if (isProtectedRoute && !session) {
      // Редиректим на sign-in с callbackUrl
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Если пользователь авторизован и идет на главную страницу
    if (session && pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Все остальные случаи - пропускаем
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);

    // В случае ошибки аутентификации - редиректим на sign-in
    if (isProtectedRoute) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Для публичных маршрутов - пропускаем даже при ошибке
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
