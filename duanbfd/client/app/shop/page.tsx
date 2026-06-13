"use client";

import React, { useMemo, useState } from 'react';
import { useProducts } from "@/hooks/useProducts";
import ProductCard from "@/components/shop/ProductCard";

const ITEMS_PER_PAGE = 8;

export default function ShopHomePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading, error } = useProducts();

  // Ghi log để debug cấu trúc (Bạn có thể xóa dòng này sau khi đã chạy ổn)
  // console.log("Dữ liệu nhận từ API:", data);

  // Xử lý dữ liệu: hỗ trợ cả { data: [...] } lẫn mảng trực tiếp
  const allProducts = useMemo(() => {
    if (!data) return [];
    return Array.isArray(data) ? data : (data.data || []);
  }, [data]);

  // Tính phân trang phía client
  const totalPages = Math.ceil(allProducts.length / ITEMS_PER_PAGE);
  const products = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return allProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [allProducts, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Hero Section */}
      <section className="bg-white py-16 border-b">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Chào mừng đến với cửa hàng</h1>
          <p className="text-gray-600 text-lg">Khám phá những sản phẩm tốt nhất với giá ưu đãi nhất</p>
        </div>
      </section>

      {/* Product Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold">
            Sản phẩm nổi bật
            {!isLoading && allProducts.length > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({allProducts.length} sản phẩm)
              </span>
            )}
          </h2>
          {/* Hiển thị thông tin trang hiện tại */}
          {totalPages > 1 && (
            <span className="text-sm text-gray-500">
              Trang {currentPage} / {totalPages}
            </span>
          )}
        </div>

        {/* Trạng thái Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="h-80 bg-gray-200 animate-pulse rounded-xl" />
            ))}
          </div>
        )}

        {/* Trạng thái Error */}
        {error && (
          <div className="text-center py-20 bg-white rounded-lg border border-red-200">
            <p className="text-red-500 font-medium">Có lỗi xảy ra khi tải dữ liệu.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 text-blue-600 hover:underline"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Trạng thái Empty */}
        {!isLoading && !error && allProducts.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            Hiện tại chưa có sản phẩm nào được cập nhật.
          </div>
        )}

        {/* Danh sách sản phẩm */}
        {!isLoading && !error && products.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product: any) => (
                <ProductCard 
                  key={product._id || product.id} 
                  product={product} 
                />
              ))}
            </div>

            {/* Phân trang */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10">
                {/* Nút Trước */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border text-sm font-medium transition
                    disabled:opacity-40 disabled:cursor-not-allowed
                    hover:bg-gray-100 border-gray-300 text-gray-700"
                >
                  ← Trước
                </button>

                {/* Số trang */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Hiển thị trang đầu, trang cuối, và các trang gần trang hiện tại
                  const isNearCurrent = Math.abs(page - currentPage) <= 1;
                  const isFirstOrLast = page === 1 || page === totalPages;
                  
                  if (!isNearCurrent && !isFirstOrLast) {
                    // Hiển thị dấu "..." giữa các nhóm trang
                    if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="px-2 text-gray-400">...</span>;
                    }
                    return null;
                  }

                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-10 h-10 rounded-lg text-sm font-semibold border transition ${
                        currentPage === page
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                {/* Nút Tiếp */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border text-sm font-medium transition
                    disabled:opacity-40 disabled:cursor-not-allowed
                    hover:bg-gray-100 border-gray-300 text-gray-700"
                >
                  Tiếp →
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}