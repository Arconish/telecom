import api from "./axios";

export const getMicrowaveLinks = async ({
  search,
  status,
  is_active,
  vendor,
  sort_by,
  sort_order,
  page = 1,
  page_size = 10,
}) => {
  const params = {
    page,
    page_size,
  };

  if (search) params.search = search;
  if (status) params.status = status;
  if (typeof is_active === "boolean") params.is_active = is_active;
  if (vendor) params.vendor = vendor;
  if (sort_by) params.sort_by = sort_by;
  if (sort_order) params.sort_order = sort_order;

  const response = await api.get("/microwave-links/", { params });
  return response.data;
};

export const getMicrowaveLinkSummary = async () => {
  const response = await api.get("/microwave-links/status/summary");
  return response.data;
};

export const getMicrowaveLinkById = async (id) => {
  const response = await api.get(`/microwave-links/${id}`);
  return response.data;
};

export const createMicrowaveLink = async (payload) => {
  const response = await api.post("/microwave-links/", payload);
  return response.data;
};

export const updateMicrowaveLink = async (id, payload) => {
  const response = await api.put(`/microwave-links/${id}`, payload);
  return response.data;
};

export const deleteMicrowaveLink = async (id) => {
  const response = await api.delete(`/microwave-links/${id}`);
  return response.data;
};

export const exportMicrowaveLinksExcel = async (params = {}) => {
  const response = await api.get("/microwave-links/export/excel", {
    params,
    responseType: "blob",
  });
  return response.data;
};

export const importMicrowaveLinksExcel = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/microwave-links/import/excel", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};