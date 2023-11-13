import Create from "../../../../components/server-create"
const viewModel = {
  db: 'ghg-master-api-v1',
  collection: 'masterContactOrdTypes',
  baseUrl: '/wms-master/order-type',
  listModel: [
    {
      key: 'contactId',
      displayName: 'Contact'
    },
    {
      key: 'contactOrdType',
      displayName: 'Order Type'
    },
    {
      key: 'description',
      displayName: 'Desc'
    },
    {
      key: 'createType',
      displayName: 'Type'
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
