// src/hooks/useReviews.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const useReviews = (productId?: string) => {
  return useQuery({
    // Nếu có productId thì lưu vào key để phân biệt review từng sản phẩm
    queryKey: productId ? ["reviews", productId] : ["reviews"], 
    queryFn: async () => {
      // ❌ ĐOẠN CŨ BỊ SAI (Gây lỗi 404): const { data } = await api.get("/me");
      
      // 🎯 SỬA LẠI THÀNH: Gọi đúng endpoint lấy danh sách đánh giá công khai
      const endpoint = productId ? `/reviews?productId=${productId}` : "/reviews";
      const { data } = await api.get(endpoint);
      
      // Logic xử lý mảng an toàn tương tự như bạn viết:
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.data)) return data.data;
      if (data && Array.isArray(data.reviews)) return data.reviews;
      
      return [];
    },
  });
};