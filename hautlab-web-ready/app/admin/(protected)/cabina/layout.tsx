import { redirect } from "next/navigation";
import { getAttendanceAccess } from "@/lib/attendance-access";

export default async function ManagerOnlyLayout({ children }: { children: React.ReactNode }) {
  const access = await getAttendanceAccess();
  if (!access.canManage) redirect("/admin/asistencia");
  return children;
}
