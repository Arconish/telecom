import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Eye,
  Network,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import {
  bulkDeleteSiteDependencies,
  createSiteDependency,
  deleteAllSiteDependencies,
  deleteSiteDependency,
  exportSelectedSiteDependenciesExcel,
  exportSiteDependenciesExcel,
  getSiteDependencies,
  getSiteDependencySummary,
  importSiteDependenciesExcel,
  updateSiteDependency,
} from "../../api/siteDependencyApi";
import AdminSiteDependencyForm from "../../components/admin/AdminSiteDependencyForm";
import AdminSiteDependencyTable from "../../components/admin/AdminSiteDependencyTable";
import { siteDependencyColumns } from "../../constants/siteDependencyColumns";

function AdminSiteDependencyPage() {
  const [rows, setRows] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [protectionFilter, setProtectionFilter] = useState("All");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [viewingRow, setViewingRow] = useState(null);
  const [summary, setSummary] = useState({
    total: 0,
    protected: 0,
    not_protected: 0,
    pop_sites: 0,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortConfig, setSortConfig] = useState({
    key: "site_id",
    direction: "asc",
  });

  const toastTimer = useRef(null);
  const fileInputRef = useRef(null);

  const smallBtnClass =
    "inline-flex h-8 items-center justify-center gap-1 rounded-md border px-2.5 text-[11px] font-medium whitespace-nowrap transition";
  const inputClass =
    "h-8 rounded-md border border-slate-300 bg-white px-2.5 text-xs text-slate-700 outline-none transition focus:border-sky-500";
  const modalBtnClass =
    "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50";

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  };

  const buildQueryParams = (
    pageValue = page,
    pageSizeValue = pageSize,
    searchValue = search,
    protectionValue = protectionFilter,
    sortValue = sortConfig
  ) => {
    const params = {
      page: pageValue,
      page_size: pageSizeValue,
      search: searchValue || undefined,
      sort_by: sortValue.key,
      sort_order: sortValue.direction,
    };

    if (protectionValue === "Yes") params.protection = true;
    if (protectionValue === "No") params.protection = false;

    return params;
  };

  const fetchRows = async (
    pageValue = page,
    pageSizeValue = pageSize,
    searchValue = search,
    protectionValue = protectionFilter,
    sortValue = sortConfig
  ) => {
    try {
      setLoading(true);
      setError("");
      const data = await getSiteDependencies(
        buildQueryParams(
          pageValue,
          pageSizeValue,
          searchValue,
          protectionValue,
          sortValue
        )
      );
      setRows(data.items || []);
      setSelectedIds([]);
      setTotal(data.total || 0);
      setPage(data.page || 1);
      setPageSize(data.page_size || 10);
      setTotalPages(data.total_pages || 0);
    } catch (err) {
      const message = err?.response?.data?.detail || "Failed to load site dependencies";
      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const data = await getSiteDependencySummary();
      setSummary({
        total: data.total || 0,
        protected: data.protected || 0,
        not_protected: data.not_protected || 0,
        pop_sites: data.pop_sites || 0,
      });
    } catch {
      showToast("Failed to load site dependency summary", "error");
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    fetchRows(page, pageSize, search, protectionFilter, sortConfig);
  }, [page, pageSize, search, protectionFilter, sortConfig]);

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const refreshAll = async ({ pageValue = page } = {}) => {
    await Promise.all([
      fetchRows(pageValue, pageSize, search, protectionFilter, sortConfig),
      fetchSummary(),
    ]);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const handleCreate = async (payload) => {
    try {
      setSaving(true);
      await createSiteDependency(payload);
      setShowCreateForm(false);
      await refreshAll();
      showToast("Site dependency created successfully");
    } catch (err) {
      showToast(err?.response?.data?.detail || "Failed to create site dependency", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (payload) => {
    try {
      setSaving(true);
      await updateSiteDependency(editingRow.id, payload);
      setEditingRow(null);
      await refreshAll();
      showToast("Site dependency updated successfully");
    } catch (err) {
      showToast(err?.response?.data?.detail || "Failed to update site dependency", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setSaving(true);
      if (deleteTarget?.deleteAll) {
        await deleteAllSiteDependencies();
        setPage(1);
        await refreshAll({ pageValue: 1 });
      } else if (deleteTarget?.ids?.length === 1) {
        await deleteSiteDependency(deleteTarget.ids[0]);
        await refreshAll();
      } else if (deleteTarget?.ids?.length > 1) {
        await bulkDeleteSiteDependencies(deleteTarget.ids);
        await refreshAll();
      }
      setDeleteTarget(null);
      setSelectedIds([]);
      setViewingRow(null);
      setEditingRow(null);
      showToast("Site dependency record(s) deleted successfully");
    } catch (err) {
      showToast(err?.response?.data?.detail || "Failed to delete site dependencies", "error");
    } finally {
      setSaving(false);
    }
  };

  const downloadBlob = (blob, fileName) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleExportAllExcel = async () => {
    try {
      const blob = await exportSiteDependenciesExcel(
        buildQueryParams(1, pageSize, search, protectionFilter, sortConfig)
      );
      downloadBlob(blob, "site_dependencies.xlsx");
      showToast("All site dependency data exported successfully");
    } catch {
      showToast("Failed to export all site dependency data", "error");
    }
  };

  const handleExportSelectedExcel = async () => {
    if (selectedIds.length === 0) return;

    try {
      const blob = await exportSelectedSiteDependenciesExcel(selectedIds);
      downloadBlob(blob, "site_dependencies_selected.xlsx");
      showToast("Selected site dependency data exported successfully");
    } catch {
      showToast("Failed to export selected site dependency data", "error");
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSaving(true);
      const result = await importSiteDependenciesExcel(file);
      await refreshAll({ pageValue: 1 });
      setPage(1);

      const errorCount = result?.errors?.length || 0;
      const message = `Import done. Created: ${result.created}, Updated: ${result.updated}, Errors: ${errorCount}`;
      showToast(message, errorCount > 0 ? "error" : "success");
    } catch (err) {
      console.error("Failed to import site dependencies", err?.response?.data || err);
      const detail = err?.response?.data?.detail;
      const detailMessage = Array.isArray(detail)
        ? detail.map((item) => item?.msg || String(item)).join(", ")
        : typeof detail === "object" && detail !== null
        ? `${detail.message || "Import failed"}${
            detail.found_columns ? ` Found columns: ${detail.found_columns.join(", ")}` : ""
          }${detail.errors?.length ? ` Errors: ${detail.errors.join("; ")}` : ""}`
        : detail;
      const message =
        typeof detailMessage === "string"
          ? detailMessage
          : err?.message || "Failed to import site dependencies";
      setError(message);
      showToast(message, "error");
    } finally {
      setSaving(false);
      e.target.value = "";
    }
  };

  const handleSort = (key) => {
    setPage(1);
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  };

  const handleToggleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = (visibleRowIds) => {
    const rowIds = visibleRowIds || rows.map((row) => row.id);
    const allSelected =
      rowIds.length > 0 && rowIds.every((id) => selectedIds.includes(id));
    setSelectedIds(allSelected ? [] : rowIds);
  };

  const selectedRows = useMemo(
    () => rows.filter((row) => selectedIds.includes(row.id)),
    [rows, selectedIds]
  );

  const stats = [
    {
      label: "Total Records",
      value: summary.total,
      sub: "All dependencies",
      icon: Network,
      iconWrap: "bg-sky-100 text-sky-700",
    },
    {
      label: "In Protection Path",
      value: summary.protected,
      sub: "Marked yes",
      icon: CheckCircle2,
      iconWrap: "bg-emerald-100 text-emerald-700",
    },
    {
      label: "Not In Path",
      value: summary.not_protected,
      sub: "Marked no",
      icon: AlertTriangle,
      iconWrap: "bg-amber-100 text-amber-700",
    },
    {
      label: "POP Sites",
      value: summary.pop_sites,
      sub: "Distinct POPs",
      icon: Network,
      iconWrap: "bg-violet-100 text-violet-700",
    },
  ];

  const isModalOpen = showCreateForm || Boolean(editingRow);

  return (
    <div className="min-h-[calc(100vh-1rem)] w-full max-w-full overflow-hidden bg-slate-50 p-2 md:p-3">
      <div className="mx-auto w-full max-w-full space-y-3">
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <div className="mb-2 flex flex-col gap-0.5">
            <h1 className="text-lg font-bold tracking-tight text-slate-900">
              Site Dependency
            </h1>
            <p className="text-[11px] text-slate-500">
              Manage site dependency records and MW protection path status.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                        {stat.label}
                      </div>
                      <div className="mt-0.5 text-base font-bold leading-tight text-slate-900">
                        {stat.value}
                      </div>
                      <div className="text-[10px] text-slate-400">{stat.sub}</div>
                    </div>
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${stat.iconWrap}`}
                    >
                      <Icon size={13} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="w-full max-w-full rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-3 py-2.5">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-2">
                <div className="relative w-[240px]">
                  <Search
                    size={13}
                    className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    placeholder="Search site, FE, child, POP..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className={`w-full pl-8 pr-8 ${inputClass}`}
                  />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute right-2 top-1/2 inline-flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      aria-label="Clear search"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  className={`${smallBtnClass} border-slate-900 bg-slate-900 text-white hover:bg-slate-800`}
                >
                  <Search size={12} />
                  Search
                </button>
              </form>

              <div className="flex flex-wrap items-center justify-start gap-2 xl:justify-end">
                <button
                  type="button"
                  onClick={handleExportAllExcel}
                  className={`${smallBtnClass} border-slate-300 bg-white text-slate-700 hover:bg-slate-50`}
                >
                  <Download size={12} />
                  Export All
                </button>

                <button
                  type="button"
                  onClick={handleExportSelectedExcel}
                  disabled={selectedIds.length === 0}
                  className={`${smallBtnClass} border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <Download size={12} />
                  Export Selected
                </button>

                <button
                  type="button"
                  onClick={handleImportClick}
                  className={`${smallBtnClass} border-slate-300 bg-white text-slate-700 hover:bg-slate-50`}
                >
                  <Upload size={12} />
                  Import
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingRow(null);
                    setShowCreateForm(true);
                  }}
                  className={`${smallBtnClass} border-sky-600 bg-sky-600 text-white hover:bg-sky-700`}
                >
                  <Plus size={12} />
                  Add Dependency
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={handleImportFile}
                />
              </div>
            </div>
          </div>

          <div className="border-b border-slate-200 bg-slate-50 px-3 py-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs text-slate-600">
                Selected: <span className="font-semibold text-slate-900">{selectedIds.length}</span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {["All", "Yes", "No"].map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setPage(1);
                      setProtectionFilter(item);
                    }}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                      protectionFilter === item
                        ? "border border-sky-600 bg-sky-600 text-white"
                        : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    MW Path: {item}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => selectedRows.length === 1 && setViewingRow(selectedRows[0])}
                  disabled={selectedIds.length !== 1}
                  className={`${smallBtnClass} border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <Eye size={12} />
                  View
                </button>
                <button
                  type="button"
                  onClick={() => selectedRows.length === 1 && setEditingRow(selectedRows[0])}
                  disabled={selectedIds.length !== 1}
                  className={`${smallBtnClass} border-blue-300 bg-white text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <Pencil size={12} />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => selectedIds.length && setDeleteTarget({ ids: selectedIds })}
                  disabled={selectedIds.length === 0}
                  className={`${smallBtnClass} border-red-300 bg-white text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <Trash2 size={12} />
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget({ ids: [], deleteAll: true })}
                  className={`${smallBtnClass} border-red-300 bg-white text-red-600 hover:bg-red-50`}
                >
                  <Trash2 size={12} />
                  Delete All
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="border-b border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
              {error}
            </div>
          )}
          {saving && (
            <div className="border-b border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
              Processing request...
            </div>
          )}
          {loading && (
            <div className="border-b border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700">
              Loading site dependencies...
            </div>
          )}

          <div className="border-b border-slate-200 bg-slate-50 px-3 py-2.5">
            <div className="flex w-full flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                Site Dependency Records
              </h2>
              <div className="text-xs text-slate-600">
                Showing{" "}
                <span className="font-semibold text-slate-900">
                  {total === 0 ? 0 : (page - 1) * pageSize + 1}
                </span>
                {" - "}
                <span className="font-semibold text-slate-900">
                  {total === 0 ? 0 : Math.min(page * pageSize, total)}
                </span>
                {" of "}
                <span className="font-semibold text-slate-900">{total}</span>
              </div>
            </div>
          </div>

          <div className="w-full max-w-full overflow-x-auto bg-white px-2 py-2">
            <AdminSiteDependencyTable
              rows={rows}
              selectedIds={selectedIds}
              onToggleSelectRow={handleToggleSelectRow}
              onToggleSelectAll={handleToggleSelectAll}
              sortConfig={sortConfig}
              onSort={handleSort}
            />
          </div>

          <div className="border-t border-slate-200 bg-white px-3 py-2.5">
            <div className="flex w-full flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span>Rows per page</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPage(1);
                    setPageSize(Number(e.target.value));
                  }}
                  className={inputClass}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                <span className="rounded-md border border-slate-300 bg-slate-50 px-2.5 py-1.5">
                  Page <span className="font-semibold text-slate-900">{page}</span> /{" "}
                  <span className="font-semibold text-slate-900">{totalPages || 1}</span>
                </span>
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page <= 1}
                  className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages || 1))}
                  disabled={page >= totalPages}
                  className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed right-3 top-3 z-[70]">
          <div
            className={`rounded-lg px-3 py-2 text-xs font-semibold shadow-lg ${
              toast.type === "error" ? "bg-red-600 text-white" : "bg-slate-900 text-white"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => {
              setShowCreateForm(false);
              setEditingRow(null);
            }}
          />
          <div className="relative z-10 max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 px-4 py-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {showCreateForm ? "Create Site Dependency" : "Edit Site Dependency"}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {showCreateForm
                    ? "Add a new site dependency record."
                    : "Update site dependency details."}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingRow(null);
                }}
                className={modalBtnClass}
              >
                <X size={14} />
              </button>
            </div>
            <div className="max-h-[calc(92vh-76px)] overflow-y-auto px-4 py-4">
              <AdminSiteDependencyForm
                key={showCreateForm ? "create-site-dependency" : editingRow?.id}
                initialData={showCreateForm ? null : editingRow}
                onSubmit={showCreateForm ? handleCreate : handleUpdate}
                onCancel={() => {
                  setShowCreateForm(false);
                  setEditingRow(null);
                }}
                submitLabel={showCreateForm ? "Create Site Dependency" : "Update Site Dependency"}
              />
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          deleteTarget={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
        />
      )}

      {viewingRow && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-slate-900/30" onClick={() => setViewingRow(null)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto border-l border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 px-4 py-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Dependency Details</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Site dependency and MW protection path status
                </p>
              </div>
              <button onClick={() => setViewingRow(null)} className={modalBtnClass}>
                <X size={14} />
              </button>
            </div>
            <div className="space-y-2.5 p-4">
              {siteDependencyColumns.map((column) => (
                <DetailItem
                  key={column.key}
                  label={column.label}
                  value={
                    column.key === "existed_in_mw_protection_path"
                      ? viewingRow[column.key]
                        ? "Yes"
                        : "No"
                      : viewingRow[column.key]
                  }
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-2.5">
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-xs font-semibold text-slate-900">
        {value === null || value === undefined || value === "" ? "-" : String(value)}
      </div>
    </div>
  );
}

function ConfirmDeleteModal({ deleteTarget, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 md:p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-md rounded-lg border border-slate-200 bg-white shadow-2xl">
        <div className="border-b border-slate-200 px-4 py-3">
          <h3 className="text-base font-bold text-slate-900">Confirm Delete</h3>
          <p className="mt-1 text-xs text-slate-500">
            {deleteTarget?.deleteAll
              ? "Are you sure you want to delete all site dependency records?"
              : "Are you sure you want to delete the selected record(s)?"}
          </p>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-200 px-4 py-3">
          <button
            onClick={onCancel}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminSiteDependencyPage;
