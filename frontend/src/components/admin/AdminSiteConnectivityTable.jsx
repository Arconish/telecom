import { Share2 } from "lucide-react";

import StandardDataTable from "../common/StandardDataTable";
import { siteConnectivityColumns } from "../../constants/siteConnectivityColumns";

function AdminSiteConnectivityTable({
  rows = [],
  selectedIds = [],
  onToggleSelectRow,
  onToggleSelectAll,
  sortConfig,
  onSort,
}) {
  const getCellValue = (row, key) => {
    const value = row?.[key];

    if (key === "is_active") {
      return (
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            value
              ? "border border-blue-200 bg-blue-50 text-blue-700"
              : "border border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {value ? "Active" : "Inactive"}
        </span>
      );
    }

    if (key === "category_ne") {
      return (
        <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700">
          {value || "-"}
        </span>
      );
    }

    if (key === "link_id") {
      return <span className="font-semibold text-slate-900">{value || "-"}</span>;
    }

    return value === null || value === undefined || value === "" ? "-" : String(value);
  };

  return (
    <StandardDataTable
      columns={siteConnectivityColumns}
      rows={rows}
      selectedIds={selectedIds}
      onToggleSelectRow={onToggleSelectRow}
      onToggleSelectAll={onToggleSelectAll}
      sortConfig={sortConfig}
      onSort={onSort}
      renderCell={getCellValue}
      emptyTitle="No site connectivity records found"
      emptyDescription="Try adjusting search or category filter, or import a new Excel file."
      emptyIcon={Share2}
    />
  );
}

export default AdminSiteConnectivityTable;
