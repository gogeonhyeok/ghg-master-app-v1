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
        ]}
        searchModel={[
          {
            value: 'skuDesc',
            displayName: 'Desc'
          }
        ]}
        db='ghg-master-api-v1'
        collection='masterSkus'
        baseUrl='/wms-master/sku'
      />
    </>
  )
}