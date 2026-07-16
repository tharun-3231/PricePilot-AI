
import {
  User,
  Bell,
  Shield,
  Moon,
  Globe,
  Save,
} from "lucide-react";

export default function Settings() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50">

          <div className="mb-8">
            <h1 className="text-4xl font-bold">
              Settings
            </h1>

            <p className="text-gray-500 mt-2">
              Manage your account and application preferences.
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

            <div className="xl:col-span-2 space-y-8">

              <div className="bg-white rounded-3xl shadow border p-8">

                <div className="flex items-center gap-3 mb-6">
                  <User className="text-blue-600" />
                  <h2 className="text-2xl font-bold">
                    Profile Information
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-6">

                  <input
                    placeholder="Full Name"
                    defaultValue="Tharun"
                    className="border rounded-xl p-4"
                  />

                  <input
                    placeholder="Email"
                    defaultValue="tharun@example.com"
                    className="border rounded-xl p-4"
                  />

                  <input
                    placeholder="Company"
                    defaultValue="PricePilot AI"
                    className="border rounded-xl p-4"
                  />

                  <input
                    placeholder="Phone"
                    defaultValue="+91 9876543210"
                    className="border rounded-xl p-4"
                  />

                </div>

              </div>

              <div className="bg-white rounded-3xl shadow border p-8">

                <div className="flex items-center gap-3 mb-6">
                  <Bell className="text-orange-500" />
                  <h2 className="text-2xl font-bold">
                    Notifications
                  </h2>
                </div>

                <div className="space-y-5">

                  <label className="flex justify-between">
                    <span>Email Notifications</span>
                    <input type="checkbox" defaultChecked />
                  </label>

                  <label className="flex justify-between">
                    <span>Price Alerts</span>
                    <input type="checkbox" defaultChecked />
                  </label>

                  <label className="flex justify-between">
                    <span>Weekly Reports</span>
                    <input type="checkbox" />
                  </label>

                </div>

              </div>

            </div>

            <div className="space-y-8">

              <div className="bg-white rounded-3xl shadow border p-8">

                <div className="flex items-center gap-3 mb-6">
                  <Moon className="text-purple-600" />
                  <h2 className="text-xl font-bold">
                    Appearance
                  </h2>
                </div>

                <select className="w-full border rounded-xl p-4">
                  <option>Light Theme</option>
                  <option>Dark Theme</option>
                  <option>System Default</option>
                </select>

              </div>

              <div className="bg-white rounded-3xl shadow border p-8">

                <div className="flex items-center gap-3 mb-6">
                  <Globe className="text-green-600" />
                  <h2 className="text-xl font-bold">
                    Language
                  </h2>
                </div>

                <select className="w-full border rounded-xl p-4">
                  <option>English</option>
                  <option>Telugu</option>
                  <option>Hindi</option>
                </select>

              </div>

              <div className="bg-white rounded-3xl shadow border p-8">

                <div className="flex items-center gap-3 mb-6">
                  <Shield className="text-red-600" />
                  <h2 className="text-xl font-bold">
                    Security
                  </h2>
                </div>

                <button className="w-full py-3 rounded-xl bg-red-100 text-red-600">
                  Change Password
                </button>

              </div>

              <button className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl text-lg font-semibold shadow-lg">
                <Save size={20} />
                Save Settings
              </button>

            </div>

          </div>

    </div>
  );
}