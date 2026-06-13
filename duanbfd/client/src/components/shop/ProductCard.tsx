"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { API_URL, api } from "@/lib/api";
import { useCartStore } from "@/store/useCartStore";

const getImageUrl = (image?: string) => {
  if (!image) return "";
  if (image.startsWith("http")) return image;
  const cleanApiUrl = API_URL || "http://localhost:3001";
  return `${cleanApiUrl}${image.startsWith("/") ? image : `/${image}`}`;
};

interface ProductCardProps {
  product: any;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  const productId = product?._id || product?.id;
  const productImage =
    product?.image ||
    product?.imageUrl ||
    (Array.isArray(product?.images) && product.images.length > 0
      ? product.images[0]
      : "");

  const [currentImg, setCurrentImg] = useState<string>(getImageUrl(productImage));
  const [added, setAdded] = useState(false);

  // Fetch variants để lấy giá & variantId (cache 5 phút)
  const { data: variants = [], isLoading: isLoadingVariants } = useQuery({
    queryKey: ["variants", productId],
    queryFn: async () => {
      try {
        const res = await api.get(`/products/${productId}/variants`);

        return Array.isArray(res.data)
          ? res.data
          : res.data?.data || [];
      } catch (e) {
        console.log("Không có variant", productId);
        return [];
      }
    },
    enabled: Boolean(productId),
    staleTime: 1000 * 60 * 5,
  });

  // Giá thấp nhất trong các variants
  const minPrice =
    Array.isArray(variants) && variants.length > 0
      ? Math.min(...variants.map((v: any) => Number(v.price) || 0))
      : product?.price || null;

  // Variant đầu tiên (mặc định thêm vào giỏ)
  const firstVariant = variants?.[0];

  // Ảnh fallback từ variant nếu product không có ảnh
  const variantImage =
    firstVariant?.image ||
    firstVariant?.imageUrl ||
    "";
  const displayImageUrl = productImage ? currentImg : getImageUrl(variantImage);

  const handleAddToCart = () => {
    if (!product || !firstVariant) {
      return;
    }

    const vId = firstVariant?._id || firstVariant?.id;

    if (!vId) {
      return;
    }

    const priceToUse =
      Number(firstVariant?.price) ??
      Number(product?.price) ??
      0;

    const imageToUse =
      productImage ||
      variantImage ||
      "";

    addItem({
      id: productId,
      _id: productId,
      variantId: vId,
      name: product.name,
      price: priceToUse,
      image: getImageUrl(imageToUse),
      size: firstVariant?.size || "",
      color: firstVariant?.color || "",
      quantity: 1,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="border rounded-xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between h-full bg-white">

      {/* Hình ảnh sản phẩm */}
      <div className="w-full h-48 bg-gray-50 rounded-lg overflow-hidden mb-4 flex items-center justify-center">
        {(productImage || variantImage) ? (
          <img
            src={displayImageUrl}
            alt={product?.name || "Sản phẩm"}
            className="w-full h-full object-cover"
            onError={() => setCurrentImg("https://placehold.co/400x400?text=No+Image")}
          />
        ) : (
          <div className="text-gray-400 text-sm text-center px-2">Không có ảnh</div>
        )}
      </div>

      {/* Thông tin sản phẩm */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-medium text-gray-800 line-clamp-2 mb-2 min-h-[2.5rem]">
            {product?.name || "Chưa có tên"}
          </h3>

          {/* Giá tiền */}
          {isLoadingVariants ? (
            <div className="h-5 w-24 bg-gray-200 animate-pulse rounded mb-4" />
          ) : minPrice > 0 ? (
            <div className="mb-3">
              <p className="text-red-600 font-bold text-lg leading-tight">
                {variants && variants.length > 1
                  ? `Từ ${minPrice.toLocaleString('vi-VN')} ₫`
                  : `${minPrice.toLocaleString('vi-VN')} ₫`
                }
              </p>
              {variants && variants.length > 1 && (
                <p className="text-xs text-gray-400">{variants.length} lựa chọn</p>
              )}
            </div>
          ) : (
            <p className="text-gray-400 text-sm mb-3">Liên hệ để biết giá</p>
          )}
        </div>

        {/* Nút hành động */}
        <div className="flex gap-2 mt-auto">
          <button
            onClick={handleAddToCart}
            disabled={!firstVariant || isLoadingVariants}
            className={`flex-1 py-2 rounded-md font-medium transition text-sm ${added
              ? 'bg-green-600 text-white'
              : !firstVariant || isLoadingVariants
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
          >
            {added ? '✓ Đã thêm!' : 'Thêm giỏ'}
          </button>

          <Link
            href={`/shop/products/${productId}`}
            className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition text-sm flex items-center justify-center"
          >
            Xem
          </Link>
        </div>
      </div>
    </div>
  );
}