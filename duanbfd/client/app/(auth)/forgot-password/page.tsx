"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

// 📜 SCHEMA BƯỚC 1: NHẬP EMAIL
const step1Schema = yup.object({
  email: yup.string().email("Email không hợp lệ").required("Bắt buộc nhập Email"),
});

type Step1Inputs = yup.InferType<typeof step1Schema>;

// 📜 SCHEMA BƯỚC 2: NHẬP OTP & ĐỔI MẬT KHẨU
const step2Schema = yup.object({
  otp: yup.string().length(6, "Mã OTP phải gồm đúng 6 chữ số").required("Bắt buộc nhập mã OTP"),
  password: yup
    .string()
    .min(8, "Mật khẩu mới ít nhất phải có 8 ký tự")
    .required("Bắt buộc nhập Mật khẩu mới"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Mật khẩu xác nhận không trùng khớp")
    .required("Bắt buộc xác nhận mật khẩu mới"),
});

type Step2Inputs = yup.InferType<typeof step2Schema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [savedEmail, setSavedEmail] = useState("");

  // Khởi tạo Form Bước 1
  const formStep1 = useForm<Step1Inputs>({
    resolver: yupResolver(step1Schema),
  });

  // Khởi tạo Form Bước 2
  const formStep2 = useForm<Step2Inputs>({
    resolver: yupResolver(step2Schema),
  });

  // 🔥 XỬ LÝ BƯỚC 1: GỬI EMAIL ĐỂ LẤY OTP
  const onStep1Submit = async (data: Step1Inputs) => {
    try {
      setLoading(true);

      const res = await api.post("/auth/forgot-password", {
        email: data.email,
      });

      toast.success("Gửi mã OTP thành công!", {
        description: res.data?.message || `Mã OTP đã được gửi tới ${data.email}`,
      });

      setSavedEmail(data.email);
      setStep(2);
    } catch (err: any) {
      toast.error("Gửi yêu cầu thất bại!", {
        description:
          err.response?.data?.message ||
          err.message ||
          "Không thể gửi mã OTP. Vui lòng thử lại.",
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔥 XỬ LÝ BƯỚC 2: XÁC THỰC OTP VÀ ĐẶT LẠI MẬT KHẨU
  const onStep2Submit = async (data: Step2Inputs) => {
    try {
      setLoading(true);

      // Khớp chính xác DTO cấu trúc Backend yêu cầu
      const payload = {
        otp: data.otp,
        newPassword: data.password,
        confirmPassword: data.confirmPassword,
      };

      const res = await api.post("/auth/reset-password", payload);

      toast.success("Đặt lại mật khẩu thành công!", {
        description: res.data?.message || "Bạn sẽ được chuyển về trang đăng nhập.",
      });

      // Cho toast hiện một chút rồi mới chuyển trang
      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch (err: any) {
      toast.error("Đặt lại mật khẩu thất bại!", {
        description:
          err.response?.data?.message ||
          err.message ||
          "Mã OTP không chính xác hoặc đã hết hạn.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-[400px] bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-2 text-center">Khôi phục mật khẩu</h1>

        <p className="text-gray-500 text-sm text-center mb-6">
          {step === 1
            ? "Nhập email hệ thống để nhận mã OTP xác thực"
            : `Nhập mã OTP vừa gửi tới: ${savedEmail}`}
        </p>

        {/* ----------------- GIAO DIỆN BƯỚC 1 ----------------- */}
        {step === 1 && (
          <form onSubmit={formStep1.handleSubmit(onStep1Submit)} className="space-y-2">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Email khôi phục <span className="text-red-500">*</span>
              </label>

              <input
                type="email"
                placeholder="Nhập email của bạn"
                {...formStep1.register("email")}
                className={`w-full border p-3 rounded-lg outline-none transition-all ${
                  formStep1.formState.errors.email
                    ? "border-red-500 bg-red-50/30"
                    : "focus:border-black"
                }`}
              />

              <p className="text-red-500 text-sm mt-1 h-4">
                {formStep1.formState.errors.email?.message}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg text-white font-semibold transition-colors mt-2 ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-800"
              }`}
            >
              {loading ? "Đang gửi mã..." : "Gửi mã xác thực (OTP)"}
            </button>
          </form>
        )}

        {/* ----------------- GIAO DIỆN BƯỚC 2 ----------------- */}
        {step === 2 && (
          <form onSubmit={formStep2.handleSubmit(onStep2Submit)} className="space-y-2">
            {/* Ô NHẬP MÃ OTP */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Mã xác thực OTP <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                maxLength={6}
                placeholder="Nhập 6 số OTP"
                {...formStep2.register("otp")}
                className={`w-full border p-3 rounded-lg outline-none tracking-[0.25em] text-center font-bold text-lg transition-all ${
                  formStep2.formState.errors.otp
                    ? "border-red-500 bg-red-50/30"
                    : "focus:border-black"
                }`}
              />

              <p className="text-red-500 text-sm mt-1 h-4">
                {formStep2.formState.errors.otp?.message}
              </p>
            </div>

            {/* Ô NHẬP MẬT KHẨU MỚI */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Mật khẩu mới <span className="text-red-500">*</span>
              </label>

              <input
                type="password"
                placeholder="Tạo mật khẩu mới"
                {...formStep2.register("password")}
                className={`w-full border p-3 rounded-lg outline-none transition-all ${
                  formStep2.formState.errors.password
                    ? "border-red-500 bg-red-50/30"
                    : "focus:border-black"
                }`}
              />

              <p className="text-red-500 text-sm mt-1 h-4">
                {formStep2.formState.errors.password?.message}
              </p>
            </div>

            {/* Ô XÁC NHẬN MẬT KHẨU MỚI */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Xác nhận mật khẩu mới <span className="text-red-500">*</span>
              </label>

              <input
                type="password"
                placeholder="Nhập lại mật khẩu mới"
                {...formStep2.register("confirmPassword")}
                className={`w-full border p-3 rounded-lg outline-none transition-all ${
                  formStep2.formState.errors.confirmPassword
                    ? "border-red-500 bg-red-50/30"
                    : "focus:border-black"
                }`}
              />

              <p className="text-red-500 text-sm mt-1 h-4">
                {formStep2.formState.errors.confirmPassword?.message}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg text-white font-semibold transition-colors mt-4 ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-800"
              }`}
            >
              {loading ? "Đang xử lý..." : "Xác nhận đổi mật khẩu"}
            </button>

            {/* Nút quay lại bước 1 nếu nhập sai Email */}
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-center text-sm text-gray-500 hover:text-black hover:underline pt-2 block"
            >
              ← Thay đổi email khác
            </button>
          </form>
        )}

        {/* 📋 ĐƯỜNG DẪN QUAY VỀ ĐĂNG NHẬP Ở DƯỚI CÙNG */}
        <div className="mt-6 text-center text-sm text-gray-600 border-t pt-4">
          Quay lại trang{" "}
          <Link href="/login" className="font-semibold text-black hover:text-gray-700 hover:underline">
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}