"use client";

import { api } from "@/lib/api";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

const menus = [
  {
    name: "Thống kê",
    href: "/admin",
  },
  {
    name: "Quản lý người dùng",
    href: "/admin/users",
  },
  {
    name: "Sản phẩm",
    href: "/admin/products",
  },
  {
    name: "Danh mục",
    href: "/admin/categories",
  },
  {
    name: "Đơn hàng",
    href: "/admin/orders",
  },
  {
    name: "Phiếu giảm giá",
    href: "/admin/vouchers",
  },
  {
    name: "Đăng xuất",
    href: "#",
    isLogout: true,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // Xử lý đăng xuất
  const logoutNow = async () => {
    try {
      await api.post("/auth/logout");

      toast.success("Đăng xuất thành công!", {
        description: "Bạn sẽ được chuyển về trang đăng nhập.",
      });
    } catch (error: any) {
      console.error("Lỗi khi gọi API đăng xuất phía Backend:", error);

      toast.error("API đăng xuất bị lỗi", {
        description:
          error.response?.data?.message ||
          error.message ||
          "Hệ thống vẫn sẽ xóa phiên đăng nhập ở trình duyệt.",
      });
    } finally {
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
      document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";

      router.push("/login");
      router.refresh();
    }
  };

  const handleLogout = () => {
    const toastId = toast.warning("Bạn có chắc chắn muốn đăng xuất?", {
      description: "Sau khi đăng xuất, bạn cần đăng nhập lại để vào trang quản trị.",
      duration: 6000,
      action: {
        label: "Đăng xuất",
        onClick: () => {
          toast.dismiss(toastId);
          logoutNow();
        },
      },
      cancel: {
        label: "Hủy",
        onClick: () => {
          toast.dismiss(toastId);
        },
      },
    });
  };

  return (
    <aside className="w-[260px] fixed top-0 left-0 min-h-screen bg-black text-white p-5">
      {/* Logo */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold">Admin</h1>
      </div>

      {/* Menu */}
      <nav className="space-y-2">
        {menus.map((menu) => {
          const isActive = pathname === menu.href;
          const itemClassName = `
            w-full flex items-center gap-3
            px-4 py-3
            rounded-xl
            transition
            text-left
            ${isActive ? "bg-white text-black" : "hover:bg-white/10"}
          `;

          if (menu.isLogout) {
            return (
              <button
                key={menu.name}
                onClick={handleLogout}
                className={`${itemClassName} text-red-400 hover:text-red-500 hover:bg-red-500/10`}
              >
                <span>{menu.name}</span>
              </button>
            );
          }

          return (
            <Link key={menu.name} href={menu.href} className={itemClassName}>
              <span>{menu.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
