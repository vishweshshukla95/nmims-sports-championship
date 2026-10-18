import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdminSession } from "@/app/actions/admin-auth";

const createUserSchema = z.object({
  email: z.string().email("Invalid email address").max(255),
  password: z
    .string()
    .min(10, "Password must be at least 10 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  role: z.enum(["admin", "super_admin"]).default("admin"),
  sports: z.array(z.string()).optional(),
});

export async function GET() {
  try {
    // 1. Session check: caller must be an authenticated administrator
    await verifyAdminSession(false);

    const supabase = createAdminClient();
    const { data: admins, error } = await supabase
      .from("admins")
      .select("id, email, role, sports, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("GET /api/admin/users error:", error);
      return NextResponse.json({ error: "Failed to retrieve administrator records" }, { status: 500 });
    }

    return NextResponse.json({ admins: admins || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unauthorized";
    console.error("GET /api/admin/users exception:", err);
    return NextResponse.json({ error: message }, { status: 403 });
  }
}

export async function POST(request: Request) {
  try {
    // 1. Strictly enforce that ONLY super_admin can create admins
    await verifyAdminSession(true);

    const rawBody: unknown = await request.json();
    const parseResult = createUserSchema.safeParse(rawBody);

    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return NextResponse.json(
        { error: issue ? issue.message : "Invalid input parameters" },
        { status: 400 }
      );
    }

    const { email, password, role, sports } = parseResult.data;
    const normalizedEmail = email.toLowerCase().trim();
    const supabase = createAdminClient();

    // 2. Create auth user via Supabase service role
    const { error: authError } = await supabase.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
    });

    if (authError && !authError.message.includes("already registered")) {
      console.error("POST /api/admin/users createUser error:", authError);
      return NextResponse.json({ error: "Unable to create authentication account" }, { status: 400 });
    }

    // 3. Upsert into admins table
    const { error: dbError } = await supabase.from("admins").upsert(
      {
        email: normalizedEmail,
        role,
        sports: sports || [
          "cricket",
          "football",
          "basketball",
          "volleyball",
          "table-tennis",
          "lawn-tennis",
        ],
      },
      { onConflict: "email" }
    );

    if (dbError) {
      console.error("POST /api/admin/users upsert admin error:", dbError);
      return NextResponse.json({ error: "Failed to update administrator permissions" }, { status: 500 });
    }

    return NextResponse.json({ success: true, email: normalizedEmail });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Forbidden";
    console.error("POST /api/admin/users exception:", err);
    return NextResponse.json({ error: message }, { status: 403 });
  }
}

export async function DELETE(request: Request) {
  try {
    // 1. Strictly enforce that ONLY super_admin can delete admins
    const { admin: callerAdmin } = await verifyAdminSession(true);

    const { searchParams } = new URL(request.url);
    const targetEmail = searchParams.get("email");

    if (!targetEmail) {
      return NextResponse.json({ error: "Email query parameter is required" }, { status: 400 });
    }

    const normalizedTarget = targetEmail.toLowerCase().trim();

    // Prevent deleting oneself
    if (callerAdmin.email.toLowerCase() === normalizedTarget) {
      return NextResponse.json({ error: "You cannot delete your own administrator account" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 2. Delete from admins table
    const { error: dbError } = await supabase.from("admins").delete().eq("email", normalizedTarget);

    if (dbError) {
      console.error("DELETE /api/admin/users dbError:", dbError);
      return NextResponse.json({ error: "Failed to remove administrator record" }, { status: 500 });
    }

    // 3. Delete auth user
    const { data: usersData } = await supabase.auth.admin.listUsers();
    const user = usersData?.users?.find((u) => u.email?.toLowerCase() === normalizedTarget);
    if (user) {
      await supabase.auth.admin.deleteUser(user.id);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Forbidden";
    console.error("DELETE /api/admin/users exception:", err);
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
