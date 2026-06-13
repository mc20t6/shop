"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { api } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const schema = yup.object({
  name: yup.string().required("Bắt buộc nhập Họ và tên"),
  phone: yup
    .string()
    .matches(/^[0-9]+$/, "Số điện thoại chỉ được chứa các chữ số")
    .min(10, "Số điện thoại tối thiểu phải có 10 số")
    .required("Bắt buộc nhập Số điện thoại"),
  email: yup.string().email("Email không hợp lệ").required("Bắt buộc nhập Email"),
  password: yup
    .string()
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    .required("Bắt buộc nhập Mật khẩu"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Mật khẩu xác nhận không trùng khớp")
    .required("Bắt buộc xác nhận lại Mật khẩu"),
});

type FormData = yup.InferType<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      console.log("FORM DATA:", data);

      const payload = {
        fullName: data.name,
        phone: data.phone,
        email: data.email,
        password: data.password,
      };

      console.log("PAYLOAD SEND:", payload);

      const res = await api.post("/auth/register", payload);

      toast.success("Đăng ký tài khoản thành công!", {
        description: res.data?.message || "Bạn sẽ được chuyển sang trang đăng nhập.",
      });

      console.log("Phản hồi từ Backend:", res.data);

      reset();

      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch (err: any) {
      toast.error("Đăng ký thất bại!", {
        description:
          err.response?.data?.message ||
          err.message ||
          "Vui lòng kiểm tra lại thông tin và thử lại.",
      });

      console.error("Lỗi API đăng ký chi tiết:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-10">
      <div className="w-[400px] bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">Đăng ký</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          {/* HỌ VÀ TÊN */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              placeholder="Nhập họ và tên"
              {...register("name")}
              className={`w-full border p-3 rounded-lg outline-none transition-all ${
                errors.name ? "border-red-500 bg-red-50/30" : "focus:border-black"
              }`}
            />
            <p className="text-red-500 text-sm mt-1 h-4">{errors.name?.message}</p>
          </div>

          {/* SỐ ĐIỆN THOẠI */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Số điện thoại <span className="text-red-500">*</span>
            </label>
            <input
              placeholder="Nhập số điện thoại"
              {...register("phone")}
              className={`w-full border p-3 rounded-lg outline-none transition-all ${
                errors.phone ? "border-red-500 bg-red-50/30" : "focus:border-black"
              }`}
            />
            <p className="text-red-500 text-sm mt-1 h-4">{errors.phone?.message}</p>
          </div>

          {/* EMAIL */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="Nhập email"
              {...register("email")}
              className={`w-full border p-3 rounded-lg outline-none transition-all ${
                errors.email ? "border-red-500 bg-red-50/30" : "focus:border-black"
              }`}
            />
            <p className="text-red-500 text-sm mt-1 h-4">{errors.email?.message}</p>
          </div>

          {/* MẬT KHẨU */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Mật khẩu <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              placeholder="Tạo mật khẩu (tối thiểu 8 ký tự)"
              {...register("password")}
              className={`w-full border p-3 rounded-lg outline-none transition-all ${
                errors.password ? "border-red-500 bg-red-50/30" : "focus:border-black"
              }`}
            />
            <p className="text-red-500 text-sm mt-1 h-4">{errors.password?.message}</p>
          </div>

          {/* XÁC NHẬN MẬT KHẨU */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Xác nhận mật khẩu <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              placeholder="Nhập lại mật khẩu"
              {...register("confirmPassword")}
              className={`w-full border p-3 rounded-lg outline-none transition-all ${
                errors.confirmPassword ? "border-red-500 bg-red-50/30" : "focus:border-black"
              }`}
            />
            <p className="text-red-500 text-sm mt-1 h-4">
              {errors.confirmPassword?.message}
            </p>
          </div>

          {/* NÚT ĐĂNG KÝ */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 rounded-lg text-white font-semibold transition-colors mt-4 ${
              isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-800"
            }`}
          >
            {isSubmitting ? "Đang xử lý..." : "Đăng Ký"}
          </button>
        </form>

        {/* 🔥 ĐƯỜNG DẪN QUAY LẠI TRANG ĐĂNG NHẬP */}
        <div className="mt-6 text-center text-sm text-gray-600 border-t pt-4">
          Đã có tài khoản?{" "}
          <Link
            href="/login"
            className="font-semibold text-black hover:text-gray-700 hover:underline"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
}