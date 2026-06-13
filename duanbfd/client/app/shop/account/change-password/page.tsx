"use client";
import React, { useState } from 'react';
import { api } from "@/lib/api"; // Giả định bạn dùng instance axios này

export default function ChangePasswordPage() {
  const [formData, setFormData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Kiểm tra cơ bản
    if (formData.newPassword !== formData.confirmPassword) {
      return alert("Mật khẩu mới không khớp!");
    }

    setLoading(true);
    try {
      await api.patch('/users/change-password', {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword
      });
      alert("Đổi mật khẩu thành công!");
      setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      alert(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Đổi mật khẩu</h1>
      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <input 
          required
          type="password" 
          placeholder="Mật khẩu cũ" 
          className="w-full border p-2 rounded"
          value={formData.oldPassword}
          onChange={(e) => setFormData({...formData, oldPassword: e.target.value})}
        />
        <input 
          required
          type="password" 
          placeholder="Mật khẩu mới" 
          className="w-full border p-2 rounded"
          value={formData.newPassword}
          onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
        />
        <input 
          required
          type="password" 
          placeholder="Nhập lại mật khẩu mới" 
          className="w-full border p-2 rounded"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
        />
        <button 
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
        </button>
      </form>
    </div>
  );
}