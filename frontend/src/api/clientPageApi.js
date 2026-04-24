import api from "./axios";

export const clientPageQueryKeys = {
  all: ["client-pages"],
  publicConfig: (slug) => ["client-pages", "public-config", slug],
  publicData: (slug, params = {}) => [
    "client-pages",
    "public-data",
    slug,
    params.page ?? 1,
    params.page_size ?? 10,
    params.search ?? "",
  ],
  publicAllData: (slug, search = "") => [
    "client-pages",
    "public-all-data",
    slug,
    search,
  ],
  publishedNav: ["client-pages", "published-nav"],
  hybridPages: ["client-pages", "hybrid-pages"],
  publishedHybridNav: ["client-pages", "published-hybrid-nav"],
  publishedHybridPage: (pageKey) => ["client-pages", "published-hybrid-page", pageKey],
};

export const getClientPagesApi = async () => {
  const response = await api.get("/client-pages/");
  return response.data;
};

export const getClientPageApi = async (pageId) => {
  const response = await api.get(`/client-pages/${pageId}`);
  return response.data;
};

export const createClientPageApi = async (payload) => {
  const response = await api.post("/client-pages/", payload);
  return response.data;
};

export const updateClientPageApi = async (pageId, payload) => {
  const response = await api.put(`/client-pages/${pageId}`, payload);
  return response.data;
};

export const deleteClientPageApi = async (pageId) => {
  const response = await api.delete(`/client-pages/${pageId}`);
  return response.data;
};

export const getClientPageTableMetadataApi = async () => {
  const response = await api.get("/client-pages/metadata/tables");
  return response.data;
};

export const getHybridPagesApi = async () => {
  const response = await api.get("/client-pages/hybrid-pages");
  return response.data;
};

export const updateHybridPageAccessApi = async (pageKey, payload) => {
  const response = await api.put(`/client-pages/hybrid-pages/${pageKey}`, payload);
  return response.data;
};

export const getPublishedHybridPagesForNavApi = async () => {
  const response = await api.get("/client-pages/hybrid-pages/published/nav");
  return response.data;
};

export const fetchPublishedHybridPagesForNav = async () => {
  return getPublishedHybridPagesForNavApi();
};

export const getPublishedHybridPageApi = async (pageKey) => {
  const response = await api.get(`/client-pages/hybrid-pages/published/${pageKey}`);
  return response.data;
};

export const getPublicClientPageApi = async (slug) => {
  const response = await api.get(`/client-pages/view/${slug}`);
  return response.data;
};

export const fetchPublicClientPageConfig = async (slug) => {
  return getPublicClientPageApi(slug);
};

export const getPublicClientPageDataApi = async (slug, params = {}) => {
  const response = await api.get(`/client-pages/view/${slug}/data`, { params });
  return response.data;
};

export const fetchPublicClientPageData = async (slug, params = {}) => {
  return getPublicClientPageDataApi(slug, params);
};

export const fetchAllPublicClientPageData = async (slug, search = "") => {
  let currentPage = 1;
  let lastPage = 1;
  let merged = [];

  do {
    const data = await getPublicClientPageDataApi(slug, {
      page: currentPage,
      page_size: 500,
      search: search || undefined,
    });

    merged = [...merged, ...(data?.items || [])];
    lastPage = data?.total_pages || 1;
    currentPage += 1;
  } while (currentPage <= lastPage);

  return merged;
};

export const getPublishedClientPagesForNavApi = async () => {
  const response = await api.get("/client-pages/published/nav");
  return response.data;
};

export const fetchPublishedClientPagesForNav = async () => {
  return getPublishedClientPagesForNavApi();
};
