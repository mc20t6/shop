import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useCartStore } from "@/store/useCartStore"; 

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  const clearCart = useCartStore((state: any) => state.clearCart); 

  return useMutation({
    mutationFn: async (orderData: any) => {
      // Gọi API tạo đơn hàng
      const { data } = await api.post("/orders", orderData);
      return data;
    },
    onSuccess: () => {
      // 1. Sau khi đặt hàng thành công, tự động xóa giỏ hàng ở Client
      if (typeof clearCart === "function") {
        clearCart();
      }
      
      // 2. Làm mới lại cache đơn hàng để trang quản lý đơn cập nhật dữ liệu mới nhất
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error: any) => {
      console.error("Lỗi đặt hàng:", error);
      alert(error.response?.data?.message || "Đặt hàng thất bại. Vui lòng thử lại!");
    }
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      // Đã sửa api.post thành api.patch để khớp với Backend
      const { data } = await api.patch(`/orders/${orderId}/cancel`);
      return data;
    },
    onSuccess: () => {
      // Làm mới lại cache đơn hàng để trang quản lý đơn cập nhật dữ liệu mới nhất
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error: any) => {
      console.error("Lỗi hủy đơn hàng:", error);
      alert(error.response?.data?.message || "Hủy đơn hàng thất bại. Vui lòng thử lại!");
    }
  });
};