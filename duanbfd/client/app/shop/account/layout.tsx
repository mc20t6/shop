// app/(shop)/account/layout.tsx
import Link from 'next/link';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const menu = [
    { name: 'Hồ sơ', path: '/shop/account/profile' },
    { name: 'Đơn hàng', path: '/shop/account/orders' },
    { name: 'Địa chỉ', path: '/shop/account/addresses' },
    { name: 'Đổi mật khẩu', path: '/shop/account/change-password' },
    { name: 'Đánh giá', path: '/shop/account/reviews' },
  ];

  return (
    <div className="container mx-auto py-10 flex gap-8">
      <aside className="w-1/4 space-y-2">
        {menu.map(item => (
          <Link key={item.path} href={item.path} className="block p-2 hover:bg-gray-100 rounded">
            {item.name}
          </Link>
        ))}
      </aside>
      <main className="w-3/4">{children}</main>
    </div>
  );
}