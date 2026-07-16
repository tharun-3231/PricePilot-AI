import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const data = [
  { month: "Jan", revenue: 4000 },
  { month: "Feb", revenue: 5200 },
  { month: "Mar", revenue: 6100 },
  { month: "Apr", revenue: 7800 },
  { month: "May", revenue: 8500 },
  { month: "Jun", revenue: 9800 },
  { month: "Jul", revenue: 11200 },
  { month: "Aug", revenue: 12800 },
  { month: "Sep", revenue: 14200 },
  { month: "Oct", revenue: 15100 },
  { month: "Nov", revenue: 16400 },
  { month: "Dec", revenue: 18200 },
];

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-4">
        <p className="font-semibold text-gray-800">{label}</p>
        <p className="text-blue-600 font-bold text-lg">
          ${payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }

  return null;
}

export default function RevenueChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/80 backdrop-blur-lg rounded-3xl border border-gray-200 shadow-lg p-6"
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Revenue Analytics
          </h2>

          <p className="text-gray-500 mt-1">
            AI predicted revenue growth
          </p>
        </div>

        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-lg bg-blue-600 text-white">
            12M
          </button>

          <button className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">
            6M
          </button>

          <button className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">
            30D
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={360}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="4 4"
            stroke="#e5e7eb"
            vertical={false}
          />

          <XAxis
            dataKey="month"
            tick={{ fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            tick={{ fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip content={<CustomTooltip />} />

          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#2563eb"
            strokeWidth={4}
            fillOpacity={1}
            fill="url(#colorRevenue)"
            activeDot={{
              r: 7,
              stroke: "#2563eb",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}