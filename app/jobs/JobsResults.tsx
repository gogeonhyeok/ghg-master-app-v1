import type { Job } from "./catalog";
import JobsList from "./JobsList";
import JobsTable from "./JobsTable";

export default function JobsResults({ jobs, loading = false }: { jobs: Job[]; loading?: boolean }) {
  return <><JobsTable jobs={jobs} loading={loading} /><JobsList jobs={jobs} loading={loading} /></>;
}
