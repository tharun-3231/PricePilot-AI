import {
  Database,
  CheckCircle2,
  Trash2,
} from "lucide-react";

import { useData } from "../context/DataContext";

export default function DatasetReport() {
  const { datasetInfo, cleaningReport } = useData();

  if (!datasetInfo || !cleaningReport) return null;

  return (
    <div className="bg-white rounded-3xl shadow-lg border p-6">

      <div className="flex items-center gap-3 mb-6">

        <Database className="text-blue-600" size={28} />

        <h2 className="text-2xl font-bold">
          Dataset Report
        </h2>

      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">

        <div className="bg-blue-50 rounded-2xl p-5">

          <Database className="text-blue-600 mb-3" />

          <h3 className="text-3xl font-bold">

            {datasetInfo.rows || 0}

          </h3>

          <p className="text-gray-600">

            Total Products

          </p>

        </div>

        <div className="bg-green-50 rounded-2xl p-5">

          <CheckCircle2 className="text-green-600 mb-3" />

          <h3 className="text-3xl font-bold">

            {cleaningReport.rows_after || 0}

          </h3>

          <p className="text-gray-600">

            Clean Rows

          </p>

        </div>

        <div className="bg-yellow-50 rounded-2xl p-5">

          <Trash2 className="text-yellow-600 mb-3" />

          <h3 className="text-3xl font-bold">

            {cleaningReport.duplicates_removed || 0}

          </h3>

          <p className="text-gray-600">

            Duplicates Removed

          </p>

        </div>

        <div className="bg-purple-50 rounded-2xl p-5">

          <Database className="text-purple-600 mb-3" />

          <h3 className="text-3xl font-bold">

            {datasetInfo.columns?.length || 0}

          </h3>

          <p className="text-gray-600">

            Columns

          </p>

        </div>

      </div>

    </div>
  );
}