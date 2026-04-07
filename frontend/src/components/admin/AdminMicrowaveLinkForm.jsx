import { useEffect, useState } from "react";

const emptyForm = {
  ne_id: "",
  fe_id: "",
  link_id: "",
  management_ip: "",
  web_protocol: "http",
  link_class: "",
  is_active: true,
  vendor: "",
  model: "",
  type: "",
  status: "",
};

function AdminMicrowaveLinkForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = "Save",
}) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    setForm(
      initialData
        ? {
            ne_id: initialData.ne_id ?? "",
            fe_id: initialData.fe_id ?? "",
            link_id: initialData.link_id ?? "",
            management_ip: initialData.management_ip ?? "",
            web_protocol: initialData.web_protocol ?? "http",
            link_class: initialData.link_class ?? "",
            is_active: initialData.is_active ?? true,
            vendor: initialData.vendor ?? "",
            model: initialData.model ?? "",
            type: initialData.type ?? "",
            status: initialData.status ?? "",
          }
        : emptyForm
    );
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h4 className="text-base font-semibold text-slate-900">
          Link Information
        </h4>
        <p className="mt-1 text-sm text-slate-500">
          Fill in the microwave link details below.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <FormField label="NE ID">
          <input
            name="ne_id"
            value={form.ne_id}
            onChange={handleChange}
            className={inputClass}
            placeholder="Enter NE ID"
          />
        </FormField>

        <FormField label="FE ID">
          <input
            name="fe_id"
            value={form.fe_id}
            onChange={handleChange}
            className={inputClass}
            placeholder="Enter FE ID"
          />
        </FormField>

        <FormField label="Link ID" required>
          <input
            name="link_id"
            value={form.link_id}
            onChange={handleChange}
            className={inputClass}
            placeholder="Enter Link ID"
            required
          />
        </FormField>

        <FormField label="Management IP">
          <input
            name="management_ip"
            value={form.management_ip}
            onChange={handleChange}
            className={inputClass}
            placeholder="Enter management IP"
          />
        </FormField>

        <FormField label="Web Protocol">
          <select
            name="web_protocol"
            value={form.web_protocol}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="http">http</option>
            <option value="https">https</option>
          </select>
        </FormField>

        <FormField label="Link Class">
          <input
            name="link_class"
            value={form.link_class}
            onChange={handleChange}
            className={inputClass}
            placeholder="Enter link class"
          />
        </FormField>

        <FormField label="Vendor">
          <input
            name="vendor"
            value={form.vendor}
            onChange={handleChange}
            className={inputClass}
            placeholder="Enter vendor"
          />
        </FormField>

        <FormField label="Model">
          <input
            name="model"
            value={form.model}
            onChange={handleChange}
            className={inputClass}
            placeholder="Enter model"
          />
        </FormField>

        <FormField label="Type">
          <input
            name="type"
            value={form.type}
            onChange={handleChange}
            className={inputClass}
            placeholder="Enter type"
          />
        </FormField>

        <FormField label="Status">
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">Select status</option>
            <option value="On Air">On Air</option>
            <option value="Planned">Planned</option>
            <option value="Down">Down</option>
          </select>
        </FormField>

        <div className="flex items-end">
          <label className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">
                Active State
              </div>
              <div className="text-xs text-slate-500">
                Toggle operational activity
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  form.is_active
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {form.is_active ? "Active" : "Down"}
              </span>

              <input
                type="checkbox"
                name="is_active"
                checked={form.is_active}
                onChange={handleChange}
                className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
          </label>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className={secondaryBtnClass}
        >
          Cancel
        </button>

        <button type="submit" className={primaryBtnClass}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

function FormField({ label, required = false, children }) {
  return (
    <div className="flex flex-col">
      <label className="mb-2 text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-600">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const secondaryBtnClass =
  "rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50";

const primaryBtnClass =
  "rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700";

export default AdminMicrowaveLinkForm;