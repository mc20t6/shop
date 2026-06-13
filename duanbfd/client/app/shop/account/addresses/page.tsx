// app/(shop)/account/addresses/page.tsx
import React from 'react';

export default function AddressesPage() {
  // Giả định dữ liệu địa chỉ
  const addresses = [
    { id: 1, label: 'Nhà riêng', address: 'Số 1, Đường ABC, Quận XYZ, Hà Nội', isDefault: true },
    { id: 2, label: 'Công ty', address: 'Tầng 5, Tòa nhà DEF, Quận GHI, Hà Nội', isDefault: false },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Địa chỉ nhận hàng</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
          + Thêm địa chỉ
        </button>
      </div>
      
      <div className="space-y-4">
        {addresses.map((addr) => (
          <div key={addr.id} className="border p-4 rounded-lg flex justify-between items-start">
            <div>
              <p className="font-semibold">{addr.label} {addr.isDefault && <span className="text-xs bg-gray-200 px-2 py-0.5 rounded ml-2">Mặc định</span>}</p>
              <p className="text-gray-600 mt-1">{addr.address}</p>
            </div>
            <div className="flex gap-2">
              <button className="text-blue-600 text-sm">Sửa</button>
              <button className="text-red-600 text-sm">Xóa</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}