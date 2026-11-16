import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_FISCAL, COOKIE_SESION, leerTokenFiscal, tokenSesionValido } from "./lib/auth";

// Primera barrera (solo verifica la firma de la cookie). Cada página y cada acción vuelve a verificar
// en el servidor: el fiscal, además, contra la base (que siga activo y con la misma clave).
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/fiscal")) {
    if (pathname === "/fiscal/ingresar") return NextResponse.next();
    const sesion = await leerTokenFiscal(request.cookies.get(COOKIE_FISCAL)?.value);
    if (sesion) return NextResponse.next();
    return NextResponse.redirect(new URL("/fiscal/ingresar", request.url));
  }

  // /admin y /api
  if (await tokenSesionValido(request.cookies.get(COOKIE_SESION)?.value)) return NextResponse.next();
  if (pathname.startsWith("/api")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*", "/fiscal/:path*"],
};
