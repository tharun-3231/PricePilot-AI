import { useMemo } from "react";
import { useData } from "../context/DataContext";
import { motion } from "framer-motion";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export default function CompetitorComparison() {

  const { products } = useData();

  const chartData = useMemo(() => {

    if (!products.length) return [];

    return products.slice(0, 8).map((item) => ({

      product:
        item.product ||
        item.name ||
        "Unknown",

      OurPrice:
        Number(item.price || 0),

      Competitor:
        Number(
          item.competitorPrice ??
          item.competitor_price ??
          item.marketPrice ??
          item.market_price ??
          item.price ??
          0
        ),

    }));

  }, [products]);

  if (!products.length) {

    return (

      <div className="bg-white rounded-3xl shadow-lg border p-8">

        <h2 className="text-2xl font-bold">
          Competitor Comparison
        </h2>

        <p className="text-gray-500 mt-3">
          Upload a CSV dataset first.
        </p>

      </div>

    );

  }

  const avgOurPrice =
    chartData.reduce(
      (sum, item) => sum + item.OurPrice,
      0
    ) / chartData.length;

  const avgCompetitorPrice =
    chartData.reduce(
      (sum, item) => sum + item.Competitor,
      0
    ) / chartData.length;

  return (

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-lg border p-8"
    >

      <div className="mb-8">

        <h2 className="text-3xl font-bold">
          Competitor Pricing
        </h2>

        <p className="text-gray-500 mt-2">
          Compare your prices with competitor prices
        </p>

      </div>

      <ResponsiveContainer
        width="100%"
        height={350}
      >

        <BarChart data={chartData}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="product" />

          <YAxis />

          <Tooltip />

          <Legend />

          <Bar
            dataKey="OurPrice"
            fill="#2563eb"
          />

          <Bar
            dataKey="Competitor"
            fill="#10b981"
          />

        </BarChart>

      </ResponsiveContainer>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">

        <div className="bg-blue-50 rounded-2xl p-5">

          <h3 className="font-semibold">
            Products Compared
          </h3>

          <p className="text-3xl font-bold mt-2">
            {chartData.length}
          </p>

        </div>

        <div className="bg-green-50 rounded-2xl p-5">

          <h3 className="font-semibold">
            Avg Our Price
          </h3>

          <p className="text-3xl font-bold mt-2">
            ${avgOurPrice.toFixed(2)}
          </p>

        </div>

        <div className="bg-purple-50 rounded-2xl p-5">

          <h3 className="font-semibold">
            Avg Competitor Price
          </h3>

          <p className="text-3xl font-bold mt-2">
            ${avgCompetitorPrice.toFixed(2)}
          </p>

        </div>

      </div>

    </motion.div>

  );

}