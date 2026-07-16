import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from "lucide-react";

const insights = [
  {
    title: "Lower iPhone 16 Pro by 2%",
    description:
      "Amazon is undercutting your price. Reducing by 2% could increase conversions.",
    icon: TrendingDown,
    color: "text-red-500 bg-red-100",
  },
  {
    title: "Increase Galaxy S25 by 3%",
    description:
      "Demand is high and competitors are priced higher than your listing.",
    icon: TrendingUp,
    color: "text-green-500 bg-green-100",
  },
  {
    title: "Watch Sony Headphones",
    description:
      "A competitor recently reduced pricing. Monitor before making changes.",
    icon: AlertTriangle,
    color: "text-orange-500 bg-orange-100",
  },
];

export default function AIInsights() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
          <Sparkles className="text-blue-600" />
        </div>

        <div>
          <h2 className="text-xl font-bold">AI Insights</h2>
          <p className="text-gray-500 text-sm">
            Smart recommendations generated today
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {insights.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              className="flex gap-4 rounded-xl border border-gray-200 p-4 hover:shadow-md transition"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color}`}
              >
                <Icon size={22} />
              </div>

              <div className="flex-1">
                <h3 className="font-semibold">{item.title}</h3>

                <p className="text-sm text-gray-500 mt-1">
                  {item.description}
                </p>

                <button className="mt-3 text-blue-600 text-sm font-semibold hover:underline">
                  View Recommendation →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}