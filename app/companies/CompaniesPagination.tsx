import type { CompaniesPage } from "./catalog";
import DirectoryPagination from "../_components/DirectoryPagination";

export default function CompaniesPagination({ data, entityName = "" }: { data: CompaniesPage; entityName?: string }) {
  return <DirectoryPagination {...data} shown={data.companies.length} path="/companies" parameter="entity_name"
    search={entityName} label="Companies pagination" noun="companies" />;
}
