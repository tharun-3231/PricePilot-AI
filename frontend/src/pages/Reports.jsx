
import {
  FileText,
  Download,
  FileSpreadsheet,
  FileBarChart,
} from "lucide-react";

const reports = [
  {
    id: 1,
    title: "Weekly Revenue Report",
    description: "Revenue generated during this week.",
    type: "PDF",
    date: "15 July 2026",
  },
  {
    id: 2,
    title: "Competitor Pricing Report",
    description: "Latest competitor price comparison.",
    type: "Excel",
    date: "14 July 2026",
  },
  {
    id: 3,
    title: "AI Price Recommendation",
    description: "Recommended pricing by AI model.",
    type: "CSV",
    date: "13 July 2026",
  },
];

export default function Reports() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50">
     

          <div className="mb-8">
            <h1 className="text-4xl font-bold">
              Reports
            </h1>

            <p className="text-gray-500 mt-2">
              Download and analyze your business reports.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

            <div className="bg-white rounded-2xl shadow border p-6">
              <div className="flex justify-between">
                <div>
                  <p className="text-gray-500">Total Reports</p>
                  <h2 className="text-4xl font-bold mt-3">28</h2>
                </div>

                <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-white">
                  <FileText size={28} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow border p-6">
              <div className="flex justify-between">
                <div>
                  <p className="text-gray-500">PDF Reports</p>
                  <h2 className="text-4xl font-bold mt-3">12</h2>
                </div>

                <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center text-white">
                  <FileBarChart size={28} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow border p-6">
              <div className="flex justify-between">
                <div>
                  <p className="text-gray-500">Excel Reports</p>
                  <h2 className="text-4xl font-bold mt-3">16</h2>
                </div>

                <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center text-white">
                  <FileSpreadsheet size={28} />
                </div>
              </div>
            </div>

          </div>

          <div className="bg-white rounded-3xl shadow border overflow-hidden">

            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">
                Generated Reports
              </h2>
            </div>

            {reports.map((report) => (
              <div
                key={report.id}
                className="flex justify-between items-center p-6 border-b hover:bg-gray-50"
              >
                <div>
                  <h3 className="font-bold text-lg">
                    {report.title}
                  </h3>

                  <p className="text-gray-500">
                    {report.description}
                  </p>

                  <p className="text-sm text-gray-400 mt-2">
                    {report.date}
                  </p>
                </div>

                <div className="flex items-center gap-4">

                  <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-semibold">
                    {report.type}
                  </span>

                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl flex items-center gap-2">
                    <Download size={18} />
                    Download
                  </button>

                </div>
              </div>
            ))}

          </div>

        
    </div>
  );
}