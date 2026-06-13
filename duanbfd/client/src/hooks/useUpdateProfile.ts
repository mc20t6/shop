// src/hooks/useUpdateProfile.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userData: any) => {
      const { data } = await api.patch("/users/profile", userData);
      return data;
    },
    onSuccess: () => {
      // Tự động làm mới dữ liệu sau khi cập nhật thành công
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};