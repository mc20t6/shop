// src/components/layout/CartBadge.tsx (hoặc chèn trực tiếp vào Header của bạn)
"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCartStore } from "@/store/useCartStore";

export default function CartBadge() {
  const { items } = useCartStore() as any;
  const [mounted, setMounted] = useState(false);

  // Chống lỗi lệch pha giao diện Server/Client (Hydration Mismatch)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Tính tổng số lượng của TẤT CẢ các sản phẩm cộng lại
  const totalItems = items?.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0) || 0;

  return (
    <Link href="/shop/carts" className="relative flex items-center gap-1 font-medium hover:text-blue-600 transition">
      <span>Giỏ hàng</span>
      <span className="bg-blue-600 text-white text-xs font-bold min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center">
        {mounted ? totalItems : 0}
      </span>
    </Link>
  );
}