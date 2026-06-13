"use client";

import { api } from "@/lib/api";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type VoucherType = "PERCENT" | "FIXED";

type Voucher = {
  id?: string;
  _id?: string;
  code: string;
  type: VoucherType;
  value: number;
  minOrderValue: number;
  maxDiscount: number;
  useCount?: number;
  usageLimit: number;
  startDate: string;
  endDate: string;
  isActive?: boolean;
  createdAt?: string;
};

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);

  const [keyword, setKeyword] = useState("");
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(total / limit));
  }, [total, limit]);

  const getVoucherId = (voucher: Voucher) => {
    return voucher.id || voucher._id || "";
  };

  const getErrorMessage = (error: any, defaultMessage: string) => {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      defaultMessage;

    return Array.isArray(message) ? message.join("\n") : message;
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

    if (Number.isNaN(value.getTime())) return date;

    return value.toLocaleDateString("vi-VN");
  };

  const getTypeLabel = (type: VoucherType) => {
    if (type === "PERCENT") return "Phần trăm";
    if (type === "FIXED") return "Số tiền";
    return type;
  };

  const getDiscountText = (voucher: Voucher) => {
    if (voucher.type === "PERCENT") {
      return `${voucher.value}%`;
    }

    return formatCurrency(voucher.value);
  };

  const getVoucherStatus = (voucher: Voucher) => {
    const now = new Date();
    const startDate = new Date(voucher.startDate);
    const endDate = new Date(voucher.endDate);

    if (voucher.isActive === false) {
      return {
        label: "Tạm ẩn",
        className: "bg-gray-100 text-gray-600",
      };
    }

    if (now < startDate) {
      return {
        label: "Chưa bắt đầu",
        className: "bg-blue-100 text-blue-600",
      };
    }

    if (now > endDate) {
      return {
        label: "Hết hạn",
        className: "bg-red-100 text-red-600",
      };
    }

    if ((voucher.useCount || 0) >= voucher.usageLimit) {
      return {
        label: "Hết lượt",
        className: "bg-red-100 text-red-600",
      };
    }

    return {
      label: "Đang hoạt động",
      className: "bg-green-100 text-green-700",
    };
  };

  const fetchVouchers = async () => {
    try {
      setLoading(true);

      const res = await api.get("/vouchers", {
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
       *   { id, code, type, value, ... }
       * ]
       */
      if (Array.isArray(data)) {
        let list = data;

        if (search) {
          const searchLower = search.toLowerCase();

          list = list.filter((voucher: Voucher) =>
            voucher.code.toLowerCase().includes(searchLower),
          );
        }

        const start = (page - 1) * limit;
        const end = start + limit;

        setVouchers(list.slice(start, end));
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
      const list = data.data || data.items || data.vouchers || [];

      setVouchers(list);
      setTotal(data.total || data.totalItems || data.meta?.total || list.length);
    } catch (error: any) {
      console.error("FETCH VOUCHERS ERROR:", error);
      toast.error(getErrorMessage(error, "Không thể tải danh sách voucher"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, [page, search]);

  const handleSearch = () => {
    setPage(1);
    setSearch(keyword.trim());
  };

  const handleDelete = async (id: string) => {
    if (!id) {
      toast.error("Không tìm thấy ID voucher");
      return;
    }

    const isConfirm = window.confirm("Bạn có chắc muốn xóa voucher này?");

    if (!isConfirm) return;

    try {
      setDeletingId(id);

      await api.delete(`/vouchers/${id}`);

      toast.success("Xóa voucher thành công");

      if (vouchers.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        fetchVouchers();
      }
    } catch (error: any) {
      console.error("DELETE VOUCHER ERROR:", error);
      toast.error(getErrorMessage(error, "Xóa voucher thất bại"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý voucher</h1>

          <p className="mt-1 text-gray-500">
            Thêm, sửa, xóa và theo dõi mã giảm giá
          </p>
        </div>

        <Link
          href="/admin/vouchers/create"
          className="rounded-xl bg-black px-5 py-3 text-white transition hover:bg-gray-800"
        >
          + Thêm voucher
        </Link>
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
            placeholder="Tìm kiếm mã voucher..."
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
          <table className="w-full min-w-[1100px]">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="p-4">Mã voucher</th>
                <th>Loại</th>
                <th>Giá trị</th>
                <th>Đơn tối thiểu</th>
                <th>Giảm tối đa</th>
                <th>Lượt dùng</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-gray-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : vouchers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-gray-500">
                    Không có voucher nào
                  </td>
                </tr>
              ) : (
                vouchers.map((voucher) => {
                  const id = getVoucherId(voucher);
                  const status = getVoucherStatus(voucher);

                  return (
                    <tr key={id} className="border-t">
                      <td className="p-4 font-semibold uppercase">
                        {voucher.code}
                      </td>

                      <td>{getTypeLabel(voucher.type)}</td>

                      <td className="font-medium">
                        {getDiscountText(voucher)}
                      </td>

                      <td>{formatCurrency(voucher.minOrderValue)}</td>

                      <td>
                        {voucher.type === "PERCENT"
                          ? formatCurrency(voucher.maxDiscount)
                          : "---"}
                      </td>

                      <td>
                        {(voucher.useCount || 0)} / {voucher.usageLimit}
                      </td>

                      <td>
                        <div className="text-sm text-gray-600">
                          <p>{formatDate(voucher.startDate)}</p>
                          <p>→ {formatDate(voucher.endDate)}</p>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`rounded-full px-3 py-1 text-sm ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </td>

                      <td>
                        <div className="flex gap-2">
                          <Link
                            href={`/admin/vouchers/edit/${id}`}
                            className="rounded-lg bg-gray-100 px-4 py-2 text-sm hover:bg-gray-200"
                          >
                            Chỉnh sửa
                          </Link>

                          <button
                            onClick={() => handleDelete(id)}
                            disabled={deletingId === id}
                            className="rounded-lg bg-red-100 px-4 py-2 text-sm text-red-600 hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingId === id ? "Đang xóa..." : "Xóa"}
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
          Trang {page} / {totalPages} - Tổng {total} voucher
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