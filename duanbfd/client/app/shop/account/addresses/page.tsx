"use client";

import React, { useState } from 'react';
import { useAddresses, useDeleteAddress, useCreateAddress, useUpdateAddress, type CreateAddressInput, type UpdateAddressInput } from "@/hooks/useAddresses";

export default function AddressesPage() {
  const { data: addresses, isLoading, isError, error } = useAddresses();
  const deleteMutation = useDeleteAddress();
  const createMutation = useCreateAddress();
  const updateMutation = useUpdateAddress();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateAddressInput>({
    fullName: '',
    phone: '',
    address: '',
    label: '',
    isDefault: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement & HTMLTextAreaElement;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      updateMutation.mutate(
        { id: editingId, data: formData as UpdateAddressInput },
        {
          onSuccess: () => {
            setShowForm(false);
            setEditingId(null);
            setFormData({
              fullName: '',
              phone: '',
              address: '',
              label: '',
              isDefault: false,
            });
          },
        }
      );
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => {
          setShowForm(false);
          setFormData({
            fullName: '',
            phone: '',
            address: '',
            label: '',
            isDefault: false,
          });
        },
      });
    }
  };

  const handleEdit = (addr: any) => {
    setFormData({
      fullName: addr.fullName,
      phone: addr.phone,
      address: addr.address,
      label: addr.label || '',
      isDefault: addr.isDefault || false,
    });
    setEditingId(addr._id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      fullName: '',
      phone: '',
      address: '',
      label: '',
      isDefault: false,
    });
  };

  if (isLoading) return <div className="text-center py-8">Đang tải danh sách địa chỉ...</div>;

  if (isError) {
    return (
      <div className="text-center py-8 text-red-600">
        Lỗi: {error instanceof Error ? error.message : 'Không thể tải địa chỉ'}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Địa chỉ nhận hàng</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          + Thêm địa chỉ
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-200">
          <h2 className="text-xl font-bold mb-4">{editingId ? 'Sửa' : 'Thêm'} địa chỉ</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tên (*)</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="Tên người nhận"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Điện thoại (*)</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="Số điện thoại"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Địa chỉ (*)</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="w-full border rounded-md px-3 py-2"
                rows={3}
                placeholder="Địa chỉ nhận hàng"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nhãn (tùy chọn)</label>
                <input
                  type="text"
                  name="label"
                  value={formData.label}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="VD: Nhà, Công ty..."
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={formData.isDefault || false}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Đặt làm mặc định</span>
                </label>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border rounded-md hover:bg-gray-100 transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
              >
                {createMutation.isPending || updateMutation.isPending ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Thêm'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {(!addresses || addresses.length === 0) ? (
          <div className="text-center py-8 text-gray-500">
            Chưa có địa chỉ nào. Hãy thêm một địa chỉ mới.
          </div>
        ) : (
          addresses.map((addr: any) => (
            <div key={addr._id} className="border p-4 rounded-lg flex justify-between items-start">
              <div className="flex-1">
                <p className="font-semibold">
                  {addr.label || addr.fullName}
                  {addr.isDefault && <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded ml-2">Mặc định</span>}
                </p>
                <p className="text-gray-600 mt-1">{addr.address}</p>
                <p className="text-gray-500 text-sm mt-1">{addr.fullName} - {addr.phone}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleEdit(addr)}
                  className="text-blue-600 text-sm hover:underline"
                >
                  Sửa
                </button>
                <button 
                  onClick={() => deleteMutation.mutate(addr._id)}
                  disabled={deleteMutation.isPending}
                  className="text-red-600 text-sm hover:underline disabled:opacity-50"
                >
                  {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}