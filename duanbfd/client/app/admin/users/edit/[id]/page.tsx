"use client";

import { api } from "@/lib/api";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";

type EditStaffForm = {
  fullName: string;
  email: string;
  phone: string;
  password?: string;
};

type StaffResponse = {
  id?: string;
  _id?: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  isActive?: boolean;
};

const schema: yup.ObjectSchema<EditStaffForm> = yup.object({
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
    .optional()
    .test("password-length", "Mật khẩu phải có ít nhất 6 ký tự", (value) => {
      if (!value) return true;

      return value.length >= 6;
    }),
});

export default function EditStaffPage() {
  const router = useRouter();
  const params = useParams();

  const staffId = String(params.id || "");

  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditStaffForm>({
    resolver: yupResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const res = await api.get<StaffResponse>(`/users/staff/${staffId}`);

      reset({
        fullName: res.data.fullName || "",
        email: res.data.email || "",
        phone: res.data.phone || "",
        password: "",
      });
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message || "Không tải được thông tin nhân viên"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (staffId) {
      fetchStaff();
    }
  }, [staffId]);

  const onSubmit = async (data: EditStaffForm) => {
    try {
      setSubmitLoading(true);
      setErrorMessage("");

      const payload: Partial<EditStaffForm> = {
        fullName: data.fullName.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
      };

      if (data.password?.trim()) {
        payload.password = data.password.trim();
      }

      await api.patch(`/users/staff/${staffId}`, payload);

      router.push("/admin/users");
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message || "Không cập nhật được nhân viên"
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Chỉnh sửa nhân viên
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Cập nhật thông tin tài khoản nhân viên
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
        {loading ? (
          <div className="py-10 text-center text-sm text-gray-500">
            Đang tải thông tin nhân viên...
          </div>
        ) : (
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
                  Mật khẩu mới
                </label>

                <input
                  type="password"
                  {...register("password")}
                  placeholder="Để trống nếu không đổi mật khẩu"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-900"
                />

                {errors.password && (
                  <p className="mt-2 text-xs text-red-600">
                    {errors.password.message}
                  </p>
                )}

                <p className="mt-2 text-xs text-gray-400">
                  Chỉ nhập nếu bạn muốn thay đổi mật khẩu.
                </p>
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
                disabled={submitLoading}
                className="rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitLoading ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}