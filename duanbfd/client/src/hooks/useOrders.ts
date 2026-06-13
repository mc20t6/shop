import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useCartStore } from "@/store/useCartStore"; 

// 🎯 Hook 1: Lấy danh sách tất cả đơn hàng
export const useOrders = () => {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data } = await api.get("/orders");
      return data;
    },
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