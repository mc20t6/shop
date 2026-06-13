"use client";

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, API_URL } from "@/lib/api";
import { useProfile } from "@/hooks/useUser";
import Link from 'next/link';

const getImageUrl = (image?: string) => {
  if (!image) return "";
  if (image.startsWith("http")) return image;
  const cleanApiUrl = API_URL || "http://localhost:3001";
  return `${cleanApiUrl}${image.startsWith("/") ? image : `/${image}`}`;
};

export default function ReviewsPage() {
  const queryClient = useQueryClient();
  const [expandedReviewId, setExpandedReviewId] = useState<string | null>(null);

  // Get current user profile
  const { data: profile } = useProfile();
  const userId = profile?.id || profile?._id;

  // Fetch user's reviews
  const { data: reviews = [], isLoading, error } = useQuery({
    queryKey: ["userReviews", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data } = await api.get(`/reviews/user/${userId}`);
      return Array.isArray(data) ? data : data?.data || [];
    },
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 5,
  });

  // Delete review mutation
  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      await api.delete(`/reviews/${reviewId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userReviews", userId] });
    },
  });

  const handleDeleteReview = (reviewId: string) => {
    if (confirm("Bạn chắc chắn muốn xóa đánh giá này?")) {
      deleteReviewMutation.mutate(reviewId);
    }
  };

  if (isLoading) return <div className="text-center py-20 text-gray-500 font-medium">Đang tải đánh giá...</div>;
  if (error) return <div className="text-center py-20 text-red-500 font-medium">Không thể tải danh sách đánh giá.</div>;

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 tracking-tight">Đánh giá của tôi</h1>
      
      {!reviews || reviews.length === 0 ? (
        <div className="text-center py-16 border rounded-2xl bg-gray-50 text-gray-500">
          <p className="font-medium text-base">Bạn chưa có đánh giá nào.</p>
          <Link href="/shop" className="text-blue-600 hover:underline mt-2 inline-block">
            Quay lại mua sắm →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review: any) => (
            <div 
              key={review._id} 
              className="border border-gray-200 p-6 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-bold text-gray-800 text-lg">
                    {review.productName || "Sản phẩm"}
                  </p>
                  <p className="text-sm text-gray-400">
                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : "Chưa cập nhật"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setExpandedReviewId(expandedReviewId === review._id ? null : review._id)}
                    className="px-3 py-1 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    {expandedReviewId === review._id ? "Thu gọn" : "Chi tiết"}
                  </button>
                  <button
                    onClick={() => handleDeleteReview(review._id)}
                    disabled={deleteReviewMutation.isPending}
                    className="px-3 py-1 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
                  >
                    Xóa
                  </button>
                </div>
              </div>

              {/* Rating and Status */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-xl ${
                        i < (review.rating || 0) ? "text-yellow-400" : "text-gray-300"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  review.isVerified
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}>
                  {review.isVerified ? "Đã xác minh" : "Chờ xác minh"}
                </span>
              </div>

              {/* Comment Preview */}
              <p className="text-gray-700 mb-4 line-clamp-2">
                {review.comment || "Không có nhận xét"}
              </p>

              {/* Expanded Content */}
              {expandedReviewId === review._id && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                  {/* Full Comment */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">Nhận xét đầy đủ:</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{review.comment || "Không có nhận xét"}</p>
                  </div>

                  {/* Images */}
                  {review.images && review.images.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800 mb-2">Hình ảnh:</h4>
                      <div className="grid grid-cols-3 gap-3">
                        {review.images.map((image: string, idx: number) => (
                          <div key={idx} className="rounded-lg overflow-hidden border border-gray-200 h-24">
                            <img
                              src={getImageUrl(image)}
                              alt={`Review image ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Product Link */}
                  <div>
                    <Link
                      href={`/shop/products/${review.productId}`}
                      className="text-blue-600 hover:underline font-medium text-sm"
                    >
                      Xem sản phẩm →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}