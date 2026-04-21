import { useEffect, useMemo, useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import {
  CalendarDays,
  Plus,
  Trash2,
  Eye,
  ArrowLeft,
  AlertTriangle,
  X,
  Download,
  Save,
  LayoutGrid,
  Users,
  BadgeInfo,
  CheckCircle2,
} from "lucide-react";
import MainSchedulePDF from "./MainSchedulePDF";
import { fetchOfficers } from "../services/officerService";
import { createSchedule } from "../services/scheduleService";
import {
  fetchLatestRotations,
  createRotationHistory,
} from "../services/rotationService";

const fixedSections = [
  { key: "ocd", title: "OCD", value: "P.T MASHIMBI – SSP" },
  { key: "ocs", title: "OCS", value: "N.P KIBIRITI – SP" },
  { key: "dto", title: "DTO", value: "Y.A SOLLY – SP" },
  { key: "oppOfficer", title: "OPP OFFICER", value: "H.B MKOLE – SP" },
  { key: "dfbo", title: "DFBO", value: "B.B MWALUPALE – SP" },
  { key: "polisiJamii", title: "POLISI JAMII W'", value: "A.A JUAKALI – SP" },
  { key: "ocCid", title: "OC-CID", value: "M.G MIRUMBE – ASP" },
  { key: "kataKabungu", title: "POLISI KATA KABUNGU", value: "A.L BALELE – INSP" },
  { key: "kataTongwe", title: "POLISI KATA TONGWE", value: "R.B MAARUFU – A/INSP" },
  { key: "kataMpanda", title: "POLISI KATA MPANDA NDOGO", value: "INSP R.J MAPUNDA" },
  { key: "mkuuKambi", title: "MKUU WA KAMBI", value: "F.4848 S/SGT MMARI M.G" },
  {
    key: "armourer",
    title: "ARMOURER / VIELELEZO",
    value: ["F.6702 D/SGT JAPHET", "J.1212 CPL DONALD"],
  },
  {
    key: "masijala",
    title: "MASIJALA YA OCD",
    value: ["J.65 SGT SALUM", "J.9078 PC GEOFREY"],
  },
  { key: "mhasibu", title: "MHASIBU", value: "WP.12288 D/CPL FATUMA" },
];

const sectionOptions = [
  { name: "OFFICE YA TRAFFIC", group: "OTHER" },
  { name: "MADEREVA", group: "OTHER" },
  { name: "OFFICE YA CID", group: "OTHER" },
  { name: "ULINZI KITUO (06:00HRS-18:00HRS)", group: "ULINZI_KITUO" },
  { name: "ULINZI KITUO (18:00HRS-06:00HRS)", group: "ULINZI_KITUO" },
  { name: "CRO SHIFT No. 1", group: "CRO" },
  { name: "CRO SHIFT No. 2", group: "CRO" },
  { name: "CRO SHIFT No. 3", group: "CRO" },
  { name: "CRO SHIFT No. 4", group: "CRO" },
  { name: "ASKARI WA CRT / MAHAKAMANI", group: "MAHAKAMANI" },
  { name: "LUHAFWE KWA MCHINA", group: "OTHER" },
  { name: "LINDO KAPUFI MINING", group: "OTHER" },
  { name: "UTAYARI AWAMU YA PILI", group: "OTHER" },
  {
    name: "ULINZI MAKAZI YA DC TANGANYIKA (06:00HRS-18:00HRS)",
    group: "ULINZI_DC_DAY",
  },
  {
    name: "LINDO MAKAZI YA DC TANGANYIKA (18:00HRS-06:00HRS)",
    group: "ULINZI_DC_NIGHT",
  },
  { name: "MAFUNZO DPA", group: "OTHER" },
  { name: "MAFUNZO CHUO CHA POLISI ZANZIBAR", group: "OTHER" },
  { name: "MASOMONI TPS-MOSHI", group: "OTHER" },
  { name: "MASOMONI KIDATU", group: "OTHER" },
  { name: "RUHUSA", group: "OTHER" },
  { name: "MGONJWA KAMBINI", group: "OTHER" },
];

const ranksWithoutForceNumber = [
  "S/SGT",
  "A/INSP",
  "INSP",
  "ASP",
  "SP",
  "SSP",
];

const rotationGroups = [
  "CRO",
  "ULINZI_KITUO",
  "MAHAKAMANI",
  "ULINZI_DC_DAY",
  "ULINZI_DC_NIGHT",
];

const sectionOrder = [
  "OFFICE YA TRAFFIC",
  "MADEREVA",
  "CRO SHIFT No. 1",
  "CRO SHIFT No. 2",
  "CRO SHIFT No. 3",
  "CRO SHIFT No. 4",
  "OFFICE YA CID",
  "ULINZI KITUO (06:00HRS-18:00HRS)",
  "ULINZI KITUO (18:00HRS-06:00HRS)",
  "ASKARI WA CRT / MAHAKAMANI",
  "LUHAFWE KWA MCHINA",
  "LINDO KAPUFI MINING",
  "UTAYARI AWAMU YA PILI",
  "ULINZI MAKAZI YA DC TANGANYIKA (06:00HRS-18:00HRS)",
  "LINDO MAKAZI YA DC TANGANYIKA (18:00HRS-06:00HRS)",
  "MAFUNZO DPA",
  "MAFUNZO CHUO CHA POLISI ZANZIBAR",
  "MASOMONI TPS-MOSHI",
  "MASOMONI KIDATU",
  "RUHUSA",
  "MGONJWA KAMBINI",
];

function sortSections(sections) {
  return [...sections].sort((a, b) => {
    const aIndex = sectionOrder.indexOf(a.name);
    const bIndex = sectionOrder.indexOf(b.name);
    const safeA = aIndex === -1 ? 999 : aIndex;
    const safeB = bIndex === -1 ? 999 : bIndex;
    return safeA - safeB;
  });
}

function formatFixedValue(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    if (value.includes(",")) {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return [value];
  }
  return [];
}

function getSectionGroup(sectionName) {
  const found = sectionOptions.find((s) => s.name === sectionName);
  return found ? found.group : "OTHER";
}

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

function MainSchedulePage() {
  const [mode, setMode] = useState("edit");
  const [scheduleTitle, setScheduleTitle] = useState(
    "MPANGO KAZI WA KITUO CHA POLISI TANGANYIKA"
  );
  const [dateFrom, setDateFrom] = useState("2026-04-20");
  const [dateTo, setDateTo] = useState("2026-04-26");
  const [selectedSection, setSelectedSection] = useState("");
  const [customSection, setCustomSection] = useState("");
  const [signatureName, setSignatureName] = useState("N. P KIBIRITI");
  const [signatureRank, setSignatureRank] = useState("SP");
  const [signatureTitle, setSignatureTitle] = useState(
    "MKUU WA KITUO CHA POLISI TANGANYIKA"
  );

  const [officersPool, setOfficersPool] = useState([]);
  const [officersLoading, setOfficersLoading] = useState(true);
  const [savingSchedule, setSavingSchedule] = useState(false);

  const [activeSections, setActiveSections] = useState([
    {
      id: Date.now(),
      name: "OFFICE YA TRAFFIC",
      group: "OTHER",
      officers: [],
      selectedOfficer: "",
      warnings: [],
    },
  ]);

  useEffect(() => {
    loadOfficersAndRotationHistory();
  }, []);

  const loadOfficersAndRotationHistory = async () => {
    try {
      setOfficersLoading(true);

      const [backendOfficers, latestRotations] = await Promise.all([
        fetchOfficers(),
        fetchLatestRotations(),
      ]);

      const normalized = backendOfficers.map((officer) => {
        const normalizedOfficer = {
          id: officer.id,
          forceNumber: officer.force_number || "",
          fullName: officer.full_name || "",
          rank: officer.rank || "",
        };

        const label = formatOfficerLabel(normalizedOfficer);
        const officerHistory = latestRotations.find(
          (item) => Number(item.officer_id) === Number(normalizedOfficer.id)
        );

        return {
          id: normalizedOfficer.id,
          label,
          forceNumber: normalizedOfficer.forceNumber,
          fullName: normalizedOfficer.fullName,
          rank: normalizedOfficer.rank,
          lastWeekSection: officerHistory?.section_name || "",
          lastWeekGroup: officerHistory?.section_group || "OTHER",
        };
      });

      setOfficersPool(normalized);
    } catch (error) {
      console.error(error);
      alert("Imeshindikana kusoma askari au rotation history kutoka database.");
    } finally {
      setOfficersLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  };

  const availableSections = useMemo(() => {
    return sectionOptions.filter(
      (option) =>
        !activeSections.some(
          (section) => section.name.toLowerCase() === option.name.toLowerCase()
        )
    );
  }, [activeSections]);

  const addSelectedSection = () => {
    if (!selectedSection) {
      alert("Chagua section kwanza.");
      return;
    }

    setActiveSections((prev) =>
      sortSections([
        ...prev,
        {
          id: Date.now(),
          name: selectedSection,
          group: getSectionGroup(selectedSection),
          officers: [],
          selectedOfficer: "",
          warnings: [],
        },
      ])
    );
    setSelectedSection("");
  };

  const addCustomSection = () => {
    const name = customSection.trim().toUpperCase();
    if (!name) {
      alert("Andika section mpya kwanza.");
      return;
    }

    const exists = activeSections.some(
      (section) => section.name.toLowerCase() === name.toLowerCase()
    );
    if (exists) {
      alert("Section hii tayari ipo.");
      return;
    }

    setActiveSections((prev) => [
      ...prev,
      {
        id: Date.now(),
        name,
        group: "OTHER",
        officers: [],
        selectedOfficer: "",
        warnings: [],
      },
    ]);
    setCustomSection("");
  };

  const removeSection = (sectionId) => {
    setActiveSections((prev) =>
      prev.filter((section) => section.id !== sectionId)
    );
  };

  const setSelectedOfficerForSection = (sectionId, officerLabel) => {
    setActiveSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? { ...section, selectedOfficer: officerLabel }
          : section
      )
    );
  };

  const addOfficerToSection = (sectionId) => {
    setActiveSections((prev) =>
      prev.map((section) => {
        if (section.id !== sectionId) return section;

        if (!section.selectedOfficer) {
          alert("Chagua askari kwanza.");
          return section;
        }

        const alreadyInSection = section.officers.some((officer) => {
          const officerLabel =
            typeof officer === "string" ? officer : officer.label || "";
          return (
            officerLabel.toLowerCase() === section.selectedOfficer.toLowerCase()
          );
        });

        if (alreadyInSection) {
          alert("Askari huyu tayari yupo kwenye section hii.");
          return section;
        }

        const officerObj = officersPool.find(
          (officer) => officer.label === section.selectedOfficer
        );

        if (!officerObj) {
          alert("Askari hakupatikana kwenye orodha.");
          return section;
        }

        const shouldWarn =
          rotationGroups.includes(section.group) &&
          officerObj.lastWeekGroup === section.group &&
          officerObj.lastWeekSection;

        const warning = shouldWarn
          ? `WARNING: ${officerObj.label} wiki iliyopita alikuwa ${officerObj.lastWeekSection}. Unaweka tena kwenye group hiyo hiyo.`
          : null;

        return {
          ...section,
          officers: [...section.officers, officerObj],
          selectedOfficer: "",
          warnings: warning
            ? [...section.warnings, { officerId: officerObj.id, text: warning }]
            : section.warnings,
        };
      })
    );
  };

  const removeOfficerFromSection = (sectionId, officerIdOrIndex) => {
    setActiveSections((prev) =>
      prev.map((section) => {
        if (section.id !== sectionId) return section;

        const updatedOfficers = section.officers.filter((officer, index) => {
          if (typeof officer === "string") {
            return index !== officerIdOrIndex;
          }
          return officer.id !== officerIdOrIndex;
        });

        return {
          ...section,
          officers: updatedOfficers,
          warnings: section.warnings.filter(
            (warning) => warning.officerId !== officerIdOrIndex
          ),
        };
      })
    );
  };

  const currentSortedSections = sortSections(activeSections);

  const saveRotationHistoryToDatabase = async () => {
    const entries = [];

    currentSortedSections.forEach((section) => {
      section.officers.forEach((officer) => {
        const officerId = typeof officer === "string" ? null : officer.id;
        if (!officerId) return;

        entries.push({
          officer_id: officerId,
          section_name: section.name,
          section_group: section.group || getSectionGroup(section.name),
          date_from: dateFrom,
          date_to: dateTo,
        });
      });
    });

    if (entries.length === 0) return;

    await createRotationHistory(entries);

    setOfficersPool((prev) =>
      prev.map((officer) => {
        const latest = entries.find(
          (item) => Number(item.officer_id) === Number(officer.id)
        );

        return latest
          ? {
              ...officer,
              lastWeekSection: latest.section_name,
              lastWeekGroup: latest.section_group,
            }
          : officer;
      })
    );
  };

  const saveMainSchedule = async () => {
    if (!scheduleTitle.trim()) {
      alert("Jaza jina la ratiba kwanza.");
      return;
    }

    if (!dateFrom || !dateTo) {
      alert("Jaza tarehe ya kuanza na kumaliza.");
      return;
    }

    try {
      setSavingSchedule(true);

      await createSchedule({
        schedule_type: "main",
        title: scheduleTitle,
        date_from: dateFrom,
        date_to: dateTo,
        signature_name: signatureName,
        signature_rank: signatureRank,
        signature_title: signatureTitle,
        fixed_sections: fixedSections,
        active_sections: currentSortedSections,
      });

      await saveRotationHistoryToDatabase();

      alert("Main Schedule imehifadhiwa kwenye database.");
    } catch (error) {
      console.error(error);
      alert(error.message || "Imeshindikana kuhifadhi Main Schedule.");
    } finally {
      setSavingSchedule(false);
    }
  };

  const leftVariableSections = currentSortedSections.slice(
    0,
    Math.ceil(currentSortedSections.length / 2)
  );
  const rightVariableSections = currentSortedSections.slice(
    Math.ceil(currentSortedSections.length / 2)
  );

  const pdfDocument = (
    <MainSchedulePDF
      scheduleTitle={scheduleTitle}
      dateFrom={dateFrom}
      dateTo={dateTo}
      fixedSections={fixedSections}
      activeSections={currentSortedSections}
      signatureName={signatureName}
      signatureRank={signatureRank}
      signatureTitle={signatureTitle}
    />
  );

  if (mode === "preview") {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-800 sm:text-2xl">
              Preview ya Ratiba Kuu
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
              onClick={saveMainSchedule}
              disabled={savingSchedule}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Save className="h-4 w-4" />
              {savingSchedule ? "Inahifadhi..." : "Save Schedule"}
            </button>

            <PDFDownloadLink
              document={pdfDocument}
              fileName={`main-schedule-${dateFrom}-to-${dateTo}.pdf`}
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
            className="mx-auto min-h-[297mm] w-full max-w-[210mm] bg-white p-4 text-black sm:p-[12mm]"
            style={{ fontFamily: '"Times New Roman", Times, serif' }}
          >
            <div className="text-center">
              <h2 className="text-[16px] font-bold uppercase leading-tight sm:text-[18px]">
                {scheduleTitle}
              </h2>
              <p className="mt-1 text-[14px] font-bold uppercase underline sm:text-[17px]">
                JUMATATU YA TAREHE {formatDate(dateFrom)} HADI TAREHE {formatDate(dateTo)}
              </p>
            </div>

            <div className="mt-4 border border-black">
              <div className="grid grid-cols-1 sm:grid-cols-2">
                <div className="border-b border-black p-3 sm:border-b-0 sm:border-r">
                  {fixedSections.map((item) => {
                    const values = formatFixedValue(item.value);

                    return (
                      <div key={item.key} className="mb-2.5">
                        <p className="text-[13px] font-bold uppercase leading-tight sm:text-[14px]">
                          {item.title}
                        </p>

                        {values.length > 1 ? (
                          <ol className="mt-1 pl-6 text-[13px] leading-tight sm:text-[14px]">
                            {values.map((value, index) => (
                              <li key={index}>{value}</li>
                            ))}
                          </ol>
                        ) : (
                          <p className="mt-0.5 text-[13px] leading-tight sm:text-[14px]">
                            {values[0] || "............................"}
                          </p>
                        )}
                      </div>
                    );
                  })}

                  {leftVariableSections.map((section) => (
                    <div key={section.id} className="mb-3">
                      <p className="text-[13px] font-bold uppercase leading-tight sm:text-[14px]">
                        {section.name}
                      </p>

                      {section.officers.length > 0 ? (
                        <ol className="mt-1 pl-6 text-[13px] leading-tight sm:text-[14px]">
                          {section.officers.map((officer, index) => (
                            <li
                              key={
                                typeof officer === "string"
                                  ? `${section.id}-${index}`
                                  : officer.id
                              }
                            >
                              {typeof officer === "string"
                                ? officer
                                : officer.label}
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <div className="mt-1 text-[13px] sm:text-[14px]">
                          ............................
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="p-3">
                  {rightVariableSections.map((section) => (
                    <div key={section.id} className="mb-3">
                      <p className="text-[13px] font-bold uppercase leading-tight sm:text-[14px]">
                        {section.name}
                      </p>

                      {section.officers.length > 0 ? (
                        <ol className="mt-1 pl-6 text-[13px] leading-tight sm:text-[14px]">
                          {section.officers.map((officer, index) => (
                            <li
                              key={
                                typeof officer === "string"
                                  ? `${section.id}-${index}`
                                  : officer.id
                              }
                            >
                              {typeof officer === "string"
                                ? officer
                                : officer.label}
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <div className="mt-1 text-[13px] sm:text-[14px]">
                          ............................
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-10 text-center">
              <p className="text-[13px] sm:text-[14px]">
                ....................................
              </p>
              <p className="mt-2 text-[13px] font-bold uppercase sm:text-[14px]">
                ({signatureName} – {signatureRank})
              </p>
              <p className="mt-2 text-[13px] font-bold uppercase sm:text-[14px]">
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
          Usimamizi wa Ratiba Kuu
        </h1>
        <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
          Andaa ratiba kuu ya wiki, panga sections, weka askari kwa utaratibu,
          hakiki warnings za mzunguko, kisha preview au hifadhi kwa muonekano wa kitaalamu.
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
              Taarifa za Ratiba
            </h2>
            <p className="text-sm text-slate-500">
              Rekebisha heading, tarehe, na taarifa za msaini wa ratiba
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Jina la Ratiba
            </label>
            <input
              type="text"
              value={scheduleTitle}
              onChange={(e) => setScheduleTitle(e.target.value.toUpperCase())}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Tarehe ya Kuanza
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Tarehe ya Kumaliza
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10"
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Jina la Msaini
            </label>
            <input
              type="text"
              value={signatureName}
              onChange={(e) => setSignatureName(e.target.value.toUpperCase())}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Cheo cha Msaini
            </label>
            <input
              type="text"
              value={signatureRank}
              onChange={(e) => setSignatureRank(e.target.value.toUpperCase())}
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
            <LayoutGrid className="h-6 w-6 text-slate-700" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Sehemu za Kudumu
            </h2>
            <p className="text-sm text-slate-500">
              Hizi zitaonekana upande wa kushoto kwenye ratiba ya mwisho
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {fixedSections.map((item) => {
            const values = formatFixedValue(item.value);

            return (
              <div
                key={item.key}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {item.title}
                </p>

                {values.length > 1 ? (
                  <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm font-medium text-slate-800">
                    {values.map((value, index) => (
                      <li key={index}>{value}</li>
                    ))}
                  </ol>
                ) : (
                  <p className="mt-2 text-sm font-medium text-slate-800">
                    {values[0] || "............................"}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
            <Plus className="h-6 w-6 text-blue-700" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Sections Zinazobadilika
            </h2>
            <p className="text-sm text-slate-500">
              Chagua section inayohitajika wiki hii au ongeza mpya
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Chagua Section
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10"
              >
                <option value="">Chagua section</option>
                {availableSections.map((section) => (
                  <option key={section.name} value={section.name}>
                    {section.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={addSelectedSection}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1f2f86] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#18256a]"
              >
                <Plus className="h-4 w-4" />
                Ongeza
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Add New Section
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={customSection}
                onChange={(e) => setCustomSection(e.target.value)}
                placeholder="Mfano: KAZI MAALUM"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10"
              />

              <button
                type="button"
                onClick={addCustomSection}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
              >
                <Plus className="h-4 w-4" />
                Add Section
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50">
              <Users className="h-6 w-6 text-slate-700" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Active Sections
              </h2>
              <p className="text-sm text-slate-500">
                Panga askari kwenye sections za wiki hii
              </p>
            </div>
          </div>
        </div>

        {currentSortedSections.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            Bado hujaongeza section yoyote.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {currentSortedSections.map((section) => (
              <div
                key={section.id}
                className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-800 sm:text-base">
                      {section.name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Idadi ya askari: {section.officers.length}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeSection(section.id)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                  >
                    <Trash2 className="h-4 w-4" />
                    Futa Section
                  </button>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Chagua Askari
                  </label>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <select
                      value={section.selectedOfficer}
                      onChange={(e) =>
                        setSelectedOfficerForSection(section.id, e.target.value)
                      }
                      disabled={officersLoading}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10 disabled:cursor-not-allowed disabled:bg-slate-100"
                    >
                      <option value="">
                        {officersLoading ? "Inapakia askari..." : "Chagua askari"}
                      </option>
                      {officersPool.map((officer) => (
                        <option key={officer.id} value={officer.label}>
                          {officer.label}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => addOfficerToSection(section.id)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1f2f86] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#18256a]"
                    >
                      <Plus className="h-4 w-4" />
                      Ongeza
                    </button>
                  </div>

                  {section.warnings.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {section.warnings.map((warning, index) => (
                        <div
                          key={`${warning.officerId}-${index}`}
                          className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3"
                        >
                          <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-700" />
                          <p className="text-sm text-amber-800">
                            {warning.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <BadgeInfo className="h-4 w-4 text-slate-500" />
                    <p className="text-sm font-semibold text-slate-700">
                      Orodha ya Askari
                    </p>
                  </div>

                  {section.officers.length > 0 ? (
                    <ol className="space-y-2">
                      {section.officers.map((officer, index) => (
                        <li
                          key={
                            typeof officer === "string"
                              ? `${section.id}-${index}`
                              : officer.id
                          }
                          className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm text-slate-800"
                        >
                          <span>
                            {index + 1}.{" "}
                            {typeof officer === "string"
                              ? officer
                              : officer.label}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              removeOfficerFromSection(
                                section.id,
                                typeof officer === "string" ? index : officer.id
                              )
                            }
                            className="rounded-lg p-1 text-rose-600 transition hover:bg-rose-50"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-sm text-slate-500">
                      Bado hakuna askari waliopangwa kwenye section hii.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MainSchedulePage;