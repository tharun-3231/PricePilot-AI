
import {
  Brain,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Sparkles,
} from "lucide-react";

const predictions = [
  {
    id: 1,
    product: "Apple iPhone 16 Pro",
    current: "$999",
    predicted: "$979",
    action: "Decrease",
    confidence: "96%",
  },
  {
    id: 2,
    product: "Samsung Galaxy S25",
    current: "$899",
    predicted: "$919",
    action: "Increase",
    confidence: "92%",
  },
  {
    id: 3,
    product: "MacBook Air M4",
    current: "$1199",
    predicted: "$1199",
    action: "Maintain",
    confidence: "98%",
  },
];

export default function PricePrediction() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50">
      

          <div className="flex justify-between items-center mb-8">

            <div>
              <h1 className="text-4xl font-bold">
                AI Price Prediction
              </h1>

              <p className="text-gray-500 mt-2">
                AI recommends the best selling price using market trends.
              </p>
            </div>

            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2">
              <Sparkles size={20} />
              Run Prediction
            </button>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

            <div className="bg-white rounded-2xl shadow border p-6">
              <Brain className="text-blue-600 mb-3" size={32}/>
              <h2 className="text-3xl font-bold">97%</h2>
              <p className="text-gray-500">AI Accuracy</p>
            </div>

            <div className="bg-white rounded-2xl shadow border p-6">
              <TrendingUp className="text-green-600 mb-3" size={32}/>
              <h2 className="text-3xl font-bold">+18%</h2>
              <p className="text-gray-500">Profit Growth</p>
            </div>

            <div className="bg-white rounded-2xl shadow border p-6">
              <TrendingDown className="text-orange-600 mb-3" size={32}/>
              <h2 className="text-3xl font-bold">342</h2>
              <p className="text-gray-500">Predictions</p>
            </div>

            <div className="bg-white rounded-2xl shadow border p-6">
              <DollarSign className="text-purple-600 mb-3" size={32}/>
              <h2 className="text-3xl font-bold">$24K</h2>
              <p className="text-gray-500">Revenue Saved</p>
            </div>

          </div>

          <div className="bg-white rounded-3xl shadow border overflow-hidden">

            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">
                AI Recommendations
              </h2>
            </div>

            <table className="w-full">

              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-5">Product</th>
                  <th className="text-center">Current</th>
                  <th className="text-center">AI Price</th>
                  <th className="text-center">Action</th>
                  <th className="text-center">Confidence</th>
                </tr>
              </thead>

              <tbody>

                {predictions.map((item)=>(
                  <tr
                    key={item.id}
                    className="border-t hover:bg-gray-50"
                  >

                    <td className="p-5 font-semibold">
                      {item.product}
                    </td>

                    <td className="text-center">
                      {item.current}
                    </td>

                    <td className="text-center font-bold text-blue-600">
                      {item.predicted}
                    </td>

                    <td className="text-center">

                      <span
                        className={`px-3 py-1 rounded-full font-semibold ${
                          item.action==="Increase"
                            ? "bg-green-100 text-green-700"
                            : item.action==="Decrease"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {item.action}
                      </span>

                    </td>

                    <td className="text-center">
                      {item.confidence}
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>

   
    </div>
  );
}