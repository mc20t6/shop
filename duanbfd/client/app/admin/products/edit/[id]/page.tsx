"use client";

import ProductVariantForm, {
  ProductData,
  VariantData,
} from "@/components/admin/ProductVariantForm";
import { api } from "@/lib/api";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();

  const productId = String(params.id || "");

  const [product, setProduct] = useState<ProductData | null>(null);
  const [variants, setVariants] = useState<VariantData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProductDetail = async () => {
    try {
      setLoading(true);

      const [productRes, variantsRes] = await Promise.all([
        api.get(`/products/${productId}`),
        api.get(`/products/${productId}/variants`),
      ]);

      const productPayload = productRes.data?.data || productRes.data;
      const variantsPayload = Array.isArray(variantsRes.data)
        ? variantsRes.data
        : variantsRes.data?.data || [];

      setProduct(productPayload);
      setVariants(variantsPayload);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Không tải được thông tin sản phẩm"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchProductDetail();
    }
  }, [productId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Chỉnh sửa sản phẩm
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Cập nhật sản phẩm, biến thể và ảnh
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
        mode="edit"
        productId={productId}
        initialProduct={product}
        initialVariants={variants}
        loading={loading}
        onDone={() => router.push("/admin/products")}
      />
    </div>
  );
}