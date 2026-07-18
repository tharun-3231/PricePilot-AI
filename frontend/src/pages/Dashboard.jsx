import { useData } from "../context/DataContext";
import api from "../services/api";
import toast from "react-hot-toast";

import UploadDataset from "../components/UploadDataset";
import DatasetReport from "../components/DatasetReport";
import StatsCard from "../components/StatsCard";
import RevenueChart from "../components/RevenueChart";
import CompetitorComparison from "../components/CompetitorComparison";
import ProductTable from "../components/ProductTable";
import AIInsights from "../components/AIInsights";
import RecentActivity from "../components/RecentActivity";

export default function Dashboard() {
  const {
    loading,
    error,
    fileName,
    products,
    isDataLoaded,
    uploadProgress,
    processingStatus,
    fetchInitialData,
  } = useData();

  const handleSyncMarketIntel = async () => {
    const toastId = toast.loading("Syncing competitor intelligence...");
    try {
      const res = await api.post("/market-intelligence/refresh");
      if (res.data && res.data.status === "success") {
        toast.success(res.data.message, { id: toastId });
        await fetchInitialData();
      }
    } catch (e) {
      console.error(e);
      toast.error(e.response?.data?.detail || "Failed to sync market intelligence.", { id: toastId });
    }
  };

  return (
    <main className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">
            PricePilot AI Dashboard
          </h1>
          <p className="text-gray-500 mt-2">
            AI Powered Dynamic Pricing Intelligence
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isDataLoaded && (
            <button
              onClick={handleSyncMarketIntel}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3.5 rounded-xl shadow-lg hover:shadow-blue-100 transition flex items-center gap-2 cursor-pointer text-sm"
            >
              🔄 Sync Market Intel
            </button>
          )}
          <UploadDataset />
        </div>
      </div>

      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-3xl p-8 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-blue-700">
              {processingStatus || "Processing Dataset..."}
            </h2>
            <span className="text-blue-700 font-extrabold text-lg">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-blue-100 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-blue-600 h-full rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-gray-600 text-sm">
            Please wait while we process your data. This application remains fully responsive.
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-red-700">
            Upload Failed
          </h2>
          <p className="mt-2 text-red-600">
            {error}
          </p>
        </div>
      )}

      {!loading && !isDataLoaded && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-yellow-700">
            No Dataset Uploaded
          </h2>
          <p className="text-gray-700 mt-3">
            Upload a CSV dataset to unlock AI predictions, analytics, reports, recommendations, anomaly detection, and pricing insights.
          </p>
        </div>
      )}

      {isDataLoaded && (
        <>
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-green-700">
              Dataset Loaded Successfully
            </h2>
            <p className="mt-2 text-slate-700">
              <strong>File:</strong> {fileName}
            </p>
            <p className="text-slate-700">
              <strong>Total Products:</strong> {products.length}
            </p>
          </div>

          <DatasetReport />

          <StatsCard />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 space-y-8">
              <RevenueChart />
              <CompetitorComparison />
              <ProductTable />
            </div>

            <div className="space-y-8">
              <AIInsights />
              <RecentActivity />
            </div>
          </div>
        </>
      )}
    </main>
  );
}