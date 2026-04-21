import { useEffect, useMemo, useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import {
  CalendarDays,
  Plus,
  Eye,
  ArrowLeft,
  X,
  Download,
  Save,
  Users,
  Clock3,
  ShieldCheck,
  BadgeInfo,
  CheckCircle2,
} from "lucide-react";
import PatrolSchedulePDF from "./PatrolSchedulePDF";
import { fetchOfficers } from "../services/officerService";
import { createSchedule } from "../services/scheduleService";

const ranksWithoutForceNumber = [
  "S/SGT",
  "A/INSP",
  "INSP",
  "ASP",
  "SP",
  "SSP",
];

const patrolTimeOptions = [
  "06:00 HRS - 18:00 HRS",
  "18:00 HRS - 06:00 HRS",
  "CUSTOM",
];

function formatNameWithInitials(fullName) {
  const parts = (fullName || "")
    .trim()
    .toUpperCase()
    .split(" ")
    .filter(Boolean);

  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0][0]}. ${parts[1]}`;

  const lastName = parts[parts.length - 1];
  const initials = parts
    .slice(0, -1)
    .map((name) => `${name[0]}.`)
    .join("");

  return `${initials} ${lastName}`;
}

function formatOfficerLabel(officer) {
  const rank = officer.rank?.trim().toUpperCase() || "";
  const fullName = officer.fullName?.trim().toUpperCase() || "";
  const forceNumber = officer.forceNumber?.trim().toUpperCase() || "";

  const nameParts = fullName.split(" ").filter(Boolean);
  const firstName = nameParts[0] || "";

  if (ranksWithoutForceNumber.includes(rank)) {
    return `${rank} ${formatNameWithInitials(fullName)}`.trim();
  }

  return `${forceNumber} ${rank} ${firstName}`.trim();
}

function PatrolSchedulePage() {
  const [mode, setMode] = useState("edit");
  const [title, setTitle] = useState("MPANGO KAZI WA MAOFISA WA ZAMU NA DORIA");
  const [date, setDate] = useState("2026-04-19");

  const [patrolTimeOption, setPatrolTimeOption] = useState("06:00 HRS - 18:00 HRS");
  const [customPatrolTime, setCustomPatrolTime] = useState("");

  const [zamuOfficer, setZamuOfficer] = useState("ASP. M.G MIRUMBE");
  const [zamuOfficerPhone, setZamuOfficerPhone] = useState("0763021470");

  const [inspectorOfficer, setInspectorOfficer] = useState("A/INSP MAARUFU");
  const [inspectorOfficerPhone, setInspectorOfficerPhone] = useState("0767376161");

  const [signatureName, setSignatureName] = useState("Paul T. Mashimbi - SSP");
  const [signatureTitle, setSignatureTitle] = useState(
    "MKUU WA KITUO CHA POLISI TANGANYIKA"
  );

  const [officersPool, setOfficersPool] = useState([]);
  const [officersLoading, setOfficersLoading] = useState(true);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState("");
  const [manualOfficer, setManualOfficer] = useState("");
  const [patrolOfficers, setPatrolOfficers] = useState([]);
  const [officerSearch, setOfficerSearch] = useState("");

  useEffect(() => {
    loadOfficersFromBackend();
  }, []);

  const loadOfficersFromBackend = async () => {
    try {
      setOfficersLoading(true);

      const backendOfficers = await fetchOfficers();

      const normalized = backendOfficers.map((officer) => {
        const mappedOfficer = {
          id: officer.id,
          forceNumber: officer.force_number || "",
          fullName: officer.full_name || "",
          rank: officer.rank || "",
        };

        return {
          id: mappedOfficer.id,
          label: formatOfficerLabel(mappedOfficer),
          forceNumber: mappedOfficer.forceNumber,
          fullName: mappedOfficer.fullName,
          rank: mappedOfficer.rank,
        };
      });

      setOfficersPool(normalized);
    } catch (error) {
      console.error(error);
      alert("Imeshindikana kusoma askari kutoka database.");
    } finally {
      setOfficersLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  };

  const patrolTime =
    patrolTimeOption === "CUSTOM" ? customPatrolTime.trim() : patrolTimeOption;

  const availableOfficers = useMemo(() => {
    const query = officerSearch.trim().toLowerCase();

    return officersPool.filter((officer) => {
      const alreadyAdded = patrolOfficers.some(
        (item) => item.toLowerCase() === officer.label.toLowerCase()
      );

      if (alreadyAdded) return false;

      if (!query) return true;

      return (
        officer.label.toLowerCase().includes(query) ||
        officer.fullName.toLowerCase().includes(query) ||
        officer.rank.toLowerCase().includes(query) ||
        officer.forceNumber.toLowerCase().includes(query)
      );
    });
  }, [officersPool, patrolOfficers, officerSearch]);

  const addOfficerToPatrol = () => {
    if (!selectedOfficer) {
      alert("Chagua askari kwanza.");
      return;
    }

    const exists = patrolOfficers.some(
      (officer) => officer.toLowerCase() === selectedOfficer.toLowerCase()
    );

    if (exists) {
      alert("Askari huyu tayari yupo kwenye ratiba ya doria.");
      return;
    }

    setPatrolOfficers((prev) => [...prev, selectedOfficer]);
    setSelectedOfficer("");
    setOfficerSearch("");
  };

  const addManualOfficerToPatrol = () => {
    const officerName = manualOfficer.trim().toUpperCase();

    if (!officerName) {
      alert("Andika jina la askari kwanza.");
      return;
    }

    const exists = patrolOfficers.some(
      (officer) => officer.toLowerCase() === officerName.toLowerCase()
    );

    if (exists) {
      alert("Askari huyu tayari yupo kwenye ratiba ya doria.");
      return;
    }

    setPatrolOfficers((prev) => [...prev, officerName]);
    setManualOfficer("");
  };

  const removeOfficerFromPatrol = (indexToRemove) => {
    setPatrolOfficers((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  const savePatrolSchedule = async () => {
    if (!title.trim()) {
      alert("Jaza jina la ratiba kwanza.");
      return;
    }

    if (!date) {
      alert("Jaza tarehe ya doria.");
      return;
    }

    try {
      setSavingSchedule(true);

      await createSchedule({
        schedule_type: "patrol",
        title,
        schedule_date: date,
        patrol_time: patrolTime,
        zamu_officer: zamuOfficer,
        zamu_officer_phone: zamuOfficerPhone,
        inspector_officer: inspectorOfficer,
        inspector_officer_phone: inspectorOfficerPhone,
        signature_name: signatureName,
        signature_title: signatureTitle,
        patrol_officers: patrolOfficers,
      });

      alert("Patrol Schedule imehifadhiwa kwenye database.");
    } catch (error) {
      console.error(error);
      alert(error.message || "Imeshindikana kuhifadhi Patrol Schedule.");
    } finally {
      setSavingSchedule(false);
    }
  };

  const pdfDocument = (
    <PatrolSchedulePDF
      title={title}
      date={date}
      patrolTime={patrolTime}
      zamuOfficer={zamuOfficer}
      zamuOfficerPhone={zamuOfficerPhone}
      inspectorOfficer={inspectorOfficer}
      inspectorOfficerPhone={inspectorOfficerPhone}
      patrolOfficers={patrolOfficers}
      signatureName={signatureName}
      signatureTitle={signatureTitle}
    />
  );

  if (mode === "preview") {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-800 sm:text-2xl">
              Preview ya Ratiba ya Doria
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Hakiki muonekano wa mwisho kabla ya kuhifadhi au kupakua PDF
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setMode("edit")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Edit
            </button>

            <button
              type="button"
              onClick={savePatrolSchedule}
              disabled={savingSchedule}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Save className="h-4 w-4" />
              {savingSchedule ? "Inahifadhi..." : "Save Schedule"}
            </button>

            <PDFDownloadLink
              document={pdfDocument}
              fileName={`patrol-schedule-${date}.pdf`}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1f2f86] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#18256a]"
            >
              {({ loading }) => (
                <>
                  <Download className="h-4 w-4" />
                  {loading ? "Inaandaa PDF..." : "Download PDF"}
                </>
              )}
            </PDFDownloadLink>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-100 p-3 shadow-sm sm:p-6">
          <div
            className="mx-auto min-h-[297mm] w-full max-w-[210mm] bg-white p-4 text-black sm:p-[16mm]"
            style={{ fontFamily: '"Times New Roman", Times, serif' }}
          >
            <div className="text-left">
              <h2 className="text-[16px] font-bold uppercase underline leading-tight sm:text-[18px]">
                {title}
                {date ? ` LEO TAREHE ${formatDate(date)}` : ""}
              </h2>
            </div>

            <div className="mt-4 space-y-2 text-[14px] leading-relaxed">
              {patrolTime ? <p>• MUDA WA DORIA - {patrolTime}</p> : null}

              <p>
                • AFISA WA ZAMU - {zamuOfficer || "........................"}
                {zamuOfficerPhone ? ` - SIMU NO ${zamuOfficerPhone}` : ""}
              </p>
              <p>
                • MKAAGUZI WA ZAMU -{" "}
                {inspectorOfficer || "........................"}
                {inspectorOfficerPhone ? ` - SIMU NO ${inspectorOfficerPhone}` : ""}
              </p>
            </div>

            <div className="mt-6">
              {patrolOfficers.length > 0 ? (
                <ol className="space-y-2 pl-6 text-[14px] leading-relaxed">
                  {patrolOfficers.map((officer, index) => (
                    <li key={index}>{officer}</li>
                  ))}
                </ol>
              ) : (
                <div className="space-y-2 text-[14px]">
                  <p>1. ........................</p>
                  <p>2. ........................</p>
                  <p>3. ........................</p>
                </div>
              )}
            </div>

            <div className="mt-20 text-center">
              <p className="text-[14px]">....................................</p>
              <p className="mt-2 text-[14px]">
                {signatureName || "........................"}
              </p>
              <p className="mt-2 text-[14px] font-bold uppercase">
                {signatureTitle}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-5 text-center shadow-sm sm:p-8">
        <h1 className="text-lg font-semibold tracking-wide text-slate-800 sm:text-2xl">
          Usimamizi wa Ratiba ya Doria
        </h1>
        <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
          Tayarisha ratiba ya doria ya siku, weka muda, maofisa wa zamu,
          chagua askari, kisha preview au hifadhi kwa muonekano wa kitaalamu.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Hali ya Mfumo
          </p>
          <p className="mt-1 text-sm font-semibold text-emerald-700">
            {officersLoading ? "Inapakia askari..." : "Ready"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setMode("preview")}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1f2f86] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#18256a]"
        >
          <Eye className="h-4 w-4" />
          Preview
        </button>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
            <CalendarDays className="h-6 w-6 text-blue-700" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Taarifa za Doria
            </h2>
            <p className="text-sm text-slate-500">
              Rekebisha heading, tarehe, muda wa doria, maofisa wa zamu na signature
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Jina la Ratiba
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value.toUpperCase())}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Tarehe
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10"
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Muda wa Doria
            </label>
            <select
              value={patrolTimeOption}
              onChange={(e) => setPatrolTimeOption(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10"
            >
              {patrolTimeOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "CUSTOM" ? "ANDIKA MUDA MWINGINE" : option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Muda wa Doria (Custom)
            </label>
            <input
              type="text"
              value={customPatrolTime}
              onChange={(e) => setCustomPatrolTime(e.target.value.toUpperCase())}
              placeholder="Mfano: 08:00 HRS - 16:00 HRS"
              disabled={patrolTimeOption !== "CUSTOM"}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Afisa wa Zamu
            </label>
            <input
              type="text"
              value={zamuOfficer}
              onChange={(e) => setZamuOfficer(e.target.value.toUpperCase())}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Simu ya Afisa wa Zamu
            </label>
            <input
              type="text"
              value={zamuOfficerPhone}
              onChange={(e) => setZamuOfficerPhone(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10"
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Mkaaguzi wa Zamu
            </label>
            <input
              type="text"
              value={inspectorOfficer}
              onChange={(e) => setInspectorOfficer(e.target.value.toUpperCase())}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Simu ya Mkaaguzi wa Zamu
            </label>
            <input
              type="text"
              value={inspectorOfficerPhone}
              onChange={(e) => setInspectorOfficerPhone(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10"
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Jina la Msaini
            </label>
            <input
              type="text"
              value={signatureName}
              onChange={(e) => setSignatureName(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Wadhifa wa Msaini
            </label>
            <input
              type="text"
              value={signatureTitle}
              onChange={(e) => setSignatureTitle(e.target.value.toUpperCase())}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10"
            />
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50">
            <Users className="h-6 w-6 text-slate-700" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Ongeza Askari wa Doria
            </h2>
            <p className="text-sm text-slate-500">
              Chagua askari kutoka orodha ya waliosajiliwa au andika manual
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <label className="text-sm font-medium text-slate-700">
                Chagua Kutoka Orodha
              </label>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={officerSearch}
                onChange={(e) => setOfficerSearch(e.target.value)}
                placeholder={officersLoading ? "Inapakia askari..." : "Tafuta askari..."}
                disabled={officersLoading}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10 disabled:cursor-not-allowed disabled:bg-slate-100"
              />

              <div className="max-h-56 overflow-y-auto rounded-2xl border border-slate-200 bg-white">
                {availableOfficers.length > 0 ? (
                  availableOfficers.slice(0, 20).map((officer) => (
                    <button
                      key={officer.id}
                      type="button"
                      onClick={() => setSelectedOfficer(officer.label)}
                      className={`flex w-full items-start justify-between gap-3 border-b border-slate-100 px-4 py-3 text-left text-sm transition last:border-b-0 ${
                        selectedOfficer === officer.label
                          ? "bg-blue-50 text-[#1f2f86]"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="break-words">{officer.label}</span>
                      {selectedOfficer === officer.label ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                      ) : null}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-4 text-sm text-slate-500">
                    Hakuna askari aliyepatikana.
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-700">
                  {selectedOfficer || "Hakuna askari aliyechaguliwa"}
                </div>

                <button
                  type="button"
                  onClick={addOfficerToPatrol}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1f2f86] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#18256a]"
                >
                  <Plus className="h-4 w-4" />
                  Ongeza
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <BadgeInfo className="h-4 w-4 text-slate-500" />
              <label className="text-sm font-medium text-slate-700">
                Andika Manual
              </label>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={manualOfficer}
                onChange={(e) => setManualOfficer(e.target.value)}
                placeholder="Mfano: H.5809 D/CPL RAHIMU - DEREVA"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10"
              />

              <button
                type="button"
                onClick={addManualOfficerToPatrol}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
            <ShieldCheck className="h-6 w-6 text-blue-700" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Orodha ya Askari wa Doria
            </h2>
            <p className="text-sm text-slate-500">
              Askari waliopo kwenye ratiba ya siku hii
            </p>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Jumla ya Askari
            </p>
            <p className="mt-2 text-xl font-semibold text-slate-800">
              {patrolOfficers.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-slate-500" />
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Muda wa Doria
              </p>
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-800">
              {patrolTime || "-"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Hali ya Mfumo
            </p>
            <p className="mt-2 text-sm font-semibold text-emerald-700">
              {officersLoading ? "Loading..." : "Ready"}
            </p>
          </div>
        </div>

        {patrolOfficers.length > 0 ? (
          <ol className="space-y-2">
            {patrolOfficers.map((officer, index) => (
              <li
                key={index}
                className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-800 transition hover:bg-slate-100"
              >
                <span>
                  {index + 1}. {officer}
                </span>

                <button
                  type="button"
                  onClick={() => removeOfficerFromPatrol(index)}
                  className="rounded-lg p-1 text-rose-600 transition hover:bg-rose-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ol>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
            Bado hakuna askari waliowekwa kwenye ratiba ya doria.
          </div>
        )}
      </div>
    </div>
  );
}

export default PatrolSchedulePage;