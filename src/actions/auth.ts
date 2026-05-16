"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { queryOne } from "@/lib/db/query";
import { createSession, deleteCurrentSession } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

type AuthUserRow = {
  id: string;
  email: string;
  password_hash: string;
};

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const user = await queryOne<AuthUserRow>(
    "SELECT id, email, password_hash FROM profiles WHERE email = $1",
    [email],
  );

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    redirect("/login?error=Invalid%20email%20or%20password");
  }

  await createSession(user.id);
  revalidatePath("/", "layout");
  redirect("/admin/dashboard");
}

export async function signup(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const username = String(formData.get("username") ?? "").trim();

  if (!email || !password || !username) {
    redirect("/signup?error=Email%2C%20username%2C%20and%20password%20are%20required");
  }

  try {
    await queryOne(
      `
      INSERT INTO profiles (email, password_hash, username, display_name, role)
      VALUES ($1, $2, $3, $3, 'admin')
      `,
      [email, await hashPassword(password), username],
    );
  } catch {
    redirect("/signup?error=Account%20already%20exists");
  }

  revalidatePath("/", "layout");
  redirect("/login?registered=1");
}

export async function logout() {
  await deleteCurrentSession();
  revalidatePath("/", "layout");
  redirect("/");
}
