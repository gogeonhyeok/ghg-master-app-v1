import Create from "../../../../components/server-create"
const viewModel = {
  db: 'ghg-itsm-api-v1',
  collection: 'systems',
  baseUrl: '/itsm/system',
  listModel: [
    {
      key: 'systemName',
      displayName: 'Name'
    },
    {
      key: 'parentSystemName',
      displayName: 'Parent System'
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
