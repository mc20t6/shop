
import Sidebar from "@/components/admin/SideBar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex bg-gray-100">
      <Sidebar />

      <main className="ml-[260px] flex-1 p-6 min-h-screen">{children}</main>
    </div>
  );
}
