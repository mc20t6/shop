"use client";

import { api } from "@/lib/api";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type Order = {
  id?: string;
  _id?: string;
  orderCode?: string;
  customer?: string;
  customerName?: string;
  shippingName?: string;
  fullName?: string;
  user?: {
    fullName?: string;
    name?: string;
    email?: string;
  };
  total?: number;
  totalAmount?: number;
  subtotal?: number;
  payment?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  date?: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  const [keyword, setKeyword] = useState("");
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(total / limit));
  }, [total, limit]);

  const getErrorMessage = (error: any, defaultMessage: string) => {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      defaultMessage;

    return Array.isArray(message) ? message.join("\n") : message;
  };

  const getOrderId = (order: Order) => {
    return order.id || order._id || "";
  };

  const getOrderCode = (order: Order) => {
    return order.orderCode || getOrderId(order);
  };

  const getCustomerName = (order: Order) => {
    return (
      order.customer ||
      order.customerName ||
      order.shippingName ||
      order.fullName ||
      order.user?.fullName ||
      order.user?.name ||
      order.user?.email ||
      "---"
    );
  };

  const getTotalAmount = (order: Order) => {
    return order.totalAmount || order.total || order.subtotal || 0;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const formatDate = (date?: string) => {
    if (!date) return "---";

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
      return date;
    }

    return value.toLocaleDateString("vi-VN");
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

    if (value === "shipping" || value === "packing" || value === "confirmed") {
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

  const canCancelOrder = (order: Order) => {
    const status = normalizeStatus(order.status);

    return !["completed", "cancelled", "delivered"].includes(status);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const res = await api.get("/orders", {
        params: {
          page,
          limit,
          search: search || undefined,
          keyword: search || undefined,
        },
      });

      const data = res.data;

      /**
       * Nếu backend trả về mảng:
       * [
       *   { id, orderCode, shippingName, totalAmount, status, paymentStatus }
       * ]
       */
      if (Array.isArray(data)) {
        let list = data;

        if (search) {
          const searchLower = search.toLowerCase();

          list = list.filter((order: Order) => {
            return (
              getOrderCode(order).toLowerCase().includes(searchLower) ||
              getCustomerName(order).toLowerCase().includes(searchLower) ||
              normalizeStatus(order.status).includes(searchLower)
            );
          });
        }

        const start = (page - 1) * limit;
        const end = start + limit;

        setOrders(list.slice(start, end));
        setTotal(list.length);

        return;
      }

      /**
       * Nếu backend trả về phân trang:
       * {
       *   data: [],
       *   total: 10,
       *   page: 1,
       *   limit: 5
       * }
       */
      const list = data.data || data.items || data.orders || [];

      setOrders(list);
      setTotal(data.total || data.totalItems || data.meta?.total || list.length);
    } catch (error: any) {
      console.error("FETCH ORDERS ERROR:", error);
      toast.error(getErrorMessage(error, "Không thể tải danh sách đơn hàng"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, search]);

  const handleSearch = () => {
    setPage(1);
    setSearch(keyword.trim());
  };

  const handleCancelOrder = async (order: Order) => {
    const id = getOrderId(order);

    if (!id) {
      toast.error("Không tìm thấy ID đơn hàng");
      return;
    }

    const isConfirm = window.confirm("Bạn có chắc muốn hủy đơn hàng này?");

    if (!isConfirm) return;

    try {
      setCancelingId(id);

      await api.patch(`/orders/${id}/status`, {
        status: "cancelled",
      });

      toast.success("Hủy đơn hàng thành công");

      fetchOrders();
    } catch (error: any) {
      console.error("CANCEL ORDER ERROR:", error);
      toast.error(getErrorMessage(error, "Hủy đơn hàng thất bại"));
    } finally {
      setCancelingId(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>

          <p className="mt-1 text-gray-500">
            Theo dõi và quản lý tất cả đơn hàng
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex gap-3">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            placeholder="Tìm kiếm theo mã đơn, khách hàng, trạng thái..."
            className="flex-1 rounded-xl border px-4 py-3 outline-none"
          />

          <button
            onClick={handleSearch}
            disabled={loading}
            className="rounded-xl bg-black px-6 text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Tìm kiếm
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="p-4">Mã đơn</th>
                <th>Khách hàng</th>
                <th>Tổng tiền</th>
                <th>Phương thức</th>
                <th>Thanh toán</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Hành động</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-gray-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-gray-500">
                    Không có đơn hàng nào
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const id = getOrderId(order);
                  const status = normalizeStatus(order.status);

                  return (
                    <tr key={id} className="border-t">
                      {/* Order Code */}
                      <td className="p-4 font-semibold">
                        {getOrderCode(order)}
                      </td>

                      {/* Customer */}
                      <td>{getCustomerName(order)}</td>

                      {/* Total */}
                      <td className="font-medium">
                        {formatCurrency(getTotalAmount(order))}
                      </td>

                      {/* Payment Method */}
                      <td>{order.paymentMethod || "---"}</td>

                      {/* Payment Status */}
                      <td>
                        <span
                          className={`rounded-full px-3 py-1 text-sm ${getPaymentClass(
                            order.paymentStatus || order.payment,
                          )}`}
                        >
                          {getPaymentLabel(order.paymentStatus || order.payment)}
                        </span>
                      </td>

                      {/* Order Status */}
                      <td>
                        <span
                          className={`rounded-full px-3 py-1 text-sm ${getStatusClass(
                            order.status,
                          )}`}
                        >
                          {getStatusLabel(order.status)}
                        </span>
                      </td>

                      {/* Date */}
                      <td>{formatDate(order.createdAt || order.date)}</td>

                      {/* Actions */}
                      <td>
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/admin/orders/${id}`}
                            className="rounded-lg bg-gray-100 px-4 py-2 hover:bg-gray-200"
                          >
                            Chi tiết
                          </Link>

                          <button
                            onClick={() => handleCancelOrder(order)}
                            disabled={
                              cancelingId === id ||
                              loading ||
                              !canCancelOrder(order)
                            }
                            className="rounded-lg bg-red-100 px-4 py-2 text-red-500 hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {cancelingId === id
                              ? "Đang hủy..."
                              : status === "cancelled"
                                ? "Đã hủy"
                                : "Hủy"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Trang {page} / {totalPages} - Tổng {total} đơn hàng
        </p>

        <div className="flex gap-2">
          <button
            disabled={page <= 1 || loading}
            onClick={() => setPage((prev) => prev - 1)}
            className="rounded-lg border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Trước
          </button>

          {Array.from({ length: totalPages }).map((_, index) => {
            const pageNumber = index + 1;

            return (
              <button
                key={pageNumber}
                disabled={loading}
                onClick={() => setPage(pageNumber)}
                className={`rounded-lg border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50 ${
                  page === pageNumber
                    ? "bg-black text-white"
                    : "bg-white text-black"
                }`}
              >
                {pageNumber}
              </button>
            );
          })}

          <button
            disabled={page >= totalPages || loading}
            onClick={() => setPage((prev) => prev + 1)}
            className="rounded-lg border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      </div>
    </div>
  );
}