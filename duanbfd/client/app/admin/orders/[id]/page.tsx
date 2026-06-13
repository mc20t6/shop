"use client";

import { api } from "@/lib/api";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type OrderItem = {
  id?: string;
  _id?: string;
  productName?: string;
  name?: string;
  image?: string;
  productImage?: string;
  size?: string;
  color?: string;
  price?: number;
  unitPrice?: number;
  quantity: number;
  totalPrice?: number;
};

type Order = {
  id?: string;
  _id?: string;
  orderCode?: string;

  shippingName?: string;
  shippingPhone?: string;
  shippingAddress?: string;

  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;

  user?: {
    fullName?: string;
    name?: string;
    email?: string;
    phone?: string;
  };

  status?: string;
  paymentMethod?: string;
  paymentStatus?: string;

  subtotal?: number;
  shippingFee?: number;
  discountAmount?: number;
  totalAmount?: number;

  items?: OrderItem[];
  orderItems?: OrderItem[];

  createdAt?: string;
  updatedAt?: string;
};

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState(false);

  const [itemPage, setItemPage] = useState(1);
  const [itemLimit] = useState(5);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const itemTotalPages = useMemo(() => {
    return Math.max(1, Math.ceil(items.length / itemLimit));
  }, [items.length, itemLimit]);

  const currentItems = useMemo(() => {
    const start = (itemPage - 1) * itemLimit;
    const end = start + itemLimit;

    return items.slice(start, end);
  }, [items, itemPage, itemLimit]);

  const getErrorMessage = (error: any, defaultMessage: string) => {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      defaultMessage;

    return Array.isArray(message) ? message.join("\n") : message;
  };

  const getImageUrl = (image?: string) => {
    if (!image) return "";

    if (image.startsWith("http")) return image;

    return `${API_URL}${image}`;
  };

  const getOrderId = () => {
    return order?.id || order?._id || id || "";
  };

  const getOrderCode = () => {
    return order?.orderCode || getOrderId();
  };

  const formatCurrency = (value?: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value || 0);
  };

  const formatDate = (date?: string) => {
    if (!date) return "---";

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
      return date;
    }

    return value.toLocaleDateString("vi-VN");
  };

  const getCustomerName = () => {
    return (
      order?.shippingName ||
      order?.customerName ||
      order?.user?.fullName ||
      order?.user?.name ||
      "---"
    );
  };

  const getCustomerPhone = () => {
    return order?.shippingPhone || order?.customerPhone || order?.user?.phone || "---";
  };

  const getCustomerEmail = () => {
    return order?.customerEmail || order?.user?.email || "---";
  };

  const getCustomerAddress = () => {
    return order?.shippingAddress || order?.customerAddress || "---";
  };

  const normalizeStatus = (status?: string) => {
    return status?.toLowerCase() || "pending";
  };

  const getStatusLabel = (status?: string) => {
    const value = normalizeStatus(status);

    const labels: Record<string, string> = {
      pending: "Chờ xác nhận",
      confirmed: "Đã xác nhận",
      packing: "Đang đóng gói",
      shipping: "Đang giao",
      delivered: "Đã giao",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
      return_requested: "Yêu cầu trả hàng",
    };

    return labels[value] || status || "---";
  };

  const getStatusClass = (status?: string) => {
    const value = normalizeStatus(status);

    if (value === "completed" || value === "delivered") {
      return "bg-green-100 text-green-700";
    }

    if (value === "pending") {
      return "bg-yellow-100 text-yellow-700";
    }

    if (value === "cancelled") {
      return "bg-red-100 text-red-600";
    }

    if (value === "confirmed" || value === "packing" || value === "shipping") {
      return "bg-blue-100 text-blue-600";
    }

    return "bg-gray-100 text-gray-600";
  };

  const getPaymentLabel = (paymentStatus?: string) => {
    const value = paymentStatus?.toUpperCase() || "PENDING";

    const labels: Record<string, string> = {
      PAID: "Đã thanh toán",
      PENDING: "Chưa thanh toán",
      FAILED: "Thất bại",
      REFUNDED: "Đã hoàn tiền",
    };

    return labels[value] || paymentStatus || "---";
  };

  const getPaymentClass = (paymentStatus?: string) => {
    const value = paymentStatus?.toUpperCase();

    if (value === "PAID") {
      return "bg-green-100 text-green-700";
    }

    if (value === "FAILED") {
      return "bg-red-100 text-red-600";
    }

    if (value === "REFUNDED") {
      return "bg-blue-100 text-blue-600";
    }

    return "bg-yellow-100 text-yellow-700";
  };

  const getItemId = (item: OrderItem, index: number) => {
    return item.id || item._id || String(index);
  };

  const getItemName = (item: OrderItem) => {
    return item.productName || item.name || "Sản phẩm";
  };

  const getItemImage = (item: OrderItem) => {
    return getImageUrl(item.image || item.productImage);
  };

  const getItemPrice = (item: OrderItem) => {
    return item.unitPrice || item.price || 0;
  };

  const getItemTotal = (item: OrderItem) => {
    return item.totalPrice || getItemPrice(item) * item.quantity;
  };

  const subtotal =
    order?.subtotal ??
    items.reduce((sum, item) => sum + getItemTotal(item), 0);

  const shippingFee = order?.shippingFee || 0;
  const discountAmount = order?.discountAmount || 0;
  const totalAmount =
    order?.totalAmount ?? subtotal + shippingFee - discountAmount;

  const fetchOrderDetail = async () => {
    if (!id) return;

    try {
      setLoading(true);

      const res = await api.get(`/orders/${id}`);

      const data = res.data?.data || res.data?.order || res.data;

      setOrder(data);

      const orderItems = data.items || data.orderItems || [];

      setItems(orderItems);
      setItemPage(1);
    } catch (error: any) {
      console.error("FETCH ORDER DETAIL ERROR:", error);

      toast.error(getErrorMessage(error, "Không thể tải chi tiết đơn hàng"));

      router.push("/admin/orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const handleUpdateStatus = async (status: string) => {
    if (!id) {
      toast.error("Không tìm thấy ID đơn hàng");
      return;
    }

    try {
      setUpdatingStatus(true);

      await api.patch(`/orders/${id}/status`, {
        status,
      });

      toast.success("Cập nhật trạng thái đơn hàng thành công");

      fetchOrderDetail();
    } catch (error: any) {
      console.error("UPDATE ORDER STATUS ERROR:", error);

      toast.error(getErrorMessage(error, "Cập nhật trạng thái thất bại"));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleUpdatePaymentStatus = async (paymentStatus: string) => {
    if (!id) {
      toast.error("Không tìm thấy ID đơn hàng");
      return;
    }

    try {
      setUpdatingPayment(true);

      await api.patch(`/orders/${id}/payment-status`, {
        paymentStatus,
      });

      toast.success("Cập nhật thanh toán thành công");

      fetchOrderDetail();
    } catch (error: any) {
      console.error("UPDATE PAYMENT STATUS ERROR:", error);

      toast.error(getErrorMessage(error, "Cập nhật thanh toán thất bại"));
    } finally {
      setUpdatingPayment(false);
    }
  };

  if (loading && !order) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-gray-500">Đang tải chi tiết đơn hàng...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-gray-500">Không tìm thấy đơn hàng</p>

        <Link
          href="/admin/orders"
          className="mt-4 inline-block rounded-xl bg-black px-5 py-3 text-white"
        >
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Chi tiết đơn hàng</h1>

            <p className="mt-2 text-gray-500">Mã đơn hàng: {getOrderCode()}</p>

            <p className="mt-1 text-sm text-gray-400">
              Ngày tạo: {formatDate(order.createdAt)}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span
              className={`rounded-full px-4 py-2 font-medium ${getStatusClass(
                order.status,
              )}`}
            >
              {getStatusLabel(order.status)}
            </span>

            <span
              className={`rounded-full px-4 py-2 font-medium ${getPaymentClass(
                order.paymentStatus,
              )}`}
            >
              {getPaymentLabel(order.paymentStatus)}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-xl font-bold">Cập nhật đơn hàng</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block font-medium">
              Trạng thái đơn hàng
            </label>

            <select
              value={normalizeStatus(order.status)}
              disabled={updatingStatus}
              onChange={(e) => handleUpdateStatus(e.target.value)}
              className="w-full rounded-xl border p-3 outline-none disabled:opacity-60"
            >
              <option value="pending">Chờ xác nhận</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="packing">Đang đóng gói</option>
              <option value="shipping">Đang giao</option>
              <option value="delivered">Đã giao</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
              <option value="return_requested">Yêu cầu trả hàng</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Trạng thái thanh toán
            </label>

            <select
              value={order.paymentStatus || "PENDING"}
              disabled={updatingPayment}
              onChange={(e) => handleUpdatePaymentStatus(e.target.value)}
              className="w-full rounded-xl border p-3 outline-none disabled:opacity-60"
            >
              <option value="PENDING">Chưa thanh toán</option>
              <option value="PAID">Đã thanh toán</option>
              <option value="FAILED">Thất bại</option>
              <option value="REFUNDED">Đã hoàn tiền</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-xl font-bold">Thông tin khách hàng</h2>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="mb-1 text-gray-500">Họ tên</p>

            <p className="font-semibold">{getCustomerName()}</p>
          </div>

          <div>
            <p className="mb-1 text-gray-500">Số điện thoại</p>

            <p className="font-semibold">{getCustomerPhone()}</p>
          </div>

          <div>
            <p className="mb-1 text-gray-500">Email</p>

            <p className="font-semibold">{getCustomerEmail()}</p>
          </div>

          <div>
            <p className="mb-1 text-gray-500">Địa chỉ</p>

            <p className="font-semibold">{getCustomerAddress()}</p>
          </div>
        </div>
      </div>

      {/* Product List */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="border-b p-6">
          <h2 className="text-xl font-bold">Danh sách sản phẩm</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="p-4">Sản phẩm</th>
                <th>Phân loại</th>
                <th>Giá</th>
                <th>Số lượng</th>
                <th>Thành tiền</th>
              </tr>
            </thead>

            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-500">
                    Chưa có sản phẩm trong đơn hàng
                  </td>
                </tr>
              ) : (
                currentItems.map((item, index) => {
                  const imageUrl = getItemImage(item);

                  return (
                    <tr key={getItemId(item, index)} className="border-t">
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={getItemName(item)}
                              className="h-16 w-16 rounded-xl border object-cover"
                            />
                          ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-xl border bg-gray-50 text-xs text-gray-400">
                              No image
                            </div>
                          )}

                          <div>
                            <h3 className="font-semibold">
                              {getItemName(item)}
                            </h3>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="text-sm text-gray-600">
                          <p>Size: {item.size || "---"}</p>
                          <p>Màu: {item.color || "---"}</p>
                        </div>
                      </td>

                      <td>{formatCurrency(getItemPrice(item))}</td>

                      <td>{item.quantity}</td>

                      <td className="font-semibold">
                        {formatCurrency(getItemTotal(item))}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Items Pagination */}
        {items.length > itemLimit && (
          <div className="flex items-center justify-between border-t p-4">
            <p className="text-sm text-gray-500">
              Trang {itemPage} / {itemTotalPages} - Tổng {items.length} sản phẩm
            </p>

            <div className="flex gap-2">
              <button
                disabled={itemPage <= 1}
                onClick={() => setItemPage((prev) => prev - 1)}
                className="rounded-lg border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                Trước
              </button>

              {Array.from({ length: itemTotalPages }).map((_, index) => {
                const pageNumber = index + 1;

                return (
                  <button
                    key={pageNumber}
                    onClick={() => setItemPage(pageNumber)}
                    className={`rounded-lg border px-4 py-2 text-sm ${
                      itemPage === pageNumber
                        ? "bg-black text-white"
                        : "bg-white text-black"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                disabled={itemPage >= itemTotalPages}
                onClick={() => setItemPage((prev) => prev + 1)}
                className="rounded-lg border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-xl font-bold">Tổng thanh toán</h2>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-500">Tạm tính</span>

            <span>{formatCurrency(subtotal)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Phí ship</span>

            <span>{formatCurrency(shippingFee)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Giảm giá</span>

            <span>-{formatCurrency(discountAmount)}</span>
          </div>

          <div className="flex justify-between border-t pt-4 text-xl font-bold">
            <span>Tổng cộng</span>

            <span>{formatCurrency(totalAmount)}</span>
          </div>
        </div>
      </div>

      <div>
        <Link
          href="/admin/orders"
          className="inline-block rounded-xl border px-5 py-3 transition hover:bg-gray-50"
        >
          Quay lại danh sách
        </Link>
      </div>
    </div>
  );
}