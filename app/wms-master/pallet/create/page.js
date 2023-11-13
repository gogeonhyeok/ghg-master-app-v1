import Create from "../../../../components/server-create"
const viewModel = {
  db: 'ghg-master-api-v1',
  collection: 'masterPallets',
  baseUrl: '/wms-master/pallet',
  listModel: [
    {
      key: 'palletId',
      displayName: 'ID'
    },
    {
      key: 'palletNo',
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
