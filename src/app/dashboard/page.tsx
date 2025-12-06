// src/app/dashboard/page.tsx
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardClient from "./dashboardClient";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const name =
    user?.firstName ||
    user?.emailAddresses[0]?.emailAddress ||
    "there";

  // 所有有 useState/useEffect 的逻辑都放到 DashboardClient 里
  return <DashboardClient name={name} />;
}