import { TrendingDown, TrendingUp, Minus } from "lucide-react";

const competitors = [
  {
    id: 1,
    company: "Amazon",
    product: "iPhone 16 Pro",
    yourPrice: 999,
    competitorPrice: 979,
    recommendation: "Decrease",
  },
  {
    id: 2,
    company: "Flipkart",
    product: "Galaxy S25",
    yourPrice: 899,
    competitorPrice: 915,
    recommendation: "Increase",
  },
  {
    id: 3,
    company: "Best Buy",
    product: "MacBook Air M4",
    yourPrice: 1199,
    competitorPrice: 1199,
    recommendation: "Maintain",
  },
  {
    id: 4,
    company: "Walmart",
    product: "Sony WH-1000XM6",
    yourPrice: 349,
    competitorPrice: 339,
    recommendation: "Decrease",
  },
];

export default function CompetitorComparison() {
  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Competitor Comparison
          </h2>
          <p className="text-gray-500">
            Compare your prices with competitors
          </p>
        </div>

        <button className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700">
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="text-gray-500 border-b">
            <tr>
              <th className="text-left py-4">Competitor</th>
              <th className="text-left">Product</th>
              <th className="text-center">Your Price</th>
              <th className="text-center">Competitor</th>
              <th className="text-center">Difference</th>
              <th className="text-center">AI Recommendation</th>
            </tr>
          </thead>

          <tbody>
            {competitors.map((item) => {
              const diff = item.yourPrice - item.competitorPrice;

              return (
                <tr
                  key={item.id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="py-5 font-semibold">
                    {item.company}
                  </td>

                  <td>{item.product}</td>

                  <td className="text-center font-semibold">
                    ${item.yourPrice}
                  </td>

                  <td className="text-center">
                    ${item.competitorPrice}
                  </td>

                  <td className="text-center">
                    <div className="flex justify-center items-center gap-2">
                      {diff > 0 ? (
                        <>
                          <TrendingDown
                            size={18}
                            className="text-red-500"
                          />
                          <span className="text-red-500 font-semibold">
                            ${Math.abs(diff)}
                          </span>
                        </>
                      ) : diff < 0 ? (
                        <>
                          <TrendingUp
                            size={18}
                            className="text-green-500"
                          />
                          <span className="text-green-500 font-semibold">
                            ${Math.abs(diff)}
                          </span>
                        </>
                      ) : (
                        <>
                          <Minus
                            size={18}
                            className="text-gray-400"
                          />
                          <span>$0</span>
                        </>
                      )}
                    </div>
                  </td>

                  <td className="text-center">
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        item.recommendation === "Increase"
                          ? "bg-green-100 text-green-600"
                          : item.recommendation === "Decrease"
                          ? "bg-red-100 text-red-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {item.recommendation}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}