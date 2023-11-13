import Create from "../../../../components/server-create"
const viewModel = {
  db: 'ghg-master-api-v1',
  collection: 'inventories',
  baseUrl: '/wms/inventory',
  listModel: [
    {
      key: 'invenNo',
      displayName: 'ID'
    },
    {
      key: 'contactId',
      displayName: 'Contact'
    },
    {
      key: 'centerNo',
      displayName: 'Center'
    },
    {
      key: 'productId',
      displayName: 'Product'
    },
    {
      key: 'productGrade',
      displayName: 'Product Grade'
    },
    {
      key: 'productState',
      displayName: 'Product State'
    },
    {
      key: 'qty',
      displayName: 'Qty'
    },
    {
      key: 'skuId',
      displayName: 'SKU'
    },
    {
      key: 'skuQty',
      displayName: 'SKU Qty'
    },
    {
      key: 'pwPlanQty',
      displayName: 'PW Plan Qty'
    },
    {
      key: 'piPlanQty',
      displayName: 'PI Plan Qty'
    },
    {
      key: 'invenOwnership',
      displayName: 'Inven Ownership'
    },
    {
      key: 'invenStatus',
      displayName: 'Inven Status'
    },
    {
      key: 'moveDate',
      displayName: 'GR Date'
    },
    {
      key: 'locationId',
      displayName: 'Location'
    },
    {
      key: 'grNo',
      displayName: 'GR'
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
