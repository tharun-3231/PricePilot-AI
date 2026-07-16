import { useState } from "react";
import ProductTable from "../components/ProductTable";
import AddProductModal from "../components/AddProductModal";

import {
  Package,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Plus,
  Search,
} from "lucide-react";

const stats = [
  {
    title: "Total Products",
    value: "1,248",
    icon: Package,
    color: "bg-blue-500",
  },
  {
    title: "Price Changes",
    value: "342",
    icon: TrendingUp,
    color: "bg-green-500",
  },
  {
    title: "Active Alerts",
    value: "28",
    icon: AlertTriangle,
    color: "bg-orange-500",
  },
  {
    title: "Average Price",
    value: "$284",
    icon: DollarSign,
    color: "bg-purple-500",
  },
];

export default function Products() {
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [products, setProducts] = useState([
    {
      id: 1,
      image: "https://picsum.photos/60?1",
      name: "Apple iPhone 16 Pro",
      brand: "Apple",
      category: "Smartphones",
      price: "$999",
      competitor: "$979",
      recommendation: "Decrease",
      status: "Tracking",
    },
    {
      id: 2,
      image: "https://picsum.photos/60?2",
      name: "Samsung Galaxy S25",
      brand: "Samsung",
      category: "Smartphones",
      price: "$899",
      competitor: "$915",
      recommendation: "Increase",
      status: "Tracking",
    },
    {
      id: 3,
      image: "https://picsum.photos/60?3",
      name: "MacBook Air M4",
      brand: "Apple",
      category: "Laptop",
      price: "$1199",
      competitor: "$1199",
      recommendation: "Maintain",
      status: "Tracking",
    },
  ]);

  const handleAddProduct = (product) => {
    setProducts((prev) => [
      ...prev,
      {
        id: Date.now(),
        image: `https://picsum.photos/60?${Date.now()}`,
        ...product,
      },
    ]);

    setOpen(false);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setIsEditing(true);
    setOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this product?")) {
      setProducts((prev) =>
        prev.filter((item) => item.id !== id)
      );
    }
  };

  const handleUpdateProduct = (updatedProduct) => {
  setProducts((prev) =>
    prev.map((item) =>
      item.id === updatedProduct.id
        ? {
            ...item,
            ...updatedProduct,
          }
        : item
    )
  );

  setOpen(false);
  setIsEditing(false);
  setSelectedProduct(null);
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50">
      
          <div className="flex justify-between items-center mb-8">

            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Products
              </h1>

              <p className="text-gray-500 mt-2">
                Manage all tracked products
              </p>
            </div>

            <button
              onClick={() => {
                setIsEditing(false);
                setSelectedProduct(null);
                setOpen(true);
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg"
            >
              <Plus size={20} />
              Add Product
            </button>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">

            {stats.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-lg transition"
                >
                  <div className="flex justify-between items-center">

                    <div>
                      <p className="text-gray-500">
                        {item.title}
                      </p>

                      <h2 className="text-4xl font-bold mt-3">
                        {item.value}
                      </h2>
                    </div>

                    <div
                      className={`w-16 h-16 rounded-2xl ${item.color} flex items-center justify-center text-white`}
                    >
                      <Icon size={28} />
                    </div>

                  </div>
                </div>
              );
            })}

          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8 flex flex-col lg:flex-row justify-between gap-4">

            <div className="relative">

              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />

              <input
                type="text"
                placeholder="Search products..."
                className="w-full lg:w-96 pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              />

            </div>

            <div className="flex gap-4">

              <select className="px-5 py-3 rounded-xl border border-gray-300 bg-white">
                <option>All Categories</option>
                <option>Smartphones</option>
                <option>Laptops</option>
                <option>Accessories</option>
              </select>

              <select className="px-5 py-3 rounded-xl border border-gray-300 bg-white">
                <option>Sort By</option>
                <option>Name</option>
                <option>Price ↑</option>
                <option>Price ↓</option>
              </select>

            </div>

          </div>
                    <ProductTable
            products={products}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

      

      <AddProductModal
        isOpen={open}
        onClose={() => {
          setOpen(false);
          setIsEditing(false);
          setSelectedProduct(null);
        }}
        onSave={
          isEditing
            ? handleUpdateProduct
            : handleAddProduct
        }
        product={selectedProduct}
        isEditing={isEditing}
      />
    </div>
  );
}