import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useCartStore } from "@/store/useCartStore"; 
import { useProfile } from "./useUser";

// 🎯 Hook 1: Lấy danh sách đơn hàng của user hiện tại
export const useOrders = () => {
  const { data: profile } = useProfile();
  const userId = profile?.id || profile?._id;

  return useQuery({
    queryKey: ["orders", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data } = await api.get(`/orders/user/${userId}`);
      return Array.isArray(data) ? data : data?.data || [];
    },
    enabled: Boolean(userId),
  });
};

// 🎯 Hook 2: Tạo đơn hàng mới (Đã sửa endpoint đồng bộ /orders)
export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  const clearCart = useCartStore((state: any) => state.clearCart); 

  return useMutation({
    mutationFn: async (orderData: any) => {
      const { data } = await api.post("/orders", orderData);
      return data;
    },
    onSuccess: () => {
      if (typeof clearCart === "function") {
        clearCart();
      }
      // Làm mới lại danh sách đơn hàng sau khi đặt thành công
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error: any) => {
      console.error("Lỗi đặt hàng:", error);
      alert(error.response?.data?.message || "Đặt hàng thất bại. Vui lòng thử lại!");
    }
  });
};