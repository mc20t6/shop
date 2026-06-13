export default function Footer() {
  return (
    <footer className="border-t bg-gray-50 py-12 mt-auto">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h4 className="font-bold mb-4">Về chúng tôi</h4>
          <p className="text-sm text-gray-600">Cung cấp các sản phẩm chất lượng tốt nhất với dịch vụ tận tâm.</p>
        </div>
        <div>
          <h4 className="font-bold mb-4">Hỗ trợ</h4>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>Chính sách đổi trả</li>
            <li>Hướng dẫn mua hàng</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">Liên hệ</h4>
          <p className="text-sm text-gray-600">Email: support@shopnew.com</p>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-8 pt-8 border-t text-center text-sm text-gray-500">
        © 2026 ShopNew. All rights reserved.
      </div>
    </footer>
  );
}