import { useState } from "react";
import {
  StandardAdminForm,
  StandardFormActions,
  StandardFormField,
  StandardFormGrid,
  StandardFormSection,
  StandardFormToggleField,
} from "../common/StandardAdminForm";
import { standardFormInputClass } from "../common/StandardAdminFormStyles";

const emptyForm = {
  site_id: "",
  fe: "",
  existed_in_mw_protection_path: false,
  child_site_id: "",
  pop_site: "",
};

function AdminSiteDependencyForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = "Save",
}) {
  const [form, setForm] = useState(() => ({
    ...emptyForm,
    ...(initialData || {}),
    existed_in_mw_protection_path:
      initialData?.existed_in_mw_protection_path ?? false,
  }));

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      site_id: form.site_id.trim(),
      fe: form.fe.trim() || null,
      existed_in_mw_protection_path: form.existed_in_mw_protection_path,
      child_site_id: form.child_site_id.trim() || null,
      pop_site: form.pop_site.trim() || null,
    });
  };

  return (
    <StandardAdminForm onSubmit={handleSubmit}>
      <StandardFormSection
        title="Site Dependency"
        description="Maintain site dependency and MW protection path status."
      >
        <StandardFormGrid>
          <StandardFormField label="Site ID" required>
            <input
              name="site_id"
              value={form.site_id}
              onChange={handleChange}
              className={standardFormInputClass}
              required
            />
          </StandardFormField>

          <StandardFormField label="FE">
            <input
              name="fe"
              value={form.fe}
              onChange={handleChange}
              className={standardFormInputClass}
            />
          </StandardFormField>

          <StandardFormField label="Child Site ID">
            <input
              name="child_site_id"
              value={form.child_site_id}
              onChange={handleChange}
              className={standardFormInputClass}
            />
          </StandardFormField>

          <StandardFormField label="POP Site">
            <input
              name="pop_site"
              value={form.pop_site}
              onChange={handleChange}
              className={standardFormInputClass}
            />
          </StandardFormField>

          <StandardFormToggleField
            className="md:col-span-2 xl:col-span-3"
            label="MW Protection Path"
            description="Site exists in MW protection path"
            name="existed_in_mw_protection_path"
            checked={form.existed_in_mw_protection_path}
            onChange={handleChange}
          />
        </StandardFormGrid>
      </StandardFormSection>

      <StandardFormActions onCancel={onCancel} submitLabel={submitLabel} />
    </StandardAdminForm>
  );
}

export default AdminSiteDependencyForm;
