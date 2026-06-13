"use client";

import React from 'react';
import { useOrders } from "@/hooks/useOrders";

export default function OrdersPage() {
  const { data: orders, isLoading, error } = useOrders();

  if (isLoading) return <div className="text-center py-10">Đang tải đơn hàng...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Không thể tải danh sách đơn hàng.</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Đơn hàng của tôi</h1>
      
      {!orders || orders.length === 0 ? (
        <p className="text-gray-500">Bạn chưa có đơn hàng nào.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <div key={order._id} className="border p-4 rounded-lg flex justify-between items-center hover:shadow-sm transition">
              <div>
                <p className="font-semibold text-lg">{order._id.slice(-6).toUpperCase()}</p>
                <p className="text-sm text-gray-500">Ngày đặt: {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">{order.totalPrice.toLocaleString()} VNĐ</p>
                <span className={`inline-block px-2 py-1 rounded text-xs ${
                  order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}