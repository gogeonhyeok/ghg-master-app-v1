import Create from "../../../../components/server-create"
const viewModel = {
  db: 'ghg-master-api-v1',
  collection: 'masterSkus',
  baseUrl: '/wms-master/sku',
  listModel: [
    {
      key: 'skuId',
      displayName: 'ID'
    },
    {
      key: 'contactId',
      displayName: 'Contact'
    },
    {
      key: 'skuDesc',
      displayName: 'Desc'
    },
    {
      key: 'skuType',
      displayName: 'Type'
    },
    {
      key: 'width',
      displayName: 'Width'
    },
    {
      key: 'length',
      displayName: 'Length'
    },
    {
      key: 'height',
      displayName: 'Height'
    },
    {
      key: 'status',
      displayName: 'Status'
    },
    {
      key: 'createDate',
      displayName: 'Create Date'
    },
    {
      key: 'createUser',
      displayName: 'Create User'
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
