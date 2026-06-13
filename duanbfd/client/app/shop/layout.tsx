// app/(shop)/layout.tsx
import Navbar from "@/components/shared/Navbar"; // Component bạn đã tạo
import Footer from "@/components/shared/Footer"; // Bạn nên tạo thêm file này

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Sử dụng Component Navbar thực tế */}
      <Navbar />
      
      {/* Nội dung trang sẽ hiển thị ở đây */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
        
      </main>
      
      {/* Sử dụng Component Footer thực tế */}
      <Footer />
    </div>
  );
}