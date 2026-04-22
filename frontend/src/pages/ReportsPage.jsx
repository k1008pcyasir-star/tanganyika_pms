import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  FileText,
  Eye,
  Download,
  Trash2,
  FolderOpen,
  FileSpreadsheet,
} from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import {
  fetchSchedules,
  deleteSchedule,
} from "../services/scheduleService";
import MainSchedulePDF from "./MainSchedulePDF";
import PatrolSchedulePDF from "./PatrolSchedulePDF";

function formatDate(dateStr) {
  if (!dateStr) return "";
  const value = String(dateStr).slice(0, 10);
  const [y, m, d] = value.split("-");
  if (!y || !m || !d) return value;
  return `${d}/${m}/${y}`;
}

function normalizeSchedule(item) {
  return {
    id: item.id,
    type: item.schedule_type,
    scheduleTitle: item.title,
    title: item.title,
    dateFrom: item.date_from,
    dateTo: item.date_to,
    date: item.schedule_date,
    patrolTime: item.patrol_time,
    zamuOfficer: item.zamu_officer,
    zamuOfficerPhone: item.zamu_officer_phone,
    inspectorOfficer: item.inspector_officer,
    inspectorOfficerPhone: item.inspector_officer_phone,
    ncoOfficer: item.nco_officer,
    ncoOfficerPhone: item.nco_officer_phone,
    signatureName: item.signature_name,
    signatureRank: item.signature_rank,
    signatureTitle: item.signature_title,
    fixedSections: item.fixed_sections || [],
    activeSections: item.active_sections || [],
    patrolOfficers: item.patrol_officers || [],
    createdAt: item.created_at,
  };
}

