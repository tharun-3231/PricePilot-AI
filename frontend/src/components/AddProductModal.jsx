import { useState, useEffect } from "react";
import { X, Upload } from "lucide-react";

const emptyForm = {
  id: null,
  name: "",
  brand: "",
  category: "Smartphones",
  price: "",
  competitor: "",
  recommendation: "Maintain",
  status: "Tracking",
};

export default function AddProductModal({
  isOpen,
  onClose,
  onSave,
  product,
  isEditing,
}) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (product) {
      setForm({
        ...product,
        price: String(product.price).replace("$", ""),
        competitor: String(product.competitor).replace("$", ""),
      });
    } else {
      setForm(emptyForm);
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !form.name.trim() ||
      !form.brand.trim() ||
      !form.price ||
      !form.competitor
    ) {
      alert("Please fill all required fields.");
      return;
    }

    onSave({
      ...form,
      price: `$${form.price}`,
      competitor: `$${form.competitor}`,
    });

    setForm(emptyForm);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8">

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">
            {isEditing ? "Edit Product" : "Add New Product"}
          </h2>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100"
          >
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="grid grid-cols-2 gap-6">

            <div>
              <label className="block mb-2 font-medium">
                Product Name
              </label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="iPhone 16 Pro"
                className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Brand
              </label>

              <input
                type="text"
                name="brand"
                value={form.brand}
                onChange={handleChange}
                placeholder="Apple"
                className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

          </div>

          <div className="grid grid-cols-2 gap-6">

            <div>
              <label className="block mb-2 font-medium">
                Category
              </label>

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3"
              >
                <option>Smartphones</option>
                <option>Laptops</option>
                <option>Accessories</option>
                <option>Headphones</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Price ($)
              </label>

              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="999"
                className="w-full border rounded-xl px-4 py-3"
              />
            </div>

          </div>

          <div className="grid grid-cols-2 gap-6">

            <div>
              <label className="block mb-2 font-medium">
                Competitor Price ($)
              </label>

              <input
                type="number"
                name="competitor"
                value={form.competitor}
                onChange={handleChange}
                placeholder="979"
                className="w-full border rounded-xl px-4 py-3"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Recommendation
              </label>

              <select
                name="recommendation"
                value={form.recommendation}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3"
              >
                <option>Maintain</option>
                <option>Increase</option>
                <option>Decrease</option>
              </select>
            </div>

          </div>

          <div>
            <label className="block mb-2 font-medium">
              Product Image
            </label>

            <div className="border-2 border-dashed rounded-2xl p-8 text-center">
              <Upload
                size={40}
                className="mx-auto text-blue-500 mb-3"
              />

              <p className="text-gray-500">
                Upload Product Image
              </p>

              <input
                type="file"
                className="mt-4"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">

            <button
              type="button"
              onClick={() => {
                setForm(emptyForm);
                onClose();
              }}
              className="px-6 py-3 rounded-xl border border-gray-300 hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isEditing ? "Update Product" : "Save Product"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}