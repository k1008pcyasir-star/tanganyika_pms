import { useState } from "react";
import logo from "../assets/logo.png";
import {
  Home,
  UserPlus,
  Calendar,
  ShieldCheck,
  FileText,
  LogOut,
  Menu,
  X,
  CheckCircle2,
} from "lucide-react";
import DashboardHome from "../pages/DashboardHome";
import OfficersPage from "../pages/OfficersPage";
import MainSchedulePage from "../pages/MainSchedulePage";
import PatrolSchedulePage from "../pages/PatrolSchedulePage";
import ReportsPage from "../pages/ReportsPage";
import { logoutAdmin } from "../services/authService";

const mainMenuItems = [
  { id: "home", label: "Home", icon: Home },
  { id: "officers", label: "Sajili Askari", icon: UserPlus },
  { id: "mainSchedule", label: "Ratiba Kuu", icon: Calendar },
  { id: "patrolSchedule", label: "Ratiba ya Doria", icon: ShieldCheck },
  { id: "reports", label: "Report", icon: FileText },
];

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <DashboardHome />;
      case "officers":
        return <OfficersPage />;
      case "mainSchedule":
        return <MainSchedulePage />;
      case "patrolSchedule":
        return <PatrolSchedulePage />;
      case "reports":
        return <ReportsPage />;
      default:
        return <DashboardHome />;
    }
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm(
      "Una uhakika unataka kutoka kwenye mfumo?"
    );

    if (!confirmLogout) return;

    logoutAdmin();
    setSidebarOpen(false);
    window.location.replace("/login");
  };

  const handleMenuClick = (itemId) => {
    setActiveTab(itemId);
    setSidebarOpen(false);
  };

  return (
    <div className="h-screen overflow-hidden bg-[#eef2f7]">
      <div
        className={`fixed inset-0 z-40 bg-slate-900/50 transition-opacity duration-300 lg:hidden ${
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      <div className="flex h-screen">
        <aside
          className={`fixed left-0 top-0 z-50 flex h-screen w-[280px] transform flex-col bg-[#0f172a] shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-5 lg:hidden">
            <h2 className="text-sm font-semibold tracking-wide text-white">
              MENU
            </h2>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="border-b border-white/10 px-5 py-6">
            <div className="flex flex-col items-center text-center">
              <img
                src={logo}
                alt="Police Logo"
                className="h-20 w-20 object-contain"
              />

              <h2 className="mt-4 text-base font-bold uppercase tracking-wide leading-6 text-white">
                Tanzania Police Force
              </h2>
            </div>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-5">
            {mainMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleMenuClick(item.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition ${
                    isActive
                      ? "bg-white font-semibold text-[#0f172a] shadow-sm"
                      : "text-slate-200 hover:bg-white/10"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="border-t border-white/10 px-4 py-4">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm text-rose-300 transition hover:bg-rose-500/10"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        <div className="flex h-screen flex-1 flex-col lg:ml-[280px]">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-8 lg:py-5">
            <div className="relative flex min-h-[56px] items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </div>

              <div className="absolute left-1/2 -translate-x-1/2 text-center">
                <h1 className="text-[15px] font-semibold text-slate-800 sm:text-lg lg:text-[24px]">
                  TANGANYIKA POLICE MANAGEMENT SYSTEM
                </h1>
              </div>

              <div className="w-10 lg:w-12" />
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6">
            <div className="mx-auto max-w-7xl space-y-4">
              {activeTab === "home" ? (
                <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800 shadow-sm">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <p className="text-sm font-medium sm:text-base">
                    Umefanikiwa kuingia kwenye mfumo.
                  </p>
                </div>
              ) : null}

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                {renderContent()}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;