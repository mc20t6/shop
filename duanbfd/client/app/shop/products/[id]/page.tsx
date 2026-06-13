"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api, API_URL } from "@/lib/api";
import { useCartStore } from "@/store/useCartStore";
import { useProduct } from "@/hooks/useProducts";

const getImageUrl = (image?: string) => {
  if (!image) return "";
  if (image.startsWith("http")) return image;
  const cleanApiUrl = API_URL || "http://localhost:3001";
  return `${cleanApiUrl}${image.startsWith("/") ? image : `/${image}`}`;
};

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params?.id as string | undefined;
  const addItem = useCartStore((state) => state.addItem);

  const { data: product, isLoading, error } = useProduct(productId);

  const { data: variants = [], isLoading: isLoadingVariants } = useQuery({
    queryKey: ["productVariants", productId],
    queryFn: async () => {
      if (!productId) return [];
      const res = await api.get(`/products/${productId}/variants`);
      return Array.isArray(res.data) ? res.data : res.data?.data || [];
    },
    enabled: Boolean(productId),
    staleTime: 1000 * 60 * 5,
  });

  const productImages = useMemo(() => {
    if (!product) return [];
    const images: string[] = [];

    if (product.image) images.push(product.image);
    if (product.imageUrl) images.push(product.imageUrl);
    if (Array.isArray(product.images)) images.push(...product.images);

    return Array.from(new Set(images)).filter(Boolean);
  }, [product]);

  const displayImage = getImageUrl(productImages[0] || product?.image || "");
  const firstVariant = variants?.[0];
  const minPrice = firstVariant ? Number(firstVariant.price) : Number(product?.price || 0);

  const handleAddToCart = () => {
    if (!product || !firstVariant) return;

    const variantId = firstVariant._id || firstVariant.id;
    if (!variantId) return;

    addItem({
      id: productId || "",
      _id: productId,
      variantId,
      name: product.name,
      price: Number(firstVariant.price) || Number(product.price) || 0,
      image: displayImage,
      size: firstVariant.size || "",
      color: firstVariant.color || "",
      quantity: 1,
    });
  };

  if (!productId) {
    return (
      <div className="container mx-auto py-10 text-center text-gray-600">
        Không tìm thấy sản phẩm.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 text-center text-gray-600">
        Đang tải sản phẩm...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 text-center text-red-500">
        Không thể tải sản phẩm. Vui lòng thử lại sau.
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto py-10 text-center text-gray-600">
        Sản phẩm không tồn tại hoặc đã bị xóa.
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Link href="/shop/products" className="text-sm text-blue-600 hover:underline">
          ← Quay lại danh sách sản phẩm
        </Link>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.3fr_0.9fr]">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="rounded-3xl overflow-hidden border border-gray-100 bg-gray-50 h-[520px] flex items-center justify-center">
            {displayImage ? (
              <img
                src={displayImage}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(event) => {
                  const img = event.currentTarget as HTMLImageElement;
                  img.src = "https://placehold.co/700x700?text=No+Image";
                }}
              />
            ) : (
              <div className="text-gray-400">Không có ảnh</div>
            )}
          </div>

          {productImages.length > 1 && (
            <div className="grid grid-cols-4 gap-3 mt-4">
              {productImages.map((image) => (
                <div key={image} className="border rounded-3xl overflow-hidden h-24">
                  <img src={getImageUrl(image)} alt={product.name} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-gray-500">Chi tiết sản phẩm</p>
            <h1 className="mt-3 text-3xl font-semibold text-gray-900">{product.name}</h1>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-gray-50 p-6">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-3xl font-bold text-red-600">
                {minPrice > 0 ? `${minPrice.toLocaleString("vi-VN")} ₫` : "Liên hệ"}
              </span>
              {variants.length > 1 && (
                <span className="text-sm text-gray-500">{variants.length} biến thể</span>
              )}
            </div>
            <p className="mt-4 text-gray-600 whitespace-pre-line">
              {product.description || "Không có mô tả sản phẩm."}
            </p>
          </div>

          <div className="grid gap-3">
            <button
              type="button"
              disabled={!firstVariant || isLoadingVariants}
              onClick={handleAddToCart}
              className={`w-full rounded-xl px-5 py-4 text-sm font-semibold transition ${
                !firstVariant || isLoadingVariants
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
            >
              {isLoadingVariants ? "Đang tải biến thể..." : firstVariant ? "Thêm vào giỏ" : "Không có biến thể"}
            </button>

            <Link
              href="/shop"
              className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-5 py-4 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Tiếp tục mua sắm
            </Link>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-gray-50 p-6 text-sm text-gray-600 space-y-2">
            <div>
              <span className="font-medium text-gray-800">Mã sản phẩm:</span> {product._id || product.id || "-"}
            </div>
            {product.slug && (
              <div>
                <span className="font-medium text-gray-800">Slug:</span> {product.slug}
              </div>
            )}
            {product.material && (
              <div>
                <span className="font-medium text-gray-800">Chất liệu:</span> {product.material}
              </div>
            )}
            {product.careGuide && (
              <div>
                <span className="font-medium text-gray-800">Hướng dẫn:</span> {product.careGuide}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}