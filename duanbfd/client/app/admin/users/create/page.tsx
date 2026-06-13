"use client";

import { api } from "@/lib/api";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";

type CreateStaffForm = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
};

const schema: yup.ObjectSchema<CreateStaffForm> = yup.object({
  fullName: yup
    .string()
    .trim()
    .required("Vui lòng nhập họ và tên")
    .min(2, "Họ tên phải có ít nhất 2 ký tự"),

  email: yup
    .string()
    .trim()
    .required("Vui lòng nhập email")
    .email("Email không hợp lệ"),

  phone: yup
    .string()
    .trim()
    .required("Vui lòng nhập số điện thoại")
    .matches(/^[0-9]{9,11}$/, "Số điện thoại phải từ 9 đến 11 chữ số"),

  password: yup
    .string()
    .required("Vui lòng nhập mật khẩu")
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
});

export default function CreateStaffPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateStaffForm>({
    resolver: yupResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  const onSubmit = async (data: CreateStaffForm) => {
    try {
      setLoading(true);
      setErrorMessage("");

      await api.post("/users/staff", {
        fullName: data.fullName.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        password: data.password,
      });

      router.push("/admin/users");
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message || "Không thêm được nhân viên"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Thêm nhân viên
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Tạo tài khoản nhân viên mới trong hệ thống
          </p>
        </div>

        <Link
          href="/admin/users"
          className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Quay lại
        </Link>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {errorMessage}
        </div>
      )}

      {/* Form */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Full name */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Họ và tên
              </label>

              <input
                {...register("fullName")}
                placeholder="Nhập họ và tên"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-900"
              />

              {errors.fullName && (
                <p className="mt-2 text-xs text-red-600">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Email
              </label>

              <input
                type="email"
                {...register("email")}
                placeholder="Nhập email"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-900"
              />

              {errors.email && (
                <p className="mt-2 text-xs text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Số điện thoại
              </label>

              <input
                {...register("phone")}
                placeholder="Nhập số điện thoại"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-900"
              />

              {errors.phone && (
                <p className="mt-2 text-xs text-red-600">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Mật khẩu
              </label>

              <input
                type="password"
                {...register("password")}
                placeholder="Nhập mật khẩu"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-900"
              />

              {errors.password && (
                <p className="mt-2 text-xs text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t pt-5">
            <Link
              href="/admin/users"
              className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Đang thêm..." : "Thêm nhân viên"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}