"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface ReviewModalProps {
  isOpen: boolean;
  productId: string;
  orderId: string;
  productName: string;
  onClose: () => void;
}

export default function ReviewModal({
  isOpen,
  productId,
  orderId,
  productName,
  onClose,
}: ReviewModalProps) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<File[]>([]);

  const createReviewMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("productId", productId);
      formData.append("orderId", orderId);
      formData.append("rating", rating.toString());
      formData.append("comment", comment);
      images.forEach((img) => formData.append("images", img));

      await api.post("/reviews", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userReviews"] });
      alert("Đánh giá thành công!");
      handleClose();
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Lỗi khi đánh giá");
    },
  });

  const handleClose = () => {
    setRating(5);
    setComment("");
    setImages([]);
    onClose();
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Đánh giá sản phẩm</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">{productName}</p>

        {/* Rating */}
        <div className="mb-4">
          <label className="text-sm font-semibold text-gray-800 mb-2 block">
            Đánh giá
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`text-3xl transition ${
                  star <= rating ? "text-yellow-400" : "text-gray-300"
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div className="mb-4">
          <label className="text-sm font-semibold text-gray-800 mb-2 block">
            Nhận xét (tùy chọn)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn với sản phẩm..."
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
        </div>

        {/* Images */}
        <div className="mb-4">
          <label className="text-sm font-semibold text-gray-800 mb-2 block">
            Hình ảnh (tùy chọn)
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageSelect}
            className="w-full border border-gray-300 rounded-lg p-2 text-sm"
          />
          {images.length > 0 && (
            <div className="mt-2 grid grid-cols-3 gap-2">
              {images.map((img, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={URL.createObjectURL(img)}
                    alt="preview"
                    className="w-full h-24 object-cover rounded border border-gray-200"
                  />
                  <button
                    onClick={() =>
                      setImages(images.filter((_, i) => i !== idx))
                    }
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
          >
            Hủy
          </button>
          <button
            onClick={() => createReviewMutation.mutate()}
            disabled={createReviewMutation.isPending}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
          >
            {createReviewMutation.isPending ? "Đang gửi..." : "Gửi đánh giá"}
          </button>
        </div>
      </div>
    </div>
  );
}
