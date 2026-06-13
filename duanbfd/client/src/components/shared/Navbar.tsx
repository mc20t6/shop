"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';

export default function Navbar() {
  const router = useRouter();
  // Lấy số lượng item trong giỏ hàng thực tế (re-render khi thay đổi)
  const itemCount = useCartStore((state) => state.items.reduce((sum, i) => sum + i.quantity, 0));

  const handleLogout = async () => {
    try {
      await fetch('/logout', { method: 'POST' });
    } catch (_) {
      // ignore network errors
    }
    // Xóa cookie phía client
    document.cookie = 'token=; Max-Age=0; path=/';
    document.cookie = 'role=; Max-Age=0; path=/';
    router.push('/login');
  };

  return (
    <nav className="border-b bg-white sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/shop" className="text-xl font-bold text-gray-900 hover:text-blue-600 transition">
          SHOP-NEW
        </Link>

        {/* Menu */}
        <div className="flex gap-6 text-sm font-medium">
          <Link href="/shop/products" className="text-gray-600 hover:text-blue-600 transition">
            Sản phẩm
          </Link>
          <Link href="/shop/account/profile" className="text-gray-600 hover:text-blue-600 transition">
            Tài khoản
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Giỏ hàng với badge số lượng thực tế */}
          <Link href="/shop/carts" className="relative flex items-center gap-1 text-gray-700 hover:text-blue-600 transition text-sm font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Giỏ hàng</span>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>

          {/* Nút Đăng xuất */}
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-white bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded-lg transition"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </nav>
  );
}