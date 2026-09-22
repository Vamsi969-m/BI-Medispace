import { useCallback, useEffect, useState } from "react";
import { useApp } from "@/store/AppContext";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Check,
  X,
  Package,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

interface Product {
  _id: string;
  name: string;
  shortDescription: string;
  description: string;
  image: string;
  manufacturedIn: string;
  purpose: string;
  uses: string[];
  category: string;
  price: number;
  rating: number;
  isActive: boolean;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string;
  createdBy?: {
    _id: string;
    fullName: string;
    role: string;
  };
}

interface ProductForm {
  name: string;
  shortDescription: string;
  description: string;
  image: string;
  manufacturedIn: string;
  purpose: string;
  uses: string;
  category: string;
  price: string;
  rating: string;
}

const emptyForm: ProductForm = {
  name: "",
  shortDescription: "",
  description: "",
  image: "",
  manufacturedIn: "",
  purpose: "",
  uses: "",
  category: "",
  price: "",
  rating: "0",
};

export function ProductManagement() {
  const { token, role, showToast } = useApp();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [form, setForm] = useState<ProductForm>(emptyForm);

  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const isAdmin = role === "admin";
  const isRep = role === "rep";

  // --------------------------------
  // FETCH PRODUCTS
  // --------------------------------

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);

      const endpoint = isAdmin
        ? `${API_URL}/products/all`
        : `${API_URL}/products/my`;

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch products"
        );
      }

      setProducts(data.products || []);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch products";

      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  }, [isAdmin, showToast, token]);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  // --------------------------------
  // FORM HANDLING
  // --------------------------------

  const updateForm = (
    field: keyof ProductForm,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const openAddForm = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (product: Product) => {
    setEditingProduct(product);

    setForm({
      name: product.name || "",
      shortDescription: product.shortDescription || "",
      description: product.description || "",
      image: product.image || "",
      manufacturedIn: product.manufacturedIn || "",
      purpose: product.purpose || "",
      uses: (product.uses || []).join(", "),
      category: product.category || "",
      price: String(product.price ?? ""),
      rating: String(product.rating ?? "0"),
    });

    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingProduct(null);
    setForm(emptyForm);
  };

  // --------------------------------
  // ADD / UPDATE PRODUCT
  // --------------------------------

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!form.name.trim()) {
      showToast("Product name is required", "error");
      return;
    }

    if (!form.description.trim()) {
      showToast("Product description is required", "error");
      return;
    }

    if (!form.purpose.trim()) {
      showToast("Product purpose is required", "error");
      return;
    }

    if (!form.category.trim()) {
      showToast("Product category is required", "error");
      return;
    }

    const price = Number(form.price);
    const rating = Number(form.rating);

    if (Number.isNaN(price) || price < 0) {
      showToast("Enter a valid price", "error");
      return;
    }

    if (
      Number.isNaN(rating) ||
      rating < 0 ||
      rating > 5
    ) {
      showToast("Rating must be between 0 and 5", "error");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        shortDescription: form.shortDescription.trim(),
        description: form.description.trim(),
        image: form.image.trim(),
        manufacturedIn: form.manufacturedIn.trim(),
        purpose: form.purpose.trim(),
        uses: form.uses
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        category: form.category.trim(),
        price,
        rating,
      };

      const url = editingProduct
        ? `${API_URL}/products/${editingProduct._id}`
        : `${API_URL}/products`;

      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to save product"
        );
      }

      showToast(
        editingProduct
          ? "Product updated successfully"
          : isRep
          ? "Product added and sent for admin approval"
          : "Product added successfully",
        "success"
      );

      closeForm();
      await fetchProducts();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to save product";

      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------
  // APPROVE PRODUCT
  // --------------------------------

  const handleApprove = async (productId: string) => {
    try {
      setActionLoading(productId);

      const response = await fetch(
        `${API_URL}/products/${productId}/approve`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to approve product"
        );
      }

      showToast(
        "Product approved successfully",
        "success"
      );

      await fetchProducts();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to approve product";

      showToast(message, "error");
    } finally {
      setActionLoading(null);
    }
  };

  // --------------------------------
  // REJECT PRODUCT
  // --------------------------------

  const handleReject = async (productId: string) => {
    const reason = window.prompt(
      "Enter rejection reason:"
    );

    if (reason === null) return;

    if (!reason.trim()) {
      showToast(
        "Rejection reason is required",
        "error"
      );
      return;
    }

    try {
      setActionLoading(productId);

      const response = await fetch(
        `${API_URL}/products/${productId}/reject`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rejectionReason: reason.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to reject product"
        );
      }

      showToast(
        "Product rejected successfully",
        "success"
      );

      await fetchProducts();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to reject product";

      showToast(message, "error");
    } finally {
      setActionLoading(null);
    }
  };

  // --------------------------------
  // DELETE PRODUCT PERMANENTLY
  // --------------------------------

  const handleDelete = async (product: Product) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?\n\n` +
        `This permanently removes the product from the database and cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setActionLoading(product._id);

      const response = await fetch(
        `${API_URL}/products/${product._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete product"
        );
      }

      showToast(
        "Product deleted permanently",
        "success"
      );

      await fetchProducts();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to delete product";

      showToast(message, "error");
    } finally {
      setActionLoading(null);
    }
  };

  // --------------------------------
  // SEARCH
  // --------------------------------

  const filteredProducts = products.filter((product) => {
    const query = search.toLowerCase().trim();

    if (!query) return true;

    return (
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.manufacturedIn
        .toLowerCase()
        .includes(query) ||
      product.approvalStatus
        .toLowerCase()
        .includes(query)
    );
  });

  // --------------------------------
  // STATUS BADGE
  // --------------------------------

  const getStatusClass = (
    status: Product["approvalStatus"]
  ) => {
    if (status === "APPROVED") {
      return "bg-green-100 text-green-700";
    }

    if (status === "REJECTED") {
      return "bg-red-100 text-red-700";
    }

    return "bg-yellow-100 text-yellow-700";
  };

  // --------------------------------
  // UI
  // --------------------------------

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Product Management
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            {isAdmin
              ? "Manage, approve, edit and delete BI products."
              : "Create and manage your products. Admin approval is required before publishing."}
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Product
        </button>

      </div>

      {/* SEARCH */}

      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search products..."
          className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* FORM */}

      {showForm && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {editingProduct
                  ? "Edit Product"
                  : "Add Product"}
              </h2>

              {isRep && (
                <p className="mt-1 text-sm text-yellow-600">
                  Representative products require admin approval.
                </p>
              )}
            </div>

            <button
              onClick={closeForm}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >

            <div>
              <label className="mb-1 block text-sm font-medium">
                Product Name *
              </label>

              <input
                value={form.name}
                onChange={(e) =>
                  updateForm("name", e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="Product name"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Category *
              </label>

              <input
                value={form.category}
                onChange={(e) =>
                  updateForm("category", e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="Medicine / Supplement / Device"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">
                Short Description
              </label>

              <input
                value={form.shortDescription}
                onChange={(e) =>
                  updateForm(
                    "shortDescription",
                    e.target.value
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="Short product description"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">
                Description *
              </label>

              <textarea
                value={form.description}
                onChange={(e) =>
                  updateForm(
                    "description",
                    e.target.value
                  )
                }
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="Complete product description"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Manufactured In
              </label>

              <input
                value={form.manufacturedIn}
                onChange={(e) =>
                  updateForm(
                    "manufacturedIn",
                    e.target.value
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="India"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Image URL
              </label>

              <input
                value={form.image}
                onChange={(e) =>
                  updateForm("image", e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="https://..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">
                Purpose *
              </label>

              <textarea
                value={form.purpose}
                onChange={(e) =>
                  updateForm("purpose", e.target.value)
                }
                rows={2}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="Product purpose"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">
                Uses
              </label>

              <input
                value={form.uses}
                onChange={(e) =>
                  updateForm("uses", e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="Use 1, Use 2, Use 3"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Price *
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) =>
                  updateForm("price", e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="0"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Rating
              </label>

              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={form.rating}
                onChange={(e) =>
                  updateForm("rating", e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="0 - 5"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 md:col-span-2">

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingProduct
                  ? "Update Product"
                  : "Add Product"}
              </button>

            </div>

          </form>
        </div>
      )}

      {/* PRODUCTS */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">

        {loading ? (
          <div className="p-10 text-center text-gray-500">
            Loading products...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-10 text-center">

            <Package
              size={40}
              className="mx-auto mb-3 text-gray-300"
            />

            <p className="text-gray-500">
              No products found.
            </p>

          </div>
        ) : (
          <div className="divide-y divide-gray-100">

            {filteredProducts.map((product) => {

              const busy =
                actionLoading === product._id;

              return (
                <div
                  key={product._id}
                  className="p-5"
                >

                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                    {/* PRODUCT INFO */}

                    <div className="flex min-w-0 gap-4">

                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">

                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Package
                              size={28}
                              className="text-gray-400"
                            />
                          </div>
                        )}

                      </div>

                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                          <h3 className="font-semibold text-gray-900">
                            {product.name}
                          </h3>

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                              product.approvalStatus
                            )}`}
                          >
                            {product.approvalStatus}
                          </span>

                        </div>

                        <p className="mt-1 text-sm text-gray-500">
                          {product.category}
                        </p>

                        <p className="mt-1 text-sm text-gray-600">
                          {product.shortDescription ||
                            product.description}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-4 text-sm">

                          <span className="font-medium text-gray-900">
                            ₹{product.price.toFixed(2)}
                          </span>

                          <span className="text-gray-500">
                            Rating: {product.rating}/5
                          </span>

                          {product.manufacturedIn && (
                            <span className="text-gray-500">
                              Made in:{" "}
                              {product.manufacturedIn}
                            </span>
                          )}

                        </div>

                        {product.approvalStatus ===
                          "REJECTED" &&
                          product.rejectionReason && (
                            <p className="mt-2 text-sm text-red-600">
                              Reason:{" "}
                              {product.rejectionReason}
                            </p>
                          )}

                      </div>

                    </div>

                    {/* ACTIONS */}

                    <div className="flex flex-wrap items-center gap-2">

                      {/* EDIT */}

                      <button
                        onClick={() =>
                          openEditForm(product)
                        }
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <Pencil size={16} />
                        Edit
                      </button>

                      {/* ADMIN APPROVE */}

                      {isAdmin &&
                        product.approvalStatus ===
                          "PENDING" && (
                          <button
                            onClick={() =>
                              handleApprove(product._id)
                            }
                            disabled={busy}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                          >
                            <Check size={16} />
                            Approve
                          </button>
                        )}

                      {/* ADMIN REJECT */}

                      {isAdmin &&
                        product.approvalStatus ===
                          "PENDING" && (
                          <button
                            onClick={() =>
                              handleReject(product._id)
                            }
                            disabled={busy}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            <X size={16} />
                            Reject
                          </button>
                        )}

                      {/* ADMIN DELETE */}

                      {isAdmin && (
                        <button
                          onClick={() =>
                            handleDelete(product)
                          }
                          disabled={busy}
                          title="Delete product"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                          {busy
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      )}

                    </div>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>

    </div>
  );
}