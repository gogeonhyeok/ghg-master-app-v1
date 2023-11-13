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
            value: 'contactOrdType',
            displayName: 'Order Type'
          }
        ]}
        db='ghg-master-api-v1'
        collection='masterContactOrdTypes'
        baseUrl='/wms-master/order-type'
      />
    </>
  )
}