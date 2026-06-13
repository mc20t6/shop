"use client";

import { api } from "@/lib/api";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

const LIMIT = 10;

type User = {
  id?: string;
  _id?: string;
  fullName?: string;
  name?: string;
  email: string;
  phone?: string;
  role: "STAFF" | "CUSTOMER" | string;
  isActive?: boolean;
  deletedAt?: string | null;
};

type UsersResponse = {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

const getUserId = (user: User) => {
  return user.id || user._id || "";
};

const getUserName = (user: User) => {
  return user.fullName || user.name || "Chưa có tên";
};

const getRoleLabel = (role: string) => {
  if (role === "STAFF") return "Nhân viên";
  if (role === "CUSTOMER") return "Khách hàng";

  return role;
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat("vi-VN").format(value);
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");

  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const res = await api.get<UsersResponse>("/users", {
        params: {
          page,
          limit: LIMIT,
          search,
          role: role || undefined,
        },
      });

      setUsers(res.data.data || []);
      setTotal(res.data.total || 0);
      setTotalPages(Math.max(res.data.totalPages || 1, 1));
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message || "Không tải được danh sách người dùng"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search, role]);

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const toggleStatus = async (user: User) => {
    const userId = getUserId(user);

    if (!userId) return;

    try {
      setActionLoadingId(userId);

      await api.patch(`/users/${userId}/toggle-status`);

      await fetchUsers();
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message ||
          "Không cập nhật được trạng thái người dùng"
      );
    } finally {
      setActionLoadingId("");
    }
  };

  const deleteUser = async (user: User) => {
    const userId = getUserId(user);

    if (!userId) return;

    const ok = window.confirm("Bạn có chắc muốn xóa tài khoản này không?");

    if (!ok) return;

    try {
      setActionLoadingId(userId);

      await api.delete(`/users/${userId}`);

      await fetchUsers();
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message || "Không xóa được tài khoản"
      );
    } finally {
      setActionLoadingId("");
    }
  };

  const pageNumbers = useMemo(() => {
    const start = Math.max(page - 2, 1);
    const end = Math.min(start + 4, totalPages);

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [page, totalPages]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý người dùng
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Quản lý nhân viên và khách hàng trong hệ thống
          </p>
        </div>

        <Link
          href="/admin/users/create"
          className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-700"
        >
          + Thêm nhân viên
        </Link>
      </div>

      {/* Filter */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <form onSubmit={handleSearch} className="flex flex-1 gap-3">
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm theo tên, email, số điện thoại..."
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-900"
            />

            <button
              type="submit"
              className="rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white"
            >
              Tìm
            </button>
          </form>

          <select
            value={role}
            onChange={(e) => {
              setPage(1);
              setRole(e.target.value);
            }}
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-gray-900"
          >
            <option value="">Tất cả</option>
            <option value="STAFF">Nhân viên</option>
            <option value="CUSTOMER">Khách hàng</option>
          </select>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {errorMessage}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="font-bold text-gray-900">Danh sách tài khoản</h2>

            <p className="mt-1 text-sm text-gray-500">
              Tổng cộng {formatNumber(total)} tài khoản
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-50 text-left text-sm text-gray-500">
              <tr>
                <th className="p-4 font-semibold">Họ và tên</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Số điện thoại</th>
                <th className="p-4 font-semibold">Vai trò</th>
                <th className="p-4 font-semibold">Trạng thái</th>
                <th className="p-4 font-semibold text-right">Hành động</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              )}

              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Không có tài khoản nào
                  </td>
                </tr>
              )}

              {!loading &&
                users.map((user) => {
                  const userId = getUserId(user);
                  const isActive = user.isActive !== false;

                  return (
                    <tr
                      key={userId}
                      className="border-t text-sm transition hover:bg-gray-50"
                    >
                      <td className="p-4">
                        <div className="font-semibold text-gray-900">
                          {getUserName(user)}
                        </div>

                        <div className="mt-1 text-xs text-gray-400">
                          ID: {userId}
                        </div>
                      </td>

                      <td className="p-4 text-gray-600">{user.email}</td>

                      <td className="p-4 text-gray-600">
                        {user.phone || "Chưa cập nhật"}
                      </td>

                      <td className="p-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            user.role === "STAFF"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {getRoleLabel(user.role)}
                        </span>
                      </td>

                      <td className="p-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {isActive ? "Đang hoạt động" : "Đã khóa"}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => toggleStatus(user)}
                            disabled={actionLoadingId === userId}
                            className={`rounded-lg px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${
                              isActive
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {actionLoadingId === userId
                              ? "Đang xử lý..."
                              : isActive
                                ? "Khóa"
                                : "Mở khóa"}
                          </button>

                          {user.role === "STAFF" && (
                            <Link
                              href={`/admin/users/edit/${userId}`}
                              className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200"
                            >
                              Sửa
                            </Link>
                          )}

                          <button
                            onClick={() => deleteUser(user)}
                            disabled={actionLoadingId === userId}
                            className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-3 border-t px-6 py-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-gray-500">
            Trang {page} / {totalPages}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page <= 1 || loading}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Trước
            </button>

            {pageNumbers.map((item) => (
              <button
                key={item}
                onClick={() => setPage(item)}
                disabled={loading}
                className={`h-10 w-10 rounded-xl text-sm font-semibold ${
                  item === page
                    ? "bg-gray-900 text-white"
                    : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {item}
              </button>
            ))}

            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page >= totalPages || loading}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}