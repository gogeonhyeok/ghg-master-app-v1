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
            key: 'systemName',
            displayName: 'Name'
          },
          {
            key: 'parentSystemName',
            displayName: 'Parent System'
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
            value: 'systemName',
            displayName: 'Name'
          }
        ]}
        db='ghg-itsm-api-v1'
        collection='systems'
        baseUrl='/itsm/system'
      />
    </>
  )
}