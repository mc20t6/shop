import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

// Lấy tất cả sản phẩm (không phân trang - giữ nguyên hàm cũ)
export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      // Endpoint này cần khớp với Backend của bạn
      const { data } = await api.get("/products");
      return data;
    },
    staleTime: 1000 * 60 * 5, // Cache trong 5 phút
  });
};

export const useProduct = (productId?: string) => {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      if (!productId) {
        throw new Error("Missing product id");
      }

      const { data } = await api.get(`/products/${productId}`);
      return data?.data || data;
    },
    enabled: Boolean(productId),
    staleTime: 1000 * 60 * 5,
  });
};

// Lấy sản phẩm có phân trang
export const useProductsPaginated = (page: number = 1, limit: number = 8) => {
  return useQuery({
    queryKey: ["products", "paginated", page, limit],
    queryFn: async () => {
      const { data } = await api.get(`/products?page=${page}&limit=${limit}`);
      return data;
    },
    staleTime: 1000 * 60 * 5,
    placeholderData: (previousData) => previousData, // giữ dữ liệu cũ khi chuyển trang
  });
};