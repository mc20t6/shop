export default function OrderSummary({ total }: { total: number }) {
  const safeTotal = Number(total) || 0;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800 border-b pb-3">Tóm tắt thanh toán</h2>
      
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Tạm tính:</span>
          <span className="font-medium text-gray-800">{safeTotal.toLocaleString('vi-VN')} ₫</span>
        </div>
        <div className="flex justify-between">
          <span>Phí vận chuyển:</span>
          <span className="font-medium text-green-600">Miễn phí</span>
        </div>
      </div>

      <div className="border-t pt-3 flex justify-between items-center">
        <span className="font-semibold text-gray-800">Tổng cộng:</span>
        <div className="text-right">
          <p className="text-2xl font-extrabold text-red-600">
            {safeTotal.toLocaleString('vi-VN')} ₫
          </p>
          <p className="text-xs text-gray-400">({safeTotal.toLocaleString('vi-VN')} VNĐ)</p>
        </div>
      </div>
    </div>
  );
}