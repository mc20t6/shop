"use client";

import ProductVariantForm from "@/components/admin/ProductVariantForm";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CreateProductPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thêm sản phẩm</h1>

          <p className="mt-2 text-sm text-gray-500">
            Tạo sản phẩm mới, thêm biến thể và upload ảnh
          </p>
        </div>

        <Link
          href="/admin/products"
          className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Quay lại
        </Link>
      </div>

      <ProductVariantForm
        mode="create"
        onDone={() => router.push("/admin/products")}
      />
    </div>
  );
}