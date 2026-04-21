import { useEffect, useState } from "react";
import { Users, CalendarDays, ShieldCheck } from "lucide-react";
import { fetchOfficerStats } from "../services/officerService";

function DashboardHome() {
  const [statsData, setStatsData] = useState({
    totalOfficers: 0,
    totalMainSchedules: 0,
    totalPatrolSchedules: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchOfficerStats();
        setStatsData({
          totalOfficers: data.totalOfficers || 0,
          totalMainSchedules: data.totalMainSchedules || 0,
          totalPatrolSchedules: data.totalPatrolSchedules || 0,
        });
      } catch (error) {
        console.error("Failed to load dashboard stats:", error);
      }
    };

    loadStats();
  }, []);

  const stats = [
    {
      id: 1,
      title: "Jumla ya Askari",
      value: statsData.totalOfficers,
      icon: Users,
      bg: "bg-blue-50",
      iconColor: "text-blue-700",
      border: "border-blue-100",
    },
    {
      id: 2,
      title: "Ratiba Kuu",
      value: statsData.totalMainSchedules,
      icon: CalendarDays,
      bg: "bg-emerald-50",
      iconColor: "text-emerald-700",
      border: "border-emerald-100",
    },
    {
      id: 3,
      title: "Ratiba ya Doria",
      value: statsData.totalPatrolSchedules,
      icon: ShieldCheck,
      bg: "bg-amber-50",
      iconColor: "text-amber-700",
      border: "border-amber-100",
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-5 text-center shadow-sm sm:p-8">
        <h1 className="text-lg font-semibold tracking-wide text-slate-800 sm:text-2xl">
          Karibu kwenye Mfumo wa Usimamizi wa Polisi Tanganyika
        </h1>
        <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
          Mfumo huu unakuwezesha kuandaa ratiba
          kuu, kuratibu doria, na kufuatilia reports za ratiba za nyuma zilizopita
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.id}
              className={`rounded-3xl border ${item.border} bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:p-6`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-500">
                    {item.title}
                  </p>
                  <h2 className="mt-4 text-3xl font-semibold leading-none text-slate-800 sm:text-4xl">
                    {item.value}
                  </h2>
                </div>

                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${item.bg} sm:h-14 sm:w-14`}
                >
                  <Icon className={`h-6 w-6 ${item.iconColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <h3 className="text-center text-lg font-semibold text-slate-800 sm:text-xl">
          Muhtasari wa Mfumo
        </h3>
        <p className="mx-auto mt-4 max-w-4xl text-center text-sm leading-7 text-slate-600 sm:text-base">
          Kupitia mfumo huu, utaweza kufanya usajili wa askari, kuandaa ratiba
          kuu kwa ufanisi, kusimamia ratiba za doria za kila siku, na kuona
          taarifa muhimu za mfumo kwa utaratibu mzuri na wa kitaalamu.
        </p>
      </div>
    </div>
  );
}

export default DashboardHome;