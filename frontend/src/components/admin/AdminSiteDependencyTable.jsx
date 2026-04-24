import { Network } from "lucide-react";

import StandardDataTable from "../common/StandardDataTable";
import { siteDependencyColumns } from "../../constants/siteDependencyColumns";

function AdminSiteDependencyTable({
  rows = [],
  selectedIds = [],
  onToggleSelectRow,
  onToggleSelectAll,
  sortConfig,
  onSort,
}) {
  const renderCell = (row, key) => {
    const value = row?.[key];

    if (key === "existed_in_mw_protection_path") {
      return (
        <span
          className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
            value
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-amber-200 bg-amber-50 text-amber-700"
          }`}
        >
          {value ? "Yes" : "No"}
        </span>
      );
    }

    if (key === "site_id") {
      return <span className="font-semibold text-slate-900">{value || "-"}</span>;
    }

    return value === null || value === undefined || value === "" ? "-" : String(value);
  };

  return (
    <StandardDataTable
      columns={siteDependencyColumns}
      rows={rows}
      selectedIds={selectedIds}
      onToggleSelectRow={onToggleSelectRow}
      onToggleSelectAll={onToggleSelectAll}
      sortConfig={sortConfig}
      onSort={onSort}
      renderCell={renderCell}
      emptyTitle="No site dependency records found"
      emptyDescription="Try adjusting search or create a new dependency record."
      emptyIcon={Network}
    />
  );
}

export default AdminSiteDependencyTable;
