import { BrowserRouter, Routes, Route } from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";

import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Analytics from "./pages/Analytics";
import Alerts from "./pages/Alerts";
import CompetitorAnalysis from "./pages/CompetitorAnalysis";
import PricePrediction from "./pages/PricePrediction";
import Forecast from "./pages/Forecast";
import AIAssistant from "./pages/AIAssistant";

import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<DashboardLayout />}>

          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/competitors" element={<CompetitorAnalysis />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/price-prediction" element={<PricePrediction />} />
          <Route path="/forecast" element={<Forecast />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;