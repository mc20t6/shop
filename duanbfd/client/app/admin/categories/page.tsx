"use client";

import { api } from "@/lib/api";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type Category = {
  id?: string;
  _id?: string;
  name: string;
  description?: string;
  image?: string;
  isActive?: boolean;
  products?: number | unknown[];
  productCount?: number;
  productsCount?: number;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);

  const [keyword, setKeyword] = useState("");
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(total / limit));
  }, [total, limit]);

  const getCategoryId = (category: Category) => {
    return category.id || category._id || "";
  };

  const getImageUrl = (image?: string) => {
    if (!image) return "";

    if (image.startsWith("http")) return image;

    return `${API_URL}${image}`;
  };

  const getProductCount = (category: Category) => {
    if (typeof category.productCount === "number") {
      return category.productCount;
    }

    if (typeof category.productsCount === "number") {
      return category.productsCount;
    }

    if (typeof category.products === "number") {
      return category.products;
    }

    if (Array.isArray(category.products)) {
      return category.products.length;
    }

    return 0;
  };

  const getErrorMessage = (error: any, defaultMessage: string) => {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      defaultMessage;

    return Array.isArray(message) ? message.join("\n") : message;
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);

      const res = await api.get("/categories", {
        params: {
          page,
          limit,
          search: search || undefined,
          keyword: search || undefined,
        },
      });

      const data = res.data;

      /**
       * Nếu backend trả về dạng:
       * [
       *   { id, name, image, productCount }
       * ]
       */
      if (Array.isArray(data)) {
        let list = data;

        if (search) {
          list = list.filter((item: Category) =>
            item.name.toLowerCase().includes(search.toLowerCase()),
          );
        }

        const start = (page - 1) * limit;
        const end = start + limit;

        setCategories(list.slice(start, end));
        setTotal(list.length);

        return;
      }

      /**
       * Nếu backend trả về dạng:
       * {
       *   data: [],
       *   total: 10,
       *   page: 1,
       *   limit: 5
       * }
       */
      const list = data.data || data.items || data.categories || [];

      setCategories(list);
      setTotal(data.total || data.totalItems || data.meta?.total || list.length);
    } catch (error: any) {
      console.error("FETCH CATEGORIES ERROR:", error);

      toast.error(getErrorMessage(error, "Không thể tải danh mục"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [page, search]);

  const handleSearch = () => {
    setPage(1);
    setSearch(keyword.trim());
  };

  const handleDelete = async (id: string) => {
    if (!id) {
      toast.error("Không tìm thấy ID danh mục");
      return;
    }

    const isConfirm = window.confirm("Bạn có chắc muốn xóa danh mục này?");

    if (!isConfirm) return;

    try {
      setDeletingId(id);

      await api.delete(`/categories/${id}`);

      toast.success("Xóa danh mục thành công");

      if (categories.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        fetchCategories();
      }
    } catch (error: any) {
      console.error("DELETE CATEGORY ERROR:", error);

      toast.error(getErrorMessage(error, "Xóa danh mục thất bại"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Danh mục</h1>

          <p className="mt-1 text-gray-500">Quản lý danh mục sản phẩm</p>
        </div>

        <Link
          href="/admin/categories/create"
          className="rounded-xl bg-black px-5 py-3 text-white transition hover:bg-gray-800"
        >
          + Thêm danh mục
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>

            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              placeholder="Tìm kiếm danh mục..."
              className="w-full rounded-xl border py-3 pl-10 pr-4 outline-none"
            />
          </div>

          <button
            onClick={handleSearch}
            disabled={loading}
            className="rounded-xl bg-black px-5 py-3 text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            Tìm kiếm
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-4">Ảnh</th>
              <th>Tên danh mục</th>
              <th>Mô tả</th>
              <th>Số sản phẩm</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  Không có danh mục nào
                </td>
              </tr>
            ) : (
              categories.map((category) => {
                const id = getCategoryId(category);
                const imageUrl = getImageUrl(category.image);

                return (
                  <tr key={id} className="border-t">
                    {/* IMAGE */}
                    <td className="p-4">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={category.name}
                          className="h-14 w-14 rounded-xl border object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl border bg-gray-50 text-xs text-gray-400">
                          No image
                        </div>
                      )}
                    </td>

                    {/* NAME */}
                    <td className="font-medium">{category.name}</td>

                    {/* DESCRIPTION */}
                    <td className="max-w-[260px] text-sm text-gray-500">
                      {category.description || "---"}
                    </td>

                    {/* PRODUCT COUNT */}
                    <td>
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
                        {getProductCount(category)}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td>
                      {category.isActive === false ? (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-sm text-red-600">
                          Tạm ẩn
                        </span>
                      ) : (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-600">
                          Đang hiện
                        </span>
                      )}
                    </td>

                    {/* ACTION */}
                    <td>
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/categories/edit/${id}`}
                          className="rounded-lg bg-gray-100 px-4 py-2 text-sm"
                        >
                          Chỉnh sửa
                        </Link>

                        <button
                          onClick={() => handleDelete(id)}
                          disabled={deletingId === id}
                          className="rounded-lg bg-red-100 px-4 py-2 text-sm text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
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

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Trang {page} / {totalPages} - Tổng {total} danh mục
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