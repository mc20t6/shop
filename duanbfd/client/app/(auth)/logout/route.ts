import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json({ message: "Đăng xuất thành công!" }, { status: 200 });

    // Xóa bỏ cookie token và role bằng cách xóa trực tiếp
    response.cookies.delete("token");
    response.cookies.delete("role");

    return response;
  } catch (error) {
    return NextResponse.json({ message: "Có lỗi xảy ra khi đăng xuất" }, { status: 500 });
  }
}
