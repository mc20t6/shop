"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useCreateOrder } from "@/hooks/useOrders";
import { useCartStore } from "@/store/useCartStore";
import OrderSummary from "@/components/shop/OrderSummary";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

// Lấy thông tin user hiện tại (id, name, phone) từ API
function useCurrentUser() {
  return useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data } = await api.get('/users/me');
      return data;
    },
    retry: false,
  });
}

// PaymentMethod phải đúng enum của backend
type PaymentMethod = 'COD' | 'VNPAY' | 'MOMO' | 'ZALOPAY';

export default function CheckoutPage() {
  const router = useRouter();
  const { mutate: createOrder, isPending } = useCreateOrder();
  const { items } = useCartStore();

  const [mounted, setMounted] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Thông tin giao hàng
  const [shippingName, setShippingName] = useState('');
  const [shippingPhone, setShippingPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [isEditing, setIsEditing] = useState(true);

  // Phương thức thanh toán (đúng enum backend: COD | VNPAY | MOMO | ZALOPAY)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');

  // Lấy thông tin user để điền sẵn và lấy userId
  const { data: userProfile } = useCurrentUser();

  // Điền sẵn thông tin từ profile
  useEffect(() => {
    if (userProfile) {
      setShippingName(userProfile.name || userProfile.fullName || '');
      setShippingPhone(userProfile.phone || userProfile.phoneNumber || '');
    }
  }, [userProfile]);

  // Tính total từ items (luôn chính xác)
  const totalPrice = useMemo(() => {
    if (!items || items.length === 0) return 0;
    return items.reduce((sum: number, item: any) => {
      return sum + (Number(item.price) || 0) * (Number(item.quantity) || 1);
    }, 0);
  }, [items]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCheckout = () => {
    if (!items || items.length === 0) {
      return alert("Giỏ hàng của bạn đang trống!");
    }

    // Kiểm tra tất cả item đều có variantId hợp lệ
    const invalidItems = items.filter((item: any) => !item.variantId);
    if (invalidItems.length > 0) {
      return alert("Một số sản phẩm trong giỏ hàng không hợp lệ. Vui lòng xóa và thêm lại.");
    }

    if (!shippingName.trim()) return alert("Vui lòng nhập tên người nhận!");
    if (shippingPhone.trim().length < 10) return alert("Số điện thoại không hợp lệ!");
    if (!shippingPhone.trim()) return alert("Vui lòng nhập số điện thoại!");
    if (!shippingAddress.trim()) return alert("Vui lòng nhập địa chỉ nhận hàng!");

    const userId = userProfile?._id || userProfile?.id;
    if (!userId) return alert("Không xác định được tài khoản. Vui lòng đăng nhập lại!");

    setIsEditing(false);

    // Payload đúng theo CreateOrderDto của backend
    const orderPayload = {
      userId: userId,
      paymentMethod: paymentMethod,
      shippingName: shippingName.trim(),
      shippingPhone: shippingPhone.trim(),
      shippingAddress: shippingAddress.trim(),
      items: items.map((item: any) => ({
        variantId: item.variantId,   // ← backend yêu cầu variantId, KHÔNG phải productId
        quantity: Number(item.quantity) || 1,
      })),
    };

    createOrder(orderPayload, {
      onSuccess: () => {
        setIsSuccess(true);
        router.push("/shop/account/orders");
      },
      onError: (error: any) => {
        const msg = error?.response?.data?.message;
        const errorText = Array.isArray(msg) ? msg.join('\n') : (msg || 'Đặt hàng thất bại. Vui lòng thử lại!');
        alert(`Lỗi: ${errorText}`);
        setIsEditing(true);
      }
    });
  };

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-6xl animate-pulse">
        <div className="h-10 bg-gray-200 rounded-xl w-1/4 mb-10"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="h-48 bg-gray-200 rounded-2xl"></div>
          <div className="h-64 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="p-20 text-center text-green-600 font-semibold text-lg flex flex-col items-center gap-3">
        <span>🎉 Đặt hàng thành công!</span>
        <span className="text-sm text-gray-500 font-normal">Đang chuyển đến danh sách đơn hàng...</span>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <div className="text-6xl mb-4">🛒</div>
        <p className="text-gray-500 text-lg mb-6">Giỏ hàng của bạn đang trống.</p>
        <button
          onClick={() => router.push("/shop")}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
        >
          Quay lại cửa hàng
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <h1 className="text-4xl font-bold mb-10 text-gray-900 tracking-tight">Thanh toán đơn hàng</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* Cột trái: Thông tin */}
        <div className="space-y-6">

          {/* Thông tin người nhận */}
          <section className="border border-gray-200 p-8 rounded-2xl bg-white shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-5">Thông tin người nhận</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên người nhận *</label>
                <input
                  type="text"
                  disabled={isPending}
                  value={shippingName}
                  onChange={(e) => setShippingName(e.target.value)}
                  placeholder="Nhập họ tên người nhận hàng..."
                  className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
                <input
                  type="tel"
                  disabled={isPending}
                  value={shippingPhone}
                  onChange={(e) => setShippingPhone(e.target.value)}
                  placeholder="Nhập số điện thoại..."
                  className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ giao hàng *</label>
                <textarea
                  disabled={isPending}
                  rows={3}
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                  className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-100"
                />
              </div>
            </div>
          </section>

          {/* Phương thức thanh toán */}
          <section className="border border-gray-200 p-8 rounded-2xl bg-white shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-5">Phương thức thanh toán</h2>
            <div className="grid grid-cols-2 gap-4">
              {(['COD', 'VNPAY', 'MOMO', 'ZALOPAY'] as PaymentMethod[]).map((method) => (
                <label
                  key={method}
                  className={`border p-4 rounded-xl flex items-center gap-3 cursor-pointer transition ${paymentMethod === method ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === method}
                    onChange={() => setPaymentMethod(method)}
                    disabled={isPending}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {method === 'COD' ? 'Thanh toán khi nhận hàng' :
                        method === 'VNPAY' ? 'VNPay' :
                          method === 'MOMO' ? 'MoMo' : 'ZaloPay'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {method === 'COD' ? 'Trả tiền mặt (COD)' :
                        method === 'VNPAY' ? 'Cổng thanh toán VNPay' :
                          method === 'MOMO' ? 'Ví MoMo' : 'Ví ZaloPay'}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* Danh sách sản phẩm */}
          <section className="border border-gray-200 p-8 rounded-2xl bg-white shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Sản phẩm đặt hàng</h2>
            <div className="space-y-3">
              {items.map((item: any) => {
                const itemPrice = Number(item.price) || 0;
                const itemQty = Number(item.quantity) || 1;
                return (
                  <div key={item.variantId} className="flex justify-between items-center text-sm">
                    <span className="text-gray-700 flex-1 mr-2 line-clamp-1">
                      {item.name}
                      {item.size && <span className="text-gray-400"> – {item.size}</span>}
                      {item.color && <span className="text-gray-400"> / {item.color}</span>}
                      <span className="text-gray-400"> × {itemQty}</span>
                    </span>
                    <span className="font-semibold text-gray-900 whitespace-nowrap">
                      {(itemPrice * itemQty).toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Cột phải: Tóm tắt & nút đặt hàng */}
        <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm h-fit">
          <OrderSummary total={totalPrice} />

          <button
            disabled={isPending}
            onClick={handleCheckout}
            className="w-full mt-8 bg-green-600 text-white py-4 rounded-2xl text-lg font-semibold hover:bg-green-700 shadow-md hover:shadow-lg transition-all disabled:bg-gray-300 disabled:shadow-none"
          >
            {isPending ? "⏳ Đang xử lý..." : "Xác nhận đặt hàng"}
          </button>

          <p className="text-xs text-gray-400 text-center mt-3">
            Bằng cách đặt hàng, bạn đồng ý với điều khoản sử dụng của chúng tôi.
          </p>
        </div>

      </div>
    </div>
  );
}