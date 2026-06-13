// src/app/(shop)/products/page.tsx
"use client";

import { useProducts } from "@/hooks/useProducts";
import ProductCard from "@/components/shop/ProductCard";
import ProductFilter from "@/components/shop/ProductFilter";

export default function ProductsPage() {
  // Gọi hook từ TanStack Query
  const { data: products, isLoading, error } = useProducts();

  if (isLoading) return <div className="p-10 text-center">Đang tải sản phẩm...</div>;
  if (error) return <div className="p-10 text-center text-red-500">Không thể tải sản phẩm. Vui lòng thử lại sau.</div>;

  return (
    <div className="container mx-auto py-10 flex gap-8">
      {/* Sidebar bộ lọc */}
      <div className="w-1/4">
        <ProductFilter />
      </div>

      {/* Danh sách sản phẩm */}
      <div className="w-3/4">
        <h1 className="text-2xl font-bold mb-6">Tất cả sản phẩm</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products?.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}