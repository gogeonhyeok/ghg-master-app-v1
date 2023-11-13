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
            displayName: ''
          },
          {
            key: 'updateUser',
            displayName: 'Update User'
          },
        ]}
        searchModel={[
          {
            value: 'centerNo',
            displayName: 'Center'
          }
        ]}
        db='ghg-master-api-v1'
        collection='inventories'
        baseUrl='/wms/inventory'
      />
    </>
  )
}