import {
  LayoutDashboard,
  Package,
  Brain,
  Bell,
  BarChart3,
  Users,
  FileText,
  Settings,
  LogOut,
  Sparkles,
  Bot,
  TrendingUp,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { useEffect, useRef } from "react";

const menu = [
  {
    name: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Products",
    path: "/products",
    icon: Package,
  },
  {
    name: "Price Alerts",
    path: "/alerts",
    icon: Bell,
  },
  {
    name: "Analytics",
    path: "/analytics",
    icon: BarChart3,
  },
  {
    name: "Competitors",
    path: "/competitors",
    icon: Users,
  },
  {
    name: "Reports",
    path: "/reports",
    icon: FileText,
  },
  {
    name: "Settings",
    path: "/settings",
    icon: Settings,
  },
  {
    name: "AI Prediction",
    path: "/price-prediction",
    icon: Brain,
  },
  {
    name: "Forecast",
    path: "/forecast",
    icon: TrendingUp,
  },
  {
    name: "AI Assistant",
    path: "/ai-assistant",
    icon: Bot,
  },
];

export default function Sidebar() {
  const navRef = useRef(null);

  useEffect(() => {
    const savedScroll = sessionStorage.getItem("sidebar-scroll");

    if (savedScroll && navRef.current) {
      navRef.current.scrollTop = Number(savedScroll);
    }
  }, []);

  const handleScroll = () => {
    if (navRef.current) {
      sessionStorage.setItem(
        "sidebar-scroll",
        navRef.current.scrollTop
      );
    }
  };

  return (
    <aside className="fixed left-0 top-0 w-72 h-screen bg-white border-r border-gray-200 flex flex-col">

      {/* Logo */}
      <div className="px-7 py-8 border-b flex-shrink-0">

        <div className="flex items-center gap-3">

          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg">
            <Sparkles className="text-white" size={24} />
          </div>

          <div>
            <h1 className="font-bold text-2xl text-gray-900">
              PricePilot
            </h1>

            <p className="text-sm text-gray-500">
              AI Pricing Platform
            </p>
          </div>

        </div>

      </div>

      {/* Scrollable Menu */}
      <div className="flex-1 overflow-hidden">

        <nav
          ref={navRef}
          onScroll={handleScroll}
          className="h-full overflow-y-auto px-4 py-6"
        >
          {menu.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-5 py-4 rounded-xl mb-2 transition-all duration-200 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-gray-600 hover:bg-gray-100 hover:text-black"
                  }`
                }
              >
                <Icon size={21} />

                <span className="font-medium">
                  {item.name}
                </span>
              </NavLink>
            );
          })}
        </nav>

      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t flex-shrink-0">

        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl p-3 text-white mb-3">

          <h2 className="font-semibold text-sm">
            Pro Plan
          </h2>

          <p className="text-[11px] opacity-90 mt-1">
            Unlock AI Features
          </p>

          <button className="mt-2 w-full bg-white text-blue-600 rounded-lg py-2 text-xs font-semibold hover:bg-gray-100 transition">
            Upgrade
          </button>

        </div>

        <button className="w-full flex items-center justify-center gap-2 border rounded-xl py-3 hover:bg-red-50 text-gray-700 hover:text-red-600 transition">

          <LogOut size={18} />

          Logout

        </button>

      </div>

    </aside>
  );
}