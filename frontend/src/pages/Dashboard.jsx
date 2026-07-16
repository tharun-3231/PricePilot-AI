import StatsCard from "../components/StatsCard";
import RevenueChart from "../components/RevenueChart";
import ProductTable from "../components/ProductTable";
import AIInsights from "../components/AIInsights";
import RecentActivity from "../components/RecentActivity";
import CompetitorComparison from "../components/CompetitorComparison";

export default function Dashboard() {
  return (
    <>
      <StatsCard />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-8">
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
  );
}