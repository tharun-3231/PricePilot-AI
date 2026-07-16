import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

export default function ProductTable({
  products = [],
  onEdit,
  onDelete,
}) {
  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="flex justify-between items-center px-6 py-5 border-b">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Products
          </h2>

          <p className="text-gray-500 text-sm mt-1">
            AI monitored products
          </p>
        </div>

        <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl">
          View All
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="text-left px-6 py-4">Product</th>
              <th className="text-left">Category</th>
              <th className="text-center">Price</th>
              <th className="text-center">Competitor</th>
              <th className="text-center">Recommendation</th>
              <th className="text-center">Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="text-center py-10 text-gray-400"
                >
                  No Products Found
                </td>
              </tr>
            ) : (
              products.map((item) => (
                <tr
                  key={item.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <img
                        src={
                          item.image ||
                          "https://picsum.photos/60"
                        }
                        alt={item.name}
                        className="w-14 h-14 rounded-xl object-cover"
                      />

                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {item.name}
                        </h3>

                        <p className="text-sm text-gray-500">
                          {item.brand}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td>{item.category}</td>

                  <td className="text-center font-semibold">
                    {item.price}
                  </td>

                  <td className="text-center">
                    {item.competitor}
                  </td>

                  <td className="text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        item.recommendation === "Increase"
                          ? "bg-green-100 text-green-700"
                          : item.recommendation === "Decrease"
                          ? "bg-red-100 text-red-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {item.recommendation}
                    </span>
                  </td>

                  <td className="text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        item.status === "Tracking"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td>
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => onEdit(item)}
                        className="p-2 rounded-lg hover:bg-blue-100 text-blue-600"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        onClick={() => onDelete(item.id)}
                        className="p-2 rounded-lg hover:bg-red-100 text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>

                      <button className="p-2 rounded-lg hover:bg-gray-100">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}