import Create from "../../../../components/server-create"
const viewModel = {
  db: 'ghg-master-api-v1',
  collection: 'pickings',
  baseUrl: '/wms/picking',
  listModel: [
    {
      key: 'piNo',
      displayName: 'ID'
    },
    {
      key: 'contactNo',
      displayName: 'Contact'
    },
    {
      key: 'centerId',
      displayName: 'Center'
    },
    {
      key: 'invenNo',
      displayName: 'Inven'
    },
    {
      key: 'qty',
      displayName: 'Qty'
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
