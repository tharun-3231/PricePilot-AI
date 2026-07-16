import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Bell,
} from "lucide-react";
import { motion } from "framer-motion";

const stats = [
  {
    title: "Revenue Saved",
    value: "$24,580",
    change: "+12.5%",
    icon: DollarSign,
    color: "bg-blue-500",
  },
  {
    title: "Tracked Products",
    value: "1,248",
    change: "+8.2%",
    icon: ShoppingCart,
    color: "bg-green-500",
  },
  {
    title: "Price Changes",
    value: "342",
    change: "+18.4%",
    icon: TrendingUp,
    color: "bg-purple-500",
  },
  {
    title: "Active Alerts",
    value: "28",
    change: "-2.1%",
    icon: Bell,
    color: "bg-orange-500",
  },
];

export default function StatsCard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {stats.map((item, index) => {
        const Icon = item.icon;

        return (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{
              y: -8,
              scale: 1.02,
            }}
            whileTap={{ scale: 0.98 }}
            transition={{
              delay: index * 0.1,
              type: "spring",
              stiffness: 250,
              damping: 18,
            }}
            className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm">
                  {item.title}
                </p>

                <h2 className="text-3xl font-bold text-gray-900 mt-2">
                  {item.value}
                </h2>

                <span
                  className={`inline-block mt-4 px-3 py-1 rounded-full text-sm font-semibold ${
                    item.change.startsWith("-")
                      ? "bg-red-100 text-red-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {item.change}
                </span>
              </div>

              <div
                className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center text-white shadow-md`}
              >
                <Icon size={26} />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}