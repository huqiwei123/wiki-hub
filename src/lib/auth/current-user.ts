import { cache } from "react";
import { redirect } from "next/navigation";
import { getCurrentSessionUser } from "./session";

export const currentUser = cache(async () => getCurrentSessionUser());

export async function requireUser() {
  const user = await currentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/");
  return user;
}
