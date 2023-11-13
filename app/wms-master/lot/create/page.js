import Create from "../../../../components/server-create"
const viewModel = {
  db: 'ghg-master-api-v1',
  collection: 'masterLots',
  baseUrl: '/wms-master/lot',
  listModel: [
    {
      key: 'lotId',
      displayName: 'ID'
    },
    {
      key: 'lotNo',
      displayName: 'NO'
    },
    {
      key: 'status',
      displayName: 'Status'
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
