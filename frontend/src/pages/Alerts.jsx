import { useMemo, useState } from "react";
import { useData } from "../context/DataContext";
import {
  Bell,
  AlertTriangle,
  Package,
} from "lucide-react";

export default function Alerts() {
  const { anomalies, products } = useData();

  // Local state to keep track of cleared/dismissed alerts visually
  const [dismissedAlertIds, setDismissedAlertIds] = useState([]);

  const activeAlerts = useMemo(() => {
    return anomalies
      .filter((item) => !dismissedAlertIds.includes(item.id))
      .map((item, idx) => {
        const stock = Number(item.stock || 0);
        const price = Number(item.price || 0);
        const sales = Number(item.sales || 0);
        
        let priority = "Medium";
        let message = "AI Flagged: Product represents a statistical pricing outlier.";
        
        if (stock < 10) {
          priority = "High";
          message = "Critical: Very low inventory level matched with abnormal sales volume.";
        } else if (price > 50000 && sales < 5) {
          priority = "High";
          message = "Anomaly Alert: Extremely high listing price with stagnant inventory velocity.";
        } else if (stock === 0) {
          priority = "High";
          message = "Stockout Alert: Product is out of stock.";
        }

        return {
          id: item.id || idx,
          product: item.product || "Unknown Product",
          message,
          priority,
          time: "Just updated",
        };
      });
  }, [anomalies, dismissedAlertIds]);

  const stats = useMemo(() => {
    const total = activeAlerts.length;
    const critical = activeAlerts.filter((a) => a.priority === "High").length;
    const lowStockCount = products.filter((p) => Number(p.stock || 0) < 20).length;

    return [
      {
        title: "Active Alerts",
        value: total.toString(),
        icon: Bell,
        color: "bg-blue-500",
      },
      {
        title: "Critical Anomalies",
        value: critical.toString(),
        icon: AlertTriangle,
        color: "bg-red-500",
      },
      {
        title: "Low Stock Warnings",
        value: lowStockCount.toString(),
        icon: Package,
        color: "bg-orange-500",
      },
    ];
  }, [activeAlerts, products]);

  const handleDismiss = (id) => {
    setDismissedAlertIds([...dismissedAlertIds, id]);
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <Bell className="text-blue-600 animate-bounce" size={36} />
          Price Alerts & Outliers
        </h1>
        <p className="text-slate-500 text-lg mt-2">
          AI monitors sales patterns, product inventory velocity, and competitor prices to flag dynamic pricing anomalies.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="bg-white rounded-2xl shadow-md border border-slate-100 p-6 flex items-center justify-between hover:shadow-lg transition duration-200"
            >
              <div>
                <p className="text-slate-500 font-medium text-sm">{item.title}</p>
                <h2 className="text-3xl font-extrabold text-slate-800 mt-2">{item.value}</h2>
              </div>
              <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center text-white shadow-sm`}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Alerts Feed */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-2xl font-bold text-slate-800">Dynamic AI Notification Feed</h2>
          <p className="text-slate-500 text-sm mt-1">
            Outliers and anomalies highlighted by Isolation Forest clustering model.
          </p>
        </div>

        <div>
          {activeAlerts.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-medium">
              No active alerts or pricing anomalies found in the current dataset.
            </div>
          ) : (
            activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-6 border-b border-slate-100 hover:bg-slate-50/50 transition gap-4"
              >
                <div>
                  <h3 className="font-bold text-slate-800 text-base">{alert.product}</h3>
                  <p className="text-slate-600 text-sm mt-1">{alert.message}</p>
                  <span className="text-xs text-slate-400 block mt-2">{alert.time}</span>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-auto">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      alert.priority === "High"
                        ? "bg-red-100 text-red-600 border border-red-200"
                        : "bg-orange-100 text-orange-600 border border-orange-200"
                    }`}
                  >
                    {alert.priority} Priority
                  </span>

                  <button
                    onClick={() => handleDismiss(alert.id)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 px-4 py-2 rounded-xl text-xs font-semibold transition"
                  >
                    Dismiss Alert
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}