"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

const schema = yup.object({
  email: yup.string().email("Email không hợp lệ").required("Bắt buộc nhập Email"),
  password: yup
    .string()
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    .required("Bắt buộc nhập Mật khẩu"),
});

type LoginFormInputs = yup.InferType<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      setLoading(true);

      const res = await api.post("/auth/login", data);
      const token = res.data.accessToken;

      if (!token) {
        toast.error("Không tìm thấy accessToken", {
          description: "Backend chưa trả về accessToken. Vui lòng kiểm tra API login.",
        });
        return;
      }

      // Giải mã JWT lấy role
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );

      const decodedToken = JSON.parse(jsonPayload);
      const rawRole = decodedToken.role;

      // CHUẨN HÓA ROLE: Xóa khoảng trắng thừa và ép thành CHỮ IN HOA
      const cleanRole = rawRole?.trim().toUpperCase();

      // Lưu cả 2 vào Cookie (Để Middleware đọc được)
      document.cookie = `token=${token}; path=/;`;
      document.cookie = `role=${cleanRole}; path=/;`;

      reset();

      // Hộp thoại báo thành công
      toast.success("Đăng nhập thành công!", {
        description: `Quyền của bạn là: ${cleanRole}`,
      });

      router.refresh(); // Cập nhật lại trạng thái server components
      if (cleanRole === "ADMIN") {
        router.push("/admin");
      } else if (cleanRole === "STAFF") {
        router.push("/staff");
      } else {
        router.push("/shop");
      }
    } catch (err: any) {
      toast.error("Đăng nhập thất bại", {
        description:
          err.response?.data?.message ||
          err.message ||
          "Vui lòng kiểm tra lại email hoặc mật khẩu.",
      });

      console.error("Lỗi API chi tiết:", err);
    } finally {
      setLoading(false);
    }
  };

  const onError = (validationErrors: any) => {
    console.log("Form bị chặn do dữ liệu chưa chuẩn:", validationErrors);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-[400px] bg-white p-4 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">Đăng Nhập</h1>

        <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-2">
          {/* Ô INPUT EMAIL */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="Nhập email của bạn"
              {...register("email")}
              className={`w-full border p-3 rounded-lg outline-none transition-all ${errors.email ? "border-red-500 bg-red-50/30" : "focus:border-black"
                }`}
            />
            <p className="text-red-500 text-sm mt-1 h-2">{errors.email?.message}</p>
          </div>

          {/* Ô INPUT MẬT KHẨU */}
          <div>
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-gray-700">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
            </div>
            <input
              type="password"
              placeholder="Nhập mật khẩu"
              {...register("password")}
              className={`w-full border p-3 rounded-lg outline-none transition-all ${errors.password ? "border-red-500 bg-red-50/30" : "focus:border-black"
                }`}
            />
            <p className="text-red-500 text-sm mt-1 h-2">{errors.password?.message}</p>
          </div>
          {/*  ĐƯỜNG DẪN QUÊN MẬT KHẨU */}
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>

          {/* NÚT SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold transition-colors mt-2 ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-800"
              }`}
          >
            {loading ? "Đang xử lý..." : "Đăng Nhập"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600 border-t pt-4">
          Chưa có tài khoản?{" "}
          <Link
            href="/register"
            className="font-semibold text-black hover:text-gray-700 hover:underline"
          >
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
