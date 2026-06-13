"use client";

import { API_URL, api } from "@/lib/api";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type Category = {
  id?: string;
  _id?: string;
  name: string;
};

export type ProductData = {
  id?: string;
  _id?: string;
  categoryId?: string | null;
  name: string;
  slug: string;
  description?: string;
  material?: string;
  careGuide?: string;
  images?: string[];
  isActive?: boolean;
};

export type VariantData = {
  id?: string;
  _id?: string;
  sku: string;
  size: string;
  color: string;
  price: number;
  stock: number;
  image?: string;
  isActive?: boolean;
};

type ProductVariantFormProps = {
  mode: "create" | "edit";
  productId?: string;
  initialProduct?: ProductData | null;
  initialVariants?: VariantData[];
  loading?: boolean;
  onDone: () => void;
};

type ProductFormState = {
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  material: string;
  careGuide: string;
  isActive: boolean;
};

type VariantFormState = {
  id?: string;
  sku: string;
  size: string;
  color: string;
  price: string;
  stock: string;
  image?: string;
  imageFile?: File | null;
  isActive: boolean;
};

const emptyVariant = (): VariantFormState => ({
  sku: "",
  size: "",
  color: "",
  price: "",
  stock: "",
  imageFile: null,
  isActive: true,
});

const getId = (item: { id?: string; _id?: string }) => {
  return item.id || item._id || "";
};

