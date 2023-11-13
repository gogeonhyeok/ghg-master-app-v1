import Create from "../../../../components/server-create"
const viewModel = {
  db: 'ghg-itsm-api-v1',
  collection: 'roles',
  baseUrl: '/itsm/role',
  listModel: [
    {
      key: 'role',
      displayName: 'Name'
    },
    {
      key: 'roleDesc',
      displayName: 'Description'
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
