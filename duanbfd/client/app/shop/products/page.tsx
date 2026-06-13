"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import ProductCard from '@/components/shop/ProductCard';

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const limit = 2; // Số sản phẩm trên mỗi trang (bạn tăng lên 8 nếu sản phẩm đã nhiều)

  // Gọi API lấy sản phẩm
  const { data: allProducts = [], isLoading, isError, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await api.get('/products');
      return Array.isArray(response.data) ? response.data : (response.data.products || []);
    }
  });

  if (isLoading) {
    return <div className="text-center py-20 font-medium text-gray-500">Đang tải danh sách sản phẩm...</div>;
  }

  if (isError) {
    return (
      <div className="text-center py-20 text-red-500 font-medium">
        ⚠️ Không thể tải sản phẩm: {(error as any)?.response?.status === 403 ? "Lỗi 403 (Yêu cầu đăng nhập)" : error.message}
      </div>
    );
  }

  // Logic phân trang
  const totalProducts = allProducts.length;
  const totalPages = Math.ceil(totalProducts / limit);
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const displayedProducts = allProducts.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Tất cả sản phẩm</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {displayedProducts.length > 0 ? (
          displayedProducts.map((product: any) => (
            <ProductCard key={product._id || product.id} product={product} />
          ))
        ) : (
          <p className="text-gray-500 col-span-full text-center py-10">Không có sản phẩm nào.</p>
        )}
      </div>

      {/* THANH ĐIỀU HƯỚNG PHÂN TRANG */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-12 border-t pt-6">
          <button
            disabled={page === 1}
            onClick={() => handlePageChange(page - 1)}
            className="px-4 py-2 border rounded-xl text-sm font-medium bg-white shadow-sm disabled:opacity-40 hover:bg-gray-50 transition"
          >
            Trước
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((item) => (
            <button
              key={item}
              onClick={() => handlePageChange(item)}
              className={`w-10 h-10 border rounded-xl text-sm font-semibold transition shadow-sm ${
                page === item 
                  ? "bg-blue-600 text-white border-blue-600 shadow-md" 
                  : "bg-white hover:bg-gray-50 text-gray-700"
              }`}
            >
              {item}
            </button>
          ))}

          <button
            disabled={page === totalPages}
            onClick={() => handlePageChange(page + 1)}
            className="px-4 py-2 border rounded-xl text-sm font-medium bg-white shadow-sm disabled:opacity-40 hover:bg-gray-50 transition"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}