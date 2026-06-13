"use client";

import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { toast } from "sonner";

type VoucherType = "PERCENT" | "FIXED";

export default function CreateVoucherPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    code: "",
    type: "PERCENT" as VoucherType,
    value: "",
    minOrderValue: "",
    maxDiscount: "",
    usageLimit: "",
    startDate: "",
    endDate: "",
    isActive: true,
  });

  const [loading, setLoading] = useState(false);

  const getErrorMessage = (error: any, defaultMessage: string) => {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      defaultMessage;

    return Array.isArray(message) ? message.join("\n") : message;
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;

      setForm({
        ...form,
        [name]: checked,
      });

      return;
    }

    setForm({
      ...form,
      [name]: value,
    });
  };

  const validateForm = () => {
    if (!form.code.trim()) {
      toast.error("Vui lòng nhập mã voucher");
      return false;
    }

    if (!form.value || Number(form.value) <= 0) {
      toast.error("Vui lòng nhập giá trị giảm hợp lệ");
      return false;
    }

    if (form.type === "PERCENT" && Number(form.value) > 100) {
      toast.error("Voucher phần trăm không được lớn hơn 100%");
      return false;
    }

    if (!form.minOrderValue || Number(form.minOrderValue) < 0) {
      toast.error("Vui lòng nhập giá trị đơn tối thiểu");
      return false;
    }

    if (form.type === "PERCENT") {
      if (!form.maxDiscount || Number(form.maxDiscount) <= 0) {
        toast.error("Vui lòng nhập số tiền giảm tối đa");
        return false;
      }
    }

    if (!form.usageLimit || Number(form.usageLimit) <= 0) {
      toast.error("Vui lòng nhập giới hạn lượt dùng");
      return false;
    }

    if (!form.startDate) {
      toast.error("Vui lòng chọn ngày bắt đầu");
      return false;
    }

    if (!form.endDate) {
      toast.error("Vui lòng chọn ngày kết thúc");
      return false;
    }

    if (new Date(form.endDate) < new Date(form.startDate)) {
      toast.error("Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu");
      return false;
    }

    return true;
  };

  const toStartISOString = (date: string) => {
    return new Date(`${date}T00:00:00`).toISOString();
  };

  const toEndISOString = (date: string) => {
    return new Date(`${date}T23:59:59`).toISOString();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      await api.post("/vouchers", {
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: Number(form.value),
        minOrderValue: Number(form.minOrderValue),
        maxDiscount:
          form.type === "PERCENT" ? Number(form.maxDiscount) : 0,
        usageLimit: Number(form.usageLimit),
        startDate: toStartISOString(form.startDate),
        endDate: toEndISOString(form.endDate),
        isActive: form.isActive,
      });

      toast.success("Tạo voucher thành công");

      router.push("/admin/vouchers");
      router.refresh();
    } catch (error: any) {
      console.error("CREATE VOUCHER ERROR:", error);
      toast.error(getErrorMessage(error, "Tạo voucher thất bại"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm">
      <h1 className="mb-6 text-2xl font-bold">Thêm voucher</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block font-medium">
            Mã voucher <span className="text-red-500">*</span>
          </label>

          <input
            name="code"
            value={form.code}
            onChange={handleChange}
            placeholder="Ví dụ: SALE20"
            className="w-full rounded-xl border p-3 uppercase outline-none"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block font-medium">
              Loại giảm giá <span className="text-red-500">*</span>
            </label>

            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full rounded-xl border p-3 outline-none"
            >
              <option value="PERCENT">Giảm theo phần trăm</option>
              <option value="FIXED">Giảm số tiền cố định</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Giá trị giảm <span className="text-red-500">*</span>
            </label>

            <input
              name="value"
              type="number"
              min={0}
              value={form.value}
              onChange={handleChange}
              placeholder={form.type === "PERCENT" ? "Ví dụ: 20" : "Ví dụ: 50000"}
              className="w-full rounded-xl border p-3 outline-none"
            />

            <p className="mt-1 text-sm text-gray-400">
              {form.type === "PERCENT"
                ? "Nhập phần trăm giảm, ví dụ 20 = giảm 20%"
                : "Nhập số tiền giảm cố định"}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block font-medium">
              Đơn tối thiểu <span className="text-red-500">*</span>
            </label>

            <input
              name="minOrderValue"
              type="number"
              min={0}
              value={form.minOrderValue}
              onChange={handleChange}
              placeholder="Ví dụ: 200000"
              className="w-full rounded-xl border p-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Giảm tối đa
              {form.type === "PERCENT" && (
                <span className="text-red-500"> *</span>
              )}
            </label>

            <input
              name="maxDiscount"
              type="number"
              min={0}
              value={form.maxDiscount}
              onChange={handleChange}
              disabled={form.type === "FIXED"}
              placeholder="Ví dụ: 100000"
              className="w-full rounded-xl border p-3 outline-none disabled:bg-gray-100"
            />

            {form.type === "FIXED" && (
              <p className="mt-1 text-sm text-gray-400">
                Voucher cố định không cần nhập giảm tối đa.
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Giới hạn lượt dùng <span className="text-red-500">*</span>
          </label>

          <input
            name="usageLimit"
            type="number"
            min={1}
            value={form.usageLimit}
            onChange={handleChange}
            placeholder="Ví dụ: 100"
            className="w-full rounded-xl border p-3 outline-none"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block font-medium">
              Ngày bắt đầu <span className="text-red-500">*</span>
            </label>

            <input
              name="startDate"
              type="date"
              value={form.startDate}
              onChange={handleChange}
              className="w-full rounded-xl border p-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Ngày kết thúc <span className="text-red-500">*</span>
            </label>

            <input
              name="endDate"
              type="date"
              value={form.endDate}
              onChange={handleChange}
              className="w-full rounded-xl border p-3 outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            id="isActive"
            name="isActive"
            type="checkbox"
            checked={form.isActive}
            onChange={handleChange}
            className="h-4 w-4"
          />

          <label htmlFor="isActive" className="font-medium">
            Đang hoạt động
          </label>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => router.push("/admin/vouchers")}
            className="w-1/2 rounded-xl border py-3 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Hủy
          </button>

          <button
            type="submit"
            disabled={loading}
            className="w-1/2 rounded-xl bg-black py-3 text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Đang tạo..." : "Tạo voucher"}
          </button>
        </div>
      </form>
    </div>
  );
}