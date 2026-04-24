import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import {
  clientPageQueryKeys,
  getPublishedHybridPageApi,
} from "../../api/clientPageApi";
import AdminLinkLevelPage from "../admin/AdminLinkLevelPage";

const hybridPageComponents = {
  "link-level": AdminLinkLevelPage,
};

function ClientHybridPage() {
  const { pageKey } = useParams();

  const {
    data: pageConfig,
    isLoading,
    error,
  } = useQuery({
    queryKey: clientPageQueryKeys.publishedHybridPage(pageKey),
    queryFn: () => getPublishedHybridPageApi(pageKey),
    enabled: Boolean(pageKey),
  });

  if (isLoading) {
    return <div className="p-4 text-sm text-slate-600">Loading shared page...</div>;
  }

  if (error || !pageConfig?.is_enabled) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
        This shared page is not enabled for client access.
      </div>
    );
  }

  const PageComponent = hybridPageComponents[pageKey];

  if (!PageComponent) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Shared page component is not available.
      </div>
    );
  }

  return <PageComponent />;
}

export default ClientHybridPage;
