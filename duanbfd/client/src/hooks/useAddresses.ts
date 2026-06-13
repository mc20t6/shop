import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Address {
  _id: string;
  userId: string;
  fullName: string;
  phone: string;
  address: string;
  label?: string;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAddressInput {
  fullName: string;
  phone: string;
  address: string;
  label?: string;
  isDefault?: boolean;
}

export interface UpdateAddressInput {
  fullName?: string;
  phone?: string;
  address?: string;
  label?: string;
  isDefault?: boolean;
}

// Lấy danh sách địa chỉ
export const useAddresses = () => {
  return useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      const { data } = await api.get<Address[]>("/addresses");
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 phút
    retry: 2,
  });
};

// Tạo địa chỉ mới
export const useCreateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAddressInput) =>
      api.post<Address>("/addresses", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });
};

// Cập nhật địa chỉ
export const useUpdateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAddressInput }) =>
      api.patch<Address>(`/addresses/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });
};

// Xóa địa chỉ
export const useDeleteAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/addresses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });
};