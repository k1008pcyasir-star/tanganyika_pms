import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Trash2,
  UserPlus,
  Pencil,
  FileSpreadsheet,
  Users,
  BadgeInfo,
  CheckCircle2,
} from "lucide-react";
import {
  fetchOfficers,
  createOfficer,
  updateOfficer,
  deleteOfficer,
} from "../services/officerService";

const rankOptions = [
  "PC",
  "CPL",
  "SGT",
  "D/CPL",
  "D/SGT",
  "S/SGT",
  "A/INSP",
  "INSP",
  "ASP",
  "SP",
  "SSP",
];

const ranksWithoutForceNumber = [
  "S/SGT",
  "A/INSP",
  "INSP",
  "ASP",
  "SP",
  "SSP",
];

function OfficersPage() {
  const [formData, setFormData] = useState({
    forceNumber: "",
    fullName: "",
    rank: "",
  });

  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadOfficers();
  }, []);

  const loadOfficers = async () => {
    try {
      setLoading(true);
      const data = await fetchOfficers();

      const normalized = data.map((officer) => ({
        id: officer.id,
        forceNumber: officer.force_number || "",
        fullName: officer.full_name || "",
        rank: officer.rank || "",
      }));

      setOfficers(normalized);
    } catch (error) {
      console.error(error);
      alert("Imeshindikana kusoma officers kutoka database.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "rank" && ranksWithoutForceNumber.includes(value)) {
      setFormData((prev) => ({
        ...prev,
        rank: value,
        forceNumber: "",
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatNameWithInitials = (fullName) => {
    const parts = fullName.trim().toUpperCase().split(" ").filter(Boolean);

    if (parts.length === 1) return parts[0];

    if (parts.length === 2) {
      return `${parts[0][0]}. ${parts[1]}`;
    }

    const lastName = parts[parts.length - 1];
    const initials = parts
      .slice(0, -1)
      .map((name) => `${name[0]}.`)
      .join("");

    return `${initials} ${lastName}`;
  };

  const formatOfficerName = (officer) => {
    const rank = officer.rank?.trim().toUpperCase();
    const fullName = officer.fullName?.trim().toUpperCase();
    const forceNumber = officer.forceNumber?.trim().toUpperCase();

    const nameParts = fullName.split(" ").filter(Boolean);
    const firstName = nameParts[0] || "";

    if (ranksWithoutForceNumber.includes(rank)) {
      return `${rank} ${formatNameWithInitials(fullName)}`;
    }

    return `${forceNumber} ${rank} ${firstName}`;
  };

  const resetForm = () => {
    setFormData({
      forceNumber: "",
      fullName: "",
      rank: "",
    });
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.rank) {
      alert("Jaza jina na cheo kwanza.");
      return;
    }

    if (
      !ranksWithoutForceNumber.includes(formData.rank) &&
      !formData.forceNumber
    ) {
      alert("Force Number inahitajika kwa cheo hiki.");
      return;
    }

    const normalizedForceNumber = formData.forceNumber.toUpperCase().trim();
    const normalizedFullName = formData.fullName.toUpperCase().trim();

    const duplicateForceNumber =
      normalizedForceNumber &&
      officers.some(
        (officer) =>
          officer.id !== editId &&
          officer.forceNumber.toUpperCase().trim() === normalizedForceNumber
      );

    if (duplicateForceNumber) {
      alert("Force Number hii tayari imeshasajiliwa.");
      return;
    }

    try {
      setSubmitting(true);

      if (editId) {
        await updateOfficer(editId, {
          force_number: normalizedForceNumber || null,
          full_name: normalizedFullName,
          rank: formData.rank,
        });

        await loadOfficers();
        resetForm();
        alert("Officer amehaririwa successfully.");
        return;
      }

      await createOfficer({
        force_number: normalizedForceNumber || null,
        full_name: normalizedFullName,
        rank: formData.rank,
      });

      await loadOfficers();
      resetForm();
      alert("Officer ameongezwa kwenye database.");
    } catch (error) {
      console.error(error);
      alert(error.message || "Imeshindikana kuhifadhi officer.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Una uhakika unataka kumfuta officer huyu?"
    );
    if (!confirmDelete) return;

    try {
      await deleteOfficer(id);
      await loadOfficers();

      if (editId === id) {
        resetForm();
      }

      alert("Officer amefutwa successfully.");
    } catch (error) {
      console.error(error);
      alert(error.message || "Imeshindikana kumfuta officer.");
    }
  };

  const handleEdit = (officer) => {
    setFormData({
      forceNumber: officer.forceNumber,
      fullName: officer.fullName,
      rank: officer.rank,
    });

    setEditId(officer.id);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const filteredOfficers = useMemo(() => {
    return officers.filter((officer) => {
      const q = search.toLowerCase();
      return (
        officer.forceNumber.toLowerCase().includes(q) ||
        officer.fullName.toLowerCase().includes(q) ||
        officer.rank.toLowerCase().includes(q)
      );
    });
  }, [officers, search]);

  const selectedRankDoesNotNeedForceNumber = ranksWithoutForceNumber.includes(
    formData.rank
  );

  const handleDownloadExcel = () => {
    const rows = filteredOfficers.map((officer, index) => ({
      "S/N": index + 1,
      "Force Number": officer.forceNumber || "-",
      "Jina Kamili": officer.fullName,
      Cheo: officer.rank,
      "Format ya Ratiba": formatOfficerName(officer),
    }));

    const headers = [
      "S/N",
      "Force Number",
      "Jina Kamili",
      "Cheo",
      "Format ya Ratiba",
    ];

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((header) => `"${String(row[header] ?? "").replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "orodha_ya_askari.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-5 text-center shadow-sm sm:p-8">
        <h1 className="text-lg font-semibold tracking-wide text-slate-800 sm:text-2xl">
          Usimamizi wa Sajili ya Askari
        </h1>
        <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
          Hapa unaweza kuongeza, kuhariri, kufuta, na kupakua orodha ya askari
          kwa muonekano safi na unaosomeka vizuri kwenye simu na desktop.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 xl:p-7">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
              <UserPlus className="h-6 w-6 text-blue-700" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                {editId ? "Hariri Taarifa za Askari" : "Ongeza Askari Mpya"}
              </h2>
              <p className="text-sm text-slate-500">
                Jaza taarifa muhimu za askari kisha hifadhi
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Jumla ya Askari
            </p>
            <p className="mt-1 text-2xl font-semibold text-slate-800">
              {officers.length}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Force Number
              </label>
              <input
                type="text"
                name="forceNumber"
                value={formData.forceNumber}
                onChange={handleChange}
                placeholder="Mfano: G.5696"
                disabled={selectedRankDoesNotNeedForceNumber}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
              {selectedRankDoesNotNeedForceNumber && (
                <p className="mt-2 text-xs text-slate-500">
                  Cheo hiki hakihitaji force number kwenye ratiba.
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Jina Kamili
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Andika jina kamili"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Cheo
              </label>
              <select
                name="rank"
                value={formData.rank}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10"
              >
                <option value="">Chagua cheo</option>
                {rankOptions.map((rank) => (
                  <option key={rank} value={rank}>
                    {rank}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
                <BadgeInfo className="h-5 w-5 text-[#1f2f86]" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Preview ya Format ya Ratiba
                </p>
                <p className="mt-2 text-sm font-medium text-slate-800">
                  {formData.fullName && formData.rank
                    ? formatOfficerName({
                        forceNumber: formData.forceNumber,
                        fullName: formData.fullName,
                        rank: formData.rank,
                      })
                    : "Muonekano wa jina la askari utaonekana hapa"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1f2f86] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#18256a] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              {submitting
                ? "Inahifadhi..."
                : editId
                ? "Save Changes"
                : "Hifadhi"}
            </button>

            {editId && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 xl:p-7">
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Orodha ya Askari
            </h2>
            <p className="text-sm text-slate-500">
              List nzima ya askari waliosajiliwa inaonekana hapa chini kwa uwazi
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative w-full sm:w-[280px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tafuta askari..."
                className="w-full rounded-2xl border border-slate-300 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10"
              />
            </div>

            <button
              type="button"
              onClick={handleDownloadExcel}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Download Excel
            </button>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-500" />
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Jumla ya Records
              </p>
            </div>
            <p className="mt-2 text-xl font-semibold text-slate-800">
              {officers.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-slate-500" />
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Zilizochujwa
              </p>
            </div>
            <p className="mt-2 text-xl font-semibold text-slate-800">
              {filteredOfficers.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Hali ya Mfumo
              </p>
            </div>
            <p className="mt-2 text-xl font-semibold text-emerald-700">
              {loading ? "Loading..." : "Ready"}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-4 text-left text-sm font-semibold text-slate-600">
                    S/N
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-slate-600">
                    Force No
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-slate-600">
                    Jina Kamili
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-slate-600">
                    Cheo
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-slate-600">
                    Format ya Ratiba
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-slate-600">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white">
                {loading ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-4 py-10 text-center text-sm text-slate-500"
                    >
                      Inapakia officers...
                    </td>
                  </tr>
                ) : filteredOfficers.length > 0 ? (
                  filteredOfficers.map((officer, index) => (
                    <tr
                      key={officer.id}
                      className="border-b border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {index + 1}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-slate-700">
                        {officer.forceNumber || "-"}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-800">
                        {officer.fullName}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700">
                        {officer.rank}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-[#1f2f86]">
                        {formatOfficerName(officer)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(officer)}
                            className="inline-flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-100"
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(officer.id)}
                            className="inline-flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
                          >
                            <Trash2 className="h-4 w-4" />
                            Futa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-4 py-10 text-center text-sm text-slate-500"
                    >
                      Hakuna askari waliopatikana
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {!loading && filteredOfficers.length > 0 ? (
          <p className="mt-4 text-xs text-slate-500">
            Unaona records {filteredOfficers.length} kati ya {officers.length}.
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default OfficersPage;