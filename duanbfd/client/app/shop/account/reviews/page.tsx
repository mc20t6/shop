"use client";

import React from 'react';
import { useOrders } from "@/hooks/useOrders"; // Đảm bảo import từ file có chữ 's'

export default function OrdersPage() {
  const { data: orders, isLoading, error } = useOrders();

  if (isLoading) return <div className="text-center py-20 text-gray-500 font-medium">Đang tải đơn hàng...</div>;
  if (error) return <div className="text-center py-20 text-red-500 font-medium">Không thể tải danh sách đơn hàng.</div>;

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 tracking-tight">Đơn hàng của tôi</h1>
      
      {!orders || orders.length === 0 ? (
        <div className="text-center py-16 border rounded-2xl bg-gray-50 text-gray-500">
          <p className="font-medium text-base">Bạn chưa có đơn hàng nào.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <div key={order._id} className="border border-gray-100 p-6 rounded-2xl bg-white flex justify-between items-center shadow-sm hover:shadow-md transition-all">
              <div className="space-y-1.5">
                <p className="font-bold text-gray-800 text-lg">
                  MÃ ĐƠN: #{order._id ? order._id.slice(-6).toUpperCase() : "N/A"}
                </p>
                <p className="text-sm text-gray-400 font-medium">
                  Ngày đặt: {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : "Chưa cập nhật"}
                </p>
              </div>
              
              <div className="text-right space-y-2">
                <p className="font-extrabold text-gray-900 text-xl">
                  {(Number(order.totalPrice) || 0).toLocaleString('vi-VN')} VNĐ
                </p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${
                  order.status === 'DELIVERED' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {order.status || 'PENDING'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}