const createSlug = (value: string) => {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const getImageUrl = (image?: string) => {
  if (!image) return "";

  if (
    image.startsWith("http") ||
    image.startsWith("blob:") ||
    image.startsWith("data:")
  ) {
    return image;
  }

  return `${API_URL}${image.startsWith("/") ? image : `/${image}`}`;
};

export default function ProductVariantForm({
  mode,
  productId,
  initialProduct,
  initialVariants = [],
  loading,
  onDone,
}: ProductVariantFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  const [productForm, setProductForm] = useState<ProductFormState>({
    categoryId: "",
    name: "",
    slug: "",
    description: "",
    material: "",
    careGuide: "",
    isActive: true,
  });

  const [productImageFiles, setProductImageFiles] = useState<File[]>([]);
  const [oldProductImages, setOldProductImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<VariantFormState[]>([emptyVariant()]);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (initialProduct) {
      setProductForm({
        categoryId: initialProduct.categoryId || "",
        name: initialProduct.name || "",
        slug: initialProduct.slug || "",
        description: initialProduct.description || "",
        material: initialProduct.material || "",
        careGuide: initialProduct.careGuide || "",
        isActive: initialProduct.isActive ?? true,
      });

      setOldProductImages(initialProduct.images || []);
    }
  }, [initialProduct]);

  useEffect(() => {
    if (initialVariants.length > 0) {
      setVariants(
        initialVariants.map((variant) => ({
          id: getId(variant),
          sku: variant.sku || "",
          size: variant.size || "",
          color: variant.color || "",
          price: String(variant.price || ""),
          stock: String(variant.stock || ""),
          image: variant.image || "",
          imageFile: null,
          isActive: variant.isActive ?? true,
        }))
      );
    }
  }, [initialVariants]);

  const productImagePreviews = useMemo(() => {
    return productImageFiles.map((file) => URL.createObjectURL(file));
  }, [productImageFiles]);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");

      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];

      setCategories(data);
    } catch {
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleProductChange = (
    field: keyof ProductFormState,
    value: string | boolean
  ) => {
    setProductForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNameChange = (value: string) => {
    setProductForm((prev) => ({
      ...prev,
      name: value,
      slug: prev.slug ? prev.slug : createSlug(value),
    }));
  };

  const handleVariantChange = (
    index: number,
    field: keyof VariantFormState,
    value: string | boolean | File | null
  ) => {
    setVariants((prev) =>
      prev.map((variant, idx) =>
        idx === index
          ? {
              ...variant,
              [field]: value,
            }
          : variant
      )
    );
  };

  const addVariant = () => {
    setVariants((prev) => [...prev, emptyVariant()]);
  };

  const removeVariant = async (index: number) => {
    const variant = variants[index];

    if (variant.id && productId) {
      const ok = window.confirm("Bạn có chắc muốn xóa biến thể này không?");

      if (!ok) return;

      try {
        await api.delete(`/products/${productId}/variants/${variant.id}`);
        toast.success("Xóa biến thể thành công");

        setVariants((prev) => prev.filter((_, idx) => idx !== index));
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Không xóa được biến thể");
      }

      return;
    }

    setVariants((prev) => prev.filter((_, idx) => idx !== index));
  };

  const buildProductFormData = () => {
    const formData = new FormData();

    formData.append("name", productForm.name.trim());
    formData.append("slug", productForm.slug.trim());
    formData.append("description", productForm.description.trim());
    formData.append("material", productForm.material.trim());
    formData.append("careGuide", productForm.careGuide.trim());

    if (productForm.categoryId) {
      formData.append("categoryId", productForm.categoryId);
    }

    productImageFiles.forEach((file) => {
      formData.append("images", file);
    });

    if (mode === "edit") {
      oldProductImages.forEach((image) => {
        formData.append("oldImages", image);
      });
    }

    return formData;
  };

  const buildVariantFormData = (variant: VariantFormState) => {
    const formData = new FormData();

    formData.append("sku", variant.sku.trim());
    formData.append("size", variant.size.trim());
    formData.append("color", variant.color.trim());
    formData.append("price", String(Number(variant.price) || 0));
    formData.append("stock", String(Number(variant.stock) || 0));

    if (variant.imageFile) {
      formData.append("image", variant.imageFile);
    }

    return formData;
  };

  const validate = () => {
    if (!productForm.name.trim()) {
      toast.error("Vui lòng nhập tên sản phẩm");
      return false;
    }

    if (!productForm.slug.trim()) {
      toast.error("Vui lòng nhập slug sản phẩm");
      return false;
    }

    if (variants.length === 0) {
      toast.error("Vui lòng thêm ít nhất một biến thể");
      return false;
    }

    for (const variant of variants) {
      if (!variant.sku.trim()) {
        toast.error("Vui lòng nhập SKU cho biến thể");
        return false;
      }

      if (!variant.size.trim()) {
        toast.error("Vui lòng nhập size cho biến thể");
        return false;
      }

      if (!variant.color.trim()) {
        toast.error("Vui lòng nhập màu cho biến thể");
        return false;
      }

      if (!variant.price || Number(variant.price) <= 0) {
        toast.error("Giá biến thể phải lớn hơn 0");
        return false;
      }

      if (!variant.stock || Number(variant.stock) < 0) {
        toast.error("Tồn kho không hợp lệ");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setSubmitLoading(true);

      let savedProductId = productId;

      if (mode === "create") {
        const res = await api.post("/products", buildProductFormData(), {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        savedProductId = res.data?.id || res.data?._id || res.data?.data?.id || res.data?.data?._id;

        if (!savedProductId) {
          throw new Error("Backend chưa trả về id sản phẩm");
        }

        for (const variant of variants) {
          await api.post(
            `/products/${savedProductId}/variants`,
            buildVariantFormData(variant),
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
        }

        toast.success("Thêm sản phẩm thành công");
      } else {
        if (!savedProductId) {
          throw new Error("Thiếu productId");
        }

        await api.patch(`/products/${savedProductId}`, buildProductFormData(), {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        for (const variant of variants) {
          if (variant.id) {
            await api.patch(
              `/products/${savedProductId}/variants/${variant.id}`,
              buildVariantFormData(variant),
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              }
            );
          } else {
            await api.post(
              `/products/${savedProductId}/variants`,
              buildVariantFormData(variant),
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              }
            );
          }
        }

        toast.success("Cập nhật sản phẩm thành công");
      }

      onDone();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Không lưu được sản phẩm"
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-sm text-gray-500 shadow-sm">
        Đang tải dữ liệu sản phẩm...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Product info */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-bold text-gray-900">
          Thông tin sản phẩm
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Tên sản phẩm
            </label>

            <input
              value={productForm.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Nhập tên sản phẩm"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Slug
            </label>

            <input
              value={productForm.slug}
              onChange={(e) =>
                handleProductChange("slug", createSlug(e.target.value))
              }
              placeholder="slug-san-pham"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Danh mục
            </label>

            <select
              value={productForm.categoryId}
              onChange={(e) => handleProductChange("categoryId", e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-gray-900"
            >
              <option value="">Không chọn danh mục</option>

              {categories.map((category) => {
                const categoryId = getId(category);

                return (
                  <option key={categoryId} value={categoryId}>
                    {category.name}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Chất liệu
            </label>

            <input
              value={productForm.material}
              onChange={(e) => handleProductChange("material", e.target.value)}
              placeholder="Ví dụ: Cotton"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Mô tả
            </label>

            <textarea
              value={productForm.description}
              onChange={(e) =>
                handleProductChange("description", e.target.value)
              }
              rows={4}
              placeholder="Nhập mô tả sản phẩm"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Hướng dẫn bảo quản
            </label>

            <textarea
              value={productForm.careGuide}
              onChange={(e) => handleProductChange("careGuide", e.target.value)}
              rows={3}
              placeholder="Ví dụ: Giặt nhẹ, không dùng chất tẩy mạnh"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Ảnh sản phẩm
            </label>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) =>
                setProductImageFiles(Array.from(e.target.files || []))
              }
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-900"
            />

            <div className="mt-4 flex flex-wrap gap-3">
              {oldProductImages.map((image) => (
                <div
                  key={image}
                  className="h-20 w-20 overflow-hidden rounded-xl border bg-gray-100"
                >
                  <img
                    src={getImageUrl(image)}
                    alt="Ảnh sản phẩm"
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}

              {productImagePreviews.map((preview) => (
                <div
                  key={preview}
                  className="h-20 w-20 overflow-hidden rounded-xl border bg-gray-100"
                >
                  <img
                    src={preview}
                    alt="Ảnh mới"
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>

            {mode === "edit" && (
              <p className="mt-2 text-xs text-gray-400">
                Nếu chọn ảnh mới, backend có thể thêm ảnh mới vào danh sách ảnh sản phẩm.
              </p>
            )}
          </div>

        </div>
      </div>

      {/* Variants */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Biến thể sản phẩm</h2>

          <button
            type="button"
            onClick={addVariant}
            className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white"
          >
            + Thêm biến thể
          </button>
        </div>

        <div className="space-y-4">
          {variants.map((variant, index) => {
            const preview = variant.imageFile
              ? URL.createObjectURL(variant.imageFile)
              : getImageUrl(variant.image);

            return (
              <div
                key={variant.id || index}
                className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">
                    Biến thể #{index + 1}
                  </h3>

                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="rounded-lg bg-red-100 px-3 py-2 text-xs font-semibold text-red-700"
                  >
                    Xóa
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      SKU
                    </label>

                    <input
                      value={variant.sku}
                      onChange={(e) =>
                        handleVariantChange(index, "sku", e.target.value)
                      }
                      placeholder="VD: AO-M-TRANG"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-900"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Size
                    </label>

                    <input
                      value={variant.size}
                      onChange={(e) =>
                        handleVariantChange(index, "size", e.target.value)
                      }
                      placeholder="VD: M"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-900"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Màu sắc
                    </label>

                    <input
                      value={variant.color}
                      onChange={(e) =>
                        handleVariantChange(index, "color", e.target.value)
                      }
                      placeholder="VD: Trắng"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-900"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Giá
                    </label>

                    <input
                      type="number"
                      value={variant.price}
                      onChange={(e) =>
                        handleVariantChange(index, "price", e.target.value)
                      }
                      placeholder="199000"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-900"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Tồn kho
                    </label>

                    <input
                      type="number"
                      value={variant.stock}
                      onChange={(e) =>
                        handleVariantChange(index, "stock", e.target.value)
                      }
                      placeholder="100"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-900"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Ảnh biến thể
                    </label>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleVariantChange(
                          index,
                          "imageFile",
                          e.target.files?.[0] || null
                        )
                      }
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-900"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Xem trước
                    </label>

                    <div className="h-20 w-20 overflow-hidden rounded-xl border bg-white">
                      {preview ? (
                        <img
                          src={preview}
                          alt="Ảnh biến thể"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                          No img
                        </div>
                      )}
                    </div>
                  </div>
                  
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Link
          href="/admin/products"
          className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Hủy
        </Link>

        <button
          type="submit"
          disabled={submitLoading}
          className="rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitLoading
            ? "Đang lưu..."
            : mode === "create"
              ? "Thêm sản phẩm"
              : "Lưu thay đổi"}
        </button>
      </div>
    </form>
  );
}