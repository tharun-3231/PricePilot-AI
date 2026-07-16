
import RevenueChart from "../components/RevenueChart";
import CompetitorComparison from "../components/CompetitorComparison";
import AIInsights from "../components/AIInsights";

import {
  TrendingUp,
  DollarSign,
  BarChart3,
  Activity,
} from "lucide-react";

const cards = [
  {
    title: "Revenue",
    value: "$125,430",
    icon: DollarSign,
    color: "bg-blue-500",
  },
  {
    title: "Growth",
    value: "+18%",
    icon: TrendingUp,
    color: "bg-green-500",
  },
  {
    title: "Analytics",
    value: "98%",
    icon: BarChart3,
    color: "bg-purple-500",
  },
  {
    title: "Performance",
    value: "Excellent",
    icon: Activity,
    color: "bg-orange-500",
  },
];

export default function Analytics() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50">

      

          <div className="mb-8">

            <h1 className="text-4xl font-bold">
              Analytics
            </h1>

            <p className="text-gray-500 mt-2">
              AI Powered Business Insights
            </p>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">

            {cards.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="bg-white rounded-2xl shadow border p-6"
                >
                  <div className="flex justify-between">

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
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

            <div className="xl:col-span-2 space-y-8">

              <RevenueChart />

              <CompetitorComparison />

            </div>

            <div>

              <AIInsights />

            </div>

          </div>


    </div>
  );
}