import Create from "../../../../components/server-create"
const viewModel = {
  db: 'ghg-itsm-api-v1',
  collection: 'employees',
  baseUrl: '/itsm/employee',
  listModel: [
    {
      key: "empId",
      displayName: "ID"
    },
    {
      key: "userId",
      displayName: "User ID"
    },
    {
      key: "displayName",
      displayName: "Display Name"
    },
    {
      key: "companyName",
      displayName: "Company"
    },
    {
      key: "language",
      displayName: "Language"
    },
    {
      key: "timezone",
      displayName: "TimeZone"
    },
    {
      key: "cancelTag",
      displayName: "Cancel Tag"
    },
  ],
}
export default async () => {
  return (
    <>
      <Create viewModel={viewModel} />
    </>
  )
}
