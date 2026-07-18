import { useMemo } from "react";
import { Brain, TrendingUp, AlertTriangle } from "lucide-react";
import { useData } from "../context/DataContext";

export default function AIInsights() {

  const { products } = useData();

  const insights = useMemo(() => {

    if (products.length === 0)
      return null;

    const highestRevenue = [...products].sort(
      (a, b) =>
        Number(b.revenue || 0) -
        Number(a.revenue || 0)
    )[0];

    const highestSales = [...products].sort(
      (a, b) =>
        Number(b.sales || 0) -
        Number(a.sales || 0)
    )[0];

    const lowestStock = [...products].sort(
      (a, b) =>
        Number(a.stock || 0) -
        Number(b.stock || 0)
    )[0];

    const expensiveProduct = [...products].sort(
      (a, b) =>
        Number(b.price || 0) -
        Number(a.price || 0)
    )[0];

    return {
      highestRevenue,
      highestSales,
      lowestStock,
      expensiveProduct,
    };

  }, [products]);

  if (!products.length) {

    return (

      <div className="bg-white rounded-3xl border shadow-lg p-8">

        <h2 className="text-2xl font-bold">

          AI Insights

        </h2>

        <p className="text-gray-500 mt-4">

          Upload a CSV file to generate AI insights.

        </p>

      </div>

    );

  }

  return (
    <div className="bg-white rounded-3xl shadow-lg border p-8">

  <div className="flex items-center gap-3 mb-8">

    <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center">

      <Brain className="text-purple-600" size={24} />

    </div>

    <div>

      <h2 className="text-2xl font-bold">

        AI Insights

      </h2>

      <p className="text-gray-500">

        Intelligent analysis from your uploaded dataset

      </p>

    </div>

  </div>

  <div className="space-y-5">

    <div className="rounded-2xl bg-green-50 p-5 border border-green-100">

      <div className="flex items-center gap-3">

        <TrendingUp className="text-green-600" />

        <div>

          <h3 className="font-semibold">

            Highest Revenue Product

          </h3>

          <p className="text-gray-600 mt-1">

            <strong>

              {insights.highestRevenue.product}

            </strong>

            {" "}generated $

            {Number(
              insights.highestRevenue.revenue
            ).toLocaleString()}

          </p>

        </div>

      </div>

    </div>

    <div className="rounded-2xl bg-blue-50 p-5 border border-blue-100">

      <div className="flex items-center gap-3">

        <TrendingUp className="text-blue-600" />

        <div>

          <h3 className="font-semibold">

            Highest Sales

          </h3>

          <p className="text-gray-600 mt-1">

            <strong>

              {insights.highestSales.product}

            </strong>

            {" "}sold

            {" "}

            {insights.highestSales.sales}

            {" "}units

          </p>

        </div>

      </div>

    </div>

    <div className="rounded-2xl bg-red-50 p-5 border border-red-100">

      <div className="flex items-center gap-3">

        <AlertTriangle className="text-red-600" />

        <div>

          <h3 className="font-semibold">

            Low Stock Alert

          </h3>

          <p className="text-gray-600 mt-1">

            <strong>

              {insights.lowestStock.product}

            </strong>

            {" "}has only

            {" "}

            {insights.lowestStock.stock}

            {" "}items remaining.

          </p>

        </div>

      </div>

    </div>

    <div className="rounded-2xl bg-yellow-50 p-5 border border-yellow-100">

      <div className="flex items-center gap-3">

        <Brain className="text-yellow-600" />

        <div>

          <h3 className="font-semibold">

            AI Recommendation

          </h3>

          <p className="text-gray-600 mt-1">

            Increase inventory for

            {" "}

            <strong>

              {insights.highestSales.product}

            </strong>

            {" "}and review pricing for

            {" "}

            <strong>

              {insights.expensiveProduct.product}

            </strong>

            {" "}to maximize revenue.

          </p>

        </div>

      </div>

    </div>

  </div>

</div>

);

}