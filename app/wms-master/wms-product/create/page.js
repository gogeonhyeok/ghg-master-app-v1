import Create from "../../../../components/server-create"
const viewModel = {
  db: 'ghg-master-api-v1',
  collection: 'masterProducts',
  baseUrl: '/wms-master/wms-product',
  listModel: [
    {
      key: 'productId',
      displayName: 'ID'
    },
    {
      key: 'contactId',
      displayName: 'Contact'
    },
    {
      key: 'productNo',
      displayName: 'No'
    },
    {
      key: 'productName',
      displayName: 'Name'
    },
    {
      key: 'productCode',
      displayName: 'Code'
    },
    {
      key: 'productGroup',
      displayName: 'Group'
    },
    {
      key: 'productClass',
      displayName: 'Class'
    },
    {
      key: 'productType',
      displayName: 'Type'
    },
    {
      key: 'length',
      displayName: 'Length'
    },
    {
      key: 'width',
      displayName: 'Width'
    },
    {
      key: 'height',
      displayName: 'Height'
    },
    {
      key: 'weight',
      displayName: 'Width'
    },
    {
      key: 'volume',
      displayName: 'Volume'
    },
    {
      key: 'basePrice',
      displayName: 'Base Price'
    },
    {
      key: 'shelfLife',
      displayName: 'Shelf Life'
    },
    {
      key: 'dfSkuId',
      displayName: 'SKU'
    },
    {
      key: 'isUseSkuBarcode',
      displayName: 'SKU Barcode'
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
