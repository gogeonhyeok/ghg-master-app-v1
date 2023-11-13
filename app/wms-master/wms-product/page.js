import List from '../../../components/server-list'

export default async ({ searchParams }) => {
  const page = parseInt(searchParams.page)
  const searchData = {
    searchType: searchParams.searchType,
    searchText: searchParams.searchText
  }
  return (
    <>
      <List
        page={page}
        searchData={searchData}
        listModel={[
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
        ]}
        searchModel={[
          {
            value: 'No',
            displayName: 'No'
          },
          {
            value: 'Name',
            displayName: 'Name'
          }
        ]}
        db='ghg-master-api-v1'
        collection='masterProducts'
        baseUrl='/wms-master/wms-product'
      />
    </>
  )
}