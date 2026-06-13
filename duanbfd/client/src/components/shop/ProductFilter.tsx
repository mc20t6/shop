// src/components/shop/ProductFilter.tsx
export default function ProductFilter() {
  return (
    <aside className="border p-4 rounded-lg">
      <h3 className="font-bold mb-3">Danh mục</h3>
      <ul className="space-y-2 text-gray-600">
        <li><button>Tất cả</button></li>
        <li><button>Đồ điện tử</button></li>
        <li><button>Thời trang</button></li>
      </ul>
    </aside>
  );
}