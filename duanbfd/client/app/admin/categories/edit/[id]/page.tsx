"use client";

import { api } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { toast } from "sonner";

type Category = {
  id?: string;
  _id?: string;
  name: string;
  description?: string;
  image?: string;
  isActive?: boolean;
};

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [form, setForm] = useState({
    name: "",
    description: "",
    isActive: true,
  });

  const [oldImage, setOldImage] = useState("");
  const [newImage, setNewImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const getErrorMessage = (error: any, defaultMessage: string) => {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      defaultMessage;

    return Array.isArray(message) ? message.join("\n") : message;
  };

  const getImageUrl = (image?: string) => {
    if (!image) return "";

    if (image.startsWith("http")) return image;

    return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}${image}`;
  };

  const fetchCategory = async () => {
    if (!id) return;

    try {
      setFetching(true);

      const res = await api.get(`/categories/${id}`);

      const category: Category = res.data;

      setForm({
        name: category.name || "",
        description: category.description || "",
        isActive: category.isActive ?? true,
      });

      setOldImage(category.image || "");
    } catch (error: any) {
      console.error("FETCH CATEGORY ERROR:", error);

      toast.error(getErrorMessage(error, "Không thể tải thông tin danh mục"));

      router.push("/admin/categories");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchCategory();
  }, [id]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleActiveChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      isActive: e.target.checked,
    });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn đúng file ảnh");
      return;
    }

    setNewImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!id) {
      toast.error("Không tìm thấy ID danh mục");
      return;
    }

    if (!form.name.trim()) {
      toast.error("Vui lòng nhập tên danh mục");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("name", form.name.trim());
      formData.append("description", form.description.trim());

      if (newImage) {
        formData.append("image", newImage);
      }

      await api.patch(`/categories/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Cập nhật danh mục thành công");

      router.push("/admin/categories");
      router.refresh();
    } catch (error: any) {
      console.error("UPDATE CATEGORY ERROR:", error);

      toast.error(getErrorMessage(error, "Cập nhật danh mục thất bại"));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-gray-500">Đang tải thông tin danh mục...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-sm">
      <h1 className="mb-6 text-2xl font-bold">Cập nhật danh mục</h1>

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

          <div className="mt-4">
            {preview ? (
              <>
                <p className="mb-2 text-sm text-gray-500">Ảnh mới:</p>

                <img
                  src={preview}
                  alt="Preview"
                  className="h-40 w-40 rounded-xl border object-cover"
                />
              </>
            ) : oldImage ? (
              <>
                <p className="mb-2 text-sm text-gray-500">Ảnh hiện tại:</p>

                <img
                  src={getImageUrl(oldImage)}
                  alt="Category"
                  className="h-40 w-40 rounded-xl border object-cover"
                />
              </>
            ) : (
              <p className="text-sm text-gray-400">Chưa có ảnh danh mục</p>
            )}
          </div>
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
            {loading ? "Đang cập nhật..." : "Cập nhật danh mục"}
          </button>
        </div>
      </form>
    </div>
  );
}