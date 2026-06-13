"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useOrders } from "@/hooks/useOrders"; 
import { useCancelOrder } from "@/hooks/useOrder";
import ReviewModal from "@/components/shop/ReviewModal";

export default function OrdersPage() {
  const { data: orders, isLoading, error } = useOrders();
  const cancelOrderMutation = useCancelOrder();
  
  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean;
    productId: string;
    orderId: string;
    productName: string;
  }>({ isOpen: false, productId: "", orderId: "", productName: "" });

  const handleCancelOrder = (orderId: string) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) {
      cancelOrderMutation.mutate(orderId);
    }
  };

  const openReviewModal = (productId: string, orderId: string, productName: string) => {
    setReviewModal({ isOpen: true, productId, orderId, productName });
  };

  const closeReviewModal = () => {
    setReviewModal({ ...reviewModal, isOpen: false });
  };

  if (isLoading) return <div className="text-center py-20 text-gray-500 font-medium">Đang tải đơn hàng...</div>;
  if (error) return <div className="text-center py-20 text-red-500 font-medium">Không thể tải danh sách đơn hàng.</div>;

  return (
    <>
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 tracking-tight">Đơn hàng của tôi</h1>
        
        {!orders || orders.length === 0 ? (
          <div className="text-center py-16 border rounded-2xl bg-gray-50 text-gray-500">
            <p className="font-medium text-base">Bạn chưa có đơn hàng nào.</p>
            <Link href="/shop" className="text-blue-600 hover:underline mt-2 inline-block">
              Quay lại mua sắm →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => (
              <div key={order._id} className="border border-gray-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all">
                {/* Order Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-gray-800 text-lg">
                        MÃ ĐƠN: #{order._id ? order._id.slice(-6).toUpperCase() : "N/A"}
                      </p>
                      <p className="text-sm text-gray-400">
                        Mã đơn hàng: {order.orderCode || order._id}
                      </p>
                      <p className="text-sm text-gray-400">
                        Ngày đặt: {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : "Chưa cập nhật"}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      order.status === 'delivered' 
                        ? 'bg-green-100 text-green-700' 
                        : order.status === 'cancelled'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {order.status?.toUpperCase() || 'PENDING'}
                    </span>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="p-6 border-b border-gray-100">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tạm tính:</span>
                      <span className="font-medium">{(order.subtotal || 0).toLocaleString('vi-VN')} ₫</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phí vận chuyển:</span>
                      <span className="font-medium">{(order.shippingFee || 0).toLocaleString('vi-VN')} ₫</span>
                    </div>
                    {order.discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Giảm giá:</span>
                        <span>-{(order.discountAmount || 0).toLocaleString('vi-VN')} ₫</span>
                      </div>
                    )}
                    <div className="border-t border-gray-100 pt-2 flex justify-between font-semibold">
                      <span>Tổng tiền:</span>
                      <span className="text-red-600">{(order.totalAmount || 0).toLocaleString('vi-VN')} ₫</span>
                    </div>
                  </div>
                </div>

                {/* Shipping Info */}
                <div className="p-6 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-800 mb-3">Thông tin giao hàng</h3>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p><span className="font-medium">Người nhận:</span> {order.shippingName}</p>
                    <p><span className="font-medium">Số điện thoại:</span> {order.shippingPhone}</p>
                    <p><span className="font-medium">Địa chỉ:</span> {order.shippingAddress}</p>
                    {order.trackingCode && (
                      <p><span className="font-medium">Mã vận đơn:</span> {order.trackingCode}</p>
                    )}
                  </div>
                </div>

                {/* Order Footer */}
                <div className="p-6 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Tổng tiền:</p>
                    <p className="font-extrabold text-gray-900 text-xl">
                      {(Number(order.totalAmount) || 0).toLocaleString('vi-VN')} ₫
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        disabled={cancelOrderMutation.isPending}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium text-sm disabled:opacity-50"
                      >
                        Hủy đơn
                      </button>
                    )}
                    <Link
                      href={`/shop/account/orders/${order._id}`}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
                    >
                      Chi tiết
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModal.isOpen && (
        <ReviewModal
          isOpen={reviewModal.isOpen}
          productId={reviewModal.productId}
          orderId={reviewModal.orderId}
          productName={reviewModal.productName}
          onClose={closeReviewModal}
        />
      )}
    </>
  );
}