import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import * as XLSX from "xlsx";
import {
  RadioTower,
  Search,
  Download,
  Eye,
  Activity,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import {
  getPublicClientPageApi,
  getPublicClientPageDataApi,
} from "../../api/clientPageApi";

function ClientDynamicPage() {
  const { slug } = useParams();

  const [pageConfig, setPageConfig] = useState(null);
  const [rows, setRows] = useState([]);
  const [allFilteredRows, setAllFilteredRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [configLoading, setConfigLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [loadingAllRows, setLoadingAllRows] = useState(false);
  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [vendor, setVendor] = useState("");
  const [region, setRegion] = useState("");
  const [status, setStatus] = useState("");

  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [viewingRow, setViewingRow] = useState(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const smallBtnClass =
    "inline-flex h-8 items-center justify-center gap-1 rounded-md border px-2.5 text-[11px] font-medium whitespace-nowrap transition";
  const inputClass =
    "h-8 rounded-md border border-slate-300 bg-white px-2.5 text-xs text-slate-700 outline-none transition focus:border-sky-500";
  const modalBtnClass =
    "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50";

  const fetchConfig = async () => {
    try {
      setConfigLoading(true);
      setError("");

      const data = await getPublicClientPageApi(slug);
      setPageConfig(data);

      const defaultPageSize = data?.layout?.pagination?.page_size || 10;
      setPageSize(defaultPageSize);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to load page config");
    } finally {
      setConfigLoading(false);
    }
  };

  const fetchRows = async () => {
    if (!pageConfig) return;

    try {
      setLoading(true);
      setError("");

      const data = await getPublicClientPageDataApi(slug, {
        page,
        page_size: pageSize,
        search: search || undefined,
        vendor: vendor || undefined,
        region: region || undefined,
        status: status || undefined,
      });

      setRows(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(data.total_pages || 1);
      setSelectedRowIds([]);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to load client data");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllFilteredRows = async () => {
    if (!pageConfig) return;

    try {
      setLoadingAllRows(true);

      let currentPage = 1;
      let lastPage = 1;
      let merged = [];

      do {
        const data = await getPublicClientPageDataApi(slug, {
          page: currentPage,
          page_size: 500,
          search: search || undefined,
          vendor: vendor || undefined,
          region: region || undefined,
          status: status || undefined,
        });

        merged = [...merged, ...(data?.items || [])];
        lastPage = data?.total_pages || 1;
        currentPage += 1;
      } while (currentPage <= lastPage);

      setAllFilteredRows(merged);
    } catch (err) {
      console.error("Failed to fetch all filtered rows", err);
    } finally {
      setLoadingAllRows(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, [slug]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    fetchRows();
  }, [pageConfig, page, pageSize, search, vendor, region, status]);

  useEffect(() => {
    fetchAllFilteredRows();
  }, [pageConfig, search, vendor, region, status]);

  const visibleColumns = useMemo(
    () => pageConfig?.layout?.columns?.filter((col) => col.visible) || [],
    [pageConfig]
  );

  const filterKeys = useMemo(
    () => (pageConfig?.layout?.filters || []).map((f) => f.key),
    [pageConfig]
  );

  const vendorOptions = useMemo(() => {
    const set = new Set(allFilteredRows.map((row) => row.vendor).filter(Boolean));
    return Array.from(set).sort();
  }, [allFilteredRows]);

  const regionOptions = useMemo(() => {
    const set = new Set(allFilteredRows.map((row) => row.region).filter(Boolean));
    return Array.from(set).sort();
  }, [allFilteredRows]);

  const statusOptions = useMemo(() => {
    const set = new Set(allFilteredRows.map((row) => row.status).filter(Boolean));
    return Array.from(set).sort();
  }, [allFilteredRows]);

  const currentPageRowIds = useMemo(
    () => rows.map((row) => row.id).filter(Boolean),
    [rows]
  );

  const allCurrentPageSelected =
    currentPageRowIds.length > 0 &&
    currentPageRowIds.every((id) => selectedRowIds.includes(id));

  const selectedRows = useMemo(
    () => allFilteredRows.filter((row) => selectedRowIds.includes(row.id)),
    [allFilteredRows, selectedRowIds]
  );

  const summary = useMemo(() => {
    const totalLinks = allFilteredRows.length;
    const activeLinks = allFilteredRows.filter((row) => row.active === true).length;
    const inactiveLinks = allFilteredRows.filter((row) => row.active === false).length;
    const onAir = allFilteredRows.filter((row) => row.status === "On Air").length;
    const down = allFilteredRows.filter(
      (row) =>
        row.status === "Down" ||
        row.status === "Inactive" ||
        row.active === false
    ).length;

    return {
      totalLinks,
      activeLinks,
      inactiveLinks,
      onAir,
      down,
    };
  }, [allFilteredRows]);

  const stats = [
    {
      label: "Total Records",
      value: summary.totalLinks,
      sub: "All filtered data",
      icon: RadioTower,
      iconWrap: "bg-sky-100 text-sky-700",
    },
    {
      label: "Active",
      value: summary.activeLinks,
      sub: "Operational",
      icon: CheckCircle2,
      iconWrap: "bg-emerald-100 text-emerald-700",
    },
    {
      label: "On Air",
      value: summary.onAir,
      sub: "Running links",
      icon: Activity,
      iconWrap: "bg-violet-100 text-violet-700",
    },
    {
      label: "Inactive / Down",
      value: summary.down || summary.inactiveLinks,
      sub: "Need attention",
      icon: AlertTriangle,
      iconWrap: "bg-amber-100 text-amber-700",
    },
  ];

  const toggleRowSelection = (rowId) => {
    setSelectedRowIds((prev) =>
      prev.includes(rowId) ? prev.filter((id) => id !== rowId) : [...prev, rowId]
    );
  };

  const toggleSelectAllCurrentPage = () => {
    setSelectedRowIds((prev) => {
      if (allCurrentPageSelected) {
        return prev.filter((id) => !currentPageRowIds.includes(id));
      }
      return Array.from(new Set([...prev, ...currentPageRowIds]));
    });
  };

  const handleViewSelected = () => {
    if (selectedRows.length !== 1) return;
    setViewingRow(selectedRows[0]);
  };

  const clearSelection = () => {
    setSelectedRowIds([]);
  };

  const buildExportRows = (dataRows) => {
    return dataRows.map((row) => {
      const formattedRow = {};

      visibleColumns.forEach((col) => {
        formattedRow[col.label] = formatCell(row[col.key], col.key);
      });

      return formattedRow;
    });
  };

  const downloadExcel = (dataRows, fileName) => {
    const exportRows = buildExportRows(dataRows);

    if (!exportRows.length) {
      alert("No data available to export.");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Client Data");
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  const handleExportSelected = () => {
    if (!selectedRows.length) {
      alert("Please select row(s) to export.");
      return;
    }

    downloadExcel(selectedRows, `${slug || "client"}_selected_rows`);
  };

  const handleExportAll = async () => {
    try {
      setExporting(true);
      downloadExcel(allFilteredRows, `${slug || "client"}_all_rows`);
    } finally {
      setExporting(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  if (configLoading) {
    return (
      <div className="p-4 text-sm text-slate-600">Loading client page...</div>
    );
  }

  if (error && !pageConfig) {
    return <div className="p-4 text-sm text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-[calc(100vh-1rem)] w-full max-w-full overflow-hidden bg-slate-50 p-2 md:p-3">
      <div className="mx-auto w-full max-w-full space-y-3">
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <div className="mb-2 flex flex-col gap-0.5">
            <h1 className="text-lg font-bold tracking-tight text-slate-900">
              {pageConfig?.title || "Client View"}
            </h1>
            <p className="text-[11px] text-slate-500">
              View and export microwave link budget records.
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
                        {loadingAllRows ? "..." : stat.value}
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
              <div className="flex flex-1 flex-wrap items-center gap-2">
                {pageConfig?.layout?.search?.enabled && (
                  <form
                    onSubmit={handleSearch}
                    className="flex flex-wrap items-center gap-2"
                  >
                    <div className="relative w-[240px]">
                      <Search
                        size={13}
                        className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        placeholder={
                          pageConfig?.layout?.search?.placeholder || "Search..."
                        }
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className={`w-full pl-8 pr-2.5 ${inputClass}`}
                      />
                    </div>

                    <button
                      type="submit"
                      className={`${smallBtnClass} border-slate-900 bg-slate-900 text-white hover:bg-slate-800`}
                    >
                      <Search size={12} />
                      Search
                    </button>
                  </form>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-start gap-2 xl:justify-end">
                <button
                  type="button"
                  onClick={handleExportAll}
                  disabled={exporting || allFilteredRows.length === 0}
                  className={`${smallBtnClass} border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <Download size={12} />
                  {exporting ? "Exporting..." : "Export All"}
                </button>

                <button
                  type="button"
                  onClick={handleExportSelected}
                  disabled={selectedRows.length === 0}
                  className={`${smallBtnClass} border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <Download size={12} />
                  Export Selected
                </button>
              </div>
            </div>
          </div>

          <div className="border-b border-slate-200 bg-slate-50 px-3 py-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs text-slate-600">
                Selected:{" "}
                <span className="font-semibold text-slate-900">
                  {selectedRowIds.length}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {filterKeys.includes("vendor") && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Vendor</span>
                    <select
                      value={vendor}
                      onChange={(e) => {
                        setPage(1);
                        setVendor(e.target.value);
                        setSelectedRowIds([]);
                      }}
                      className={`${inputClass} min-w-[120px]`}
                    >
                      <option value="">All</option>
                      {vendorOptions.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {filterKeys.includes("region") && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Region</span>
                    <select
                      value={region}
                      onChange={(e) => {
                        setPage(1);
                        setRegion(e.target.value);
                        setSelectedRowIds([]);
                      }}
                      className={`${inputClass} min-w-[120px]`}
                    >
                      <option value="">All</option>
                      {regionOptions.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {filterKeys.includes("status") && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Status</span>
                    <select
                      value={status}
                      onChange={(e) => {
                        setPage(1);
                        setStatus(e.target.value);
                        setSelectedRowIds([]);
                      }}
                      className={`${inputClass} min-w-[120px]`}
                    >
                      <option value="">All</option>
                      {statusOptions.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleViewSelected}
                  disabled={selectedRows.length !== 1}
                  className="inline-flex h-8 items-center justify-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 text-[11px] font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Eye size={12} />
                  View
                </button>

                <button
                  type="button"
                  onClick={clearSelection}
                  disabled={selectedRowIds.length === 0}
                  className="inline-flex h-8 items-center justify-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 text-[11px] font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="border-b border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
              {error}
            </div>
          )}

          {loading && (
            <div className="border-b border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700">
              Loading client records...
            </div>
          )}

          <div className="border-b border-slate-200 bg-slate-50 px-3 py-2.5">
            <div className="flex w-full flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Client Records
                </h2>
              </div>

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
            <table className="w-full min-w-max border-collapse bg-white">
              <thead>
                <tr>
                  <th className={thClass}>
                    <input
                      type="checkbox"
                      checked={allCurrentPageSelected}
                      onChange={toggleSelectAllCurrentPage}
                      className="h-4 w-4 cursor-pointer rounded border-slate-300"
                    />
                  </th>

                  {visibleColumns.map((col) => (
                    <th key={col.key} className={thClass}>
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={visibleColumns.length + 1}
                      className="px-6 py-12 text-center"
                    >
                      <div className="text-sm font-medium text-slate-500">
                        Loading client records...
                      </div>
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={visibleColumns.length + 1}
                      className="px-6 py-12 text-center"
                    >
                      <div className="text-4xl">📄</div>
                      <h3 className="mt-3 text-lg font-semibold text-slate-900">
                        No records found
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Try adjusting search or filters to see more results.
                      </p>
                    </td>
                  </tr>
                ) : (
                  rows.map((row, index) => {
                    const isSelected = selectedRowIds.includes(row.id);

                    return (
                      <tr
                        key={row.id}
                        className={`transition ${
                          isSelected
                            ? "bg-sky-50"
                            : index % 2 === 0
                            ? "bg-white"
                            : "bg-slate-50/50"
                        } hover:bg-sky-50`}
                      >
                        <td className={tdClass}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleRowSelection(row.id)}
                            className="h-4 w-4 cursor-pointer rounded border-slate-300"
                          />
                        </td>

                        {visibleColumns.map((col, colIndex) => (
                          <td key={col.key} className={tdClass}>
                            {renderStyledCell(row[col.key], col.key, colIndex === 0)}
                          </td>
                        ))}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {pageConfig?.layout?.pagination?.enabled && (
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
                    <span className="font-semibold text-slate-900">
                      {totalPages || 1}
                    </span>
                  </span>

                  <button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page <= 1}
                    className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <button
                    onClick={() =>
                      setPage((prev) => Math.min(prev + 1, totalPages || 1))
                    }
                    disabled={page >= totalPages}
                    className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {viewingRow && (
        <div className="fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-slate-900/30"
            onClick={() => setViewingRow(null)}
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto border-l border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 px-4 py-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Record Details
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Detailed client record information
                </p>
              </div>
              <button onClick={() => setViewingRow(null)} className={modalBtnClass}>
                ✕
              </button>
            </div>

            <div className="space-y-2.5 p-4">
              {visibleColumns.map((column) => (
                <DetailItem
                  key={column.key}
                  label={column.label}
                  value={formatCell(viewingRow[column.key], column.key)}
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

const thClass =
  "whitespace-nowrap border-b border-slate-300 bg-slate-100 px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-600";

const tdClass =
  "whitespace-nowrap border-b border-slate-200 px-4 py-3 align-middle text-sm text-slate-700";

const infoBadgeClass =
  "inline-flex rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700";

const protocolBadgeClass =
  "inline-flex rounded-md border border-cyan-200 bg-cyan-50 px-2 py-1 text-xs font-semibold uppercase text-cyan-700";

function statusBadgeClass(status) {
  switch (status) {
    case "On Air":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "Dismantle":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "Down":
      return "border-red-200 bg-red-50 text-red-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

function activeBadgeClass(active) {
  return active
    ? "border-blue-200 bg-blue-50 text-blue-700"
    : "border-rose-200 bg-rose-50 text-rose-700";
}

function renderStyledCell(value, key, isPrimary = false) {
  const formatted = formatCell(value, key);

  if (key === "status") {
    return (
      <span
        className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(
          value
        )}`}
      >
        {formatted}
      </span>
    );
  }

  if (key === "active") {
    return (
      <span
        className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-semibold ${activeBadgeClass(
          !!value
        )}`}
      >
        {value ? "Active" : "Inactive"}
      </span>
    );
  }

  if (key === "management_ip" || key === "ip_address") {
    return <span className={infoBadgeClass}>{formatted}</span>;
  }

  if (key === "web_protocol" || key === "protocol") {
    return <span className={protocolBadgeClass}>{formatted}</span>;
  }

  if (isPrimary) {
    return <span className="font-semibold text-slate-900">{formatted}</span>;
  }

  return formatted;
}

function formatCell(value, key) {
  if (value === null || value === undefined || value === "") return "-";

  if (key === "active") {
    return value ? "Active" : "Inactive";
  }

  return String(value);
}

export default ClientDynamicPage;