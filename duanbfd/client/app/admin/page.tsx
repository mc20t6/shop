"use client";

import { api } from "@/lib/api";
import { useEffect, useMemo, useState } from "react";

type DashboardStats = {
  totalUsers: number;
  totalProducts?: number;
  totalOrders: number;
  totalRevenue: number;
  totalReturns: number;
};

type RevenueByMonth = {
  month: number;
  revenue: number;
};

type DashboardResponse = {
  stats: DashboardStats;
  revenueByMonth: RevenueByMonth[];
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat("vi-VN").format(value);
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

export default function AdminDashboardPage() {
  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState(currentYear);
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const res = await api.get<DashboardResponse>("/admin/dashboard", {
        params: {
          year,
        },
      });

      setDashboard(res.data);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message || "Không tải được dữ liệu dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [year]);

  const cards = useMemo(() => {
    return [
      {
        title: "Tổng số người dùng",
        value: formatNumber(dashboard?.stats.totalUsers || 0),
        description: "Tài khoản trong hệ thống",
      },
      {
        title: "Tổng số đơn hàng",
        value: formatNumber(dashboard?.stats.totalOrders || 0),
        description: `Đơn hàng trong năm ${year}`,
      },
      {
        title: "Doanh thu",
        value: formatCurrency(dashboard?.stats.totalRevenue || 0),
        description: `Tổng doanh thu năm ${year}`,
      },
      {
        title: "Đơn trả hàng",
        value: formatNumber(dashboard?.stats.totalReturns || 0),
        description: "Tổng số đơn hoàn trả",
      },
    ];
  }, [dashboard, year]);

  const revenueByMonth = useMemo(() => {
    return Array.from({ length: 12 }, (_, index) => {
      const month = index + 1;

      const found = dashboard?.revenueByMonth?.find(
        (item) => Number(item.month) === month
      );

      return {
        month,
        revenue: found?.revenue || 0,
      };
    });
  }, [dashboard]);

  const maxRevenue = useMemo(() => {
    return Math.max(...revenueByMonth.map((item) => item.revenue), 1);
  }, [revenueByMonth]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

          <p className="mt-2 text-gray-500">
            Thống kê doanh thu và hoạt động hệ thống
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm outline-none focus:border-gray-900"
          >
            <option value={currentYear}>{currentYear}</option>
            <option value={currentYear - 1}>{currentYear - 1}</option>
            <option value={currentYear - 2}>{currentYear - 2}</option>
          </select>

          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Đang tải..." : "Làm mới"}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {errorMessage}
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {card.title}
                </p>

                <h2 className="mt-3 text-3xl font-bold text-gray-900">
                  {loading && !dashboard ? "..." : card.value}
                </h2>

                <p className="mt-2 text-sm text-gray-400">
                  {card.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Doanh thu theo tháng
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Biểu đồ doanh thu từ tháng 1 đến tháng 12
            </p>
          </div>
        </div>

        <div className="h-[320px] overflow-x-auto">
          <div className="flex h-full min-w-[720px] items-end gap-4 border-b border-gray-100 pb-6">
            {revenueByMonth.map((item) => {
              const height =
                item.revenue > 0
                  ? Math.max((item.revenue / maxRevenue) * 240, 10)
                  : 4;

              return (
                <div
                  key={item.month}
                  className="flex flex-1 flex-col items-center gap-3"
                >
                  <div className="flex h-[260px] w-full items-end">
                    <div
                      title={formatCurrency(item.revenue)}
                      className="w-full rounded-t-xl bg-gradient-to-t from-gray-900 to-gray-500 transition-all hover:opacity-80"
                      style={{
                        height: `${height}px`,
                      }}
                    />
                  </div>

                  <div className="text-center">
                    <p className="text-xs font-semibold text-gray-700">
                      T{item.month}
                    </p>

                    <p className="mt-1 text-[11px] text-gray-400">
                      {item.revenue > 0
                        ? formatCurrency(item.revenue).replace("₫", "")
                        : "0"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}