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
            key: 'lotId',
            displayName: 'ID'
          },
          {
            key: 'lotNo',
            displayName: 'NO'
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
            value: 'lotNo',
            displayName: 'NO'
          }
        ]}
        db='ghg-master-api-v1'
        collection='masterLots'
        baseUrl='/wms-master/lot'
      />
    </>
  )
}