import List from '../../../components/list'
import { listItems, modifyItemDetails } from '../../actions'

const viewModel = {
  db: 'ghg-master-api-v1',
  collection: 'masterWmsProducts',
  modifyUrl: '/wms-product/modify',
  detailUrl: '/wms-product/detail',
  createUrl: '/wms-product/create',
  searchModel: [
    {
      value: 'No',
      displayName: 'No'
    },
    {
      value: 'Name',
      displayName: 'Name'
    }
  ],
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
    {
      key: 'createDate',
      displayName: 'Create Date'
    },
    {
      key: 'createUser',
      displayName: 'Create User'
    },
    {
      key: 'updateDate',
      displayName: 'Update Date'
    },
    {
      key: 'updateUser',
      displayName: 'Update User'
    },
  ]

}

export default () => {
  return (
    <>
      <List
        viewModel={viewModel}
        listItems={listItems}
        modifyItemDetails={modifyItemDetails}
      />
    </>
  )
}