function ReportsPage() {
  const [savedSchedules, setSavedSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const data = await fetchSchedules();
      const normalized = data.map(normalizeSchedule);

      setSavedSchedules(normalized);
      setSelectedSchedule(normalized.length > 0 ? normalized[0] : null);
    } catch (error) {
      console.error(error);
      alert("Imeshindikana kusoma reports kutoka database.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSchedule = (item) => {
    setSelectedSchedule({ ...item });
  };

  const handleDelete = async (scheduleId) => {
    const confirmDelete = window.confirm(
      "Una uhakika unataka kufuta report hii?"
    );
    if (!confirmDelete) return;

    try {
      await deleteSchedule(scheduleId);

      const updated = savedSchedules.filter((item) => item.id !== scheduleId);
      setSavedSchedules(updated);

      if (selectedSchedule?.id === scheduleId) {
        setSelectedSchedule(updated.length > 0 ? { ...updated[0] } : null);
      }

      alert("Report imefutwa successfully.");
    } catch (error) {
      console.error(error);
      alert(error.message || "Imeshindikana kufuta report.");
    }
  };

  const pdfDocument = useMemo(() => {
    if (!selectedSchedule) return null;

    if (selectedSchedule.type === "main") {
      return (
        <MainSchedulePDF
          scheduleTitle={selectedSchedule.scheduleTitle}
          dateFrom={selectedSchedule.dateFrom}
          dateTo={selectedSchedule.dateTo}
          fixedSections={selectedSchedule.fixedSections || []}
          activeSections={selectedSchedule.activeSections || []}
          signatureName={selectedSchedule.signatureName}
          signatureRank={selectedSchedule.signatureRank}
          signatureTitle={selectedSchedule.signatureTitle}
        />
      );
    }

    if (selectedSchedule.type === "patrol") {
      return (
        <PatrolSchedulePDF
          title={selectedSchedule.title}
          date={selectedSchedule.date}
          patrolTime={selectedSchedule.patrolTime}
          zamuOfficer={selectedSchedule.zamuOfficer}
          zamuOfficerPhone={selectedSchedule.zamuOfficerPhone}
          inspectorOfficer={selectedSchedule.inspectorOfficer}
          inspectorOfficerPhone={selectedSchedule.inspectorOfficerPhone}
          ncoOfficer={selectedSchedule.ncoOfficer}
          ncoOfficerPhone={selectedSchedule.ncoOfficerPhone}
          patrolOfficers={selectedSchedule.patrolOfficers || []}
          signatureName={selectedSchedule.signatureName}
          signatureTitle={selectedSchedule.signatureTitle}
        />
      );
    }

    return null;
  }, [selectedSchedule]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-5 text-center shadow-sm sm:p-8">
        <h1 className="text-lg font-semibold tracking-wide text-slate-800 sm:text-2xl">
          Kumbukumbu za Reports
        </h1>
        <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
          Hapa utaona ratiba zote zilizohifadhiwa, uzifungue, uzipitie kwa
          muonekano mzuri, na kupakua PDF wakati wowote unapohitaji.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[390px_minmax(0,1fr)]">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
              <FolderOpen className="h-6 w-6 text-blue-700" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Orodha ya Reports
              </h2>
              <p className="text-sm text-slate-500">
                Main Schedule na Patrol Schedule zote
              </p>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Jumla ya Reports
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-800">
                {savedSchedules.length}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Hali ya Mfumo
              </p>
              <p className="mt-1 text-2xl font-semibold text-emerald-700">
                {loading ? "Loading..." : "Ready"}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
              Inapakia reports...
            </div>
          ) : savedSchedules.length > 0 ? (
            <div className="space-y-3">
              {savedSchedules.map((item) => {
                const isSelected = selectedSchedule?.id === item.id;

                return (
                  <div
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSelectSchedule(item)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleSelectSchedule(item);
                      }
                    }}
                    className={`cursor-pointer rounded-2xl border p-4 transition ${
                      isSelected
                        ? "border-blue-300 bg-blue-50 shadow-sm"
                        : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {item.type === "main"
                              ? "Main Schedule"
                              : "Patrol Schedule"}
                          </p>
                          <p className="mt-1 line-clamp-2 text-sm font-medium text-slate-800">
                            {item.type === "main"
                              ? item.scheduleTitle
                              : item.title}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                          }}
                          className="rounded-xl p-2 text-rose-600 transition hover:bg-rose-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <CalendarDays className="h-4 w-4" />
                        <span>
                          {item.type === "main"
                            ? `${formatDate(item.dateFrom)} - ${formatDate(item.dateTo)}`
                            : formatDate(item.date)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectSchedule(item);
                          }}
                          className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                          <Eye className="h-4 w-4" />
                          Open
                        </button>

                        {isSelected ? (
                          <span className="text-xs font-semibold text-blue-700">
                            Imefunguliwa
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
              Bado hakuna report iliyohifadhiwa.
            </div>
          )}
        </div>

        <div
          key={selectedSchedule?.id || "empty"}
          className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
        >
          {selectedSchedule ? (
            <div className="space-y-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                    <FileText className="h-4 w-4" />
                    {selectedSchedule.type === "main"
                      ? "Main Schedule"
                      : "Patrol Schedule"}
                  </div>

                  <h2 className="mt-4 text-lg font-semibold text-slate-800 sm:text-xl">
                    {selectedSchedule.type === "main"
                      ? selectedSchedule.scheduleTitle
                      : selectedSchedule.title}
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Report iliyochaguliwa kwa preview na upakuaji wa PDF.
                  </p>
                </div>

                {pdfDocument ? (
                  <PDFDownloadLink
                    document={pdfDocument}
                    fileName={`report-${selectedSchedule.id}.pdf`}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1f2f86] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#18256a]"
                  >
                    {({ loading: pdfLoading }) => (
                      <>
                        <Download className="h-4 w-4" />
                        {pdfLoading ? "Inaandaa PDF..." : "Download PDF"}
                      </>
                    )}
                  </PDFDownloadLink>
                ) : null}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Tarehe
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-800">
                    {selectedSchedule.type === "main"
                      ? `${formatDate(selectedSchedule.dateFrom)} - ${formatDate(
                          selectedSchedule.dateTo
                        )}`
                      : formatDate(selectedSchedule.date)}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Aina ya Report
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-800">
                    {selectedSchedule.type === "main"
                      ? "Main Schedule"
                      : "Patrol Schedule"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Idadi ya Vipengele
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-800">
                    {selectedSchedule.type === "main"
                      ? `${selectedSchedule.activeSections?.length || 0} sections`
                      : `${selectedSchedule.patrolOfficers?.length || 0} askari`}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Muonekano
                  </p>
                  <p className="mt-2 text-sm font-medium text-emerald-700">
                    Ready
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5">
                <h3 className="text-base font-semibold text-slate-800">
                  Muhtasari wa Report
                </h3>

                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <p>
                    <span className="font-semibold text-slate-800">Jina:</span>{" "}
                    {selectedSchedule.type === "main"
                      ? selectedSchedule.scheduleTitle
                      : selectedSchedule.title}
                  </p>

                  <p>
                    <span className="font-semibold text-slate-800">Tarehe:</span>{" "}
                    {selectedSchedule.type === "main"
                      ? `${formatDate(selectedSchedule.dateFrom)} hadi ${formatDate(
                          selectedSchedule.dateTo
                        )}`
                      : formatDate(selectedSchedule.date)}
                  </p>

                  {selectedSchedule.type === "patrol" &&
                  selectedSchedule.patrolTime ? (
                    <p>
                      <span className="font-semibold text-slate-800">
                        Muda wa Doria:
                      </span>{" "}
                      {selectedSchedule.patrolTime}
                    </p>
                  ) : null}

                  {selectedSchedule.type === "patrol" &&
                  selectedSchedule.ncoOfficer ? (
                    <p>
                      <span className="font-semibold text-slate-800">
                        NCO wa Zamu:
                      </span>{" "}
                      {selectedSchedule.ncoOfficer}
                      {selectedSchedule.ncoOfficerPhone
                        ? ` - ${selectedSchedule.ncoOfficerPhone}`
                        : ""}
                    </p>
                  ) : null}

                  {selectedSchedule.type === "main" ? (
                    <p>
                      <span className="font-semibold text-slate-800">
                        Sections zilizopangwa:
                      </span>{" "}
                      {selectedSchedule.activeSections?.length || 0}
                    </p>
                  ) : (
                    <p>
                      <span className="font-semibold text-slate-800">
                        Askari wa Doria:
                      </span>{" "}
                      {selectedSchedule.patrolOfficers?.length || 0}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center">
              <FileSpreadsheet className="h-10 w-10 text-slate-400" />
              <p className="mt-4 text-sm font-medium text-slate-600">
                Chagua report kutoka upande wa kushoto ili kuiona hapa.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReportsPage;