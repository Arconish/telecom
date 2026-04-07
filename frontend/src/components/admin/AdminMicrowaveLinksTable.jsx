function AdminMicrowaveLinksTable({
  rows = [],
  onEdit,
  onDelete,
  onView,
  sortConfig,
  onSort,
}) {
  const statusBadgeClass = (status) => {
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
  };

  const activeBadgeClass = (active) =>
    active
      ? "border-blue-200 bg-blue-50 text-blue-700"
      : "border-rose-200 bg-rose-50 text-rose-700";

  const sortIndicator = (key) => {
    if (sortConfig?.key !== key) return "↕";
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  const SortableHeader = ({ label, columnKey }) => (
    <th
      onClick={() => onSort(columnKey)}
      className={`${thClass} cursor-pointer select-none hover:bg-slate-200`}
    >
      <div className="flex items-center gap-2">
        <span>{label}</span>
        <span className="text-[10px] text-slate-400">
          {sortIndicator(columnKey)}
        </span>
      </div>
    </th>
  );

  return (
    <table className="w-full min-w-max border-collapse bg-white">
      <thead>
        <tr>
          <SortableHeader label="NE ID" columnKey="ne_id" />
          <SortableHeader label="FE ID" columnKey="fe_id" />
          <SortableHeader label="Link ID" columnKey="link_id" />
          <SortableHeader label="IP Address" columnKey="management_ip" />
          <SortableHeader label="Protocol" columnKey="web_protocol" />
          <SortableHeader label="Class" columnKey="link_class" />
          <SortableHeader label="Vendor" columnKey="vendor" />
          <SortableHeader label="Model" columnKey="model" />
          <SortableHeader label="Type" columnKey="type" />
          <SortableHeader label="Status" columnKey="status" />
          <SortableHeader label="Active" columnKey="is_active" />
          <th className={thClass}>Actions</th>
        </tr>
      </thead>

      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={12} className="px-6 py-12 text-center">
              <div className="text-4xl">📡</div>
              <h3 className="mt-3 text-lg font-semibold text-slate-900">
                No microwave links found
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Try adjusting search or filter, or create a new link.
              </p>
            </td>
          </tr>
        ) : (
          rows.map((row, index) => (
            <tr
              key={row.id}
              className={`transition ${
                index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
              } hover:bg-sky-50`}
            >
              <td className={tdClass}>{row.ne_id || "-"}</td>
              <td className={tdClass}>{row.fe_id || "-"}</td>
              <td className={tdClass}>
                <span className="font-semibold text-slate-900">
                  {row.link_id || "-"}
                </span>
              </td>
              <td className={tdClass}>
                <span className={infoBadgeClass}>
                  {row.management_ip || "-"}
                </span>
              </td>
              <td className={tdClass}>
                <span className={protocolBadgeClass}>
                  {row.web_protocol || "-"}
                </span>
              </td>
              <td className={tdClass}>{row.link_class || "-"}</td>
              <td className={tdClass}>{row.vendor || "-"}</td>
              <td className={tdClass}>{row.model || "-"}</td>
              <td className={tdClass}>{row.type || "-"}</td>

              <td className={tdClass}>
                <span
                  className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(
                    row.status
                  )}`}
                >
                  {row.status || "Unknown"}
                </span>
              </td>

              <td className={tdClass}>
                <span
                  className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-semibold ${activeBadgeClass(
                    row.is_active
                  )}`}
                >
                  {row.is_active ? "Active" : "Down"}
                </span>
              </td>

              <td className={tdClass}>
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <button
                    onClick={() => onView(row)}
                    className={actionBtnClass}
                  >
                    View
                  </button>
                  <button
                    onClick={() => onEdit(row)}
                    className={editBtnClass}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(row)}
                    className={deleteBtnClass}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

const thClass =
  "whitespace-nowrap border-b border-slate-300 bg-slate-100 px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-600";

const tdClass =
  "whitespace-nowrap border-b border-slate-200 px-4 py-3 align-middle text-sm text-slate-700";

const infoBadgeClass =
  "rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700";

const protocolBadgeClass =
  "rounded-md border border-cyan-200 bg-cyan-50 px-2 py-1 text-xs font-semibold uppercase text-cyan-700";

const actionBtnClass =
  "rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50";

const editBtnClass =
  "rounded-lg border border-blue-300 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-50";

const deleteBtnClass =
  "rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50";

export default AdminMicrowaveLinksTable;