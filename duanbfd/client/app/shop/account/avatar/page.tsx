"use client";

import React, { useState, useRef } from 'react';
import { api } from "@/lib/api";

export default function AvatarPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile)); // Tạo đường dẫn ảnh tạm thời để xem trước
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file); // 'file' là tên field mà Backend (Multer) mong đợi

    try {
      await api.post('/users/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert("Cập nhật ảnh đại diện thành công!");
    } catch (err) {
      alert("Upload thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Ảnh đại diện</h1>
      
      <div className="flex flex-col items-center gap-6">
        {/* Vùng Preview ảnh */}
        <div className="w-32 h-32 rounded-full border bg-gray-100 overflow-hidden flex items-center justify-center">
          {preview ? (
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-400">Ảnh</span>
          )}
        </div>

        {/* Input ẩn */}
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
        
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="border px-4 py-2 rounded hover:bg-gray-50"
        >
          Chọn ảnh từ máy
        </button>

        <button 
          onClick={handleUpload}
          disabled={!file || loading}
          className="bg-blue-600 text-white px-8 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Đang tải lên..." : "Cập nhật ảnh"}
        </button>
      </div>
    </div>
  );
}