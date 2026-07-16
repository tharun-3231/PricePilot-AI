import {
  ArrowDown,
  ArrowUp,
  Bell,
  CheckCircle2,
  Clock,
} from "lucide-react";

const activities = [
  {
    id: 1,
    icon: ArrowDown,
    color: "bg-red-100 text-red-600",
    title: "iPhone 16 Pro price dropped",
    description: "Amazon reduced the price by $20.",
    time: "2 min ago",
  },
  {
    id: 2,
    icon: Bell,
    color: "bg-yellow-100 text-yellow-600",
    title: "New competitor detected",
    description: "Best Buy added a competing listing.",
    time: "12 min ago",
  },
  {
    id: 3,
    icon: ArrowUp,
    color: "bg-green-100 text-green-600",
    title: "AI recommends increasing price",
    description: "Demand increased by 14%.",
    time: "35 min ago",
  },
  {
    id: 4,
    icon: CheckCircle2,
    color: "bg-blue-100 text-blue-600",
    title: "Alert resolved",
    description: "Sony WH-1000XM6 is back to target price.",
    time: "1 hour ago",
  },
  {
    id: 5,
    icon: Clock,
    color: "bg-purple-100 text-purple-600",
    title: "Scheduled price sync",
    description: "Next synchronization in 30 minutes.",
    time: "Today",
  },
];

export default function RecentActivity() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      <div className="px-6 py-5 border-b">
        <h2 className="text-xl font-bold text-gray-900">
          Recent Activity
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Latest AI insights and updates
        </p>
      </div>

      <div className="divide-y divide-gray-100">
        {activities.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.id}
              className="flex gap-4 px-6 py-5 hover:bg-gray-50 transition"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color}`}
              >
                <Icon size={20} />
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {item.title}
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  {item.description}
                </p>

                <p className="text-xs text-gray-400 mt-2">
                  {item.time}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}