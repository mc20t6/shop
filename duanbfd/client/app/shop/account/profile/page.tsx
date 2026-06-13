"use client";
import { useState, useEffect } from 'react';
import { useProfile, useUpdateProfile } from "@/hooks/useUser";
import error from 'next/dist/api/error';

export default function ProfilePage() {
  const { data: profile, isLoading } = useProfile();
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const [formData, setFormData] = useState({ name: '', phone: '' });

  // Khi dữ liệu từ API về, cập nhật vào form
  useEffect(() => {
    if (profile) {
      setFormData({ name: profile.name, phone: profile.phone || '' });
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
  };

  if (isLoading) return <div>Đang tải thông tin...</div>;
  if (error) return <div>Vui lòng đăng nhập để xem thông tin cá nhân.</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Thông tin cá nhân</h1>
      <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
          <input 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input disabled value={profile?.email || ''} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gray-100" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
          <input 
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        <button 
          disabled={isPending}
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
        >
          {isPending ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </form>
    </div>
  );
}