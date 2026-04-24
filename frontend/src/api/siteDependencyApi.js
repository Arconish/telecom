import api from "./axios";

export const getSiteDependencies = async (params = {}) => {
  const response = await api.get("/site-dependencies/", { params });
  return response.data;
};

export const getSiteDependencySummary = async () => {
  const response = await api.get("/site-dependencies/summary");
  return response.data;
};

export const createSiteDependency = async (payload) => {
  const response = await api.post("/site-dependencies/", payload);
  return response.data;
};

export const updateSiteDependency = async (id, payload) => {
  const response = await api.put(`/site-dependencies/${id}`, payload);
  return response.data;
};

export const deleteSiteDependency = async (id) => {
  const response = await api.delete(`/site-dependencies/${id}`);
  return response.data;
};

export const deleteAllSiteDependencies = async () => {
  const response = await api.delete("/site-dependencies/delete-all");
  return response.data;
};

export const bulkDeleteSiteDependencies = async (ids) => {
  const response = await api.delete("/site-dependencies/", {
    params: { ids },
    paramsSerializer: {
      indexes: null,
    },
  });
  return response.data;
};

export const exportSiteDependenciesExcel = async (params = {}) => {
  const response = await api.get("/site-dependencies/export/excel", {
    params,
    responseType: "blob",
  });
  return response.data;
};

export const exportSelectedSiteDependenciesExcel = async (ids) => {
  const response = await api.get("/site-dependencies/export/excel-selected", {
    params: { ids },
    paramsSerializer: {
      indexes: null,
    },
    responseType: "blob",
  });
  return response.data;
};

export const importSiteDependenciesExcel = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/site-dependencies/import/excel", formData);
  return response.data;
};
