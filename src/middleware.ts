import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminPage = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isAdminApi = pathname.startsWith("/api/admin");

  if (isAdminPage || isAdminApi) {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Parameters<typeof response.cookies.set>[2] }>) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    // 1. Check verified Supabase Auth user session from cookie
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user || !user.email) {
      if (isAdminApi) {
        return NextResponse.json({ error: "Unauthorized: Invalid or missing session." }, { status: 401 });
      }
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/admin/login";
      return NextResponse.redirect(redirectUrl);
    }

    // 2. Query admins table in Supabase for user's email
    const { data: adminRecord, error: adminError } = await supabase
      .from("admins")
      .select("email, role")
      .eq("email", user.email.toLowerCase().trim())
      .maybeSingle();

    if (adminError || !adminRecord) {
      if (isAdminApi) {
        return NextResponse.json({ error: "Forbidden: Not an authorized administrator." }, { status: 403 });
      }
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/admin/login";
      return NextResponse.redirect(redirectUrl);
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
