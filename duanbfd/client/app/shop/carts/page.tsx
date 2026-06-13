"use client";

import React, { useEffect, useState } from 'react';
import { useCartStore } from "@/store/useCartStore"; 
import Link from 'next/link';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="text-center py-20 text-gray-500">Đang tải giỏ hàng...</div>;

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Giỏ hàng của bạn</h1>
      
      {items && items.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Cột 1 & 2: Danh sách sản phẩm */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item: any) => {
              const itemPrice = Number(item.price) || 0;
              const itemQty = Number(item.quantity) || 1;
              const itemKey = item.variantId; // Key theo variantId
              const subtotal = itemPrice * itemQty;

              return (
                <div key={itemKey} className="flex items-center justify-between border border-gray-100 p-5 rounded-2xl bg-white shadow-sm hover:shadow-md transition">
                  <div className="flex items-center gap-5">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-xl bg-gray-50 border" />
                    )}
                    <div className="space-y-1">
                      <h3 className="font-semibold text-gray-800 text-base line-clamp-1">{item.name || "Sản phẩm không tên"}</h3>
                      
                      {/* Giá đơn vị */}
                      <p className="text-sm text-gray-500">
                        Đơn giá: <span className="font-semibold text-gray-700">{itemPrice.toLocaleString('vi-VN')} ₫</span>
                      </p>
                      
                      {/* Thành tiền dòng */}
                      <p className="text-sm font-bold text-blue-600">
                        Thành tiền: {subtotal.toLocaleString('vi-VN')} ₫
                      </p>
                      
                      {/* Bộ tăng giảm số lượng */}
                      <div className="flex items-center gap-2 mt-2">
                        <button 
                          onClick={() => {
                            if (item.quantity > 1) {
                              updateQuantity(itemKey, item.quantity - 1);
                            } else {
                              removeItem(itemKey);
                            }
                          }}
                          className="w-7 h-7 border rounded-md flex items-center justify-center bg-gray-50 hover:bg-gray-100 font-bold text-gray-600 text-sm transition"
                        >
                          -
                        </button>
                        <span className="text-sm font-semibold w-8 text-center text-gray-800">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(itemKey, item.quantity + 1)}
                          className="w-7 h-7 border rounded-md flex items-center justify-center bg-gray-50 hover:bg-gray-100 font-bold text-gray-600 text-sm transition"
                        >
                          +
                        </button>
                      </div>

                    </div>
                  </div>
                  
                  {/* Nút xóa sản phẩm khỏi giỏ hàng */}
                  <button 
                    onClick={() => removeItem(itemKey)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium p-2 hover:bg-red-50 rounded-xl transition"
                  >
                    Xóa
                  </button>
                </div>
              );
            })}
          </div>

          {/* Cột 3: Tóm tắt đơn hàng */}
          <div className="border border-gray-200 p-6 rounded-2xl bg-white h-fit shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-3">Tóm tắt đơn hàng</h2>
            
            {/* Danh sách item tóm tắt */}
            <div className="space-y-2 text-sm text-gray-600">
              {items.map((item: any) => {
                const itemPrice = Number(item.price) || 0;
                const itemQty = Number(item.quantity) || 1;
                const itemKey = item.variantId;
                return (
                  <div key={itemKey} className="flex justify-between">
                    <span className="line-clamp-1 flex-1 mr-2">{item.name} × {itemQty}</span>
                    <span className="font-medium text-gray-800 whitespace-nowrap">
                      {(itemPrice * itemQty).toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="border-t pt-3">
              <div className="flex justify-between items-center font-medium text-gray-700">
                <span>Tổng tiền:</span>
                <span className="text-2xl text-red-600 font-extrabold">
                  {total.toLocaleString('vi-VN')} ₫
                </span>
              </div>
              <p className="text-xs text-gray-400 text-right mt-1">
                ({total.toLocaleString('vi-VN')} VNĐ)
              </p>
            </div>
            
            <Link href="/shop/checkout" className="block">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-semibold transition text-center block shadow-sm shadow-blue-200">
                Tiến hành thanh toán
              </button>
            </Link>
          </div>

        </div>
      ) : (
        <div className="text-center py-16 text-gray-500 border border-dashed rounded-2xl bg-gray-50 max-w-xl mx-auto px-4">
          <div className="text-5xl mb-3">🛒</div>
          <p className="mb-5 text-gray-600 font-medium">Giỏ hàng của bạn đang trống.</p>
          <Link href="/shop" className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition shadow-sm">
            Tiếp tục mua sắm
          </Link>
        </div>
      )}
    </div>
  );
}