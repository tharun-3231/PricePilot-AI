import {
  Bell,
  Search,
  Moon,
  Settings,
  ChevronDown,
  Plus,
} from "lucide-react";

export default function Topbar() {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-200">
      <div className="h-20 px-8 flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Welcome back, Tharun 👋
          </p>
        </div>

        <div className="flex items-center gap-4">

          <div className="relative">

            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />

            <input
              placeholder="Search products..."
              className="w-80 pl-11 pr-4 py-3 rounded-xl bg-gray-100 border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>

          <button className="w-11 h-11 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition">
            <Moon size={19} />
          </button>

          <button className="relative w-11 h-11 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition">

            <Bell size={20} />

            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500"></span>

          </button>

          <button className="w-11 h-11 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition">
            <Settings size={19} />
          </button>

          <button className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-xl text-white font-semibold flex items-center gap-2 transition shadow-lg">
            <Plus size={18} />
            Add Product
          </button>

          <div className="flex items-center gap-3 ml-2 cursor-pointer">

            <img
              src="https://i.pravatar.cc/150?img=12"
              alt="Profile"
              className="w-11 h-11 rounded-full border-2 border-blue-500"
            />

            <div>
              <h3 className="font-semibold text-sm">
                Tharun
              </h3>

              <p className="text-xs text-gray-500">
                Admin
              </p>
            </div>

            <ChevronDown size={18} />

          </div>

        </div>

      </div>
    </header>
  );
}