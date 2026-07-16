
import {
  Bell,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

const stats = [
  {
    title: "Active Alerts",
    value: "28",
    icon: Bell,
    color: "bg-blue-500",
  },
  {
    title: "Price Drops",
    value: "16",
    icon: TrendingDown,
    color: "bg-green-500",
  },
  {
    title: "Price Increases",
    value: "12",
    icon: TrendingUp,
    color: "bg-orange-500",
  },
  {
    title: "Critical Alerts",
    value: "5",
    icon: AlertTriangle,
    color: "bg-red-500",
  },
];

const alerts = [
  {
    id: 1,
    product: "Apple iPhone 16 Pro",
    message: "Competitor price dropped by $20",
    priority: "High",
    time: "2 mins ago",
  },
  {
    id: 2,
    product: "Samsung Galaxy S25",
    message: "Price increased by $15",
    priority: "Medium",
    time: "10 mins ago",
  },
  {
    id: 3,
    product: "MacBook Air M4",
    message: "AI recommends decreasing price",
    priority: "Low",
    time: "25 mins ago",
  },
];

export default function Alerts() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50">
     

          <div className="mb-8">
            <h1 className="text-4xl font-bold">
              Price Alerts
            </h1>

            <p className="text-gray-500 mt-2">
              AI monitors competitor prices in real time
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
                      className={`${item.color} w-16 h-16 rounded-2xl flex items-center justify-center text-white`}
                    >
                      <Icon size={28} />
                    </div>

                  </div>
                </div>
              );
            })}

          </div>
                    <div className="bg-white rounded-3xl shadow border">

            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">
                Latest Alerts
              </h2>
            </div>

            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex justify-between items-center px-6 py-5 border-b hover:bg-gray-50"
              >
                <div>

                  <h3 className="font-bold">
                    {alert.product}
                  </h3>

                  <p className="text-gray-500">
                    {alert.message}
                  </p>

                  <span className="text-sm text-gray-400">
                    {alert.time}
                  </span>

                </div>

                <div className="flex items-center gap-4">

                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      alert.priority === "High"
                        ? "bg-red-100 text-red-600"
                        : alert.priority === "Medium"
                        ? "bg-orange-100 text-orange-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {alert.priority}
                  </span>

                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl">
                    Mark Read
                  </button>

                </div>

              </div>
            ))}

          </div>

      
    </div>
  );
}