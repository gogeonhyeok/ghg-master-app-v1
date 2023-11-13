import Create from "../../../../components/server-create"
const viewModel = {
  db: 'ghg-master-api-v1',
  collection: 'putAways',
  baseUrl: '/wms/put-away',
  listModel: [
    {
      key: 'pwNo',
      displayName: 'ID'
    },
    {
      key: 'centerNo',
      displayName: 'Center'
    },
    {
      key: 'contactId',
      displayName: 'Contact'
    },
    {
      key: 'invenNo',
      displayName: 'Inven'
    },
    {
      key: 'qty',
      displayName: 'QTY'
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
