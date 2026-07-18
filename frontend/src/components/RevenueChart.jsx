import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useData } from "../context/DataContext";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function RevenueChart() {
  const { stats, products, darkMode } = useData();

  const [view, setView] = useState("Revenue");

  const chartData = useMemo(() => {
    if (stats && stats.monthlyAnalytics && stats.monthlyAnalytics.length > 0) {
      return stats.monthlyAnalytics;
    }
    return MONTHS.map((month) => ({
      month,
      Revenue: 0,
      Sales: 0,
      Profit: 0,
      Forecast: 0,
    }));
  }, [stats]);

  const totalRevenue = chartData.reduce(
    (sum, item) => sum + item.Revenue,
    0
  );

  const totalSales = chartData.reduce(
    (sum, item) => sum + item.Sales,
    0
  );

  const totalProfit = chartData.reduce(
    (sum, item) => sum + item.Profit,
    0
  );

  if (!products.length) {
    return (
      <div className="bg-white rounded-3xl shadow-lg border p-10 text-center">
        <h2 className="text-3xl font-bold">
          Revenue Analytics
        </h2>

        <p className="text-gray-500 mt-3">
          Upload a dataset to see charts.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-lg border p-8"
    >
      <div className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-6">

        <div>

          <h2 className="text-3xl font-bold">
            Revenue Analytics
          </h2>

          <p className="text-gray-500 mt-2">
            Monthly Business Performance
          </p>

        </div>

        <div className="flex gap-3 flex-wrap">

          {["Revenue", "Sales", "Profit", "Forecast"].map((type) => (

            <button
              key={type}
              onClick={() => setView(type)}
              className={`px-4 py-2 rounded-xl transition ${
                view === type
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100"
              }`}
            >
              {type}
            </button>

          ))}

        </div>

      </div>

      <ResponsiveContainer width="100%" height={380}>

        <AreaChart data={chartData}>

          <defs>

            <linearGradient
              id="gradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >

              <stop
                offset="5%"
                stopColor="#2563eb"
                stopOpacity={0.8}
              />

              <stop
                offset="95%"
                stopColor="#2563eb"
                stopOpacity={0.05}
              />

            </linearGradient>

          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#334155" : "#e2e8f0"} />

          <XAxis dataKey="month" stroke={darkMode ? "#94a3b8" : "#475569"} fontSize={12} tickLine={false} />

          <YAxis stroke={darkMode ? "#94a3b8" : "#475569"} fontSize={12} tickLine={false} />

          <Tooltip />

          <Area
            type="monotone"
            dataKey={view}
            stroke="#2563eb"
            fill="url(#gradient)"
            strokeWidth={3}
          />

        </AreaChart>

      </ResponsiveContainer>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">

        <div className="bg-blue-50 rounded-2xl p-5">

          <p>Total Revenue</p>

          <h2 className="text-3xl font-bold text-blue-700 mt-2">
            ₹{totalRevenue.toLocaleString()}
          </h2>

        </div>

        <div className="bg-green-50 rounded-2xl p-5">

          <p>Total Sales</p>

          <h2 className="text-3xl font-bold text-green-700 mt-2">
            {totalSales.toLocaleString()}
          </h2>

        </div>

        <div className="bg-purple-50 rounded-2xl p-5">

          <p>Estimated Profit</p>

          <h2 className="text-3xl font-bold text-purple-700 mt-2">
            ₹{totalProfit.toLocaleString()}
          </h2>

        </div>

      </div>

    </motion.div>
  );
}