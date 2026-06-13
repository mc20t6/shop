import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  // Lay role tu cookies
  const role = request.cookies.get("role")?.value.toUpperCase();

  const isAuthPage =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/register");

  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isStaffRoute = request.nextUrl.pathname.startsWith("/staff");

  // Chua dang nhap se dieu huong den trang login
  if ((isAdminRoute || isStaffRoute) && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Neu dang nhap roi se dieu huong theo role
  if (isAuthPage && token) {
    if (role === "ADMIN") return NextResponse.redirect(new URL("/admin", request.url));
    if (role === "STAFF") return NextResponse.redirect(new URL("/staff", request.url));
    if(role === "CUSTOMER") return NextResponse.redirect(new URL("/shop", request.url));
    return NextResponse.redirect(new URL("/", request.url));
  }

  // if (isAdminRoute && role !== "ADMIN") {
  //   if (role === "STAFF") {
  //     return NextResponse.redirect(new URL("/staff", request.url));
  //   }
  //   return NextResponse.redirect(new URL("/login", request.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register", "/admin/:path*", "/staff/:path*"],
};
