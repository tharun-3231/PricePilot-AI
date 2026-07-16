
import {
  Users,
  TrendingDown,
  TrendingUp,
  Globe,
} from "lucide-react";

const stats = [
  {
    title: "Competitors",
    value: "18",
    icon: Users,
    color: "bg-blue-500",
  },
  {
    title: "Lower Prices",
    value: "9",
    icon: TrendingDown,
    color: "bg-green-500",
  },
  {
    title: "Higher Prices",
    value: "7",
    icon: TrendingUp,
    color: "bg-orange-500",
  },
  {
    title: "Market Share",
    value: "72%",
    icon: Globe,
    color: "bg-purple-500",
  },
];

const competitors = [
  {
    id: 1,
    company: "Amazon",
    product: "iPhone 16 Pro",
    price: "$979",
    trend: "Lower",
    recommendation: "Decrease Price",
  },
  {
    id: 2,
    company: "Flipkart",
    product: "Galaxy S25",
    price: "$915",
    trend: "Higher",
    recommendation: "Maintain",
  },
  {
    id: 3,
    company: "Best Buy",
    product: "MacBook Air M4",
    price: "$1199",
    trend: "Equal",
    recommendation: "Maintain",
  },
];

export default function CompetitorAnalysis() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50">
     
          <div className="mb-8">
            <h1 className="text-4xl font-bold">
              Competitor Analysis
            </h1>

            <p className="text-gray-500 mt-2">
              Compare competitor pricing and market trends.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">

            {stats.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="bg-white rounded-2xl shadow border p-6"
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
                      className={`${item.color} w-16 h-16 rounded-2xl flex items-center justify-center text-white`}
                    >
                      <Icon size={28} />
                    </div>

                  </div>
                </div>
              );
            })}

          </div>

          <div className="bg-white rounded-3xl shadow border overflow-hidden">

            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">
                Competitor Pricing
              </h2>
            </div>

            <table className="w-full">

              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-5">Company</th>
                  <th className="text-left">Product</th>
                  <th className="text-center">Price</th>
                  <th className="text-center">Trend</th>
                  <th className="text-center">
                    Recommendation
                  </th>
                </tr>
              </thead>

              <tbody>

                {competitors.map((item) => (

                  <tr
                    key={item.id}
                    className="border-t hover:bg-gray-50"
                  >

                    <td className="p-5 font-semibold">
                      {item.company}
                    </td>

                    <td>{item.product}</td>

                    <td className="text-center">
                      {item.price}
                    </td>

                    <td className="text-center">

                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          item.trend === "Lower"
                            ? "bg-green-100 text-green-700"
                            : item.trend === "Higher"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {item.trend}
                      </span>

                    </td>

                    <td className="text-center">

                      <span className="font-medium">
                        {item.recommendation}
                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

     
    </div>
  );
}