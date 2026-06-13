export default function CartItem({ item }: { item: any }) {
  return (
    <div className="flex justify-between items-center border-b py-4">
      <div className="flex gap-4">
        <div className="w-16 h-16 bg-gray-200 rounded"></div>
        <div>
          <p className="font-semibold">{item?.name || "Sản phẩm không tên"}</p>
          {/* ✅ Sửa dòng này để thêm giá trị mặc định là 0 nếu price bị undefined */}
          <p className="text-sm text-gray-500">{(item?.price || 0).toLocaleString()} VNĐ</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <input type="number" defaultValue={item?.quantity || 1} className="w-12 border p-1 rounded" />
        <button className="text-red-500 text-sm">Xóa</button>
      </div>
    </div>
  );
}