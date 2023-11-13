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
            key: 'id',
            displayName: 'ID'
          },
        ]}
        searchModel={[
          {
            value: 'id',
            displayName: 'ID'
          }
        ]}
        db='ghg-settings-api-v1'
        collection='users'
        baseUrl='/settings/user'
      />
    </>
  )
}