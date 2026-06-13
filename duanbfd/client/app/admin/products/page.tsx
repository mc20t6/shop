"use client";

import { API_URL, api } from "@/lib/api";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const LIMIT = 10;

type Product = {
  id?: string;
  _id?: string;
  categoryId?: string | null;
  name: string;
  slug?: string;
  description?: string;
  material?: string;
  careGuide?: string;
  images?: string[];
  isActive?: boolean;
  deletedAt?: string | null;
  createdAt?: string;
};

type ProductsResponse = {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

const getProductId = (product: Product) => {
  return product.id || product._id || "";
};

const getImageUrl = (image?: string) => {
  if (!image) return "";

  if (image.startsWith("http")) {
    return image;
  }

  return `${API_URL}${image.startsWith("/") ? image : `/${image}`}`;
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat("vi-VN").format(value);
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const res = await api.get<ProductsResponse | Product[]>("/products", {
        params: {
          page,
          limit: LIMIT,
          search,
        },
      });

      const payload: any = res.data;

      // Trường hợp backend trả mảng thường
      if (Array.isArray(payload)) {
        setProducts(payload);
        setTotal(payload.length);
        setTotalPages(1);
        return;
      }

      // Trường hợp backend trả phân trang
      setProducts(payload.data || []);
      setTotal(payload.total || 0);
      setTotalPages(Math.max(payload.totalPages || 1, 1));
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Không tải được danh sách sản phẩm";

      setErrorMessage(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, search]);

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setPage(1);
    setSearch(searchInput.trim());
  };

  const deleteProduct = async (product: Product) => {
    const productId = getProductId(product);

    if (!productId) return;

    const ok = window.confirm("Bạn có chắc muốn xóa sản phẩm này không?");

    if (!ok) return;

    try {
      setActionLoadingId(productId);

      await api.delete(`/products/${productId}`);

      toast.success("Xóa sản phẩm thành công");

      await fetchProducts();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không xóa được sản phẩm");
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
            Quản lý sản phẩm
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Quản lý sản phẩm, biến thể và hình ảnh sản phẩm
          </p>
        </div>

        <Link
          href="/admin/products/create"
          className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-700"
        >
          + Thêm sản phẩm
        </Link>
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-3 md:flex-row"
        >
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm theo tên sản phẩm, slug, chất liệu..."
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-900"
          />

          <button
            type="submit"
            className="rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white"
          >
            Tìm kiếm
          </button>
        </form>
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
            <h2 className="font-bold text-gray-900">Danh sách sản phẩm</h2>

            <p className="mt-1 text-sm text-gray-500">
              Tổng cộng {formatNumber(total)} sản phẩm
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px]">
            <thead className="bg-gray-50 text-left text-sm text-gray-500">
              <tr>
                <th className="p-4 font-semibold">Sản phẩm</th>
                <th className="p-4 font-semibold">Slug</th>
                <th className="p-4 font-semibold">Chất liệu</th>
                <th className="p-4 font-semibold">Trạng thái</th>
                <th className="p-4 font-semibold text-right">Hành động</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              )}

              {!loading && products.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    Không có sản phẩm nào
                  </td>
                </tr>
              )}

              {!loading &&
                products.map((product) => {
                  const productId = getProductId(product);
                  const firstImage = product.images?.[0];

                  return (
                    <tr
                      key={productId}
                      className="border-t text-sm transition hover:bg-gray-50"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-14 w-14 overflow-hidden rounded-xl bg-gray-100">
                            {firstImage ? (
                              <img
                                src={getImageUrl(firstImage)}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                                No img
                              </div>
                            )}
                          </div>

                          <div>
                            <div className="font-semibold text-gray-900">
                              {product.name}
                            </div>

                            <div className="mt-1 text-xs text-gray-400">
                              ID: {productId}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-gray-600">
                        {product.slug || "Chưa có"}
                      </td>

                      <td className="p-4 text-gray-600">
                        {product.material || "Chưa cập nhật"}
                      </td>

                      <td className="p-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            product.isActive !== false
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {product.isActive !== false
                            ? "Đang bán"
                            : "Ngừng bán"}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/products/edit/${productId}`}
                            className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200"
                          >
                            Sửa
                          </Link>

                          <button
                            onClick={() => deleteProduct(product)}
                            disabled={actionLoadingId === productId}
                            className="rounded-lg bg-red-100 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {actionLoadingId === productId
                              ? "Đang xóa..."
                              : "Xóa"}
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