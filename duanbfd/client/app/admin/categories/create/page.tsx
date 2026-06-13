"use client";

import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { toast } from "sonner";

export default function CreateCategoryPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  const getErrorMessage = (error: any, defaultMessage: string) => {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      defaultMessage;

    return Array.isArray(message) ? message.join("\n") : message;
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn đúng file ảnh");
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Vui lòng nhập tên danh mục");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("name", form.name.trim());
      formData.append("description", form.description.trim());

      if (image) {
        formData.append("image", image);
      }

      await api.post("/categories", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Tạo danh mục thành công");

      router.push("/admin/categories");
      router.refresh();
    } catch (error: any) {
      console.error("CREATE CATEGORY ERROR:", error);

      toast.error(getErrorMessage(error, "Tạo danh mục thất bại"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-sm">
      <h1 className="mb-6 text-2xl font-bold">Thêm danh mục</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* NAME */}
        <div>
          <label className="mb-2 block font-medium">
            Tên danh mục <span className="text-red-500">*</span>
          </label>

          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Ví dụ: Áo"
            className="w-full rounded-xl border p-3 outline-none"
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="mb-2 block font-medium">Mô tả</label>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            placeholder="Nhập mô tả danh mục..."
            className="w-full rounded-xl border p-3 outline-none"
          />
        </div>

        {/* IMAGE */}
        <div>
          <label className="mb-2 block font-medium">Ảnh danh mục</label>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full rounded-xl border p-3 outline-none"
          />

          {preview && (
            <div className="mt-4">
              <p className="mb-2 text-sm text-gray-500">Xem trước ảnh:</p>

              <img
                src={preview}
                alt="Preview"
                className="h-40 w-40 rounded-xl border object-cover"
              />
            </div>
          )}
        </div>

        {/* BUTTONS */}
        <div className="flex gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => router.push("/admin/categories")}
            className="w-1/2 rounded-xl border py-3 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Hủy
          </button>

          <button
            type="submit"
            disabled={loading}
            className="w-1/2 rounded-xl bg-black py-3 text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Đang tạo..." : "Tạo danh mục"}
          </button>
        </div>
      </form>
    </div>
  );
}