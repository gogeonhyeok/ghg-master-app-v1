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
            key: 'supportTypeDescription',
            displayName: 'Name'
          },
          {
            key: 'updateDate',
            displayName: 'Update Date'
          },
          {
            key: 'updateUser',
            displayName: 'Update User'
          }
        ]}
        searchModel={[
          {
            value: 'supportTypeDescription',
            displayName: 'Name'
          }
        ]}
        db='ghg-itsm-api-v1'
        collection='requestSupportTypes'
        baseUrl='/itsm/system'
      />
    </>
  )
}